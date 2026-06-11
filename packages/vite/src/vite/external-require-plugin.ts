import type { Plugin } from 'vite';

/**
 * Patch the two Rolldown 1.0.3 ESM-output behaviors that break esmx federation.
 * Runs in `generateBundle` because rolldown injects these runtime helpers
 * AFTER `renderChunk`.
 *
 * (1) **`__require("<external>")` shim calls.** For a CJS module that depends
 *     on an external module, rolldown emits a runtime require shim
 *     (`createRequire(import.meta.url)` in a shared chunk) and every
 *     `require('react')` is compiled to a call on it — often via a
 *     single-letter alias after minification, e.g. `e(`react`)`.
 *
 *     `createRequire` is Node-only AND it bypasses esmx's ESM resolve hook
 *     (`module.register`). Two symptoms:
 *       - BROWSER: hydration crashes — no `createRequire`.
 *       - SERVER: `__require('react')` returns `node_modules/react` while ESM
 *         `import 'react'` is intercepted by `module.register` → federation
 *         chunk. Two react instances. React's dispatcher singleton splits.
 *         SSR throws `Cannot read properties of null (reading 'useState')`.
 *
 *     We REWRITE the call sites per consumer chunk: any
 *     `<localAlias>("<external>")` invocation in a chunk is replaced with a
 *     direct reference to a top-level `import * as __esmExt_<external>` added
 *     to the same chunk. The shared chunk and its `createRequire` definition
 *     are left untouched, which avoids the load cycle that would arise if the
 *     shared chunk itself ESM-imported `react` (it gets re-imported BY the
 *     federation chunk that `module.register` redirects `react` to).
 *
 * (2) **`__toESM` interop helper.** Rolldown emits in the shared chunk:
 *
 *         d=(e,r,i)=>(i=e==null?{}:t(a(e)),
 *                     l(r||!e||!e.__esModule
 *                         ? n(i,`default`,{value:e,enumerable:!0})
 *                         : i,
 *                       e))
 *
 *     The ternary OMITS `.default` when the CJS module declares
 *     `__esModule:true` — but the SAME rolldown output still emits consumer
 *     code that reads `.default.X` from the wrapped result. Vue's
 *     `@vue/runtime-dom` hits this: `l.default.Transition` is undefined and
 *     SSR crashes with `Cannot read properties of undefined (reading
 *     'Transition')`. This is a rolldown internal inconsistency.
 *
 *     We patch the helper to ALWAYS set `default` (esbuild `--interop`
 *     style). `l()` still spreads top-level properties so `.X` consumers
 *     also keep working.
 */
export function esmxExternalRequirePlugin(externals: string[]): Plugin {
    const externalSet = new Set(externals);
    const safeId = (spec: string) =>
        `__esmExt_${spec.replace(/[^A-Za-z0-9]/g, '_')}`;

    const toEsmRe =
        /(=\([a-z],[a-z],[a-z]\)=>\([a-z]=[a-z]==null\?\{\}:[a-z]\([a-z]\([a-z]\)\),)([a-z])\([a-z]\|\|![a-z]\|\|![a-z]\.__esModule\?([a-z])\([a-z],`default`,\{value:[a-z],enumerable:!0\}\):[a-z],[a-z]\)\)/g;

    // Match `<ident>("<external>")` or `` <ident>(`<external>`) `` where ident
    // is a likely minified local (1–8 chars, $/_ permitted). The leading
    // boundary stops us matching inside other identifiers like `foo<bar>`.
    const callRe =
        /(^|[^A-Za-z0-9_$])([A-Za-z_$][\w$]{0,7})\((?:"([^"]+)"|'([^']+)'|`([^`]+)`)\)/g;

    const patchChunk = (code: string): string | null => {
        let out = code;
        let changed = false;

        // (2) toESM ternary → always set `.default`.
        out = out.replace(
            toEsmRe,
            (
                _match,
                prefix: string,
                copyHelper: string,
                defineHelper: string
            ) => {
                const params = prefix.match(/\(([a-z]),([a-z]),([a-z])\)/);
                if (!params) return _match;
                const [, e, , i] = params;
                changed = true;
                return `${prefix}${copyHelper}(${defineHelper}(${i},\`default\`,{value:${e},enumerable:!0}),${e}))`;
            }
        );

        // (1) `<alias>("<external>")` → `__esmExt_<external>`.
        const used = new Set<string>();
        out = out.replace(
            callRe,
            (
                match,
                lead: string,
                _ident: string,
                dq?: string,
                sq?: string,
                bt?: string
            ) => {
                const spec = dq ?? sq ?? bt ?? '';
                if (!externalSet.has(spec)) return match;
                used.add(spec);
                changed = true;
                return `${lead}${safeId(spec)}`;
            }
        );

        if (used.size > 0) {
            const importsBlock = [...used]
                .map(
                    (e) => `import * as ${safeId(e)} from ${JSON.stringify(e)};`
                )
                .join('\n');
            out = `${importsBlock}\n${out}`;
        }

        return changed ? out : null;
    };

    return {
        name: 'esmx:external-require-to-esm',
        generateBundle(_options, bundle) {
            for (const fileName of Object.keys(bundle)) {
                const entry = bundle[fileName] as {
                    type: string;
                    code?: string;
                };
                if (entry.type !== 'chunk' || typeof entry.code !== 'string')
                    continue;
                const next = patchChunk(entry.code);
                if (next !== null) entry.code = next;
            }
        }
    };
}

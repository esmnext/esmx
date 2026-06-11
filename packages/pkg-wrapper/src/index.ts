import fs from 'node:fs';
import { createRequire, findPackageJSON } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { init as cjsInit, parse as cjsParse } from 'cjs-module-lexer';
import * as esmLexer from 'es-module-lexer';

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const RESERVED = new Set(['default', '__esModule']);

let lexersReady: Promise<void> | null = null;
async function ensureLexers(): Promise<void> {
    if (lexersReady) return lexersReady;
    lexersReady = (async () => {
        await cjsInit();
        await esmLexer.init;
    })();
    return lexersReady;
}

/**
 * Detect whether a resolved file should be parsed as CommonJS or ESM.
 *
 * `.mjs`/`.cjs` extensions are conclusive; otherwise we walk up to the
 * nearest package.json and read its `"type"` field. Defaults to CJS when
 * nothing identifies the file as ESM — matches Node's own resolution.
 */
function detectModuleKind(file: string): 'cjs' | 'esm' {
    const ext = path.extname(file);
    if (ext === '.mjs') return 'esm';
    if (ext === '.cjs') return 'cjs';
    let dir = path.dirname(file);
    while (dir !== path.dirname(dir)) {
        const pj = path.join(dir, 'package.json');
        if (fs.existsSync(pj)) {
            try {
                const pkg = JSON.parse(fs.readFileSync(pj, 'utf8'));
                if (pkg && typeof pkg === 'object' && 'name' in pkg) {
                    return pkg.type === 'module' ? 'esm' : 'cjs';
                }
            } catch {
                // ignore; keep walking
            }
        }
        dir = path.dirname(dir);
    }
    return 'cjs';
}

const RELATIVE_REQUIRE_RE = /require\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g;

/**
 * Lex a CJS file with cjs-module-lexer, following `module.exports
 * = require('./impl')`-style re-exports to the file that actually declares
 * the names. This mirrors what rspack / webpack / rolldown do internally so
 * the resulting names match what the bundler will accept on a static
 * `export { ... } from '<spec>'` statement.
 *
 * For pure-reexport files with CONDITIONAL branches (the canonical
 *
 *     if (process.env.NODE_ENV === 'production')
 *         module.exports = require('./prod');
 *     else
 *         module.exports = require('./dev');
 *
 * pattern used by react, react-dom, react-router, etc.), cjs-module-lexer
 * only reports one branch. We supplement with a regex scan to find every
 * relative `require()` call and take the INTERSECTION of names across all
 * branches — the bundler's view (production OR development) is guaranteed
 * to be a subset of that intersection, so the explicit re-export we emit is
 * always valid regardless of which branch the bundler picks at build time.
 */
function lexCJS(
    file: string,
    requireFrom: ReturnType<typeof createRequire>,
    seen: Set<string>
): string[] {
    if (seen.has(file)) return [];
    seen.add(file);
    const code = fs.readFileSync(file, 'utf8');
    const result = cjsParse(code);
    const ownExports = [...result.exports];
    const isPureReexport =
        ownExports.length === 0 && result.reexports.length > 0;

    if (!isPureReexport) {
        const names = new Set(ownExports);
        for (const re of result.reexports) {
            for (const n of resolveAndLex(re, file, requireFrom, seen)) {
                names.add(n);
            }
        }
        return [...names];
    }

    // Pure re-export file: collect candidate branches via lexer + regex
    // scan, lex each, intersect.
    //
    // Each branch gets an INDEPENDENT `seen` (forked from the shared one so
    // we still detect cycles within a single branch's recursion). If we
    // reused the outer `seen`, branch B would see branch A's lexed files as
    // "already seen" and return empty — and the intersection would drop
    // every name to nothing.
    const candidates = new Set(result.reexports);
    RELATIVE_REQUIRE_RE.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = RELATIVE_REQUIRE_RE.exec(code))) {
        candidates.add(m[1]);
    }
    const branches: string[][] = [];
    for (const re of candidates) {
        const branchSeen = new Set(seen);
        const names = resolveAndLex(re, file, requireFrom, branchSeen);
        if (names.length > 0) branches.push(names);
    }
    if (branches.length === 0) return [];
    if (branches.length === 1) return branches[0];
    const [first, ...rest] = branches;
    return first.filter((n) => rest.every((b) => b.includes(n)));
}

function resolveAndLex(
    spec: string,
    fromFile: string,
    requireFrom: ReturnType<typeof createRequire>,
    seen: Set<string>
): string[] {
    const sub = resolveFromFile(spec, fromFile, requireFrom);
    if (!sub) return [];
    return lexCJS(sub, requireFrom, seen);
}

/**
 * Resolve a specifier (relative or bare) starting from a specific file's
 * directory — necessary for bare specifiers like `@vue/runtime-dom` that
 * live inside another package's `node_modules` and aren't visible from the
 * project root (pnpm's non-hoisted layout).
 */
function resolveFromFile(
    spec: string,
    fromFile: string,
    requireFrom: ReturnType<typeof createRequire>
): string | null {
    try {
        return requireFrom.resolve(spec, {
            paths: [path.dirname(fromFile)]
        } as never);
    } catch {
        try {
            return requireFrom.resolve(spec);
        } catch {
            return null;
        }
    }
}

/**
 * Lex an ESM file with es-module-lexer, FOLLOWING `export *` re-exports
 * recursively. Many "main entry" ESM files are pure proxies — e.g. vue's
 * `index.mjs` is just `export * from './index.js'` — so the named exports
 * live in a downstream file. We mirror the bundler's recursive resolution
 * here so the wrapper enumerates the same names rspack/vite ultimately see.
 *
 * Mixed CJS-target re-exports (an ESM file that `export *`s from a CJS
 * file, as vue's `./index.mjs → ./index.js` does) fall through to `lexCJS`
 * so each step uses the right parser.
 */
function lexESMRecursive(
    file: string,
    requireFrom: ReturnType<typeof createRequire>,
    seen: Set<string>
): { names: string[]; hasDefault: boolean } {
    if (seen.has(file)) return { names: [], hasDefault: false };
    seen.add(file);
    const code = fs.readFileSync(file, 'utf8');
    const [imports, exports] = esmLexer.parse(code);
    const names = new Set<string>();
    let hasDefault = false;
    for (const e of exports) {
        if (e.n === 'default') {
            hasDefault = true;
        } else if (IDENTIFIER_RE.test(e.n) && !RESERVED.has(e.n)) {
            names.add(e.n);
        }
    }
    // Detect `export *` re-exports by scanning the source — es-module-lexer
    // reports `export * from 'x'` only as an import (no named export entry).
    for (const imp of imports) {
        if (imp.t !== 1 || !imp.n) continue;
        const slice = code.slice(imp.ss, imp.se);
        if (!/^\s*export\s*\*\s*from/.test(slice)) continue;
        const sub = resolveRel(imp.n, file, requireFrom);
        if (!sub) continue;
        const kind = detectModuleKind(sub);
        if (kind === 'esm') {
            const r = lexESMRecursive(sub, requireFrom, seen);
            for (const n of r.names) names.add(n);
            // `export *` excludes `default` by spec, so don't propagate it.
        } else {
            for (const n of lexCJS(sub, requireFrom, seen)) names.add(n);
        }
    }
    return { names: [...names], hasDefault };
}

function resolveRel(
    spec: string,
    fromFile: string,
    requireFrom: ReturnType<typeof createRequire>
): string | null {
    try {
        return spec.startsWith('.')
            ? requireFrom.resolve(spec, {
                  paths: [path.dirname(fromFile)]
              } as never)
            : requireFrom.resolve(spec);
    } catch {
        return null;
    }
}

/**
 * Resolve a bare specifier from a project root. Try in order:
 *
 * 1. **`findPackageJSON`** (Node 24+): finds the target package's
 *    `package.json` from `root`'s `node_modules` walk, then reads its
 *    `exports['.']` for the right entry. Works for ESM-only packages whose
 *    `exports` lacks a `require` condition (e.g. `@esmx/router`). Reliable
 *    regardless of the caller's own cwd / module context — unlike
 *    `import.meta.resolve(spec, parent)`, whose second arg Node ignores for
 *    bare-specifier resolution.
 *
 * 2. **`require.resolve`** from `root/index.js` — for normal CJS packages.
 *
 * 3. **`import.meta.resolve`** — last resort.
 */
function resolveFromRoot(root: string, spec: string): string {
    const fromFile = path.join(root, 'index.js');
    try {
        const pjPath = findPackageJSON(spec, fromFile);
        if (pjPath) {
            const pj = JSON.parse(fs.readFileSync(pjPath, 'utf8'));
            const entry = pickEntry(pj);
            if (entry) return path.join(path.dirname(pjPath), entry);
        }
    } catch {
        // fall through
    }
    try {
        return createRequire(fromFile).resolve(spec);
    } catch {
        return fileURLToPath(
            import.meta.resolve(spec, pathToFileURL(fromFile).href)
        );
    }
}

/**
 * Pick the file path the package wants to expose for the default entry under
 * the Node environment, mirroring Node's condition precedence:
 *
 *   - `import` then `module` over `require` / `default` for ESM-first packages
 *   - `node` over `browser` / `default` for environment branching
 *   - Walks nested condition maps recursively (handles vue's
 *     `import → { types, node, default }` shape)
 */
function pickEntry(pj: Record<string, unknown>): string | null {
    const exports = pj.exports as undefined | string | Record<string, unknown>;
    const dot = exports && typeof exports === 'object' ? exports['.'] : exports;
    const fromDot = pickFromCondition(dot);
    if (fromDot) return fromDot;
    if (typeof pj.module === 'string') return pj.module;
    if (typeof pj.main === 'string') return pj.main;
    return null;
}

const NODE_PREFERRED_CONDITIONS = [
    'node',
    'import',
    'module',
    'default'
] as const;

function pickFromCondition(value: unknown): string | null {
    if (typeof value === 'string') return value;
    if (!value || typeof value !== 'object') return null;
    const obj = value as Record<string, unknown>;
    for (const cond of NODE_PREFERRED_CONDITIONS) {
        if (cond in obj) {
            const sub = pickFromCondition(obj[cond]);
            if (sub) return sub;
        }
    }
    return null;
}

/**
 * Enumerate a package's static, named ESM exports using the same lexers
 * bundlers use internally — `cjs-module-lexer` for CommonJS and
 * `es-module-lexer` for ESM. This keeps our view of the package aligned
 * with what rspack / vite see during their static analysis, so the explicit
 * `export { a, b } from '<spec>'` we emit in the wrapper does not error out
 * on names that the bundler "doesn't know about".
 *
 * We deliberately do NOT run the module — runtime evaluation would surface
 * dynamic properties (e.g. react's dev-only `act` and `captureOwnerStack`)
 * that the bundler's static lexer can't see, leading to "export not found"
 * build failures.
 */
export async function inspectPkg(
    root: string,
    spec: string
): Promise<{ names: string[]; hasDefault: boolean }> {
    await ensureLexers();
    try {
        const file = resolveFromRoot(root, spec);
        const kind = detectModuleKind(file);
        const requireFrom = createRequire(path.join(root, 'index.js'));
        if (kind === 'esm') {
            const r = lexESMRecursive(file, requireFrom, new Set());
            return {
                names: r.names.filter(
                    (n) => IDENTIFIER_RE.test(n) && !RESERVED.has(n)
                ),
                hasDefault: r.hasDefault
            };
        }
        const names = lexCJS(file, requireFrom, new Set());
        // CJS packages always have a default export (== module.exports).
        return {
            names: names.filter(
                (n) => IDENTIFIER_RE.test(n) && !RESERVED.has(n)
            ),
            hasDefault: true
        };
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
            `[esmx:pkg-wrapper] failed to enumerate named exports of "${spec}" (${message}); only its default export will be re-exported, so named imports of this federated package may fail at runtime.`
        );
        return { names: [], hasDefault: false };
    }
}

/**
 * Build a wrapper module that re-exports a CommonJS or ESM package as a
 * federation entry with STATIC named exports.
 *
 * Pointing rspack / rsbuild's entry directly at a CommonJS package (e.g.
 * react) produces a federation chunk that, in development mode, exposes
 * nothing usable as ESM named exports — `import { useState } from 'react'`
 * resolves to undefined and SSR/CSR crashes. We instead re-export every
 * named field explicitly so the federation boundary preserves CJS exports
 * regardless of build mode.
 *
 * The wrapper imports the package by its ORIGINAL bare specifier so the
 * bundler's resolver — and any user-supplied `resolve.alias` such as `vue$`
 * → the runtime build set by @esmx/rsbuild-vue — still applies. The wrapper
 * only adds the named-export plumbing on top.
 *
 * Adapters install the wrapper as a virtual module (mental model:
 * `esmx://<spec>`) and point the federation entry at that id. The wrapper's
 * own internal `export { ... } from '<spec>'` must NOT be externalized by
 * the adapter — it would route back to the wrapper itself and cycle.
 */
export function generatePkgWrapperSource(
    spec: string,
    names: string[],
    hasDefault: boolean
): string {
    const specJson = JSON.stringify(spec);
    const lines: string[] = [];
    if (names.length > 0) {
        lines.push(`export { ${names.join(', ')} } from ${specJson};`);
    }
    if (hasDefault) {
        lines.push(`export { default } from ${specJson};`);
    }
    if (lines.length === 0) {
        lines.push('export {};');
    }
    return `${lines.join('\n')}\n`;
}

/** Probe a package and produce the wrapper source — single call adapters use. */
export async function buildPkgWrapper(opts: {
    root: string;
    spec: string;
}): Promise<{ source: string; names: string[]; hasDefault: boolean }> {
    const { names, hasDefault } = await inspectPkg(opts.root, opts.spec);
    return {
        source: generatePkgWrapperSource(opts.spec, names, hasDefault),
        names,
        hasDefault
    };
}

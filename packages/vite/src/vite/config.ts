import { createRequire } from 'node:module';
import path from 'node:path';
import type { Esmx } from '@esmx/core';
import type { InlineConfig, Plugin } from 'vite';
import type { BuildTarget } from './build-target';
import { esmxExternalRequirePlugin } from './external-require-plugin';
import {
    esmxManifestPlugin,
    type ManifestExportInput
} from './manifest-plugin';

type RequireFn = ReturnType<typeof createRequire>;

/** Virtual-id prefix for pkg-export re-export entries. */
const PKG_REEXPORT_PREFIX = '\0esmx-pkg-reexport:';

interface PkgReexport {
    /** Resolved absolute path of the real package entry. */
    path: string;
    /** Statically re-exported named exports (valid JS identifiers only). */
    names: string[];
}

const IDENTIFIER_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/;
const RESERVED = new Set(['default', '__esModule']);

/**
 * Enumerate a package's named exports by loading it in Node. CommonJS packages
 * such as react assign their exports at runtime (inside conditional
 * `./cjs/*.js` files), so neither `export *` nor Rollup's static analysis can
 * recover them — but `Object.keys(require(pkg))` can.
 */
function resolvePkgNames(requireFn: RequireFn, target: string): string[] {
    try {
        const mod = requireFn(target);
        if (!mod || typeof mod !== 'object') return [];
        return Object.keys(mod).filter(
            (k) => IDENTIFIER_RE.test(k) && !RESERVED.has(k)
        );
    } catch (error) {
        // Not silent: failing to enumerate names degrades the re-export to
        // `default`-only, which breaks `import { x } from '<pkg>'` for
        // consumers — warn loudly with the cause so it is diagnosable.
        const message = error instanceof Error ? error.message : String(error);
        console.warn(
            `[esmx:vite] failed to enumerate named exports of "${target}" (${message}); only its default export will be re-exported, so named imports of this federated package may fail at runtime.`
        );
        return [];
    }
}

/**
 * Build a virtual entry per pkg export that re-exports the real package as a
 * federation chunk with STATIC named exports.
 *
 * Pointing the Rollup entry straight at a CommonJS package (e.g. react) yields
 * only a `default` export, breaking `import { useState } from 'react'` for
 * consumers resolved through the import map. We instead emit explicit
 * `export const <name> = __m.<name>` bindings (names discovered by loading the
 * package in Node), matching what rspack produces, plus a default export.
 */
function esmxPkgReexportPlugin(reexports: Map<string, PkgReexport>): Plugin {
    return {
        name: 'esmx:pkg-reexport',
        resolveId(id) {
            return reexports.has(id) ? id : null;
        },
        load(id) {
            const entry = reexports.get(id);
            if (!entry) return null;
            const spec = JSON.stringify(entry.path);
            const lines = [`import __m from ${spec};`, 'export default __m;'];
            for (const name of entry.names) {
                lines.push(
                    `export const ${name} = __m[${JSON.stringify(name)}];`
                );
            }
            return lines.join('\n');
        }
    };
}

export interface ViteAppOptions {
    /** Enable minification. Defaults to production. */
    minimize?: boolean;
    /** Hook to mutate the resolved Vite config before building. */
    config?: (context: ViteAppConfigContext) => void;
}

export interface ViteAppConfigContext {
    esmx: Esmx;
    buildTarget: BuildTarget;
    config: InlineConfig;
    options: ViteAppOptions;
}

/**
 * The set of exports (one ESM entry each) the given target must emit, derived
 * from esmx's parsed module config. For the `node` target this is the single
 * server bootstrap entry.
 */
function resolveTargetExports(
    esmx: Esmx,
    buildTarget: BuildTarget
): Array<{ name: string; file: string; pkg: boolean }> {
    if (buildTarget === 'node') {
        return [
            { name: 'src/entry.node', file: './src/entry.node', pkg: false }
        ];
    }
    const env = esmx.moduleConfig.environments[buildTarget];
    return Object.values(env.exports)
        .filter((e) => e.file !== '')
        .map((e) => ({ name: e.name, file: e.file, pkg: e.pkg }));
}

/**
 * Build a predicate that marks specifiers external so they are left as bare
 * imports and resolved by the esmx import map at runtime. Mirrors the rspack
 * module-link externals + nodeExternals behavior.
 */
export function createExternalPredicate(
    esmx: Esmx,
    buildTarget: BuildTarget
): (id: string) => boolean {
    const isNode = buildTarget === 'node';
    const env =
        buildTarget === 'node'
            ? esmx.moduleConfig.environments.server
            : esmx.moduleConfig.environments[buildTarget];

    // Bare specifiers this module exposes through scopes/imports (e.g. "react").
    const bareExternals = new Set<string>();
    for (const scope of Object.values(env.scopes)) {
        for (const key of Object.keys(scope)) bareExternals.add(key);
    }
    for (const key of Object.keys(env.imports)) bareExternals.add(key);

    // Other linked modules (micro-frontend deps) are always external.
    const depNames = Object.keys(esmx.moduleConfig.links).filter(
        (name) => name !== esmx.name
    );

    const isBare = (id: string) =>
        !id.startsWith('.') && !id.startsWith('/') && !path.isAbsolute(id);

    return (id: string): boolean => {
        if (id.startsWith('node:')) return true;
        if (bareExternals.has(id)) return true;
        for (const dep of depNames) {
            if (id === dep || id.startsWith(`${dep}/`)) return true;
        }
        // The node bootstrap externalizes all third-party deps, like nodeExternals.
        if (isNode && isBare(id)) return true;
        return false;
    };
}

/**
 * Translate esmx's module config into a Vite InlineConfig for one build target.
 */
export function createViteConfig(
    esmx: Esmx,
    buildTarget: BuildTarget,
    options: ViteAppOptions
): InlineConfig {
    const isClient = buildTarget === 'client';
    const isNode = buildTarget === 'node';
    const isProd = esmx.isProd;

    const targetExports = resolveTargetExports(esmx, buildTarget);
    const requireFromRoot = createRequire(path.join(esmx.root, 'index.js'));
    const input: Record<string, string> = {};
    // Virtual re-export entries for pkg exports (see esmxPkgReexportPlugin).
    const pkgReexports = new Map<string, PkgReexport>();
    for (const exp of targetExports) {
        if (exp.pkg) {
            // A pkg export (e.g. "react") is built as its own federation chunk
            // with explicit static named exports, so consumers doing
            // `import { useState } from 'react'` resolve correctly at runtime.
            const virtualId = `${PKG_REEXPORT_PREFIX}${exp.name}`;
            const resolved = requireFromRoot.resolve(exp.file);
            pkgReexports.set(virtualId, {
                path: resolved,
                names: resolvePkgNames(requireFromRoot, resolved)
            });
            input[exp.name] = virtualId;
        } else {
            // File exports resolve to an ABSOLUTE path so they are real entry
            // inputs (the external predicate matches bare specifiers only).
            input[exp.name] = path.resolve(esmx.root, exp.file);
        }
    }

    const manifestExports: ManifestExportInput[] = targetExports.map((e) => ({
        name: e.name,
        pkg: e.pkg
    }));

    const isExternal = createExternalPredicate(esmx, buildTarget);

    // Federation bare specifiers (e.g. "react", "react-dom", "vue", linked
    // micro deps) — passed to the require-rewrite plugin so it knows which
    // `__require("X")` calls to convert to ESM imports.
    const externalEnv =
        buildTarget === 'node'
            ? esmx.moduleConfig.environments.server
            : esmx.moduleConfig.environments[buildTarget];
    const externalNames = new Set<string>();
    for (const scope of Object.values(externalEnv.scopes)) {
        for (const key of Object.keys(scope)) externalNames.add(key);
    }
    for (const key of Object.keys(externalEnv.imports)) externalNames.add(key);
    for (const dep of Object.keys(esmx.moduleConfig.links)) {
        if (dep !== esmx.name) externalNames.add(dep);
    }

    const hashed = isProd && !isNode;
    const entryFileNames = hashed ? '[name].[hash].final.mjs' : '[name].mjs';
    const chunkFileNames = isProd
        ? 'chunks/[name].[hash].final.mjs'
        : 'chunks/[name].mjs';
    const assetFileNames = isProd
        ? '[name].[hash].final[extname]'
        : '[name][extname]';

    const config: InlineConfig = {
        root: esmx.root,
        configFile: false,
        logLevel: 'warn',
        mode: isProd ? 'production' : 'development',
        define: isClient
            ? {
                  'process.env.NODE_ENV': JSON.stringify(
                      isProd ? 'production' : 'development'
                  )
              }
            : undefined,
        resolve: {
            // Self-reference: `import 'name/src/x'` resolves into the project.
            alias: { [esmx.name]: esmx.root }
        },
        // For SSR builds Vite externalizes deps to node_modules by default,
        // which would load a SECOND copy of react/vue (breaking shared hooks /
        // SSR internals). Bundle everything instead; the only externals are the
        // federation bare specifiers handled by rollupOptions.external, so
        // subpaths like react-dom/server are inlined yet still import the single
        // federated react/react-dom.
        ssr: isClient ? undefined : { noExternal: true },
        build: {
            outDir: esmx.resolvePath('dist', buildTarget),
            emptyOutDir: isProd,
            minify: options.minimize ?? isProd,
            target: 'esnext',
            ssr: !isClient,
            cssCodeSplit: true,
            rollupOptions: {
                input,
                external: isExternal,
                // Federation entries: their exports are consumed externally via
                // the import map, never within this bundle. Without strict
                // preservation Vite tree-shakes "unused" entry exports.
                preserveEntrySignatures: 'strict',
                output: {
                    format: 'es',
                    entryFileNames,
                    chunkFileNames,
                    assetFileNames
                }
            }
        },
        plugins: [
            esmxPkgReexportPlugin(pkgReexports),
            ...(externalNames.size
                ? [esmxExternalRequirePlugin([...externalNames])]
                : []),
            esmxManifestPlugin({
                moduleName: esmx.name,
                exports: manifestExports,
                integrity: isProd,
                root: esmx.root,
                // The server build seeds core's SSR chunk set via
                // import.meta.chunkName so federated chunk CSS is collected.
                injectChunkName: buildTarget === 'server'
            })
        ]
    };

    options.config?.({ esmx, buildTarget, config, options });
    return config;
}

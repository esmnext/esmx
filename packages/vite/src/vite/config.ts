import { createRequire } from 'node:module';
import path from 'node:path';
import type { Esmx } from '@esmx/core';
import type { InlineConfig } from 'vite';
import type { BuildTarget } from './build-target';
import {
    esmxManifestPlugin,
    type ManifestExportInput
} from './manifest-plugin';

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
function createExternalPredicate(
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
    for (const exp of targetExports) {
        // Each export resolves to an ABSOLUTE module path so it is a real entry
        // input. The external predicate matches the bare specifier string
        // (e.g. "react"), never this resolved path — otherwise Rollup would
        // reject "entry module cannot be external".
        input[exp.name] = exp.pkg
            ? requireFromRoot.resolve(exp.file)
            : path.resolve(esmx.root, exp.file);
    }

    const manifestExports: ManifestExportInput[] = targetExports.map((e) => ({
        name: e.name,
        pkg: e.pkg
    }));

    const isExternal = createExternalPredicate(esmx, buildTarget);

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
            esmxManifestPlugin({
                moduleName: esmx.name,
                exports: manifestExports,
                integrity: isProd
            })
        ]
    };

    options.config?.({ esmx, buildTarget, config, options });
    return config;
}

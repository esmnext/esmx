import path from 'node:path';
import type { Esmx } from '@esmx/core';
import { buildPkgWrapper } from '@esmx/pkg-wrapper';
import { type RsbuildConfig, rspack } from '@rsbuild/core';
import RspackVirtualModulePlugin from 'rspack-plugin-virtual-module';
import nodeExternals from 'webpack-node-externals';
import type { BuildTarget } from './build-target';
import {
    EsmxManifestPlugin,
    type ManifestExportInput
} from './manifest-plugin';

export interface RsbuildAppOptions {
    /** Enable minification. Defaults to production. */
    minimize?: boolean;
    /** Hook to mutate the resolved Rsbuild config before building. */
    config?: (context: RsbuildAppConfigContext) => void;
}

export interface RsbuildAppConfigContext {
    esmx: Esmx;
    buildTarget: BuildTarget;
    config: RsbuildConfig;
    options: RsbuildAppOptions;
}

/** Exports (one ESM entry each) the target must emit. */
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

/** Predicate marking specifiers external (resolved by the esmx import map). */
export function createIsExternal(
    esmx: Esmx,
    buildTarget: BuildTarget
): (request: string) => boolean {
    const env =
        buildTarget === 'node'
            ? esmx.moduleConfig.environments.server
            : esmx.moduleConfig.environments[buildTarget];

    const bareExternals = new Set<string>();
    for (const scope of Object.values(env.scopes)) {
        for (const key of Object.keys(scope)) bareExternals.add(key);
    }
    for (const key of Object.keys(env.imports)) bareExternals.add(key);

    const depNames = Object.keys(esmx.moduleConfig.links).filter(
        (name) => name !== esmx.name
    );

    return (request: string): boolean => {
        if (bareExternals.has(request)) return true;
        for (const dep of depNames) {
            if (request === dep || request.startsWith(`${dep}/`)) return true;
        }
        return false;
    };
}

export interface CreateRsbuildConfigContext {
    /** Extra entry modules prepended to the browser entry (e.g. HMR client). */
    preEntries?: string[];
    /** Inject the HMR plugin (client + dev). */
    hot?: boolean;
}

/**
 * Translate esmx's module config into an Rsbuild config for one build target.
 */
export async function createRsbuildConfig(
    esmx: Esmx,
    buildTarget: BuildTarget,
    options: RsbuildAppOptions,
    ctx: CreateRsbuildConfigContext = {}
): Promise<RsbuildConfig> {
    const isClient = buildTarget === 'client';
    const isNode = buildTarget === 'node';
    const isProd = esmx.isProd;

    const targetExports = resolveTargetExports(esmx, buildTarget);
    const entry: Record<string, string | string[]> = {};
    // Each `pkg:react` export becomes a VIRTUAL MODULE — a wrapper that
    // imports the real package by its original bare specifier and re-exports
    // every named field explicitly. Without this, rsbuild's dev mode does not
    // enumerate CJS named exports for a bare-specifier entry and
    // `import { useState } from 'react'` resolves to undefined.
    //
    // The virtual is registered with `webpack-virtual-modules` under a
    // pseudo-path; the federation entry points at that pseudo-path. The
    // wrapper's own `import * as __ns from 'react'` keeps the bundler's
    // resolver / aliases working — externals must skip it (issuer = wrapper)
    // to avoid routing back to the wrapper itself.
    const virtualModules: Record<string, string> = {};
    const wrapperFiles = new Set<string>();
    const virtualBaseDir = path.join(
        esmx.root,
        'node_modules',
        `.esmx-virtual-${esmx.name}`
    );
    for (const exp of targetExports) {
        let resolved: string;
        if (exp.pkg) {
            const { source } = await buildPkgWrapper({
                root: esmx.root,
                spec: exp.file
            });
            const safeName = `${exp.file.replace(/[^A-Za-z0-9_-]/g, '_')}.mjs`;
            virtualModules[safeName] = source;
            const actualPath = path.join(virtualBaseDir, safeName);
            wrapperFiles.add(actualPath);
            resolved = actualPath;
        } else {
            resolved = path.resolve(esmx.root, exp.file);
        }
        entry[exp.name] =
            isClient && ctx.preEntries?.length
                ? [...ctx.preEntries, resolved]
                : resolved;
    }

    const manifestExports: ManifestExportInput[] = targetExports.map((e) => ({
        name: e.name,
        pkg: e.pkg
    }));

    const isExternal = createIsExternal(esmx, buildTarget);
    const hashed = isProd && !isNode;

    const config: RsbuildConfig = {
        root: esmx.root,
        mode: isProd ? 'production' : 'development',
        source: { entry },
        output: {
            target: isClient ? 'web' : 'node',
            distPath: { root: esmx.resolvePath('dist', buildTarget) },
            minify: options.minimize ?? isProd,
            filenameHash: hashed
        },
        performance: { chunkSplit: { strategy: 'all-in-one' } },
        tools: {
            htmlPlugin: false,
            rspack: (rspackConfig) => {
                // Disable persistent cache in production so federation chunks
                // are always emitted from the current config (mirrors
                // @esmx/rspack's `cache(!isProd)`); stale cache otherwise drops
                // tree-shaken exports non-deterministically.
                rspackConfig.cache = !isProd;

                rspackConfig.output = rspackConfig.output ?? {};
                rspackConfig.output.module = true;
                rspackConfig.output.chunkFormat = 'module';
                rspackConfig.output.chunkLoading = 'import';
                rspackConfig.output.library = { type: 'module' };
                rspackConfig.output.filename = hashed
                    ? '[name].[contenthash:8].final.mjs'
                    : '[name].mjs';
                rspackConfig.output.chunkFilename = isProd
                    ? 'chunks/[name].[contenthash:8].final.mjs'
                    : 'chunks/[name].mjs';
                rspackConfig.output.cssFilename = isProd
                    ? '[name].[contenthash:8].final.css'
                    : '[name].css';

                rspackConfig.externalsType = 'module';
                const externals: Array<unknown> = [
                    (
                        data: {
                            request?: string;
                            contextInfo?: { issuer?: string };
                        },
                        callback: (err?: null, result?: string) => void
                    ) => {
                        const request = data.request ?? '';
                        // Only externalize a federation specifier when it is
                        // imported BY another module (has an issuer). The pkg
                        // export's own entry module has no issuer and must be
                        // built, not externalized into an empty re-export —
                        // mirrors @esmx/rspack's module-link externals.
                        const issuer = data.contextInfo?.issuer;
                        // The wrapper IS the federation chunk for its package;
                        // its inner `import __m from '<abs-pkg-path>'` must not
                        // be externalized or it would route back to the
                        // wrapper itself (cyclic).
                        if (issuer && wrapperFiles.has(issuer)) {
                            return callback();
                        }
                        if (issuer && isExternal(request)) {
                            return callback(null, `module ${request}`);
                        }
                        callback();
                    }
                ];
                if (isNode) {
                    externals.push(
                        nodeExternals({
                            importType: 'module' as never
                        }) as unknown
                    );
                }
                rspackConfig.externals = externals as never;

                rspackConfig.optimization = rspackConfig.optimization ?? {};
                rspackConfig.optimization.avoidEntryIife = true;
                // Federation chunks expose their exports to OTHER bundles via
                // the import map, so an export unused within this bundle (e.g.
                // vue's `ssrUtils`, consumed only by @vue/server-renderer) must
                // not be tree-shaken away. Rsbuild's production defaults would
                // drop it; keep all exports like @esmx/rspack's library mode.
                rspackConfig.optimization.usedExports = false;

                rspackConfig.plugins = rspackConfig.plugins ?? [];
                if (Object.keys(virtualModules).length > 0) {
                    rspackConfig.plugins.push(
                        new RspackVirtualModulePlugin(
                            virtualModules,
                            `.esmx-virtual-${esmx.name}`
                        )
                    );
                }
                rspackConfig.plugins.push(
                    new EsmxManifestPlugin({
                        moduleName: esmx.name,
                        exports: manifestExports,
                        integrity: isProd,
                        root: esmx.root,
                        // Server build seeds core's SSR chunk set via
                        // import.meta.chunkName so federated chunk CSS is
                        // collected at commit().
                        injectChunkName: buildTarget === 'server'
                    })
                );

                if (ctx.hot && isClient) {
                    rspackConfig.plugins.push(
                        new rspack.HotModuleReplacementPlugin()
                    );
                }
            }
        }
    };

    options.config?.({ esmx, buildTarget, config, options });
    return config;
}

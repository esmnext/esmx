import type { Esmx } from '@esmx/core';
import { moduleLinkPlugin } from '@esmx/rspack-module-link-plugin';
import {
    type ExternalItem,
    type Plugin,
    type Plugins,
    type RspackOptions,
    rspack
} from '@rspack/core';
import nodeExternals from 'webpack-node-externals';
import type { RspackAppOptions } from './app';
import type { BuildTarget } from './build-target';
import { HMR_DIR, HMR_JSONP } from './hmr-config';

/**
 * Base configuration for building Client, Server, and Node targets
 */
export function createRspackConfig(
    esmx: Esmx,
    buildTarget: BuildTarget,
    options: RspackAppOptions
): RspackOptions {
    const isHot = buildTarget === 'client' && !esmx.isProd;
    return {
        /**
         * Project root directory, cannot be modified
         */
        context: esmx.root,
        output: {
            clean: esmx.isProd,
            filename:
                buildTarget !== 'node' && esmx.isProd
                    ? 'exports/[name].[contenthash:8].final.mjs'
                    : 'exports/[name].mjs',
            cssFilename: esmx.isProd
                ? 'exports/[name].[contenthash:8].final.css'
                : 'exports/[name].css',
            chunkFilename: esmx.isProd
                ? 'chunks/[name].[contenthash:8].final.mjs'
                : 'chunks/[name].mjs',
            cssChunkFilename: esmx.isProd
                ? 'chunks/[name].[contenthash:8].final.css'
                : 'chunks/[name].css',
            publicPath:
                buildTarget === 'client'
                    ? 'auto'
                    : `${esmx.basePathPlaceholder}${esmx.basePath}`,
            uniqueName: esmx.varName,
            hotUpdateGlobal: HMR_JSONP,
            chunkLoadingGlobal: HMR_JSONP + '_chunk',
            hotUpdateChunkFilename: `${HMR_DIR}/[id].[fullhash].hot-update.mjs`,
            hotUpdateMainFilename: `${HMR_DIR}/[runtime].[fullhash].hot-update.json`,
            path: ((): string => {
                switch (buildTarget) {
                    case 'client':
                        return esmx.resolvePath('dist/client');
                    case 'server':
                        return esmx.resolvePath('dist/server');
                    case 'node':
                        return esmx.resolvePath('dist/node');
                }
            })()
        },
        plugins: ((): Plugins => {
            return [
                new rspack.ProgressPlugin({
                    prefix: buildTarget
                }),
                createModuleLinkPlugin(esmx, buildTarget),
                isHot ? new rspack.HotModuleReplacementPlugin() : false
            ];
        })(),
        module: {
            parser: {
                javascript: {
                    // DEV hot update fix
                    dynamicImportMode: esmx.isProd ? 'lazy' : 'eager',
                    url: buildTarget === 'client' ? true : 'relative'
                }
            },
            generator: {
                asset: {
                    emit: buildTarget === 'client'
                },
                'asset/resource': {
                    emit: buildTarget === 'client'
                }
            },
            rules: []
        },
        resolve: {
            alias: {
                [esmx.name]: esmx.root
            }
        },
        optimization: {
            minimize: options.minimize ?? esmx.isProd,
            emitOnErrors: true,
            // DEV hot update fix
            splitChunks: esmx.isProd ? undefined : false,
            // DEV hot update fix
            runtimeChunk: esmx.isProd ? undefined : false
        },
        externalsPresets: {
            web: buildTarget === 'client',
            node: buildTarget === 'server' || buildTarget === 'node'
        },
        externalsType: 'module-import',
        externals: ((): ExternalItem[] => {
            if (buildTarget === 'node') {
                return [
                    // @ts-ignore
                    nodeExternals({
                        // @ts-ignore
                        importType: 'module-import'
                    })
                ];
            }
            return [];
        })(),
        target: buildTarget === 'client' ? 'web' : 'node24',
        mode: esmx.isProd ? 'production' : 'development',
        cache: !esmx.isProd
    };
}

function createModuleLinkPlugin(esmx: Esmx, buildTarget: BuildTarget): Plugin {
    if (buildTarget === 'node') {
        return moduleLinkPlugin({
            name: esmx.name,
            exports: {
                'src/entry.node': {
                    rewrite: false,
                    file: './src/entry.node'
                }
            }
        });
    }
    const exports: Record<
        string,
        {
            rewrite: boolean;
            file: string;
        }
    > = {};
    for (const [name, item] of Object.entries(esmx.moduleConfig.exports)) {
        if (item.entryPoints[buildTarget]) {
            exports[name] = {
                rewrite: item.rewrite,
                file: item.entryPoints[buildTarget]
            };
        }
    }
    const preEntries: string[] = [];
    if (buildTarget === 'client' && !esmx.isProd) {
        preEntries.push(
            `${import.meta.resolve('webpack-hot-middleware/client.js')}?path=/${esmx.name}/hot-middleware`
        );
    }

    return moduleLinkPlugin({
        name: esmx.name,
        injectChunkName: buildTarget === 'server',
        imports: esmx.moduleConfig.imports,
        deps: Object.keys(esmx.moduleConfig.links),
        exports,
        preEntries
    });
}

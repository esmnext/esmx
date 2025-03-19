import type { Gez } from '@gez/core';
import { moduleLinkPlugin } from '@gez/rspack-module-link-plugin';
import {
    type ExternalItem,
    type Plugins,
    type RspackOptions,
    rspack
} from '@rspack/core';
import nodeExternals from 'webpack-node-externals';
import type { RspackAppOptions } from './app';
import type { BuildTarget } from './build-target';

/**
 * 构建 Client、Server、Node 的基础配置
 */
export function createRspackConfig(
    gez: Gez,
    buildTarget: BuildTarget,
    options: RspackAppOptions
): RspackOptions {
    const isWebApp = buildTarget === 'client' || buildTarget === 'server';
    const isHot = buildTarget === 'client' && !gez.isProd;
    return {
        /**
         * 项目根目录，不可修改
         */
        context: gez.root,
        entry: (() => {
            const importPaths: string[] = [];
            switch (buildTarget) {
                case 'client':
                    importPaths.push(gez.resolvePath('src/entry.client.ts'));
                    isHot &&
                        importPaths.push(
                            `${resolve('webpack-hot-middleware/client')}?path=${gez.basePath}hot-middleware&timeout=5000&overlay=false`
                        );
                    break;
                case 'server':
                    importPaths.push(gez.resolvePath('src/entry.server.ts'));
                    break;
                case 'node':
                    importPaths.push(gez.resolvePath('src/entry.node.ts'));
                    break;
            }
            return {
                [`./src/entry.${buildTarget}`]: {
                    import: importPaths
                }
            };
        })(),
        output: {
            clean: gez.isProd,
            module: true,
            chunkFormat: gez.isProd ? 'module' : undefined,
            chunkLoading: gez.isProd ? 'import' : undefined,
            chunkFilename: gez.isProd
                ? 'chunks/[name].[contenthash:8].final.js'
                : 'chunks/[name].js',
            library: {
                type: gez.isProd ? 'modern-module' : 'module'
            },
            filename:
                buildTarget !== 'node' && gez.isProd
                    ? '[name].[contenthash:8].final.js'
                    : '[name].js',
            cssFilename: gez.isProd
                ? '[name].[contenthash:8].final.css'
                : '[name].css',
            cssChunkFilename: gez.isProd
                ? 'chunks/[name].[contenthash:8].final.css'
                : 'chunks/[name].css',
            publicPath:
                buildTarget === 'client'
                    ? 'auto'
                    : `${gez.basePathPlaceholder}${gez.basePath}`,
            uniqueName: gez.varName,
            hotUpdateChunkFilename: '__hot__/[id].[fullhash].hot-update.js',
            hotUpdateMainFilename:
                '__hot__/[runtime].[fullhash].hot-update.json',
            path: ((): string => {
                switch (buildTarget) {
                    case 'client':
                        return gez.resolvePath('dist/client');
                    case 'server':
                        return gez.resolvePath('dist/server');
                    case 'node':
                        return gez.resolvePath('dist/node');
                }
            })(),
            environment: {
                nodePrefixForCoreModules: true
            }
        },
        // 默认插件，不可修改
        plugins: ((): Plugins => {
            return [
                // 进度条插件
                new rspack.ProgressPlugin({
                    prefix: buildTarget
                }),
                // 模块链接插件
                isWebApp ? moduleLinkPlugin(gez.moduleConfig) : false,
                // 热更新插件
                isHot ? new rspack.HotModuleReplacementPlugin() : false
            ];
        })(),
        module: {
            parser: {
                javascript: {
                    url: buildTarget === 'client' ? true : 'relative',
                    importMeta: false,
                    strictExportPresence: true
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
                [gez.name]: gez.root
            }
        },
        optimization: {
            minimize: options.minimize ?? gez.isProd,
            avoidEntryIife: gez.isProd,
            concatenateModules: gez.isProd,
            emitOnErrors: true,
            splitChunks: {
                chunks: 'async'
            }
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
        experiments: {
            outputModule: true,
            parallelCodeSplitting: true,
            rspackFuture: {
                bundlerInfo: { force: false }
            }
        },
        target: buildTarget === 'client' ? 'web' : 'node22.6',
        mode: gez.isProd ? 'production' : 'development',
        cache: !gez.isProd
    };
}

function resolve(name: string) {
    return new URL(import.meta.resolve(name)).pathname;
}

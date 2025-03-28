import type { ManifestJson, ParsedModuleConfig } from '@esmx/core';
import type { Compilation, Compiler, StatsCompilation } from '@rspack/core';
import { generateIdentifier } from './identifier';

export function packagePlugin(
    moduleConfig: ParsedModuleConfig,
    compiler: Compiler
) {
    compiler.hooks.thisCompilation.tap(
        'importmap-plugin',
        (compilation: Compilation) => {
            let manifestJson: ManifestJson = {
                name: moduleConfig.name,
                exports: {},
                buildFiles: [],
                chunks: {}
            };
            compilation.hooks.processAssets.tap(
                {
                    name: 'importmap-plugin',
                    stage: compiler.rspack.Compilation
                        .PROCESS_ASSETS_STAGE_ADDITIONAL
                },
                (assets) => {
                    const stats = compilation.getStats().toJson({
                        hash: true,
                        entrypoints: true
                    });

                    const exports = getExports(stats);
                    const resources = Object.keys(assets)
                        .map(transFileName)
                        .filter((file) => !file.includes('hot-update'));
                    manifestJson = {
                        name: moduleConfig.name,
                        exports: exports,
                        buildFiles: resources,
                        chunks: getChunks(moduleConfig, compilation)
                    };

                    const { RawSource } = compiler.rspack.sources;

                    compilation.emitAsset(
                        'manifest.json',
                        new RawSource(JSON.stringify(manifestJson, null, 4))
                    );
                }
            );

            if (
                typeof compilation.options.target !== 'string' ||
                !compilation.options.target.startsWith('node')
            ) {
                return;
            }
            compilation.hooks.processAssets.tap(
                {
                    name: 'import-meta-build-from',
                    stage: compiler.rspack.Compilation
                        .PROCESS_ASSETS_STAGE_ADDITIONS
                },
                (assets) => {
                    Object.entries(manifestJson.chunks).forEach(
                        ([name, value]) => {
                            const asset = assets[value.js];
                            if (!asset) {
                                return;
                            }
                            const { RawSource } = compiler.rspack.sources;
                            const source = new RawSource(
                                `import.meta.chunkName = import.meta.chunkName ?? ${JSON.stringify(name)};${asset.source()}`
                            );

                            compilation.updateAsset(value.js, source);
                        }
                    );
                }
            );
        }
    );
}

/**
 * 使用正则表达式替换文件名中的前导点和斜杠为空字符串
 * @param {string} fileName - 要转换的文件名
 * @returns 转换后的文件名，不包含前导点和斜杠
 *
 * @example transFileName("./example.txt") => "example.txt"
 */
function transFileName(fileName: string): string {
    return fileName.replace(/^.\//, '');
}

export function getExports(stats: StatsCompilation) {
    const entrypoints = stats.entrypoints || {};
    const exports: Record<string, string> = {};
    const prefix = './';
    Object.entries(entrypoints).forEach(([key, value]) => {
        const asset = value.assets?.find((item) => {
            return (
                item.name.endsWith('.js') && !item.name.includes('hot-update')
            );
        });
        if (!asset) return;
        const target = asset.name;
        if (!key.startsWith(prefix) && !target.endsWith('.js')) return;

        exports[key.substring(prefix.length)] = target.substring(prefix.length);
    });
    return exports;
}

function getChunks(config: ParsedModuleConfig, compilation: Compilation) {
    const stats = compilation.getStats().toJson({
        all: false,
        chunks: true,
        modules: true,
        chunkModules: true,
        ids: true
    });
    const buildChunks: ManifestJson['chunks'] = {};
    stats.chunks?.forEach((chunk) => {
        const module = chunk.modules
            ?.sort((a, b) => {
                return (a.index ?? -1) - (b?.index ?? -1);
            })
            ?.find((module) => {
                return module.moduleType?.includes('javascript/');
            });
        if (!module?.nameForCondition) return;
        const js = chunk.files?.find((file) => file.endsWith('.js'));
        if (!js) return;

        const name = generateIdentifier({
            root: config.root,
            name: config.name,
            filePath: module.nameForCondition
        });

        const css = chunk.files?.filter((file) => file.endsWith('.css')) ?? [];
        const resources = chunk.auxiliaryFiles ?? [];
        const sizes = chunk.sizes ?? {};
        buildChunks[name] = {
            js,
            css,
            resources,
            sizes: {
                js: (sizes?.javascript ?? 0) + (sizes.runtime ?? 0),
                css: (sizes.css ?? 0) + (sizes['css/mini-extract'] ?? 0),
                resource: sizes.asset ?? 0
            }
        };
    });
    return buildChunks;
}

import type { Compilation, Compiler, StatsCompilation } from '@rspack/core';
import upath from 'upath';
import type {
    ManifestJson,
    ManifestJsonChunks,
    ManifestJsonExports,
    ParsedModuleLinkPluginOptions
} from './types';

export const RSPACK_PLUGIN_NAME = 'rspack-module-link-plugin';

export class ManifestPlugin {
    constructor(private opts: ParsedModuleLinkPluginOptions) {}

    apply(compiler: Compiler) {
        const opts = this.opts;
        const { Compilation } = compiler.rspack;
        compiler.hooks.thisCompilation.tap(
            RSPACK_PLUGIN_NAME,
            (compilation) => {
                let manifestJson: ManifestJson = {
                    name: opts.name,
                    exports: {},
                    scopes: opts.scopes,
                    files: [],
                    chunks: {}
                };

                compilation.hooks.processAssets.tap(
                    {
                        name: RSPACK_PLUGIN_NAME,
                        stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
                    },
                    (assets) => {
                        const stats = compilation.getStats().toJson({
                            hash: true,
                            entrypoints: true
                        });

                        const exports = getExports(opts, stats);
                        const resources = Object.keys(assets)
                            .map(transFileName)
                            .filter((file) => !file.includes('hot-update'));
                        manifestJson = {
                            name: opts.name,
                            exports: exports,
                            scopes: opts.scopes,
                            files: resources,
                            chunks: getChunks(opts, compilation)
                        };
                        const { RawSource } = compiler.rspack.sources;

                        compilation.emitAsset(
                            'manifest.json',
                            new RawSource(JSON.stringify(manifestJson, null, 4))
                        );
                    }
                );

                if (opts.injectChunkName) {
                    compilation.hooks.processAssets.tap(
                        {
                            name: RSPACK_PLUGIN_NAME,
                            stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
                        },
                        (assets) => {
                            const { RawSource } = compiler.rspack.sources;
                            for (const [key, value] of Object.entries(
                                manifestJson.chunks
                            )) {
                                const asset = assets[value.js];
                                if (!asset) {
                                    return;
                                }
                                const source = new RawSource(
                                    `import.meta.chunkName = import.meta.chunkName ?? ${JSON.stringify(key)};\n${asset.source()}`
                                );

                                compilation.updateAsset(value.js, source);
                            }
                        }
                    );
                }
            }
        );
    }
}

function transFileName(fileName: string): string {
    return fileName.replace(/^.\//, '');
}

export function getExports(
    opts: ParsedModuleLinkPluginOptions,
    stats: StatsCompilation
): ManifestJsonExports {
    const entrypoints = stats.entrypoints || {};
    const exports: ManifestJsonExports = {};

    for (const [key, value] of Object.entries(entrypoints)) {
        const asset = value.assets?.find((item) => {
            return (
                item.name.endsWith(opts.ext) &&
                !item.name.includes('hot-update')
            );
        });
        if (!asset) continue;
        if (key in opts.exports) {
            exports[key] = {
                ...opts.exports[key],
                file: asset.name
            };
        }
    }
    return exports;
}

function getChunks(
    opts: ParsedModuleLinkPluginOptions,
    compilation: Compilation
) {
    const stats = compilation.getStats().toJson({
        all: false,
        chunks: true,
        modules: true,
        chunkModules: true,
        ids: true
    });
    const buildChunks: ManifestJsonChunks = {};
    if (!stats.chunks) return buildChunks;

    for (const chunk of stats.chunks) {
        const module = chunk.modules
            ?.sort((a, b) => {
                return (a.index ?? -1) - (b?.index ?? -1);
            })
            ?.find((module) => {
                return module.moduleType?.includes('javascript/');
            });
        if (!module?.nameForCondition) continue;

        const js = chunk.files?.find((file) => file.endsWith(opts.ext));
        if (!js) continue;

        const root = compilation.options.context ?? process.cwd();
        const name = generateIdentifier({
            root,
            name: opts.name,
            filePath: module.nameForCondition
        });

        const css = chunk.files?.filter((file) => file.endsWith('.css')) ?? [];
        const resources = chunk.auxiliaryFiles ?? [];
        buildChunks[name] = {
            name,
            js,
            css,
            resources
        };
    }
    return buildChunks;
}

export function generateIdentifier({
    root,
    name,
    filePath
}: {
    root: string;
    name: string;
    filePath: string;
}) {
    const unixFilePath = upath.toUnix(filePath);
    if (!root) {
        return `${name}@${unixFilePath}`;
    }
    const file = upath.relative(upath.toUnix(root), unixFilePath);
    return `${name}@${file}`;
}

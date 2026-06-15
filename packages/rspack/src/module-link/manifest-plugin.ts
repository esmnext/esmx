import { buildManifestProtocolFields } from '@esmx/core';
import type { Compiler, StatsChunk, StatsCompilation } from '@rspack/core';
import upath from 'upath';
import type {
    ManifestJson,
    ManifestJsonChunks,
    ManifestJsonExports,
    ParsedModuleLinkPluginOptions
} from './types';

export const RSPACK_PLUGIN_NAME = 'rspack-module-link-plugin';

export class ManifestPlugin {
    constructor(
        private opts: ParsedModuleLinkPluginOptions,
        isProduction: boolean
    ) {}

    apply(compiler: Compiler) {
        const opts = this.opts;
        const { Compilation } = compiler.rspack;
        compiler.hooks.thisCompilation.tap(
            RSPACK_PLUGIN_NAME,
            (compilation) => {
                let manifestJson: ManifestJson = {
                    ...buildManifestProtocolFields(
                        compiler.options.context ?? process.cwd(),
                        []
                    ),
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
                        const chunksStats = compilation.getStats().toJson({
                            all: false,
                            chunks: true,
                            modules: true,
                            chunkModules: true,
                            ids: true,
                            entrypoints: true,
                            chunkRelations: true
                        });
                        const root =
                            compilation.options.context ?? process.cwd();
                        manifestJson = {
                            ...buildManifestProtocolFields(
                                root,
                                Object.values(exports)
                                    .filter((exp) => exp.pkg)
                                    .map((exp) => exp.name)
                            ),
                            name: opts.name,
                            exports: exports,
                            scopes: opts.scopes,
                            files: resources,
                            chunks: getChunks(opts, chunksStats, root)
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
                item.name.startsWith(key) &&
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

/**
 * Build the `chunks` section of the federation manifest from rspack stats.
 *
 * Each emitted chunk that owns at least one JS module gets a manifest entry
 * keyed by a stable, root-relative identifier (`<remote>@<source-path>`). The
 * entry lists:
 *
 *   - `js`   — the chunk's primary JS asset
 *   - `css`  — every `.css` file the chunk emitted; consumed by the host's
 *              renderHost to inject `<link rel="stylesheet">` into `<head>`
 *              (G5). This is how `import './x.css'` in a remote translates
 *              into stylesheet delivery in the browser without the runtime
 *              having to evaluate CSS as JS.
 *   - `resources` — auxiliary assets (sourcemaps, images, fonts) so the host
 *              can preload / fingerprint them.
 *
 * Pure function over stats + root path — kept testable without booting a
 * real rspack build.
 */
export function getChunks(
    opts: ParsedModuleLinkPluginOptions,
    stats: StatsCompilation,
    root: string
): ManifestJsonChunks {
    const buildChunks: ManifestJsonChunks = {};
    if (!stats.chunks) return buildChunks;

    for (const chunk of stats.chunks) {
        const module = pickPrimaryJsModule(chunk);
        if (!module?.nameForCondition) continue;

        const js = chunk.files?.find((file) => file.endsWith(opts.ext));
        if (!js) continue;

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

function pickPrimaryJsModule(chunk: StatsChunk) {
    return chunk.modules
        ?.sort((a, b) => (a.index ?? -1) - (b?.index ?? -1))
        ?.find((module) => module.moduleType?.includes('javascript/'));
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

import crypto from 'node:crypto';
import path from 'node:path';
import type { ManifestJson } from '@esmx/core';
import { rspack } from '@rsbuild/core';

const { RawSource } = rspack.sources;

export interface ManifestExportInput {
    /** Export name, e.g. "src/entry.client" or "react". */
    name: string;
    /** Whether this is a package (pkg:) export that becomes a scope mapping. */
    pkg: boolean;
}

export interface EsmxManifestPluginOptions {
    moduleName: string;
    exports: ManifestExportInput[];
    integrity: boolean;
    /** Project root; chunk keys are derived from source paths relative to it. */
    root: string;
    /**
     * Inject `import.meta.chunkName` into each chunk (server build only). At SSR
     * `RenderContext.commit()` time core collects a chunk's CSS/resources only
     * when its source-path key is in the executed chunk set, seeded from these
     * injected names. Mirrors @esmx/rspack's `injectChunkName`.
     */
    injectChunkName: boolean;
}

/**
 * Stable chunk identity `${moduleName}@${source-path}` — the chunk's primary
 * JS module relative to the project root, matching @esmx/rspack's
 * `generateIdentifier` and core's hardcoded entry key. Aligns the client
 * manifest's chunk keys with the `import.meta.chunkName` injected on the server
 * build, so SSR `commit()` collects the right CSS/resources.
 */
export function chunkSourceKey(
    moduleName: string,
    root: string,
    nameForCondition: string
): string {
    const rel = path.relative(root, nameForCondition).split(path.sep).join('/');
    return `${moduleName}@${rel}`;
}

/**
 * Per-chunk record the manifest emits. CSS files travel through here — the
 * host's renderHost reads `css[]` for each touched chunk and injects
 * `<link rel="stylesheet">` into `<head>`, which is how `import './x.css'`
 * inside a remote ultimately delivers the stylesheet to the browser without
 * the runtime evaluating CSS as JS. See G section of `.claude/redesign-plan.md`.
 */
export interface CollectedChunk {
    /** Stable source-path-keyed identity (`<moduleName>@<rel-path>`). */
    key: string;
    /** Primary `.mjs` asset for the chunk. */
    js: string;
    /** Every `.css` asset the chunk emitted. */
    css: string[];
}

interface CollectStats {
    chunks?: Array<{
        files?: string[];
        modules?: Array<{
            index?: number;
            moduleType?: string;
            nameForCondition?: string | null;
        }>;
    }>;
}

/**
 * Pure stats → chunk list, exported so unit tests can exercise the CSS
 * extraction without spinning up a real rspack/rsbuild build. The plugin's
 * `collectChunks` closure is a one-line call into this.
 */
export function collectChunksFromStats(
    stats: CollectStats,
    moduleName: string,
    root: string
): CollectedChunk[] {
    const result: CollectedChunk[] = [];
    for (const chunk of stats.chunks ?? []) {
        const module = chunk.modules
            ?.slice()
            .sort((a, b) => (a.index ?? -1) - (b.index ?? -1))
            .find((m) => m.moduleType?.includes('javascript/'));
        if (!module?.nameForCondition) continue;
        const js = chunk.files?.find((f) => f.endsWith('.mjs'));
        if (!js) continue;
        result.push({
            key: chunkSourceKey(moduleName, root, module.nameForCondition),
            js,
            css: chunk.files?.filter((f) => f.endsWith('.css')) ?? []
        });
    }
    return result;
}

/**
 * Rspack plugin emitting an esmx-format manifest.json, mirroring
 * @esmx/rspack's ManifestPlugin. The entrypoint -> output file mapping is read
 * from the compilation, the bundler-native source of truth.
 */
export class EsmxManifestPlugin {
    private readonly options: EsmxManifestPluginOptions;

    constructor(options: EsmxManifestPluginOptions) {
        this.options = options;
    }

    apply(compiler: import('@rsbuild/core').Rspack.Compiler): void {
        const { moduleName, exports, integrity, root, injectChunkName } =
            this.options;
        compiler.hooks.thisCompilation.tap('EsmxManifest', (compilation) => {
            // Source-path keyed chunk list (mirrors @esmx/rspack's getChunks):
            // pick each chunk's primary JS module and key it by that module's
            // path relative to root. Shared by manifest emit and injection so
            // the keys are identical. Delegates to `collectChunksFromStats`
            // for testability.
            const collectChunks = (): CollectedChunk[] => {
                const stats = compilation.getStats().toJson({
                    all: false,
                    chunks: true,
                    modules: true,
                    chunkModules: true,
                    ids: true
                });
                return collectChunksFromStats(stats, moduleName, root);
            };

            // Server build: announce each chunk's source-path identity so core
            // can collect its CSS/resources at SSR commit(). Runs before the
            // manifest/integrity stage so the injected code is hashed.
            if (injectChunkName) {
                compilation.hooks.processAssets.tap(
                    {
                        name: 'EsmxManifestInject',
                        stage: compiler.rspack.Compilation
                            .PROCESS_ASSETS_STAGE_ADDITIONS
                    },
                    (assets) => {
                        for (const { key, js } of collectChunks()) {
                            const asset = assets[js];
                            if (!asset) continue;
                            compilation.updateAsset(
                                js,
                                new RawSource(
                                    `import.meta.chunkName = import.meta.chunkName ?? ${JSON.stringify(key)};\n${asset.source()}`
                                )
                            );
                        }
                    }
                );
            }

            compilation.hooks.processAssets.tap(
                {
                    name: 'EsmxManifest',
                    stage: Infinity
                },
                (assets) => {
                    const exportsField: ManifestJson['exports'] = {};
                    for (const exp of exports) {
                        const entrypoint = compilation.entrypoints.get(
                            exp.name
                        );
                        if (!entrypoint) {
                            throw new Error(
                                `[@esmx/rsbuild] manifest: no webpack entrypoint produced for export "${exp.name}". Check that modules.exports in entry.node.ts lists "${exp.name}" and that the bundler config registered it as an entry.`
                            );
                        }
                        const chunk = entrypoint.getEntrypointChunk();
                        const file = [...chunk.files].find((f) =>
                            f.endsWith('.mjs')
                        );
                        if (!file) {
                            throw new Error(
                                `[@esmx/rsbuild] manifest: entrypoint "${exp.name}" produced no .mjs file. Esmx federation requires ESM output — ensure output.module is true and library.type is "module" in the rsbuild config.`
                            );
                        }
                        exportsField[exp.name] = {
                            name: exp.name,
                            pkg: exp.pkg,
                            file,
                            identifier: `${moduleName}/${exp.name}`
                        };
                    }

                    const scopes: ManifestJson['scopes'] = { '': {} };
                    for (const exp of exports) {
                        if (exp.pkg) {
                            scopes[''][exp.name] = `${moduleName}/${exp.name}`;
                        }
                    }

                    const chunks: ManifestJson['chunks'] = {};
                    for (const { key, js, css } of collectChunks()) {
                        chunks[key] = { name: key, js, css, resources: [] };
                    }

                    const manifest: ManifestJson = {
                        name: moduleName,
                        exports: exportsField,
                        scopes,
                        files: Object.keys(assets),
                        chunks
                    };

                    if (integrity) {
                        const integrityMap: Record<string, string> = {};
                        for (const [fileName, asset] of Object.entries(
                            assets
                        )) {
                            const hash = crypto
                                .createHash('sha384')
                                .update(asset.source() as string | Buffer)
                                .digest('base64');
                            integrityMap[fileName] = `sha384-${hash}`;
                        }
                        manifest.integrity = integrityMap;
                    }

                    compilation.emitAsset(
                        'manifest.json',
                        new RawSource(JSON.stringify(manifest, null, 4))
                    );
                }
            );
        });
    }
}

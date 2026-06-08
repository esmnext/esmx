import crypto from 'node:crypto';
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
        const { moduleName, exports, integrity } = this.options;
        compiler.hooks.thisCompilation.tap('EsmxManifest', (compilation) => {
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
                                `[EsmxManifest] missing entrypoint "${exp.name}"`
                            );
                        }
                        const chunk = entrypoint.getEntrypointChunk();
                        const file = [...chunk.files].find((f) =>
                            f.endsWith('.mjs')
                        );
                        if (!file) {
                            throw new Error(
                                `[EsmxManifest] no .mjs output for "${exp.name}"`
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
                    for (const chunk of compilation.chunks) {
                        const js = [...chunk.files].find((f) =>
                            f.endsWith('.mjs')
                        );
                        if (js) {
                            const key = `${moduleName}@${chunk.name ?? chunk.id}`;
                            chunks[key] = {
                                name: key,
                                js,
                                css: [...chunk.files].filter((f) =>
                                    f.endsWith('.css')
                                ),
                                resources: []
                            };
                        }
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

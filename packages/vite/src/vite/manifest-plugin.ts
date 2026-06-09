import crypto from 'node:crypto';
import path from 'node:path';
import type { ManifestJson } from '@esmx/core';
import type { Plugin, Rollup } from 'vite';

type RenderedChunk = Rollup.RenderedChunk;

/**
 * Description of a single export the bundler must emit as its own ESM entry.
 * Mirrors esmx's ParsedModuleConfigExport.
 */
export interface ManifestExportInput {
    /** Export name, e.g. "src/entry.client" or "react". */
    name: string;
    /** Whether this is a package (pkg:) export that becomes a scope mapping. */
    pkg: boolean;
}

export interface EsmxManifestPluginOptions {
    moduleName: string;
    exports: ManifestExportInput[];
    /** Compute SRI hashes (production only). */
    integrity: boolean;
    /** Project root; chunk keys are derived from source paths relative to it. */
    root: string;
    /**
     * Inject `import.meta.chunkName` into each chunk (server build only). At SSR
     * `RenderContext.commit()` time core collects a chunk's CSS/resources only
     * when its source-path key is in the executed chunk set, which is seeded
     * from these injected names. Mirrors @esmx/rspack's `injectChunkName`.
     */
    injectChunkName: boolean;
}

/**
 * Stable, cross-build chunk identity: `${moduleName}@${source-path}` where the
 * source path is the chunk's facade module relative to the project root. This
 * matches @esmx/rspack's `generateIdentifier` (and core's hardcoded entry key
 * `${name}@src/entry.client.ts`), so the client manifest's chunk keys align
 * with the `import.meta.chunkName` injected into the server build. Virtual
 * modules (pkg re-exports, prefixed with `\0`) have no source path and fall
 * back to the output chunk name.
 */
export function chunkSourceKey(
    moduleName: string,
    root: string,
    chunk: RenderedChunk
): string {
    const source =
        chunk.facadeModuleId ??
        chunk.moduleIds.find((id) => !id.startsWith('\0'));
    if (source && !source.startsWith('\0')) {
        const rel = path.relative(root, source).split(path.sep).join('/');
        return `${moduleName}@${rel}`;
    }
    return `${moduleName}@${chunk.name}`;
}

/**
 * Rollup/Vite plugin that emits an esmx-format manifest.json into the bundle.
 *
 * The manifest is the contract @esmx/core consumes to build import maps and to
 * resolve module-federation entries. Only fields the core reads are required
 * (name, exports{file,identifier,pkg}, scopes); files/chunks/integrity are
 * provided for completeness and SRI.
 */
export function esmxManifestPlugin(options: EsmxManifestPluginOptions): Plugin {
    const { moduleName, exports, integrity, root, injectChunkName } = options;
    return {
        name: 'esmx:manifest',
        renderChunk(code, chunk) {
            // Seed core's SSR chunk set: the server build's chunks announce
            // their own source-path identity so commit() can collect the
            // matching client chunk's CSS/resources. Done in renderChunk (not
            // generateBundle) so the prepend is part of the hashed output.
            if (!injectChunkName) return null;
            const key = chunkSourceKey(moduleName, root, chunk);
            return {
                code: `import.meta.chunkName = import.meta.chunkName ?? ${JSON.stringify(key)};\n${code}`,
                map: null
            };
        },
        generateBundle(_outputOptions, bundle) {
            const exportsField: ManifestJson['exports'] = {};
            for (const exp of exports) {
                const chunk = Object.values(bundle).find(
                    (c) =>
                        c.type === 'chunk' && c.isEntry && c.name === exp.name
                );
                if (!chunk || chunk.type !== 'chunk') {
                    throw new Error(
                        `[esmx:manifest] missing output chunk for export "${exp.name}"`
                    );
                }
                exportsField[exp.name] = {
                    name: exp.name,
                    pkg: exp.pkg,
                    file: chunk.fileName,
                    identifier: `${moduleName}/${exp.name}`
                };
            }

            const scopes: ManifestJson['scopes'] = { '': {} };
            for (const exp of exports) {
                if (exp.pkg) {
                    scopes[''][exp.name] = `${moduleName}/${exp.name}`;
                }
            }

            const files = Object.keys(bundle);
            const chunks: ManifestJson['chunks'] = {};
            for (const [fileName, c] of Object.entries(bundle)) {
                if (c.type === 'chunk') {
                    const key = chunkSourceKey(moduleName, root, c);
                    // viteMetadata carries the CSS emitted for a chunk; it is
                    // present at generateBundle time but absent from Rollup's
                    // OutputChunk type, hence the guarded access.
                    const importedCss = (
                        c as { viteMetadata?: { importedCss: Set<string> } }
                    ).viteMetadata?.importedCss;
                    chunks[key] = {
                        name: key,
                        js: fileName,
                        css: importedCss ? [...importedCss] : [],
                        resources: []
                    };
                }
            }

            const manifest: ManifestJson = {
                name: moduleName,
                exports: exportsField,
                scopes,
                files,
                chunks
            };

            if (integrity) {
                const integrityMap: Record<string, string> = {};
                for (const [fileName, c] of Object.entries(bundle)) {
                    const source = c.type === 'chunk' ? c.code : c.source;
                    const hash = crypto
                        .createHash('sha384')
                        .update(source as string | Uint8Array)
                        .digest('base64');
                    integrityMap[fileName] = `sha384-${hash}`;
                }
                manifest.integrity = integrityMap;
            }

            this.emitFile({
                type: 'asset',
                fileName: 'manifest.json',
                source: JSON.stringify(manifest, null, 4)
            });
        }
    };
}

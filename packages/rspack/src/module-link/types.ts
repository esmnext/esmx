import type { ManifestJsonExports } from '@esmx/core';

export type {
    ManifestJson,
    ManifestJsonChunk,
    ManifestJsonChunks,
    ManifestJsonExport,
    ManifestJsonExports
} from '@esmx/core';

export interface ModuleLinkPluginOptions {
    name: string;
    ext?: string;
    imports?: Record<string, string>;
    scopes?: Record<string, Record<string, string>>;
    exports?: Record<string, { pkg?: boolean; file: string }>;
    injectChunkName?: boolean;
    preEntries?: string[];
    deps?: string[];
    /**
     * Absolute paths of pkg-export wrapper files (one per pkg export). When
     * the externals function sees an import whose issuer is one of these
     * wrappers, it skips externalization — the wrapper IS the federation
     * chunk for that package, so externalizing its inner
     * `import __m from '<pkg-path>'` would route back to the wrapper itself
     * (cyclic).
     */
    wrapperFiles?: string[];
}

export interface ParsedModuleLinkPluginOptions {
    name: string;
    ext: string;
    exports: ManifestJsonExports;
    imports: Record<string, string>;
    scopes: Record<string, Record<string, string>>;
    injectChunkName: boolean;
    preEntries: string[];
    deps: string[];
    wrapperFiles: string[];
}

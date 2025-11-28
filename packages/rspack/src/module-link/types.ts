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
}

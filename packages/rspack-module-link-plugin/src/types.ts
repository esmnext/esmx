import type { ManifestJsonExports } from '@esmx/core';
export type {
    ManifestJson,
    ManifestJsonChunks,
    ManifestJsonChunk,
    ManifestJsonChunkSizes,
    ManifestJsonExport,
    ManifestJsonExports
} from '@esmx/core';

export interface ModuleLinkPluginOptions {
    /**
     * Module name
     */
    name: string;
    /**
     * JS file extension, defaults to `mjs`
     * @default mjs
     */
    ext?: string;
    /**
     * Import mappings
     */
    imports?: Record<string, string>;
    /**
     * Export modules
     */
    exports?: Record<string, { rewrite?: boolean; file: string }>;
    /**
     * Whether to inject chunk name, defaults to `false`. Usually only needs to be set to `true` when building server-side rendering artifacts
     * @default false
     */
    injectChunkName?: boolean;
}
/**
 * Parsed module link plugin configuration
 */
export interface ParsedModuleLinkPluginOptions {
    /**
     * Module name
     */
    name: string;
    /**
     * JS file extension
     */
    ext: string;
    /**
     * Export configuration
     * Type: Record<export path, export item info>
     */
    exports: ManifestJsonExports;
    /**
     * Import mappings
     */
    imports: Record<string, string>;
    /**
     * Whether to inject chunk name. Usually only needs to be set to `true` when building server-side rendering artifacts
     */
    injectChunkName: boolean;
}

import type { ManifestJsonExports } from '@esmx/core';
export type {
    ManifestJson,
    ManifestJsonChunks,
    ManifestJsonChunk,
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
     * Scope-specific import mappings
     * Type: Record<scope name, import mappings within that scope>
     */
    scopes?: Record<string, Record<string, string>>;
    /**
     * Export modules
     */
    exports?: Record<string, { rewrite?: boolean; file: string }>;
    /**
     * Whether to inject chunk name, defaults to `false`. Usually only needs to be set to `true` when building server-side rendering artifacts
     * @default false
     */
    injectChunkName?: boolean;
    /**
     * Files to prepend to each entry
     * @example ['./src/hot-client.ts']
     */
    preEntries?: string[];
    /**
     * Module dependencies to be externalized
     * @example ['ssr-main']
     */
    deps?: string[];
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
     * Scope-specific import mappings
     * Type: Record<scope name, import mappings within that scope>
     */
    scopes: Record<string, Record<string, string>>;
    /**
     * Whether to inject chunk name. Usually only needs to be set to `true` when building server-side rendering artifacts
     */
    injectChunkName: boolean;
    /**
     * Files to prepend to each entry
     */
    preEntries: string[];
    /**
     * Module dependencies to be externalized
     */
    deps: string[];
}

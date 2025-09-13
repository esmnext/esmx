import fsp from 'node:fs/promises';
import path from 'node:path';

import type { BuildEnvironment } from './core';
import type { ParsedModuleConfig } from './module-config';

export interface ManifestJson {
    /**
     * Module name
     */
    name: string;
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
     * Export item configuration
     * Type: Record<export path, export item information>
     */
    exports: ManifestJsonExports;
    /**
     * Build output files
     */
    files: string[];
    /**
     * Compiled file information
     * Type: Record<source file, compilation information>
     */
    chunks: ManifestJsonChunks;
}

/**
 * Export item configuration mapping
 * Type: Record<export path, export item information>
 */
export type ManifestJsonExports = Record<string, ManifestJsonExport>;

/**
 * Export item information
 */
export interface ManifestJsonExport {
    /**
     * Export item name
     */
    name: string;
    /**
     * Whether to rewrite module import paths
     * - true: Rewrite to '{serviceName}/{exportName}' format
     * - false: Maintain original import paths
     */
    rewrite: boolean;
    /**
     * File path corresponding to the export item
     */
    file: string;
    /**
     * Identifier for the export item
     */
    identifier: string;
}

export type ManifestJsonChunks = Record<string, ManifestJsonChunk>;

export interface ManifestJsonChunk {
    name: string;
    /**
     * Current compiled JS file.
     */
    js: string;
    /**
     * Current compiled CSS files.
     */
    css: string[];
    /**
     * Other resource files.
     */
    resources: string[];
}

/**
 * Get service manifest files
 */
export async function getManifestList(
    env: BuildEnvironment,
    moduleConfig: ParsedModuleConfig
): Promise<ManifestJson[]> {
    return Promise.all(
        Object.values(moduleConfig.links).map(async (item) => {
            const filename = path.resolve(item[env], 'manifest.json');
            try {
                const data: ManifestJson = await JSON.parse(
                    await fsp.readFile(filename, 'utf-8')
                );
                data.name = item.name;
                return data;
            } catch (e) {
                throw new Error(
                    `'${item.name}' service '${filename}' file read error on environment '${env}': ${e instanceof Error ? e.message : String(e)}`
                );
            }
        })
    );
}

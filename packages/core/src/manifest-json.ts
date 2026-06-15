import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import type { BuildEnvironment } from './core';
import type { ParsedModuleConfig } from './module-config';

/**
 * Manifest protocol version emitted by the bundler plugins (RFC 0001 §5).
 * The linker rejects manifests whose `protocol` is HIGHER than this value.
 */
export const MANIFEST_PROTOCOL_VERSION = 2;

export interface ManifestJson {
    /**
     * Manifest protocol version (RFC 0001 §5). Absent in pre-v2 manifests;
     * readers treat absence as protocol 1 and skip v2-only checks.
     */
    protocol: number;
    /**
     * Module name
     */
    name: string;
    /**
     * Module version, transcribed from the module's package.json at build
     * time (RFC 0001 §5). Pre-v2 manifests default to '0.0.0' at read time.
     */
    version: string;
    /**
     * Resolved versions for every pkg-export (`pkg: true`) package, captured
     * at build time (RFC 0001 §5).
     * Type: Record<package specifier, provide record>
     */
    provides: Record<string, ManifestJsonProvide>;
    /**
     * Consumption edges transcribed from the module's package.json `esmx.uses`
     * declaration (RFC 0001 §5). Pre-v2 manifests default to [] at read time.
     */
    uses: string[];
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
    /**
     * Subresource Integrity (SRI) hashes for build output files.
     * Only generated in production builds to avoid development overhead.
     * Type: Record<file path, integrity hash>
     */
    integrity?: Record<string, string>;
}

/**
 * Build-time facts about one provided (pkg-export) package (RFC 0001 §5).
 */
export interface ManifestJsonProvide {
    /**
     * The RESOLVED installed version of the provided package at build time,
     * read from node_modules/<pkg>/package.json relative to the module root.
     * Subpath specifiers (e.g. `vue/jsx-runtime`) resolve via their parent
     * package. '0.0.0' when the package could not be resolved.
     */
    version: string;
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
    pkg: boolean;
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
 * The RFC 0001 §5 protocol fields shared by every bundler manifest plugin.
 */
export interface ManifestProtocolFields {
    protocol: number;
    version: string;
    provides: Record<string, ManifestJsonProvide>;
    uses: string[];
}

function readJsonObjectSync(filePath: string): Record<string, unknown> | null {
    // Boundary adapter: absence or malformed JSON means "no readable
    // package.json"; callers fall back to protocol defaults.
    let json: unknown;
    try {
        json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    } catch {
        return null;
    }
    if (typeof json !== 'object' || json === null || Array.isArray(json)) {
        return null;
    }
    return json as Record<string, unknown>;
}

/**
 * Parent package name of a bare specifier: `vue/jsx-runtime` → `vue`,
 * `@esmx/router` → `@esmx/router`.
 */
function parentPackageName(specifier: string): string {
    const segments = specifier.split('/');
    return specifier.startsWith('@')
        ? segments.slice(0, 2).join('/')
        : segments[0];
}

/** Walks up from `fromDir` through node_modules, Node-resolution style. */
function resolveInstalledVersionSync(
    fromDir: string,
    packageName: string
): string | null {
    let dir = path.resolve(fromDir);
    for (;;) {
        const candidate = path.join(dir, 'node_modules', packageName);
        const pkg = readJsonObjectSync(path.join(candidate, 'package.json'));
        if (pkg) {
            return typeof pkg.version === 'string' && pkg.version !== ''
                ? pkg.version
                : null;
        }
        const parent = path.dirname(dir);
        if (parent === dir) {
            return null;
        }
        dir = parent;
    }
}

/**
 * Builds the RFC 0001 §5 manifest protocol fields (`protocol`, `version`,
 * `provides`, `uses`) from the module root's package.json plus the list of
 * pkg-export package specifiers the bundler plugin computed. Shared by the
 * @esmx/rspack, @esmx/rsbuild and @esmx/vite manifest plugins so their output
 * cannot drift.
 */
export function buildManifestProtocolFields(
    moduleRoot: string,
    provides: string[]
): ManifestProtocolFields {
    const pkg = readJsonObjectSync(path.resolve(moduleRoot, 'package.json'));
    const version =
        pkg && typeof pkg.version === 'string' && pkg.version !== ''
            ? pkg.version
            : '0.0.0';
    const esmx =
        pkg && typeof pkg.esmx === 'object' && pkg.esmx !== null
            ? (pkg.esmx as Record<string, unknown>)
            : null;
    const uses = Array.isArray(esmx?.uses)
        ? esmx.uses.filter((item): item is string => typeof item === 'string')
        : [];
    const providesField: Record<string, ManifestJsonProvide> = {};
    for (const name of provides) {
        const resolvedVersion = resolveInstalledVersionSync(
            moduleRoot,
            parentPackageName(name)
        );
        providesField[name] = {
            version: resolvedVersion ?? '0.0.0'
        };
    }
    return {
        protocol: MANIFEST_PROTOCOL_VERSION,
        version,
        provides: providesField,
        uses
    };
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
            let data: ManifestJson;
            try {
                data = await JSON.parse(await fsp.readFile(filename, 'utf-8'));
            } catch (e) {
                throw new Error(
                    `'${item.name}' service '${filename}' file read error on environment '${env}': ${e instanceof Error ? e.message : String(e)}`
                );
            }
            data.name = item.name;
            // Pre-v2 manifests carry none of the protocol fields: treat them
            // as protocol 1 and default the v2 fields so v2-only checks skip.
            data.protocol =
                typeof data.protocol === 'number' ? data.protocol : 1;
            if (data.protocol > MANIFEST_PROTOCOL_VERSION) {
                throw new Error(
                    `[E_PROTOCOL] '${item.name}' service '${filename}' declares manifest protocol ${data.protocol}, but this linker supports up to ${MANIFEST_PROTOCOL_VERSION}. Upgrade esmx, or rebuild '${item.name}' with a matching toolchain.`
                );
            }
            data.version =
                typeof data.version === 'string' ? data.version : '0.0.0';
            data.provides =
                typeof data.provides === 'object' && data.provides !== null
                    ? data.provides
                    : {};
            data.uses = Array.isArray(data.uses) ? data.uses : [];
            return data;
        })
    );
}

import type { ImportMap, ScopesMap, SpecifierMap } from '@esmx/import';
import { pathWithoutIndex } from './path-without-index';

/**
 * Import map with `imports` and `scopes` fully resolved. The optional
 * `integrity` field is layered on later by {@link createClientImportMap}.
 */
type ResolvedImportMap = Required<Pick<ImportMap, 'imports' | 'scopes'>>;

export interface ImportMapManifest {
    name: string;
    exports: Record<
        string,
        {
            name: string;
            file: string;
            identifier: string;
            pkg: boolean;
        }
    >;
    scopes: Record<string, Record<string, string>>;
    /**
     * Emitted chunk files (keyed arbitrarily). Each chunk's `js` is a relative
     * path (e.g. "chunks/routes.xxx.mjs"). Used so a module's scope also covers
     * its code-split chunks, not just its export files.
     */
    chunks?: Record<string, { js: string }>;
    /**
     * Subresource Integrity hashes for this module's build output files.
     * Keys are relative file paths (e.g. "src/routes.xxx.mjs"), values are
     * integrity strings (e.g. "sha384-..."). Only present in production builds.
     */
    integrity?: Record<string, string>;
}

export interface GetImportMapOptions {
    manifests: readonly ImportMapManifest[];
    getScope: (name: string, scope: string) => string;
    getFile: (name: string, file: string) => string;
}

export function createImportsMap(
    manifests: readonly ImportMapManifest[],
    getFile: (name: string, file: string) => string
): SpecifierMap {
    const imports: SpecifierMap = {};

    manifests.forEach((manifest) => {
        Object.entries(manifest.exports).forEach(([, exportItem]) => {
            const file = getFile(manifest.name, exportItem.file);
            imports[exportItem.identifier] = file;
        });
    });

    pathWithoutIndex(imports);

    return imports;
}

export function createScopesMap(
    imports: SpecifierMap,
    manifests: readonly ImportMapManifest[],
    getScope: (name: string, scope: string) => string
): ScopesMap {
    const scopes: ScopesMap = {};

    manifests.forEach((manifest) => {
        if (!manifest.scopes) {
            return;
        }

        Object.entries(manifest.scopes).forEach(([scopeName, specifierMap]) => {
            const scopedImports: SpecifierMap = {};

            Object.entries(specifierMap).forEach(
                ([specifierName, identifier]) => {
                    scopedImports[specifierName] =
                        imports[identifier] ?? identifier;
                }
            );

            const scopePath =
                imports[`${manifest.name}/${scopeName}`] ?? `/${scopeName}`;

            const scopeKey = getScope(manifest.name, scopePath);
            scopes[scopeKey] = scopedImports;
        });
    });

    return scopes;
}
/**
 * Fixes the nested scope resolution issue in import maps across all browsers.
 *
 * Import Maps have a cross-browser issue where nested scopes are not resolved correctly.
 * For example, when you have both "/shared-modules/" and "/shared-modules/vue2/" scopes,
 * browsers fail to properly apply the more specific nested scope.
 *
 * This function works around the issue by:
 * 1. Sorting scopes by path depth (shallow paths first, deeper paths last)
 * 2. Manually applying scopes to matching imports in the correct order
 * 3. Converting pattern-based scopes to concrete path scopes
 *
 * @example
 * Problematic import map that fails in browsers:
 * ```json
 * {
 *   "scopes": {
 *     "/shared-modules/": {
 *       "vue": "/shared-modules/vue.d8c7a640.final.mjs"
 *     },
 *     "/shared-modules/vue2/": {
 *       "vue": "/shared-modules/vue2.9b4efaf3.final.mjs"
 *     }
 *   }
 * }
 * ```
 *
 * @see https://github.com/guybedford/es-module-shims/issues/529
 * @see https://issues.chromium.org/issues/453147451
 */
export function fixImportMapNestedScopes(
    importMap: ResolvedImportMap
): ResolvedImportMap {
    Object.entries(importMap.scopes)
        .sort(([pathA], [pathB]) => {
            const depthA = pathA.split('/').length;
            const depthB = pathB.split('/').length;
            return depthA - depthB;
        })
        .forEach(([scopePath, scopeMappings]) => {
            Object.values(importMap.imports).forEach((importPath) => {
                if (importPath.startsWith(scopePath)) {
                    importMap.scopes[importPath] = {
                        ...importMap.scopes[importPath],
                        ...scopeMappings
                    };
                }
            });
            Reflect.deleteProperty(importMap.scopes, scopePath);
        });

    return importMap;
}

/**
 * A module's code-split chunk files (e.g. Vite/Rollup facade+impl splits) are
 * not exports, so they are absent from `imports` and miss the per-file scopes
 * produced by {@link fixImportMapNestedScopes}. Those chunks still import the
 * module's bare externals (e.g. "vue"), so without a scope the browser throws
 * "Failed to resolve module specifier". This adds, for each chunk file, the
 * module's bare-specifier mappings — but only the ones NOT already satisfied by
 * a matching global `imports` entry. Runs AFTER compression so it never skews
 * the global-promotion heuristic (which would wrongly hoist a multi-version
 * dep like "vue"). rspack's all-in-one output has no such chunks, so this is a
 * no-op there.
 */
function addCodeSplitChunkScopes(
    importMap: ImportMap,
    base: ResolvedImportMap,
    options: GetImportMapOptions
): void {
    for (const manifest of options.manifests) {
        const moduleScope = manifest.scopes?.[''];
        const chunks = manifest.chunks;
        if (!moduleScope || !chunks) continue;

        const resolved: SpecifierMap = {};
        for (const [specifier, identifier] of Object.entries(moduleScope)) {
            const target = base.imports[identifier] ?? identifier;
            // Skip specifiers a global import already resolves to the same file.
            if (importMap.imports?.[specifier] === target) continue;
            resolved[specifier] = target;
        }
        if (Object.keys(resolved).length === 0) continue;

        for (const chunk of Object.values(chunks)) {
            if (!chunk.js) continue;
            const url = options.getFile(manifest.name, chunk.js);
            importMap.scopes ??= {};
            importMap.scopes[url] = { ...importMap.scopes[url], ...resolved };
        }
    }
}

export function compressImportMap(importMap: ResolvedImportMap): ImportMap {
    const compressed: ResolvedImportMap = {
        imports: { ...importMap.imports },
        scopes: {}
    };

    const counts: Record<string, Record<string, number>> = {};
    Object.values(importMap.scopes).forEach((scopeMappings) => {
        Object.entries(scopeMappings).forEach(([specifier, target]) => {
            if (Object.hasOwn(importMap.imports, specifier)) return;
            counts[specifier] ??= {};
            counts[specifier][target] = (counts[specifier][target] ?? 0) + 1;
        });
    });

    Object.entries(counts).forEach(([specifier, targetCounts]) => {
        const entries = Object.entries(targetCounts);

        let best: [string, number] | null = null;
        let secondBestCount = 0;
        for (const [t, c] of entries) {
            if (!best || c > best[1]) {
                secondBestCount = best
                    ? Math.max(secondBestCount, best[1])
                    : secondBestCount;
                best = [t, c];
            } else {
                secondBestCount = Math.max(secondBestCount, c);
            }
        }
        if (best && best[1] > secondBestCount) {
            compressed.imports[specifier] = best[0];
        }
    });

    Object.entries(importMap.scopes).forEach(([scopePath, scopeMappings]) => {
        const filtered: SpecifierMap = {};

        Object.entries(scopeMappings).forEach(([specifier, target]) => {
            const globalTarget = compressed.imports[specifier];
            if (globalTarget === target) {
                return;
            }
            filtered[specifier] = target;
        });

        if (Object.keys(filtered).length > 0) {
            compressed.scopes[scopePath] = filtered;
        }
    });

    const hasScopes = Object.keys(compressed.scopes).length > 0;
    return hasScopes ? compressed : { imports: compressed.imports };
}

export function createImportMap({
    manifests,
    getFile,
    getScope
}: GetImportMapOptions): ResolvedImportMap {
    const imports = createImportsMap(manifests, getFile);

    const scopes = createScopesMap(imports, manifests, getScope);
    return {
        imports,
        scopes
    };
}

export function createClientImportMap(options: GetImportMapOptions): ImportMap {
    const base = createImportMap(options);
    const fixed = fixImportMapNestedScopes(base);
    const compressed = compressImportMap(fixed);
    // Code-split chunk files are not exports, so they miss the per-file scopes
    // above. Add them post-compression so it never skews global promotion.
    addCodeSplitChunkScopes(compressed, base, options);

    // Collect integrity from all manifests
    // Manifest integrity keys are relative filenames (e.g., "src/routes.xxx.mjs")
    // Import map values are absolute URLs (e.g., "/ssr-micro-vue2/src/routes.xxx.mjs")
    // Must convert relative paths to absolute URLs to match browser expectations
    const integrity: Record<string, string> = {};
    for (const manifest of options.manifests) {
        if (manifest.integrity) {
            for (const [filePath, hash] of Object.entries(manifest.integrity)) {
                // Convert relative file path to absolute URL path
                // e.g., "src/routes.xxx.mjs" -> "/ssr-micro-vue2/src/routes.xxx.mjs"
                const urlPath = `/${manifest.name}/${filePath}`;
                integrity[urlPath] = hash;
            }
        }
    }

    if (Object.keys(integrity).length > 0) {
        return {
            ...compressed,
            integrity
        };
    }

    return compressed;
}

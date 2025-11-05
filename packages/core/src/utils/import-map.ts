import { pathWithoutIndex } from './path-without-index';

import type { ImportMap, ScopesMap, SpecifierMap } from '@esmx/import';

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
    importMap: Required<ImportMap>
): Required<ImportMap> {
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

export function compressImportMap(
    importMap: Required<ImportMap>
): Required<ImportMap> {
    const minOccurrences = 2;

    const compressed: Required<ImportMap> = {
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
        if (best && best[1] >= minOccurrences && best[1] > secondBestCount) {
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

    return compressed;
}

export function createImportMap({
    manifests,
    getFile,
    getScope
}: GetImportMapOptions): Required<ImportMap> {
    const imports = createImportsMap(manifests, getFile);

    const scopes = createScopesMap(imports, manifests, getScope);
    return {
        imports,
        scopes
    };
}

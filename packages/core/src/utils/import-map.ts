import { pathWithoutIndex } from './path-without-index';

import type { ImportMap, ScopesMap, SpecifierMap } from '@esmx/import';

export interface ImportMapManifest {
    name: string;
    imports: Record<string, string>;
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

export function buildImportsMap(
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

    manifests.forEach((manifest) => {
        Object.entries(manifest.imports).forEach(([name, identifier]) => {
            const fullName = `${manifest.name}/${name}`;
            imports[fullName] = imports[identifier] ?? identifier;
        });
    });

    pathWithoutIndex(imports);

    return imports;
}

export function buildScopesMap(
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
 * Fixes Chrome's nested scope resolution bug in import maps.
 *
 * Chrome has a bug where nested scopes in import maps are not resolved correctly.
 * For example, when you have both "/shared-modules/" and "/shared-modules/vue2/" scopes,
 * Chrome fails to properly apply the more specific nested scope.
 *
 * This function works around the bug by:
 * 1. Sorting scopes by path depth (shallow paths first, deeper paths last)
 * 2. Manually applying scopes to matching imports in the correct order
 *
 * @example
 * Problematic import map that fails in Chrome:
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
export function fixNestedScopesResolution(
    importMap: Required<ImportMap>
): Required<ImportMap> {
    Object.entries(importMap.scopes)
        .filter(([scopePath]) => {
            return (
                scopePath.startsWith('/') &&
                scopePath.endsWith('/') &&
                scopePath.split('/').length >= 4
            );
        })
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

export function getImportMap({
    manifests,
    getFile,
    getScope
}: GetImportMapOptions): Required<ImportMap> {
    const imports = buildImportsMap(manifests, getFile);

    const scopes = buildScopesMap(imports, manifests, getScope);
    return {
        imports,
        scopes
    };
}

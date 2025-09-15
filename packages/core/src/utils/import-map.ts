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

export function getImportMap({
    manifests,
    getFile,
    getScope
}: GetImportMapOptions): ImportMap {
    const imports = buildImportsMap(manifests, getFile);

    const scopes = buildScopesMap(imports, manifests, getScope);

    return {
        imports,
        scopes
    };
}

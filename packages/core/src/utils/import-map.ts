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
            rewrite: boolean;
        }
    >;
}

export function getImportMap({
    manifests,
    getFile,
    getScope
}: {
    manifests: readonly ImportMapManifest[];
    getScope: (name: string) => string;
    getFile: (name: string, file: string) => string;
}): ImportMap {
    const imports: SpecifierMap = {};
    const scopes: ScopesMap = {};
    Object.values(manifests).forEach((manifest) => {
        const scopeImports: SpecifierMap = {};

        Object.entries(manifest.exports).forEach(([key, exportItem]) => {
            // Handle the case where exportItem is a string in legacy builds
            if (typeof exportItem === 'string') {
                throw new Error(
                    `Detected incompatible legacy manifest format in ${manifest.name}. Please upgrade your ESMX dependencies first, then rebuild and redeploy your service.`
                );
            }

            const file = getFile(manifest.name, exportItem.file);
            imports[exportItem.identifier] = file;
            if (!exportItem.rewrite) {
                scopeImports[exportItem.name] = file;
            }
        });
        if (Object.keys(scopeImports).length || Object.keys(imports).length) {
            scopes[getScope(manifest.name)] = scopeImports;
        }
    });
    pathWithoutIndex(imports);
    Object.values(manifests).forEach((manifest) => {
        Object.entries(manifest.imports).forEach(([name, identifier]) => {
            scopes[getScope(manifest.name)][name] =
                imports[identifier] ?? identifier;
        });
    });
    return {
        imports,
        scopes
    };
}

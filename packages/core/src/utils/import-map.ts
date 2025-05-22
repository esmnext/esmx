import { pathWithoutIndex } from './path-without-index';

import type { ImportMap, ScopesMap, SpecifierMap } from '@esmx/import';
import type { ManifestJson } from '../manifest-json';

export function getImportMap({
    manifests,
    getFile,
    getScope
}: {
    manifests: readonly ManifestJson[];
    getScope: (name: string) => string;
    getFile: (name: string, file: string) => string;
}): ImportMap {
    const imports: SpecifierMap = {};
    const scopes: ScopesMap = {};
    Object.values(manifests).forEach((manifest) => {
        const scopeImports: SpecifierMap = {};
        Object.values(manifest.exports).forEach((exportItem) => {
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
            scopes[getScope(manifest.name)][name] = imports[identifier];
        });
    });
    return {
        imports,
        scopes
    };
}

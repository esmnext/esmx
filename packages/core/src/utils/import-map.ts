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
        if (!manifest.scopes) {
            throw new Error(
                `Detected incompatible legacy manifest format in "${manifest.name}".\n\n` +
                    `Missing required field: 'scopes'\n` +
                    `Expected type: Record<string, Record<string, string>>\n\n` +
                    `Please upgrade your ESMX dependencies to the latest version and rebuild your service.\n\n` +
                    `Expected manifest format:\n` +
                    `{\n` +
                    `  "name": "module-name",\n` +
                    `  "imports": { ... },\n` +
                    `  "exports": { ... },\n` +
                    `  "scopes": { ... }\n` +
                    `}`
            );
        }

        const scopeImports: SpecifierMap = {};

        Object.entries(manifest.exports).forEach(([, exportItem]) => {
            const file = getFile(manifest.name, exportItem.file);
            imports[exportItem.identifier] = file;
            if (exportItem.pkg) {
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

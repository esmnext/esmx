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
    getScope: (name: string, path: string) => string;
    getFile: (name: string, file: string) => string;
}

export function buildImportsMap(
    manifests: readonly ImportMapManifest[],
    getFile: (name: string, file: string) => string
): SpecifierMap {
    const imports: SpecifierMap = {};

    // 1. Generate default import mappings from all exports
    manifests.forEach((manifest) => {
        Object.entries(manifest.exports).forEach(([, exportItem]) => {
            const file = getFile(manifest.name, exportItem.file);
            imports[exportItem.identifier] = file;
        });
    });

    // 2. Apply user custom imports (overrides defaults)
    manifests.forEach((manifest) => {
        Object.entries(manifest.imports).forEach(([name, identifier]) => {
            const fullName = `${manifest.name}/${name}`;
            imports[fullName] = imports[identifier] ?? identifier;
        });
    });

    // 3. Create identifier aliases for /index suffixes
    // Example: 'module/path/index' → creates 'module/path' alias
    pathWithoutIndex(imports);

    return imports;
}

export function getImportMap({
    manifests,
    getFile,
    getScope
}: GetImportMapOptions): ImportMap {
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
            scopes[getScope(manifest.name, '/')] = scopeImports;
        }
    });
    pathWithoutIndex(imports);
    Object.values(manifests).forEach((manifest) => {
        Object.entries(manifest.imports).forEach(([name, identifier]) => {
            scopes[getScope(manifest.name, '/')][name] =
                imports[identifier] ?? identifier;
        });
    });
    return {
        imports,
        scopes
    };
}

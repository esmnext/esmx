import module from 'node:module';
import { createImportMapResolver } from './import-map-resolve';
import type { ImportMap, ImportMapResolver } from './types';

interface Data {
    baseURL: string;
    importMap: ImportMap;
}

let registered = '';

export function createLoaderImport(baseURL: URL, importMap: ImportMap = {}) {
    if (!registered) {
        module.register<Data>(import.meta.url, {
            parentURL: baseURL,
            data: {
                baseURL: baseURL.href,
                importMap
            }
        });
        registered = JSON.stringify(importMap);
    } else if (registered !== JSON.stringify(importMap)) {
        throw new Error(
            `[@esmx/import] createLoaderImport() is a per-process singleton and was called twice with different importMap data. Ensure your app initializes the loader exactly once at startup.`
        );
    }
    return (specifier: string): Promise<Record<string, any>> => {
        try {
            return import(specifier);
        } catch (e) {
            const cause = e instanceof Error ? e.message : String(e);
            throw new Error(
                `[@esmx/import] Failed to import '${specifier}'. Verify the specifier is declared in the importMap (modules.imports in entry.node.ts) or matches a federated module name. Original error: ${cause}`
            );
        }
    };
}

let importMapResolver: ImportMapResolver | null = null;

export function initialize(data: Data) {
    importMapResolver = createImportMapResolver(data.baseURL, data.importMap);
}

export function resolve(
    specifier: string,
    context: { parentURL: string },
    nextResolve: Function
) {
    const result = importMapResolver?.(specifier, context.parentURL);
    return nextResolve(result ?? specifier, context);
}

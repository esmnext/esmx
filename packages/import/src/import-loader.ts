import module from 'node:module';
import IM from '@import-maps/resolve';
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
            `'createLoaderImport()' can only be created once and cannot be created repeatedly`
        );
    }
    return (specifier: string): Promise<Record<string, any>> => {
        try {
            return import(specifier);
        } catch (e) {
            throw new Error(`Failed to import '${specifier}'`);
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

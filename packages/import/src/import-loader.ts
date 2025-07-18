import module from 'node:module';
import { fileURLToPath } from 'node:url';
import IM from '@import-maps/resolve';
import type { ImportMap } from './types';

interface Data {
    baseURL: string;
    importMap: ImportMap;
}

let registered = '';

export function createLoaderImport(baseURL: URL, importMap: ImportMap = {}) {
    if (!registered) {
        module.register<Data>(fileURLToPath(import.meta.url), {
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

let loaderBaseURL: URL = new URL('file:');
let loaderParsedImportMap: IM.ParsedImportMap = {};

export function initialize(data: Data) {
    loaderBaseURL = new URL(data.baseURL);
    loaderParsedImportMap = IM.parse(data.importMap, loaderBaseURL);
}

export function resolve(
    specifier: string,
    context: Record<string, any>,
    nextResolve: Function
) {
    const scriptURL = new URL(context.parentURL);
    const result = IM.resolve(specifier, loaderParsedImportMap, scriptURL);
    if (result.matched && result.resolvedImport) {
        return nextResolve(result.resolvedImport.href);
    }
    return nextResolve(specifier, context);
}

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

    // Windows-compatible debug logging
    const debugScriptPath =
        scriptURL.protocol === 'file:'
            ? fileURLToPath(scriptURL)
            : scriptURL.href;

    if (result.matched && result.resolvedImport) {
        const debugResultPath =
            result.resolvedImport.protocol === 'file:'
                ? fileURLToPath(result.resolvedImport)
                : result.resolvedImport.href;

        console.log('Import resolved:', {
            specifier,
            from: debugScriptPath,
            to: debugResultPath
        });
        return nextResolve(result.resolvedImport.href);
    }

    const debugTarget = new URL(specifier, scriptURL);
    const debugTargetPath =
        debugTarget.protocol === 'file:'
            ? fileURLToPath(debugTarget)
            : debugTarget.href;

    console.log('Import passthrough:', {
        specifier,
        from: debugScriptPath,
        to: debugTargetPath
    });
    return nextResolve(specifier, context);
}

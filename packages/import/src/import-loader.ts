import module from 'node:module';
import { fileURLToPath } from 'node:url';
import IM from '@import-maps/resolve';
import type { ImportMap } from './types';

interface Data {
    baseURL: string;
    importMap: ImportMap;
}

let registered = '';
/**
 * 创建一个使用 loader 实现的 importmap 的 import 函数，只能创建一次，无热更新，适合生产使用。
 */
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

// loader 线程时的处理逻辑
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

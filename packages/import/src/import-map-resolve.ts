import { pathToFileURL } from 'node:url';
import { parse, resolve } from '@import-maps/resolve';
import type { ImportMap, ImportMapResolver } from './types';

export function createImportMapResolver(
    base: string,
    importMap: ImportMap
): ImportMapResolver {
    const baseURL = pathToFileURL(base);
    const parsedImportMap = parse(importMap, baseURL);
    return (specifier: string, scriptURL: string): string | null => {
        const result = resolve(specifier, parsedImportMap, new URL(scriptURL));
        if (result.resolvedImport) {
            return result.resolvedImport.href;
        }
        return null;
    };
}

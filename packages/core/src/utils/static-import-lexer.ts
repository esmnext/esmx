import type fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import type { ImportMap, SpecifierMap } from '@esmx/import';
import * as esmLexer from 'es-module-lexer';
import type { ParsedModuleConfig } from '../module-config';

/**
 * Get the list of statically imported module names from JS code. Maybe cannot handle multiple concurrent calls, not tested.
 * @param code JS code
 * @returns `Promise<string[]>` List of statically imported module names
 */
export async function getImportsFromJsCode(code: string): Promise<string[]> {
    await esmLexer.init;
    const [imports] = esmLexer.parse(code);
    // Static import && has module name
    return imports
        .filter((item) => item.t === 1 && item.n)
        .map((item) => item.n as string);
}

/**
 * Get the list of statically imported module names from a JS file.
 * @param filepath JS file path
 * @returns `Promise<string[]>` List of statically imported module names
 */
export async function getImportsFromJsFile(
    filepath: fs.PathLike | fs.promises.FileHandle
) {
    const source = await fsp.readFile(filepath, 'utf-8');
    return getImportsFromJsCode(source);
}

export type ImportPreloadInfo = SpecifierMap;
/**
 * Get import preload information.
 * @param specifier Module name
 * @param importMap Import map object
 * @param moduleConfig Module configuration
 * @returns
 *   - `Promise<{ [specifier: string]: ImportPreloadPathString }>` Mapping object of module names to file paths
 *   - `null` specifier does not exist
 */
export async function getImportPreloadInfo(
    specifier: string,
    importMap: ImportMap,
    moduleConfig: ParsedModuleConfig
) {
    const importInfo = importMap.imports;
    if (!importInfo || !(specifier in importInfo)) {
        return null;
    }

    const ans: ImportPreloadInfo = {
        // Entry file is also added to the preload list
        [specifier]: importInfo[specifier]
    };

    // Lexical analysis is a time-consuming operation, so the fewer files processed, the faster, in other words, the shallower the depth, the faster, so breadth-first search is used here
    const needHandles: string[] = [specifier];
    while (needHandles.length) {
        const specifier = needHandles.shift()!;
        let filepath = importInfo[specifier];
        const splitRes = filepath.split('/');
        if (splitRes[0] === '') splitRes.shift();
        // Here it is assumed that the first directory in the path is the soft package name
        const name = splitRes.shift() + '';
        const link = moduleConfig.links[name];
        if (!link) {
            continue;
        }
        filepath = path.join(link.client, ...splitRes);
        const imports = await getImportsFromJsFile(filepath);
        for (const specifier of imports) {
            // If the module name does not exist in importMap or has been processed
            if (!(specifier in importInfo) || specifier in ans) continue;
            ans[specifier] = importInfo[specifier];
            needHandles.push(specifier);
        }
    }

    // Reverse order, theoretically browser parsing may be faster after reversing
    return Object.fromEntries(Object.entries(ans).reverse());
}

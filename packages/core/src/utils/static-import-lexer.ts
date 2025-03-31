import type fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';

import * as esmLexer from 'es-module-lexer';

/**
 * 从 JS 代码中获取静态 import 的模块名列表。也许不能并发多个调用，没实验过。
 * @param code js 代码
 * @returns `Promise<string[]>` 静态 import 的模块名列表
 */
export async function getImportsFromJsCode(code: string) {
    await esmLexer.init;
    const [imports] = esmLexer.parse(code);
    // 静态导入 && 拥有模块名
    return imports
        .filter((item) => item.t === 1 && item.n)
        .map((item) => item.n as string);
}

/**
 * 从 JS 文件中获取静态 import 的模块名列表。
 * @param filepath js 文件路径
 * @returns `Promise<string[]>` 静态 import 的模块名列表
 */
export async function getImportsFromJsFile(
    filepath: fs.PathLike | fs.promises.FileHandle
) {
    const source = await fsp.readFile(filepath, 'utf-8');
    return getImportsFromJsCode(source);
}

import type { ImportMap, SpecifierMap } from '@esmx/import';
import type { ParsedModuleConfig } from '../module-config';

export type ImportPreloadInfo = SpecifierMap;
/**
 * 获取导入的预加载信息。
 * @param specifier 模块名
 * @param importMap 导入映射对象
 * @param moduleConfig 模块配置
 * @returns
 *   - `Promise<{ [specifier: string]: ImportPreloadPathString }>` 模块名和文件路径的映射对象
 *   - `null` specifier 不存在
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
        // 入口文件也放入预加载列表
        [specifier]: importInfo[specifier]
    };

    // 词法分析是耗时操作，因此处理的文件越少越快，换句话说就是深度越浅越快，因此这里使用广度优先搜索
    const needHandles: string[] = [specifier];
    while (needHandles.length) {
        const specifier = needHandles.shift()!;
        let filepath = importInfo[specifier];
        const splitRes = filepath.split('/');
        if (splitRes[0] === '') splitRes.shift();
        // 这里默认路径的第一个目录是软包名称
        const name = splitRes.shift() + '';
        const link = moduleConfig.links.find((item) => item.name === name);
        if (!link) {
            continue;
        }
        filepath = path.join(link.root, 'client', ...splitRes);
        const imports = await getImportsFromJsFile(filepath);
        for (const specifier of imports) {
            // 如果模块名在 importMap 中不存在，或已经处理过
            if (!(specifier in importInfo) || (specifier in ans))
                continue;
            ans[specifier] = importInfo[specifier];
            needHandles.push(specifier);
        }
    }

    // 倒序，理论上倒序后浏览器解析可能会更快
    return Object.fromEntries(Object.entries(ans).reverse());
}

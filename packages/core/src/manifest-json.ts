import fsp from 'node:fs/promises';
import path from 'node:path';

import type { RuntimeTarget } from './gez';
import type { ParsedModuleConfig } from './module-config';

export interface ManifestJsonChunks {
    /**
     * 当前编译的 JS 文件。
     */
    js: string;
    /**
     * 当前编译的 CSS 文件。
     */
    css: string[];
    /**
     * 其它的资源文件。
     */
    resources: string[];
    /**
     * 构建产物的大小。
     */
    sizes: ManifestJsonChunkSizes;
}

export interface ManifestJsonChunkSizes {
    js: number;
    css: number;
    resource: number;
}

export interface ManifestJson {
    /**
     * 服务名字，来自于：GezOptions.name
     */
    name: string;
    /**
     * 对外导出的文件
     */
    exports: Record<string, string>;
    /**
     * 构建的全部文件清单
     */
    buildFiles: string[];
    /**
     * 编译的文件信息
     * 类型：Record<源文件, 编译信息>
     */
    chunks: Record<string, ManifestJsonChunks>;
}

/**
 * 异步的读取一个 JSON 文件。
 */
async function readJson(filename: string): Promise<any> {
    return JSON.parse(await fsp.readFile(filename, 'utf-8'));
}

/**
 * 获取服务清单文件
 */
export async function getManifestList(
    target: RuntimeTarget,
    moduleConfig: ParsedModuleConfig
): Promise<ManifestJson[]> {
    return Promise.all(
        moduleConfig.links.map(async (item) => {
            const filename = path.resolve(item.root, target, 'manifest.json');
            try {
                const data: ManifestJson = await readJson(filename);
                data.name = item.name;
                return data;
            } catch (e) {
                throw new Error(
                    `'${item.name}' service '${target}/manifest.json' file read error`
                );
            }
        })
    );
}

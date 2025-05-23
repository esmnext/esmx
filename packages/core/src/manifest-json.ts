import fsp from 'node:fs/promises';
import path from 'node:path';

import type { BuildSsrTarget } from './core';
import type { ParsedModuleConfig } from './module-config';

export interface ManifestJson {
    /**
     * 模块名称
     */
    name: string;
    /**
     * 导入映射
     */
    imports: Record<string, string>;
    /**
     * 导出项配置
     * 类型：Record<导出路径, 导出项信息>
     */
    exports: ManifestJsonExports;
    /**
     * 构建产物文件列表
     */
    buildFiles: string[];
    /**
     * 编译的文件信息
     * 类型：Record<源文件, 编译信息>
     */
    chunks: ManifestJsonChunks;
}

/**
 * 导出项配置映射
 * 类型：Record<导出路径, 导出项信息>
 */
export type ManifestJsonExports = Record<string, ManifestJsonExport>;

/**
 * 导出项信息
 */
export interface ManifestJsonExport {
    /**
     * 导出项名称
     */
    name: string;
    /**
     * 是否重写模块内的导入路径
     * - true: 重写为 '{服务名}/{导出名}' 格式
     * - false: 保持原始导入路径
     */
    rewrite: boolean;
    /**
     * 导出项对应的文件路径
     */
    file: string;
    /**
     * 导出项的标识符
     */
    identifier: string;
}

export type ManifestJsonChunks = Record<string, ManifestJsonChunk>;

export interface ManifestJsonChunk {
    name: string;
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
    /**
     * JavaScript 文件的大小，单位：字节
     */
    js: number;
    /**
     * CSS 文件的大小，单位：字节
     */
    css: number;
    /**
     * 资源文件的大小，单位：字节
     */
    resource: number;
}

/**
 * 获取服务清单文件
 */
export async function getManifestList(
    target: BuildSsrTarget,
    moduleConfig: ParsedModuleConfig
): Promise<ManifestJson[]> {
    return Promise.all(
        Object.values(moduleConfig.links).map(async (item) => {
            const filename = path.resolve(item[target], 'manifest.json');
            try {
                const data: ManifestJson = await JSON.parse(await fsp.readFile(filename, 'utf-8'));
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

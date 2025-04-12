import fsp from 'node:fs/promises';
import path from 'node:path';

import type { RuntimeTarget } from './core';
import type { ParsedModuleConfig } from './module-config';

export interface ManifestJson {
    /**
     * 模块名称
     */
    name: string;
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
export type ManifestJsonExports = Record<string, ManifestJsonExportItem>;

/**
 * 导出项类型
 * - npm: NPM 包导出
 * - public: 公共资源导出
 */
export type ManifestJsonExportType = 'npm' | 'public';

/**
 * 导出项信息
 */
export interface ManifestJsonExportItem {
    /**
     * 导出项名称
     */
    name: string;
    /**
     * 导出项类型
     */
    type: ManifestJsonExportType;
    /**
     * 导出项对应的文件路径
     */
    file: string;
    /**
     * 导出项的唯一标识符
     */
    identifier: string;
}

export type ManifestJsonChunks = Record<string, ManifestJsonChunkItem>;

export interface ManifestJsonChunkItem {
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
        Object.values(moduleConfig.links).map(async (item) => {
            const filename = path.resolve(item[target], 'manifest.json');
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

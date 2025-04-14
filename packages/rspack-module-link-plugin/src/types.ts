import type { ManifestJsonExports } from '@esmx/core';
export type {
    ManifestJson,
    ManifestJsonChunks,
    ManifestJsonChunkItem,
    ManifestJsonChunkSizes,
    ManifestJsonExports,
    ManifestJsonExportItem
} from '@esmx/core';

export interface ModuleLinkPluginOptions {
    /**
     * 模块名称
     */
    name: string;
    /**
     * JS 文件的后缀，默认为 `mjs`
     * @default mjs
     */
    ext?: string;
    /**
     * 导入映射
     */
    imports?: Record<string, string>;
    /**
     * 导出模块
     */
    exports?: Record<string, { pkg?: boolean; file: string }>;
    /**
     * 是否注入 chunk name，默认为 `false`，通常只有构建服务端渲染产物时才需要设置为 `true`
     * @default false
     */
    injectChunkName?: boolean;
}
/**
 * 解析后的模块链接插件配置
 */
export interface ParsedModuleLinkPluginOptions {
    /**
     * 模块名称
     */
    name: string;
    /**
     * JS 文件的后缀
     */
    ext: string;
    /**
     * 导出项配置
     * 类型：Record<导出路径, 导出项信息>
     */
    exports: ManifestJsonExports;
    /**
     * 是否注入 chunk name，通常只有构建服务端渲染产物时才需要设置为 `true`
     */
    injectChunkName: boolean;
}

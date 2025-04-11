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
    exports?: Array<string | Record<string, string>>;
    /**
     * 是否注入 chunk name，默认为 `false`，通常只有构建服务端渲染产物时才需要设置为 `true`
     * @default false
     */
    injectChunkName?: boolean;
}
export interface ParsedModuleLinkPluginOptions {
    name: string;
    ext: string;
    exports: ManifestJsonExports;
    injectChunkName: boolean;
}

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

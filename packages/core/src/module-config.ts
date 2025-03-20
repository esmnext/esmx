import path from 'node:path';

export enum PathType {
    npm = 'npm:',
    root = 'root:'
}

/**
 * 模块配置接口。
 * 用于定义服务的导出、导入和外部依赖配置。
 *
 * @example
 * ```ts
 * // entry.node.ts
 * import type { GezOptions } from '@gez/core';
 *
 * export default {
 *   modules: {
 *     // 导出配置
 *     exports: [
 *       'root:src/components/button.vue',  // 导出源码文件
 *       'root:src/utils/format.ts',
 *       'npm:vue',  // 导出第三方依赖
 *       'npm:vue-router'
 *     ],
 *
 *     // 导入配置
 *     links: {
 *       // 源码安装方式：需要指向 dist 目录
 *       'ssr-remote': 'root:./node_modules/ssr-remote/dist',
 *       // 软件包安装方式：直接指向包目录
 *       'other-remote': 'root:./node_modules/other-remote'
 *     },
 *
 *     // 外部依赖配置
 *     imports: {
 *       'vue': 'ssr-remote/npm/vue',
 *       'vue-router': 'ssr-remote/npm/vue-router'
 *     }
 *   }
 * } satisfies GezOptions;
 * ```
 */
export interface ModuleConfig {
    /**
     * 导出配置列表。
     * 将服务中的特定代码单元（如组件、工具函数等）以 ESM 格式对外暴露。
     *
     * 支持两种类型：
     * - root:* - 导出源码文件，如：'root:src/components/button.vue'
     * - npm:* - 导出第三方依赖，如：'npm:vue'
     *
     * @example
     * ```ts
     * exports: [
     *   // 导出源码文件
     *   'root:src/components/button.vue',
     *   'root:src/utils/format.ts',
     *   // 导出第三方依赖
     *   'npm:vue',
     *   'npm:vue-router'
     * ]
     * ```
     */
    exports?: string[];

    /**
     * 导入配置映射。
     * 配置需要导入的远程模块及其本地路径。
     *
     * 安装方式不同，配置也不同：
     * - 源码安装（Workspace、Git）：需要指向 dist 目录
     * - 软件包安装（Link、静态服务器、私有镜像源、File）：直接指向包目录
     *
     * @example
     * ```ts
     * links: {
     *   // 源码安装方式：需要指向 dist 目录
     *   'ssr-remote': 'root:./node_modules/ssr-remote/dist',
     *   // 软件包安装方式：直接指向包目录
     *   'other-remote': 'root:./node_modules/other-remote'
     * }
     * ```
     */
    links?: Record<string, string>;

    /**
     * 外部依赖映射。
     * 配置要使用的外部依赖，通常是使用远程模块中的依赖。
     *
     * @example
     * ```ts
     * imports: {
     *   // 使用远程模块中的依赖
     *   'vue': 'ssr-remote/npm/vue',
     *   'vue-router': 'ssr-remote/npm/vue-router'
     * }
     * ```
     */
    imports?: Record<string, string>;
}

/**
 * 解析后的模块配置。
 * 将原始的模块配置转换为标准化的内部格式，用于模块的加载和解析。
 */
export interface ParsedModuleConfig {
    /**
     * 当前服务的名称。
     * 用于标识模块和生成导入路径。
     */
    name: string;

    /**
     * 当前服务的根目录路径。
     * 用于解析相对路径和构建产物的存放。
     */
    root: string;

    /**
     * 导出配置列表。
     * 定义了当前服务对外暴露的模块。
     */
    exports: {
        /**
         * 原始导出路径。
         * 例如：'npm:vue' 或 'root:src/components'
         */
        name: string;

        /**
         * 路径类型。
         * - npm: node_modules 中的依赖
         * - root: 项目根目录下的文件
         */
        type: PathType;

        /**
         * 导入名称。
         * 格式：'${serviceName}/${type}/${path}'
         * 例如：'your-app-name/npm/vue' 或 'your-app-name/src/components'
         */
        importName: string;

        /**
         * 导出路径。
         * 相对于服务根目录的路径。
         * 例如：'./npm/vue' 或 './src/components'
         */
        exportName: string;

        /**
         * 实际的文件路径。
         * 例如：'vue' 或 './src/components.ts'
         */
        exportPath: string;

        /**
         * 外部依赖名称。
         * 用于其他服务导入此模块时的标识。
         * 例如：'vue' 或 'your-app-name/src/components'
         */
        externalName: string;
    }[];

    /**
     * 导入配置列表。
     * 定义了当前服务需要导入的外部模块。
     */
    links: Array<{
        /**
         * 软包名称
         */
        name: string;

        /**
         * 软件包根目录
         */
        root: string;
    }>;

    /**
     * 外部依赖映射。
     * 将模块的导入路径映射到实际的模块位置。
     *
     * @example
     * ```ts
     * {
     *   'vue': {
     *     match: /^vue$/,  // 匹配导入语句
     *     import: 'your-app-name/npm/vue'  // 实际的模块路径
     *   }
     * }
     * ```
     */
    imports: Record<string, { match: RegExp; import?: string }>;
}

export function parseModuleConfig(
    name: string,
    root: string,
    config: ModuleConfig = {}
): ParsedModuleConfig {
    const exports: ParsedModuleConfig['exports'] = [];
    if (config.exports) {
        config.exports.forEach((key) => {
            if (key.startsWith(PathType.npm)) {
                const exportName = key.substring(PathType.npm.length);

                exports.push({
                    name: key,
                    type: PathType.npm,
                    importName: `${name}/npm/${exportName}`,
                    exportName: `./npm/${exportName}`,
                    exportPath: exportName,
                    externalName: exportName
                });
            } else if (key.startsWith(PathType.root)) {
                const exportName = key.substring(PathType.root.length);

                const exportNameNoSuffix = exportName.replace(/\.(ts|js)$/, '');

                exports.push({
                    name: key,
                    type: PathType.root,
                    importName: `${name}/${exportNameNoSuffix}`,
                    exportName: `./${exportNameNoSuffix}`,
                    exportPath: `./${exportName}`,
                    externalName: `${name}/${exportNameNoSuffix}`
                });
            }
        });
    }

    const links: ParsedModuleConfig['links'] = [];
    if (config.links) {
        const getLocalPath = (dir: string) => {
            if (dir.startsWith(PathType.root)) {
                return path.resolve(root, dir.substring(PathType.root.length));
            } else if (path.isAbsolute(dir)) {
                return dir;
            }
            return path.resolve(process.cwd(), dir);
        };
        const _links = config.links;
        Object.keys(config.links).forEach((key) => {
            const value = _links[key].trim();
            links.push({
                name: key,
                root: getLocalPath(value)
            });
        });
    }

    const imports: ParsedModuleConfig['imports'] = {};
    exports.forEach(({ importName, externalName }) => {
        imports[externalName] = {
            match: new RegExp(`^${externalName}$`),
            import: importName
        };
    });

    links.forEach(({ name }) => {
        imports[name] = {
            match: new RegExp(`^${[name]}/`)
        };
    });
    if (config.imports) {
        Object.entries(config.imports).forEach(([key, value]) => {
            imports[key] = {
                import: value,
                match: new RegExp(`^${key}$`)
            };
        });
    }

    links.push({
        name,
        root: path.resolve(root, 'dist')
    });
    return { name, root, exports, links, imports };
}

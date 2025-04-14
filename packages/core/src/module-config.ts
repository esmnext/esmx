import path from 'node:path';
import { parseExport } from './utils/parse-export';

/**
 * 模块链接配置
 */
export interface ModuleConfig {
    /**
     * 模块链接
     *
     * @example
     * ```ts
     * links: {
     *   // 源码安装方式：指向构建产物目录
     *   'ssr-remote': './node_modules/ssr-remote/dist',
     *   // 软件包安装方式：指向包目录
     *   'other-remote': './node_modules/other-remote'
     * }
     * ```
     */
    links?: Record<string, string>;

    /**
     * 模块导入
     *
     * @example
     * ```ts
     * imports: {
     *   'vue': 'ssr-remote/npm/vue',
     *   'vue-router': 'ssr-remote/npm/vue-router'
     * }
     * ```
     */
    imports?: Record<string, string>;
    /**
     * 模块导出
     *
     * @example
     * ```ts
     * exports: [
     *   'npm:vue',
     *   ['npm.server:react', './src/react.ts']
     * ]
     * ```
     */
    exports?: Array<string | [string, string]>;
}

export interface ParsedModuleConfig {
    name: string;
    root: string;
    links: Record<
        string,
        {
            name: string;
            root: string;
            client: string;
            server: string;
        }
    >;
    imports: Record<string, string>;
    exports: Record<
        string,
        {
            name: string;
            pkg: boolean;
            client: boolean;
            server: boolean;
            file: string;
        }
    >;
}

export function parseModuleConfig(
    name: string,
    root: string,
    config: ModuleConfig = {}
): ParsedModuleConfig {
    const links: ParsedModuleConfig['links'] = {};
    Object.entries(config.links || {}).forEach(([key, value]) => {
        links[key] = {
            name: key,
            root: value,
            client: path.resolve(root, value, 'client'),
            server: path.resolve(root, value, 'server')
        };
    });

    const exports: ParsedModuleConfig['exports'] = {};
    config.exports?.forEach((value) => {
        const item = parseExport(value);
        exports[item.name] = item;
    });
    return {
        name,
        root,
        links,
        imports: config.imports ?? {},
        exports
    };
}

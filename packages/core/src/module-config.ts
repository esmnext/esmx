import path from 'node:path';
import type { BuildSsrTarget } from './core';

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
    imports?: Record<string, string>;
    /**
     * 模块导出配置对象
     *
     * @example
     * ```ts
     * exports: {
     *   // 1. 基础导出
     *   'utils': './src/utils.ts',
     *
     *   // 2. 自定义构建目标导出
     *   'ssr': {
     *     input: './src/entry.ts',
     *     inputTarget: {
     *       client: './src/entry.client.ts',
     *       server: './src/entry.server.ts'
     *     }
     *   },
     *
     *   // 3. 导出第三方库
     *   // rewrite 设为 false 可以避免模块内的 import 被重写为 '{服务名}/xxx' 格式
     *   'vue': {
     *     rewrite: false
     *   },
     *
     *   // 4. 导出包装后的第三方库
     *   'react': {
     *     rewrite: false,
     *     input: './src/react.ts'  // 自定义包装层
     *   }
     * }
     * ```
     */
    exports?: ModuleConfigExportExports;
}

export type ModuleConfigExportExports =
    | Array<string | Record<string, string | ModuleConfigExportObject>>
    | Record<string, string | ModuleConfigExportObject>;

export type ModuleConfigExportObject = {
    rewrite?: boolean;
    input?: string;
    inputTarget?: Record<BuildSsrTarget, string | false>;
};

export interface ParsedModuleConfig {
    name: string;
    root: string;
    links: Record<
        string,
        {
            name: string;
            root: string;
            client: string;
            clientManifestJson: string;
            server: string;
            serverManifestJson: string;
        }
    >;
    imports: Record<string, string>;
    exports: ParsedModuleConfigExports;
}

export type ParsedModuleConfigExports = Record<
    string,
    ParsedModuleConfigExport
>;
export interface ParsedModuleConfigExport {
    /**
     * 导出项的唯一标识名称
     */
    name: string;

    /**
     * 是否重写模块内的导入路径
     * - true: 重写为 '{服务名}/{导出名}' 格式
     * - false: 保持原始导入路径
     */
    rewrite: boolean;

    /**
     * 特定目标的构建入口文件路径
     * 用于配置不同目标（client/server）的专用入口文件
     */
    inputTarget: Record<BuildSsrTarget, string | false>;
}

export function parseModuleConfig(
    name: string,
    root: string,
    config: ModuleConfig = {}
): ParsedModuleConfig {
    return {
        name,
        root,
        links: getLinks(name, root, config),
        imports: config.imports ?? {},
        exports: getExports(config)
    };
}

const PREFIX = {
    npm: 'npm:',
    root: 'root:'
};

function getLinks(name: string, root: string, config: ModuleConfig) {
    const result: ParsedModuleConfig['links'] = {};
    Object.entries({
        [name]: path.resolve(root, 'dist'),
        ...config.links
    }).forEach(([name, value]) => {
        result[name] = {
            name: name,
            root: value,
            client: path.resolve(root, value, 'client'),
            clientManifestJson: path.resolve(
                root,
                value,
                'client/manifest.json'
            ),
            server: path.resolve(root, value, 'server'),
            serverManifestJson: path.resolve(
                root,
                value,
                'server/manifest.json'
            )
        };
    });
    return result;
}

function getExports(config: ModuleConfig = {}) {
    const result: ParsedModuleConfig['exports'] = {};
    const exports: Record<string, ModuleConfigExportObject | string> = {
        'src/entry.client': {
            inputTarget: {
                client: './src/entry.client',
                server: false
            }
        },
        'src/entry.server': {
            inputTarget: {
                client: false,
                server: './src/entry.server'
            }
        }
    };
    if (Array.isArray(config.exports)) {
        const FILE_EXT_REGEX =
            /\.(js|mjs|cjs|jsx|mjsx|cjsx|ts|mts|cts|tsx|mtsx|ctsx)$/i;
        config.exports.forEach((item) => {
            if (typeof item === 'string') {
                if (item.startsWith(PREFIX.npm)) {
                    item = item.substring(PREFIX.npm.length);
                    exports[item] = {
                        rewrite: false,
                        input: item
                    };
                } else if (item.startsWith(PREFIX.root)) {
                    item = item
                        .substring(PREFIX.root.length)
                        .replace(FILE_EXT_REGEX, '');
                    exports[item] = {
                        input: './' + item
                    };
                } else {
                    console.error(`Invalid module export: ${item}`);
                }
            } else {
                Object.assign(exports, item);
            }
        });
    } else if (config.exports) {
        Object.assign(exports, config.exports);
    }
    for (const [name, value] of Object.entries(exports)) {
        const opts =
            typeof value === 'string'
                ? {
                      input: value
                  }
                : value;
        const client = opts.inputTarget?.client ?? opts.input ?? name;
        const server = opts.inputTarget?.server ?? opts.input ?? name;
        result[name] = {
            name,
            rewrite: opts.rewrite ?? true,
            inputTarget: {
                client,
                server
            }
        };
    }
    return result;
}

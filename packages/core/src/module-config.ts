import path from 'node:path';
import type { BuildSsrTarget } from './core';

/**
 * 模块配置接口
 * 在微服务架构中，一个服务既可以作为主服务使用其他服务的模块，
 * 也可以作为远程服务（remote）向其他服务提供模块。
 *
 * @example
 * // 假设有两个服务：
 * // 1. vue-host-service：主服务，需要使用远程服务的 Vue 组件
 * // 2. vue-remote-service：远程服务，提供可复用的 Vue 组件
 *
 * // vue-remote-service 的配置示例：
 * const remoteConfig: ModuleConfig = {
 *   // 服务名称
 *   name: 'vue-remote-service',
 *   // 导入配置：空，因为这个服务不需要导入其他服务的模块
 *   imports: {},
 *   // 导出配置：将组件库暴露给其他服务使用
 *   exports: [
 *     {
 *       'components/button': {
 *         input: './src/components/button.ts'  // 必须指定具体的源文件
 *       }
 *     }
 *   ]
 * };
 *
 * // vue-host-service 的配置示例：
 * const hostConfig: ModuleConfig = {
 *   // 服务名称
 *   name: 'vue-host-service',
 *   // 链接配置：指定远程服务的构建产物位置
 *   links: {
 *     'vue-remote-service': '../vue-remote-service/dist'
 *   },
 *   // 导入配置：使用远程服务提供的组件
 *   imports: {
 *     'remote-button': 'vue-remote-service/components/button'
 *   },
 *   // 导出配置：可选，如果这个服务也需要暴露模块给其他服务使用
 *   exports: []
 * };
 */
export interface ModuleConfig {
    /**
     * 服务与服务之间的链接配置
     * 键：远程服务的名称
     * 值：远程服务的构建产物目录路径
     */
    links?: Record<string, string>;

    /**
     * 导入配置
     * 用于将当前服务中的某个模块标识符映射到远程服务提供的模块
     * 键：在当前服务中使用的模块标识符
     * 值：远程服务导出的模块路径
     */
    imports?: Record<string, string>;

    /**
     * 导出配置
     * 用于将当前服务的模块暴露给其他服务使用
     * 其他服务可以通过 imports 配置来使用这里导出的模块
     */
    exports?: ModuleConfigExportExports;
}

/**
 * 模块导出配置类型
 * 用于定义当前服务要暴露哪些模块供其他服务使用
 *
 * @example
 * // 1. 数组形式 - 字符串简写
 * const exports1: ModuleConfigExportExports = [
 *   // npm 包导出
 *   'npm:lodash',
 *   // 本地文件导出（必须指定具体文件名）
 *   'root:src/components/button.ts'
 * ];
 *
 * // 2. 数组形式 - 对象配置
 * const exports2: ModuleConfigExportExports = [
 *   // 简单的键值对映射
 *   { 'button': './src/components/button.ts' },
 *   // 带完整配置的对象
 *   {
 *     'store': {
 *       input: './src/store.ts',
 *       inputTarget: {
 *         client: './src/store.client.ts',
 *         server: './src/store.server.ts'
 *       }
 *     }
 *   }
 * ];
 *
 * // 3. 对象形式
 * const exports3: ModuleConfigExportExports = {
 *   // 简单路径映射
 *   'utils': './src/utils.ts',
 *
 *   // 完整配置对象
 *   'api': {
 *     input: './src/api/index.ts'
 *   },
 *
 *   // 客户端/服务端分离
 *   'entry': {
 *     inputTarget: {
 *       client: './src/entry.client.ts',
 *       server: './src/entry.server.ts'
 *     }
 *   }
 * };
 */
export type ModuleConfigExportExports =
    | Array<string | Record<string, string | ModuleConfigExportObject>>
    | Record<string, string | ModuleConfigExportObject>;

/**
 * 模块导出对象配置
 * 用于详细定义一个要导出的模块的配置
 *
 * @property input - 模块的源文件路径
 * @property inputTarget - 针对客户端和服务端分别配置不同的入口文件
 * @property rewrite - 是否需要重写模块路径，默认为 true
 *                    可以对 npm 包设置为 false 以保持原始路径
 *
 * @example
 * // 导出一个同构组件（客户端和服务端使用相同的实现）
 * const buttonExport: ModuleConfigExportObject = {
 *   input: './src/components/button'
 * };
 *
 * // 导出一个具有不同客户端和服务端实现的模块
 * const storeExport: ModuleConfigExportObject = {
 *   inputTarget: {
 *     client: './src/store/client',  // 客户端特定实现
 *     server: './src/store/server'   // 服务端特定实现
 *   }
 * };
 */
export type ModuleConfigExportObject = {
    /**
     * 模块的源文件路径，用于指定导出的具体文件
     */
    input?: string;

    /**
     * 客户端和服务端的不同入口文件配置
     * - false 表示在该环境下不提供实现
     */
    inputTarget?: Record<BuildSsrTarget, string | false>;

    /**
     * 是否需要重写模块路径（不常用）
     * @default true - 适用于大多数情况
     * @remarks 仅在导出 npm 包时可能需要设为 false
     */
    rewrite?: boolean;
};

/**
 * 解析后的模块配置接口
 * 这是运行时实际使用的配置格式，由原始配置解析得到
 * 包含了所有必要的绝对路径和解析后的模块映射关系
 *
 * @example
 * const parsedConfig: ParsedModuleConfig = {
 *   // 服务名称
 *   name: 'vue-remote-service',
 *   // 服务根目录
 *   root: '/path/to/vue-remote-service',
 *   // 解析后的服务链接配置（包含了完整的文件路径）
 *   links: {
 *     'vue-remote-service': {
 *       name: 'vue-remote-service',
 *       root: '/path/to/vue-remote-service/dist',
 *       client: '/path/to/vue-remote-service/dist/client',
 *       clientManifestJson: '/path/to/vue-remote-service/dist/client/manifest.json',
 *       server: '/path/to/vue-remote-service/dist/server',
 *       serverManifestJson: '/path/to/vue-remote-service/dist/server/manifest.json'
 *     }
 *   },
 *   // 模块导入映射
 *   imports: {
 *     'remote-button': 'vue-remote-service/components/button'
 *   },
 *   // 解析后的导出配置
 *   exports: {
 *     'components/button': {
 *       name: 'components/button',
 *       inputTarget: {
 *         client: './src/components/button',
 *         server: './src/components/button'
 *       },
 *       // 系统内部标记，用户通常不需要关心
 *       rewrite: true
 *     }
 *   }
 * };
 */
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

/**
 * 解析后的模块导出配置
 * 将原始的导出配置转换为标准化的格式
 * 键为导出模块的名称，值为该模块的详细配置
 */
export type ParsedModuleConfigExports = Record<
    string,
    ParsedModuleConfigExport
>;

/**
 * 解析后的单个导出模块配置
 * @property name - 导出模块的名称，用于其他服务导入此模块
 * @property inputTarget - 客户端和服务端的入口文件配置
 * @property rewrite - 模块路径重写标志，true 表示需要调整路径以适配微服务架构
 */
export interface ParsedModuleConfigExport {
    name: string;
    inputTarget: Record<BuildSsrTarget, string | false>;
    rewrite: boolean;
}

/**
 * 解析模块配置
 * 将原始的模块配置转换为标准化的格式，处理路径解析和模块映射
 *
 * @param name - 服务的名称
 * @param root - 服务的根目录路径
 * @param config - 原始的模块配置对象
 * @returns 解析后的模块配置
 *
 * @example
 * const parsedConfig = parseModuleConfig('vue-remote-service', '/path/to/service', {
 *   links: {
 *     'vue-remote-service': 'dist'
 *   },
 *   imports: {
 *     'remote-button': 'vue-remote-service/components/button'
 *   },
 *   exports: ['root:src/components/button.ts']  // 必须指定具体文件名
 * });
 */
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

/**
 * 模块配置中使用的前缀常量
 */
const PREFIX = {
    /** npm 包前缀 */
    npm: 'npm:',
    /** 根路径前缀 */
    root: 'root:'
};

/**
 * 获取解析后的链接配置
 * @param name - 模块名称
 * @param root - 模块根目录路径
 * @param config - 模块配置对象
 * @returns 解析后的链接配置
 * @internal
 */
function getLinks(name: string, root: string, config: ModuleConfig) {
    const result: ParsedModuleConfig['links'] = {};
    Object.entries({
        [name]: path.resolve(root, 'dist'),
        ...config.links
    }).forEach(([name, value]) => {
        const serverRoot = path.isAbsolute(value)
            ? value
            : path.resolve(root, value);
        result[name] = {
            name: name,
            root: value,
            client: path.resolve(serverRoot, 'client'),
            clientManifestJson: path.resolve(
                serverRoot,
                'client/manifest.json'
            ),
            server: path.resolve(serverRoot, 'server'),
            serverManifestJson: path.resolve(serverRoot, 'server/manifest.json')
        };
    });
    return result;
}

/**
 * 获取解析后的导出配置
 * @param config - 模块配置对象
 * @returns 解析后的导出配置
 * @internal
 */
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

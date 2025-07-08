import crypto from 'node:crypto';
import fs from 'node:fs';
import fsp from 'node:fs/promises';
import path from 'node:path';
import { cwd } from 'node:process';
import type { ImportMap, ScopesMap, SpecifierMap } from '@esmx/import';

import serialize from 'serialize-javascript';
import { type App, createApp } from './app';
import { type ManifestJson, getManifestList } from './manifest-json';
import {
    type ModuleConfig,
    type ParsedModuleConfig,
    parseModuleConfig
} from './module-config';
import {
    type PackConfig,
    type ParsedPackConfig,
    parsePackConfig
} from './pack-config';
import type { ImportmapMode } from './render-context';
import type { RenderContext, RenderContextOptions } from './render-context';
import { type CacheHandle, createCache } from './utils/cache';
import { getImportMap } from './utils/import-map';
import type { Middleware } from './utils/middleware';
import { type ProjectPath, resolvePath } from './utils/resolve-path';
import { getImportPreloadInfo as getStaticImportPaths } from './utils/static-import-lexer';

/**
 * Esmx 框架的核心配置选项接口
 */
export interface EsmxOptions {
    /**
     * 项目根目录路径
     * - 可以是绝对路径或相对路径
     * - 默认为当前工作目录 (process.cwd())
     */
    root?: string;

    /**
     * 是否为生产环境
     * - true: 生产环境
     * - false: 开发环境
     * - 默认根据 process.env.NODE_ENV === 'production' 判断
     */
    isProd?: boolean;

    /**
     * 基础路径占位符配置
     * - string: 自定义占位符
     * - false: 禁用占位符
     * - 默认值为 '[[[___GEZ_DYNAMIC_BASE___]]]'
     * - 用于运行时动态替换资源的基础路径
     */
    basePathPlaceholder?: string | false;

    /**
     * 模块配置选项
     * - 用于配置项目的模块解析规则
     * - 包括模块别名、外部依赖等配置
     */
    modules?: ModuleConfig;

    /**
     * 打包配置选项
     * - 用于将构建产物打包成标准的 npm .tgz 格式软件包
     * - 包括输出路径、package.json 处理、打包钩子等配置
     */
    packs?: PackConfig;

    /**
     * 开发环境应用创建函数
     * - 仅在开发环境中使用
     * - 用于创建开发服务器的应用实例
     * @param esmx Esmx实例
     */
    devApp?: (esmx: Esmx) => Promise<App>;

    /**
     * 服务器启动配置函数
     * - 用于配置和启动 HTTP 服务器
     * - 在开发环境和生产环境中都可使用
     * @param esmx Esmx实例
     */
    server?: (esmx: Esmx) => Promise<void>;

    /**
     * 构建后置处理函数
     * - 在项目构建完成后执行
     * - 可用于执行额外的资源处理、部署等操作
     * @param esmx Esmx实例
     */
    postBuild?: (esmx: Esmx) => Promise<void>;
}

/**
 * 应用程序构建目标类型。
 * - client: 客户端构建目标，用于生成浏览器端运行的代码
 * - server: 服务端构建目标，用于生成 Node.js 环境运行的代码
 */
export type BuildSsrTarget = 'client' | 'server';

/**
 * Esmx 框架的命令枚举。
 * 用于控制框架的运行模式和生命周期。
 */
export enum COMMAND {
    /**
     * 开发模式
     * 启动开发服务器并支持热更新
     */
    dev = 'dev',

    /**
     * 构建模式
     * 生成生产环境构建产物
     */
    build = 'build',

    /**
     * 预览模式
     * 预览构建产物
     */
    preview = 'preview',

    /**
     * 启动模式
     * 启动生产环境服务器
     */
    start = 'start'
}

export type { ImportMap, SpecifierMap, ScopesMap };

/**
 * Esmx 框架实例的初始化状态接口
 * @internal 仅供框架内部使用
 *
 * @description
 * 该接口定义了框架实例初始化后的状态数据，包含：
 * - 应用实例：处理请求和渲染
 * - 当前命令：控制运行模式
 * - 模块配置：解析后的模块设置
 * - 打包配置：解析后的构建设置
 * - 缓存处理：框架内部缓存机制
 */
interface Readied {
    /** 应用程序实例，提供中间件和渲染功能 */
    app: App;
    /** 当前执行的框架命令 */
    command: COMMAND;
    /** 解析后的模块配置信息 */
    moduleConfig: ParsedModuleConfig;
    /** 解析后的打包配置信息 */
    packConfig: ParsedPackConfig;
    /** 缓存处理器 */
    cache: CacheHandle;
}

export class Esmx {
    // 基础属性和构造函数
    private readonly _options: EsmxOptions;
    private _readied: Readied | null = null;
    private _importmapHash: string | null = null;

    private get readied() {
        if (this._readied) {
            return this._readied;
        }
        throw new NotReadyError();
    }

    /**
     * 获取模块名称
     * @returns {string} 当前模块的名称，来源于模块配置
     * @throws {NotReadyError} 在框架实例未初始化时抛出错误
     */
    public get name(): string {
        return this.moduleConfig.name;
    }

    /**
     * 获取模块变量名
     * @returns {string} 基于模块名称生成的合法 JavaScript 变量名
     * @throws {NotReadyError} 在框架实例未初始化时抛出错误
     */
    public get varName(): string {
        return '__' + this.name.replace(/[^a-zA-Z]/g, '_') + '__';
    }

    /**
     * 获取项目根目录的绝对路径
     * @returns {string} 项目根目录的绝对路径
     * 如果配置的 root 为相对路径，则基于当前工作目录解析为绝对路径
     */
    public get root(): string {
        const { root = cwd() } = this._options;
        if (path.isAbsolute(root)) {
            return root;
        }
        return path.resolve(cwd(), root);
    }

    /**
     * 判断当前是否为生产环境
     * @returns {boolean} 环境标识
     * 优先使用配置项中的 isProd，若未配置则根据 process.env.NODE_ENV 判断
     */
    public get isProd(): boolean {
        return this._options?.isProd ?? process.env.NODE_ENV === 'production';
    }

    /**
     * 获取模块的基础路径
     * @returns {string} 以斜杠开头和结尾的模块基础路径
     * 用于构建模块资源的访问路径
     */
    public get basePath(): string {
        return `/${this.name}/`;
    }

    /**
     * 获取基础路径占位符
     * @returns {string} 基础路径占位符或空字符串
     * 用于运行时动态替换模块的基础路径，可通过配置禁用
     */
    public get basePathPlaceholder(): string {
        const varName = this._options.basePathPlaceholder;
        if (varName === false) {
            return '';
        }
        return varName ?? '[[[___GEZ_DYNAMIC_BASE___]]]';
    }

    /**
     * 获取当前执行的命令
     * @returns {COMMAND} 当前正在执行的命令枚举值
     * @throws {NotReadyError} 在框架实例未初始化时调用此方法会抛出错误
     */
    public get command(): COMMAND {
        return this.readied.command;
    }

    /**
     * 获取命令枚举类型
     * @returns {typeof COMMAND} 命令枚举类型定义
     */
    public get COMMAND(): typeof COMMAND {
        return COMMAND;
    }

    /**
     * 获取模块配置信息
     * @returns {ParsedModuleConfig} 当前模块的完整配置信息
     */
    public get moduleConfig(): ParsedModuleConfig {
        return this.readied.moduleConfig;
    }

    /**
     * 获取打包配置信息
     * @returns {ParsedPackConfig} 当前模块的打包相关配置
     */
    public get packConfig(): ParsedPackConfig {
        return this.readied.packConfig;
    }

    /**
     * 获取应用程序的静态资源处理中间件。
     *
     * 该中间件负责处理应用程序的静态资源请求，根据运行环境提供不同的实现：
     * - 开发环境：支持源码的实时编译、热更新，使用 no-cache 缓存策略
     * - 生产环境：处理构建后的静态资源，支持不可变文件的长期缓存
     *
     * @returns {Middleware} 返回静态资源处理中间件函数
     * @throws {NotReadyError} 在框架实例未初始化时调用此方法会抛出错误
     *
     * @example
     * ```ts
     * const server = http.createServer((req, res) => {
     *     // 使用中间件处理静态资源请求
     *     esmx.middleware(req, res, async () => {
     *         const rc = await esmx.render({ url: req.url });
     *         res.end(rc.html);
     *     });
     * });
     * ```
     */
    public get middleware(): Middleware {
        return this.readied.app.middleware;
    }

    /**
     * 获取应用程序的服务端渲染函数。
     *
     * 该函数负责执行服务端渲染，根据运行环境提供不同的实现：
     * - 开发环境：加载源码中的服务端入口文件，支持热更新和实时预览
     * - 生产环境：加载构建后的服务端入口文件，提供优化的渲染性能
     *
     * @returns {(options?: RenderContextOptions) => Promise<RenderContext>} 返回服务端渲染函数
     * @throws {NotReadyError} 在框架实例未初始化时调用此方法会抛出错误
     *
     * @example
     * ```ts
     * // 基本用法
     * const rc = await esmx.render({
     *     params: { url: req.url }
     * });
     * res.end(rc.html);
     *
     * // 高级配置
     * const rc = await esmx.render({
     *     base: '',           // 设置基础路径
     *     importmapMode: 'inline',    // 设置导入映射模式
     *     entryName: 'default',    // 指定渲染入口
     *     params: {
     *         url: req.url,
     *         state: { user: 'admin' }
     *     }
     * });
     * ```
     */
    public get render(): (
        options?: RenderContextOptions
    ) => Promise<RenderContext> {
        return this.readied.app.render;
    }
    public constructor(options: EsmxOptions = {}) {
        this._options = options;
    }
    /**
     * 初始化 Esmx 框架实例。
     *
     * 该方法执行以下核心初始化流程：
     * 1. 解析项目配置（package.json、模块配置、打包配置等）
     * 2. 创建应用实例（开发环境或生产环境）
     * 3. 根据命令执行相应的生命周期方法
     *
     * @param command - 框架运行命令
     *   - dev: 启动开发服务器，支持热更新
     *   - build: 构建生产环境产物
     *   - preview: 预览构建产物
     *   - start: 启动生产环境服务器
     *
     * @returns 初始化成功返回 true
     * @throws {Error} 重复初始化时抛出错误
     *
     * @example
     * ```ts
     * // entry.node.ts
     * import type { EsmxOptions } from '@esmx/core';
     *
     * export default {
     *   // 开发环境配置
     *   async devApp(esmx) {
     *     return import('@esmx/rspack').then((m) =>
     *       m.createRspackHtmlApp(esmx, {
     *         config(context) {
     *           // 自定义 Rspack 配置
     *         }
     *       })
     *     );
     *   },
     *
     *   // HTTP 服务器配置
     *   async server(esmx) {
     *     const server = http.createServer((req, res) => {
     *       // 静态文件处理
     *       esmx.middleware(req, res, async () => {
     *         // 传入渲染的参数
     *         const render = await esmx.render({
     *           params: { url: req.url }
     *         });
     *         // 响应 HTML 内容
     *         res.end(render.html);
     *       });
     *     });
     *
     *     // 监听端口
     *     server.listen(3000, () => {
     *       console.log('http://localhost:3000');
     *     });
     *   }
     * } satisfies EsmxOptions;
     * ```
     */
    public async init(command: COMMAND): Promise<boolean> {
        if (this._readied) {
            throw new Error('Cannot be initialized repeatedly');
        }

        const { name } = await this.readJson(
            path.resolve(this.root, 'package.json')
        );
        const moduleConfig = parseModuleConfig(
            name,
            this.root,
            this._options.modules
        );
        const packConfig = parsePackConfig(this._options.packs);
        this._readied = {
            command,
            app: {
                middleware() {
                    throw new NotReadyError();
                },
                async render() {
                    throw new NotReadyError();
                }
            },
            moduleConfig,
            packConfig,
            cache: createCache(this.isProd)
        };

        const devApp = this._options.devApp || defaultDevApp;
        const app: App = [COMMAND.dev, COMMAND.build].includes(command)
            ? await devApp(this)
            : await createApp(this, command);

        this.readied.app = app;

        switch (command) {
            case COMMAND.dev:
            case COMMAND.start:
                await this.server();
                break;
            case COMMAND.build:
                return this.build();
            case COMMAND.preview:
                break;
        }
        return true;
    }

    /**
     * 销毁 Esmx 框架实例，执行资源清理和连接关闭等操作。
     *
     * 该方法主要用于开发环境下的资源清理，包括：
     * - 关闭开发服务器（如 Rspack Dev Server）
     * - 清理临时文件和缓存
     * - 释放系统资源
     *
     * 注意：一般情况下，框架会自动处理资源的释放，用户无需手动调用此方法。
     * 仅在需要自定义资源清理逻辑时才需要使用。
     *
     * @returns 返回一个 Promise，resolve 为 boolean 值
     *   - true: 清理成功或无需清理
     *   - false: 清理失败
     *
     * @example
     * ```ts
     * // 在需要自定义清理逻辑时使用
     * process.once('SIGTERM', async () => {
     *   await esmx.destroy(); // 清理资源
     *   process.exit(0);
     * });
     * ```
     */
    public async destroy(): Promise<boolean> {
        const { readied } = this;
        if (readied.app?.destroy) {
            return readied.app.destroy();
        }
        return true;
    }

    /**
     * 执行应用程序的构建流程。
     *
     * 该方法负责执行整个应用的构建过程，包括：
     * - 编译源代码
     * - 生成生产环境的构建产物
     * - 优化和压缩代码
     * - 生成资源清单
     *
     * 构建过程会打印开始和结束时间，以及总耗时等信息。
     *
     * @returns 返回一个 Promise，resolve 为 boolean 值
     *   - true: 构建成功或构建方法未实现
     *   - false: 构建失败
     *
     * @throws {NotReadyError} 在框架实例未初始化时调用此方法会抛出错误
     *
     * @example
     * ```ts
     * // entry.node.ts
     * import type { EsmxOptions } from '@esmx/core';
     *
     * export default {
     *   // 开发环境配置
     *   async devApp(esmx) {
     *     return import('@esmx/rspack').then((m) =>
     *       m.createRspackHtmlApp(esmx, {
     *         config(context) {
     *           // 自定义 Rspack 配置
     *         }
     *       })
     *     );
     *   },
     *
     *   // 构建后处理
     *   async postBuild(esmx) {
     *     // 构建完成后生成静态 HTML
     *     const render = await esmx.render({
     *       params: { url: '/' }
     *     });
     *     esmx.writeSync(
     *       esmx.resolvePath('dist/client', 'index.html'),
     *       render.html
     *     );
     *   }
     * } satisfies EsmxOptions;
     * ```
     */
    public async build(): Promise<boolean> {
        const startTime = Date.now();

        const successful = await this.readied.app.build?.();

        const endTime = Date.now();
        const duration = endTime - startTime;
        const status = successful
            ? '\x1b[32m✓\x1b[0m'.padEnd(3)
            : '\x1b[31m✗\x1b[0m'.padEnd(3);
        console.log(
            `${status.padEnd(2)} Build ${successful ? 'completed' : 'failed'} in ${duration}ms`
        );

        return successful ?? true;
    }

    /**
     * 启动 HTTP 服务器并配置服务器实例。
     *
     * 该方法在框架的以下生命周期中被调用：
     * - 开发环境（dev）：启动开发服务器，提供热更新等功能
     * - 生产环境（start）：启动生产服务器，提供生产级性能
     *
     * 服务器的具体实现由用户通过 EsmxOptions 的 server 配置函数提供。
     * 该函数负责：
     * - 创建 HTTP 服务器实例
     * - 配置中间件和路由
     * - 处理请求和响应
     * - 启动服务器监听
     *
     * @returns 返回一个 Promise，在服务器启动完成后 resolve
     * @throws {NotReadyError} 在框架实例未初始化时调用此方法会抛出错误
     *
     * @example
     * ```ts
     * // entry.node.ts
     * import http from 'node:http';
     * import type { EsmxOptions } from '@esmx/core';
     *
     * export default {
     *   // 服务器配置
     *   async server(esmx) {
     *     const server = http.createServer((req, res) => {
     *       // 处理静态资源
     *       esmx.middleware(req, res, async () => {
     *         // 服务端渲染
     *         const render = await esmx.render({
     *           params: { url: req.url }
     *         });
     *         res.end(render.html);
     *       });
     *     });
     *
     *     // 启动服务器
     *     server.listen(3000, () => {
     *       console.log('Server running at http://localhost:3000');
     *     });
     *   }
     * } satisfies EsmxOptions;
     * ```
     */
    public async server(): Promise<void> {
        await this._options?.server?.(this);
    }

    /**
     * 执行构建后的处理逻辑。
     *
     * 该方法在应用构建完成后被调用，用于执行额外的资源处理，如：
     * - 生成静态 HTML 文件
     * - 处理构建产物
     * - 执行部署任务
     * - 发送构建通知
     *
     * 方法会自动捕获并处理执行过程中的异常，确保不会影响主构建流程。
     *
     * @returns 返回一个 Promise，resolve 为 boolean 值
     *   - true: 后处理成功或无需处理
     *   - false: 后处理失败
     *
     * @example
     * ```ts
     * // entry.node.ts
     * import type { EsmxOptions } from '@esmx/core';
     *
     * export default {
     *   // 构建后处理
     *   async postBuild(esmx) {
     *     // 生成多个页面的静态 HTML
     *     const pages = ['/', '/about', '/404'];
     *
     *     for (const url of pages) {
     *       const render = await esmx.render({
     *         params: { url }
     *       });
     *
     *       // 写入静态 HTML 文件
     *       esmx.writeSync(
     *         esmx.resolvePath('dist/client', url.substring(1), 'index.html'),
     *         render.html
     *       );
     *     }
     *   }
     * } satisfies EsmxOptions;
     * ```
     */
    public async postBuild(): Promise<boolean> {
        try {
            await this._options.postBuild?.(this);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }
    /**
     * 解析项目相对路径为绝对路径
     *
     * @param projectPath - 项目路径类型，如 'dist/client'、'dist/server' 等
     * @param args - 需要拼接的路径片段
     * @returns 解析后的绝对路径
     *
     * @example
     * ```ts
     * // 在 entry.node.ts 中使用
     * async postBuild(esmx) {
     *   const outputPath = esmx.resolvePath('dist/client', 'index.html');
     *   // 输出: /project/root/dist/client/index.html
     * }
     * ```
     */
    public resolvePath(projectPath: ProjectPath, ...args: string[]): string {
        return resolvePath(this.root, projectPath, ...args);
    }

    /**
     * 同步写入文件内容
     *
     * @param filepath - 文件的绝对路径
     * @param data - 要写入的数据，可以是字符串、Buffer 或对象
     * @returns 写入是否成功
     *
     * @example
     * ```ts
     * // 在 entry.node.ts 中使用
     * async postBuild(esmx) {
     *   const htmlPath = esmx.resolvePath('dist/client', 'index.html');
     *   const success = esmx.writeSync(htmlPath, '<html>...</html>');
     * }
     * ```
     */
    public writeSync(filepath: string, data: any): boolean {
        try {
            // 确保目标目录存在
            fs.mkdirSync(path.dirname(filepath), { recursive: true });
            // 写入文件
            fs.writeFileSync(filepath, data);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 异步写入文件内容
     *
     * @param filepath - 文件的绝对路径
     * @param data - 要写入的数据，可以是字符串、Buffer 或对象
     * @returns Promise<boolean> 写入是否成功
     *
     * @example
     * ```ts
     * // 在 entry.node.ts 中使用
     * async postBuild(esmx) {
     *   const htmlPath = esmx.resolvePath('dist/client', 'index.html');
     *   const success = await esmx.write(htmlPath, '<html>...</html>');
     * }
     * ```
     */
    public async write(filepath: string, data: any): Promise<boolean> {
        try {
            // 确保目标目录存在
            await fsp.mkdir(path.dirname(filepath), { recursive: true });
            // 写入文件
            await fsp.writeFile(filepath, data);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 同步读取并解析 JSON 文件
     *
     * @template T - 期望返回的JSON对象类型
     * @param filename - JSON 文件的绝对路径
     * @returns {T} 解析后的 JSON 对象
     * @throws 当文件不存在或 JSON 格式错误时抛出异常
     *
     * @example
     * ```ts
     * // 在 entry.node.ts 中使用
     * async server(esmx) {
     *   const manifest = esmx.readJsonSync<Manifest>(esmx.resolvePath('dist/client', 'manifest.json'));
     *   // 使用 manifest 对象
     * }
     * ```
     */
    public readJsonSync<T = any>(filename: string): T {
        return JSON.parse(fs.readFileSync(filename, 'utf-8'));
    }

    /**
     * 异步读取并解析 JSON 文件
     *
     * @template T - 期望返回的JSON对象类型
     * @param filename - JSON 文件的绝对路径
     * @returns {Promise<T>} 解析后的 JSON 对象
     * @throws 当文件不存在或 JSON 格式错误时抛出异常
     *
     * @example
     * ```ts
     * // 在 entry.node.ts 中使用
     * async server(esmx) {
     *   const manifest = await esmx.readJson<Manifest>(esmx.resolvePath('dist/client', 'manifest.json'));
     *   // 使用 manifest 对象
     * }
     * ```
     */
    public async readJson<T = any>(filename: string): Promise<T> {
        return JSON.parse(await fsp.readFile(filename, 'utf-8'));
    }

    /**
     * 获取构建清单列表
     *
     * @description
     * 该方法用于获取指定目标环境的构建清单列表，包含以下功能：
     * 1. **缓存管理**
     *    - 使用内部缓存机制避免重复加载
     *    - 返回不可变的清单列表
     *
     * 2. **环境适配**
     *    - 支持客户端和服务端两种环境
     *    - 根据目标环境返回对应的清单信息
     *
     * 3. **模块映射**
     *    - 包含模块导出信息
     *    - 记录资源依赖关系
     *
     * @param target - 目标环境类型
     *   - 'client': 客户端环境
     *   - 'server': 服务端环境
     * @returns 返回只读的构建清单列表
     * @throws {NotReadyError} 在框架实例未初始化时调用此方法会抛出错误
     *
     * @example
     * ```ts
     * // 在 entry.node.ts 中使用
     * async server(esmx) {
     *   // 获取客户端构建清单
     *   const manifests = await esmx.getManifestList('client');
     *
     *   // 查找特定模块的构建信息
     *   const appModule = manifests.find(m => m.name === 'my-app');
     *   if (appModule) {
     *     console.log('App exports:', appModule.exports);
     *     console.log('App chunks:', appModule.chunks);
     *   }
     * }
     * ```
     */
    public async getManifestList(
        target: BuildSsrTarget
    ): Promise<readonly ManifestJson[]> {
        return this.readied.cache(`getManifestList-${target}`, async () =>
            Object.freeze(await getManifestList(target, this.moduleConfig))
        );
    }

    /**
     * 获取导入映射对象
     *
     * @description
     * 该方法用于生成 ES 模块导入映射（Import Map），具有以下特点：
     * 1. **模块解析**
     *    - 基于构建清单生成模块映射
     *    - 支持客户端和服务端两种环境
     *    - 自动处理模块路径解析
     *
     * 2. **缓存优化**
     *    - 使用内部缓存机制
     *    - 返回不可变的映射对象
     *
     * 3. **路径处理**
     *    - 自动处理模块路径
     *    - 支持动态基础路径
     *
     * @param target - 目标环境类型
     *   - 'client': 生成浏览器环境的导入映射
     *   - 'server': 生成服务端环境的导入映射
     * @returns 返回只读的导入映射对象
     * @throws {NotReadyError} 在框架实例未初始化时调用此方法会抛出错误
     *
     * @example
     * ```ts
     * // 在 entry.node.ts 中使用
     * async server(esmx) {
     *   // 获取客户端导入映射
     *   const importmap = await esmx.getImportMap('client');
     *
     *   // 自定义 HTML 模板
     *   const html = `
     *     <!DOCTYPE html>
     *     <html>
     *     <head>
     *       <script type="importmap">
     *         ${JSON.stringify(importmap)}
     *       </script>
     *     </head>
     *     <body>
     *       <!-- 页面内容 -->
     *     </body>
     *     </html>
     *   `;
     * }
     * ```
     */
    public async getImportMap(
        target: BuildSsrTarget
    ): Promise<Readonly<ImportMap>> {
        return this.readied.cache(`getImportMap-${target}`, async () => {
            const { moduleConfig } = this.readied;
            const manifests = await this.getManifestList(target);
            let json: ImportMap = {};
            switch (target) {
                case 'client':
                    json = getImportMap({
                        manifests,
                        getScope(name) {
                            return `/${name}/`;
                        },
                        getFile(name, file) {
                            return `/${name}/${file}`;
                        }
                    });
                    break;
                case 'server':
                    json = getImportMap({
                        manifests,
                        getScope: (name: string) => {
                            const linkPath = moduleConfig.links[name].server;
                            // Get the real physical path instead of symbolic link
                            // This is crucial when generating import maps on the server side.
                            // If we use symbolic link paths as scopes, it would cause module resolution errors at runtime
                            // because the actual accessed paths are real physical paths, not the symbolic links.
                            // Using realpathSync ensures path consistency between import map generation and runtime resolution.
                            const realPath = fs.realpathSync(linkPath);
                            return path.join(realPath, '/');
                        },
                        getFile: (name: string, file: string) => {
                            return path.resolve(
                                moduleConfig.links[name].server,
                                file
                            );
                        }
                    });
                    break;
            }

            return Object.freeze(json);
        });
    }

    /**
     * 获取客户端导入映射信息
     *
     * @description
     * 该方法用于生成客户端环境的导入映射代码，支持两种模式：
     * 1. **内联模式 (inline)**
     *    - 将导入映射直接内联到 HTML 中
     *    - 减少额外的网络请求
     *    - 适合导入映射较小的场景
     *
     * 2. **JS 文件模式 (js)**
     *    - 生成独立的 JS 文件
     *    - 支持浏览器缓存
     *    - 适合导入映射较大的场景
     *
     * 核心功能：
     * - 自动处理动态基础路径
     * - 支持模块路径运行时替换
     * - 优化缓存策略
     * - 确保模块加载顺序
     *
     * @param mode - 导入映射模式
     *   - 'inline': 内联模式，返回 HTML script 标签
     *   - 'js': JS 文件模式，返回带有文件路径的信息
     * @returns 返回导入映射的相关信息
     *   - src: JS 文件的 URL（仅在 js 模式下）
     *   - filepath: JS 文件的本地路径（仅在 js 模式下）
     *   - code: HTML script 标签内容
     * @throws {NotReadyError} 在框架实例未初始化时调用此方法会抛出错误
     *
     * @example
     * ```ts
     * // 在 entry.node.ts 中使用
     * async server(esmx) {
     *   const server = express();
     *   server.use(esmx.middleware);
     *
     *   server.get('*', async (req, res) => {
     *     // 使用 JS 文件模式
     *     const result = await esmx.render({
     *       importmapMode: 'js',
     *       params: { url: req.url }
     *     });
     *     res.send(result.html);
     *   });
     *
     *   // 或者使用内联模式
     *   server.get('/inline', async (req, res) => {
     *     const result = await esmx.render({
     *       importmapMode: 'inline',
     *       params: { url: req.url }
     *     });
     *     res.send(result.html);
     *   });
     * }
     * ```
     */
    public async getImportMapClientInfo<T extends ImportmapMode>(
        mode: T
    ): Promise<
        T extends 'js'
            ? {
                  src: string;
                  filepath: string;
                  code: string;
              }
            : {
                  src: null;
                  filepath: null;
                  code: string;
              }
    > {
        return this.readied.cache(
            `getImportMap-${mode}`,
            async (): Promise<any> => {
                const importmap = await this.getImportMap('client');
                const { basePathPlaceholder } = this;
                let filepath: string | null = null;
                if (this._importmapHash === null) {
                    let wrote = false;
                    const code = `(() => {
const base = document.currentScript.getAttribute("data-base");
const importmap = ${serialize(importmap, { isJSON: true })};
const set = (data) => {
    if (!data) return;
    Object.entries(data).forEach(([k, v]) => {
        data[k] = base + v;
    });
};
set(importmap.imports);
if (importmap.scopes) {
    Object.values(importmap.scopes).forEach(set);
}
const script = document.createElement("script");
script.type = "importmap";
script.innerText = JSON.stringify(importmap);
document.head.appendChild(script);
})();`;
                    const hash = contentHash(code);
                    filepath = this.resolvePath(
                        'dist/client/importmap',
                        `${hash}.final.mjs`
                    );
                    try {
                        const existingContent = await fsp.readFile(
                            filepath,
                            'utf-8'
                        );
                        if (existingContent === code) {
                            wrote = true;
                        } else {
                            wrote = await this.write(filepath, code);
                        }
                    } catch {
                        wrote = await this.write(filepath, code);
                    }
                    this._importmapHash = wrote ? hash : '';
                }
                if (mode === 'js' && this._importmapHash) {
                    const src = `${basePathPlaceholder}${this.basePath}importmap/${this._importmapHash}.final.mjs`;
                    return {
                        src,
                        filepath,
                        code: `<script data-base="${basePathPlaceholder}" src="${src}"></script>`
                    };
                }
                if (basePathPlaceholder) {
                    const set = (data?: Record<string, string>) => {
                        if (!data) return;
                        Object.entries(data).forEach(([k, v]) => {
                            data[k] = basePathPlaceholder + v;
                        });
                    };
                    set(importmap.imports);
                    if (importmap.scopes) {
                        Object.values(importmap.scopes).forEach(set);
                    }
                }
                return {
                    src: null,
                    filepath: null,
                    code: `<script type="importmap">${serialize(importmap, { isJSON: true })}</script>`
                };
            }
        );
    }

    /**
     * 获取模块的静态导入路径列表。
     *
     * @param target - 构建目标（'client' | 'server'）
     * @param specifier - 模块标识符
     * @returns 返回静态导入路径列表，如果未找到则返回 null
     * @throws {NotReadyError} 在框架实例未初始化时调用此方法会抛出错误
     *
     * @example
     * ```ts
     * // 获取客户端入口模块的静态导入路径
     * const paths = await esmx.getStaticImportPaths(
     *   'client',
     *   `your-app-name/src/entry.client`
     * );
     * ```
     */
    public async getStaticImportPaths(
        target: BuildSsrTarget,
        specifier: string
    ) {
        return this.readied.cache(
            `getStaticImportPaths-${target}-${specifier}`,
            async () => {
                const result = await getStaticImportPaths(
                    specifier,
                    await this.getImportMap(target),
                    this.moduleConfig
                );
                if (!result) {
                    return null;
                }
                return Object.freeze(Object.values(result));
            }
        );
    }
}

/**
 * 默认的开发环境应用创建函数
 *
 * @description
 * 这是一个默认的占位函数，用于在未配置开发环境应用创建函数时抛出错误。
 * 实际使用时应当通过 EsmxOptions.devApp 配置实际的应用创建函数。
 *
 * @throws {Error} 当未配置 devApp 时抛出错误，提示用户需要设置开发环境应用创建函数
 * @returns {Promise<App>} 不会真正返回，总是抛出错误
 *
 * @example
 * ```ts
 * // 正确的使用方式是在配置中提供 devApp
 * const options: EsmxOptions = {
 *   devApp: async (esmx) => {
 *     return import('@esmx/rspack').then(m =>
 *       m.createRspackHtmlApp(esmx)
 *     );
 *   }
 * };
 * ```
 */
async function defaultDevApp(): Promise<App> {
    throw new Error("'devApp' function not set");
}

/**
 * Esmx 框架未初始化错误
 *
 * @description
 * 该错误在以下情况下抛出：
 * - 在调用 init() 之前访问需要初始化的方法或属性
 * - 在框架未完全初始化时尝试使用核心功能
 * - 在销毁实例后继续使用框架功能
 *
 * @extends Error
 *
 * @example
 * ```ts
 * const esmx = new Esmx();
 * try {
 *   // 这会抛出 NotReadyError，因为还未初始化
 *   await esmx.render();
 * } catch (e) {
 *   if (e instanceof NotReadyError) {
 *     console.error('Framework not initialized');
 *   }
 * }
 * ```
 */
class NotReadyError extends Error {
    constructor() {
        super(`The Esmx has not been initialized yet`);
    }
}

/**
 * 计算内容的 SHA-256 哈希值
 *
 * @description
 * 该函数用于：
 * - 生成文件内容的唯一标识符
 * - 用于缓存失效判断
 * - 生成具有内容哈希的文件名
 *
 * 特点：
 * - 使用 SHA-256 算法确保哈希值的唯一性
 * - 截取前 12 位以平衡唯一性和长度
 * - 适用于缓存控制和文件版本管理
 *
 * @param {string} text - 要计算哈希的文本内容
 * @returns {string} 返回 12 位的十六进制哈希字符串
 *
 * @example
 * ```ts
 * const content = 'some content';
 * const hash = contentHash(content);
 * // 输出类似：'a1b2c3d4e5f6'
 * ```
 */
function contentHash(text: string) {
    const hash = crypto.createHash('sha256');
    hash.update(text);
    return hash.digest('hex').substring(0, 12);
}

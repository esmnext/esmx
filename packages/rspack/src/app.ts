import fs from 'node:fs';
import { pathToFileURL } from 'node:url';
import { styleText } from 'node:util';
import {
    type App,
    type Esmx,
    type Middleware,
    RenderContext,
    type RenderContextOptions,
    type ServerRenderHandle,
    createApp,
    mergeMiddlewares
} from '@esmx/core';
import { createVmImport } from '@esmx/import';
import type { RspackOptions } from '@rspack/core';
import hotMiddleware from 'webpack-hot-middleware';
import type { BuildTarget } from './build-target';
import { createRspackConfig } from './config';
import { pack } from './pack';
import { createRsBuild } from './utils';

/**
 * Rspack 应用配置上下文接口。
 *
 * 该接口提供了在配置钩子函数中可以访问的上下文信息，允许你：
 * - 访问 Esmx 框架实例
 * - 获取当前的构建目标（client/server/node）
 * - 修改 Rspack 配置
 * - 访问应用选项
 *
 * @example
 * ```ts
 * // entry.node.ts
 * export default {
 *   async devApp(esmx) {
 *     return import('@esmx/rspack').then((m) =>
 *       m.createRspackApp(esmx, {
 *         // 配置钩子函数
 *         config(context) {
 *           // 访问构建目标
 *           if (context.buildTarget === 'client') {
 *             // 修改客户端构建配置
 *             context.config.optimization = {
 *               ...context.config.optimization,
 *               splitChunks: {
 *                 chunks: 'all'
 *               }
 *             };
 *           }
 *         }
 *       })
 *     );
 *   }
 * };
 * ```
 */
export interface RspackAppConfigContext {
    /**
     * Esmx 框架实例。
     * 可用于访问框架提供的 API 和工具函数。
     */
    esmx: Esmx;

    /**
     * 当前的构建目标。
     * - 'client': 客户端构建，生成浏览器可执行的代码
     * - 'server': 服务端构建，生成 SSR 渲染代码
     * - 'node': Node.js 构建，生成服务器入口代码
     */
    buildTarget: BuildTarget;

    /**
     * Rspack 编译配置对象。
     * 你可以在配置钩子中修改这个对象来自定义构建行为。
     */
    config: RspackOptions;

    /**
     * 创建应用时传入的选项对象。
     */
    options: RspackAppOptions;
}

/**
 * Rspack 应用配置选项接口。
 *
 * 该接口提供了创建 Rspack 应用时可以使用的配置选项，包括：
 * - 代码压缩选项
 * - Rspack 配置钩子函数
 *
 * @example
 * ```ts
 * // entry.node.ts
 * export default {
 *   async devApp(esmx) {
 *     return import('@esmx/rspack').then((m) =>
 *       m.createRspackApp(esmx, {
 *         // 禁用代码压缩
 *         minimize: false,
 *         // 自定义 Rspack 配置
 *         config(context) {
 *           if (context.buildTarget === 'client') {
 *             context.config.optimization.splitChunks = {
 *               chunks: 'all'
 *             };
 *           }
 *         }
 *       })
 *     );
 *   }
 * };
 * ```
 */
export interface RspackAppOptions {
    /**
     * 是否启用代码压缩。
     *
     * - true: 启用代码压缩
     * - false: 禁用代码压缩
     * - undefined: 根据环境自动判断（生产环境启用，开发环境禁用）
     *
     * @default undefined
     */
    minimize?: boolean;

    /**
     * Rspack 配置钩子函数。
     *
     * 在构建开始前调用，可以通过该函数修改 Rspack 的编译配置。
     * 支持针对不同的构建目标（client/server/node）进行差异化配置。
     *
     * @param context - 配置上下文，包含框架实例、构建目标和配置对象
     */
    config?: (context: RspackAppConfigContext) => void;
}

/**
 * 创建 Rspack 应用实例。
 *
 * 该函数根据运行环境（开发/生产）创建不同的应用实例：
 * - 开发环境：配置热更新中间件和实时渲染
 * - 生产环境：配置构建任务
 *
 * @param esmx - Esmx 框架实例
 * @param options - Rspack 应用配置选项
 * @returns 返回应用实例
 *
 * @example
 * ```ts
 * // entry.node.ts
 * export default {
 *   async devApp(esmx) {
 *     return import('@esmx/rspack').then((m) =>
 *       m.createRspackApp(esmx, {
 *         config(context) {
 *           // 配置 loader 处理不同类型的文件
 *           context.config.module = {
 *             rules: [
 *               {
 *                 test: /\.ts$/,
 *                 exclude: [/node_modules/],
 *                 loader: 'builtin:swc-loader',
 *                 options: {
 *                   jsc: {
 *                     parser: {
 *                       syntax: 'typescript'
 *                     }
 *                   }
 *                 }
 *               },
 *               {
 *                 test: /\.css$/,
 *                 use: ['style-loader', 'css-loader']
 *               }
 *             ]
 *           };
 *         }
 *       })
 *     );
 *   }
 * };
 * ```
 */
export async function createRspackApp(
    esmx: Esmx,
    options?: RspackAppOptions
): Promise<App> {
    const app = await createApp(esmx, esmx.command);
    switch (esmx.command) {
        case esmx.COMMAND.dev:
            app.middleware = mergeMiddlewares([
                ...(await createMiddleware(esmx, options)),
                app.middleware
            ]);
            app.render = rewriteRender(esmx);
            break;
        case esmx.COMMAND.build:
            app.build = rewriteBuild(esmx, options);
            break;
    }
    return app;
}
async function createMiddleware(
    esmx: Esmx,
    options: RspackAppOptions = {}
): Promise<Middleware[]> {
    if (esmx.command !== esmx.COMMAND.dev) {
        return [];
    }
    // const middlewares: Middleware[] = [];

    const rsBuild = createRsBuild([
        generateBuildConfig(esmx, options, 'client'),
        generateBuildConfig(esmx, options, 'server')
    ]);
    rsBuild.watch();

    // @ts-ignore
    const hot = hotMiddleware(rsBuild.compilers[0], {
        path: `${esmx.basePath}hot-middleware`
    });
    return [
        (req, res, next) => {
            if (req.url?.startsWith(`${esmx.basePath}hot-middleware`)) {
                // @ts-ignore
                return hot(req, res, next);
            }
            return next();
        }
    ];
}

function generateBuildConfig(
    esmx: Esmx,
    options: RspackAppOptions,
    buildTarget: BuildTarget
) {
    const config = createRspackConfig(esmx, buildTarget, options);
    options.config?.({ esmx, options, buildTarget, config });

    return config;
}

function rewriteRender(esmx: Esmx) {
    return async (options?: RenderContextOptions): Promise<RenderContext> => {
        const baseURL = pathToFileURL(esmx.root);
        const importMap = await esmx.getImportMap('server');
        const vmImport = createVmImport(baseURL, importMap);
        const rc = new RenderContext(esmx, options);
        const module = await vmImport(
            `${esmx.name}/src/entry.server`,
            import.meta.url,
            {
                console,
                setTimeout,
                clearTimeout,
                process,
                URL,
                global
            }
        );
        const serverRender: ServerRenderHandle = module[rc.entryName];
        if (typeof serverRender === 'function') {
            await serverRender(rc);
        }
        return rc;
    };
}

function rewriteBuild(esmx: Esmx, options: RspackAppOptions = {}) {
    return async (): Promise<boolean> => {
        const ok = await createRsBuild([
            generateBuildConfig(esmx, options, 'client'),
            generateBuildConfig(esmx, options, 'server'),
            generateBuildConfig(esmx, options, 'node')
        ]).build();
        if (!ok) {
            return false;
        }
        esmx.writeSync(
            esmx.resolvePath('dist/index.js'),
            `
async function start() {
    const options = await import('./node/src/entry.node.js').then(
        (mod) => mod.default
    );
    const { Esmx } = await import('@esmx/core');
    const esmx = new Esmx(options);

    await esmx.init(esmx.COMMAND.start);
}

start();
`.trim()
        );
        return pack(esmx);
    };
}

import type { IncomingMessage, ServerResponse } from 'node:http';
import send from 'send';
import path from 'upath';
import type { Esmx } from '../core';

/**
 * 中间件函数类型定义
 *
 * @description
 * 中间件是一个函数，用于处理 HTTP 请求。它接收请求对象、响应对象和下一个中间件函数作为参数。
 * 中间件可以执行以下操作：
 * - 修改请求和响应对象
 * - 结束请求-响应循环
 * - 调用下一个中间件
 *
 * @example
 * ```ts
 * // 创建一个简单的日志中间件
 * const loggerMiddleware: Middleware = (req, res, next) => {
 *   console.log(`${req.method} ${req.url}`);
 *   next();
 * };
 * ```
 */
export type Middleware = (
    req: IncomingMessage,
    res: ServerResponse,
    next: Function
) => void;

const reFinal = /\.final\.[a-zA-Z0-9]+$/;
/**
 * 判断文件路径是否是一个符合 esmx 规范的不可变文件
 * @param path 文件路径
 */
export function isImmutableFile(filename: string) {
    return reFinal.test(filename);
}

/**
 * 创建 Esmx 应用的中间件
 *
 * @param esmx - Esmx 实例
 * @returns 返回一个处理静态资源的中间件
 *
 * @description
 * 该函数创建一个中间件，用于处理模块的静态资源请求。它会：
 * - 根据模块配置创建对应的静态资源中间件
 * - 处理资源的缓存控制
 * - 支持不可变文件的长期缓存
 *
 * @example
 * ```ts
 * import { Esmx, createMiddleware } from '@esmx/core';
 *
 * const esmx = new Esmx();
 * const middleware = createMiddleware(esmx);
 *
 * // 在 HTTP 服务器中使用
 * server.use(middleware);
 * ```
 */
export function createMiddleware(esmx: Esmx): Middleware {
    const middlewares = Object.values(esmx.moduleConfig.links).map(
        (item): Middleware => {
            const base = `/${item.name}/`;
            const baseUrl = new URL(`file:`);
            const root = item.client;
            return (req, res, next) => {
                const url = req.url ?? '/';
                const { pathname } = new URL(req.url ?? '/', baseUrl);

                if (!url.startsWith(base) || req.method !== 'GET') {
                    next();
                    return;
                }

                send(req, pathname.substring(base.length - 1), {
                    root
                })
                    .on('headers', () => {
                        if (isImmutableFile(pathname)) {
                            res.setHeader(
                                'cache-control',
                                'public, max-age=31536000, immutable'
                            );
                        } else {
                            res.setHeader('cache-control', 'no-cache');
                        }
                    })
                    .pipe(res);
            };
        }
    );
    return mergeMiddlewares(middlewares);
}

/**
 * 将多个中间件，合并成一个中间件执行
 * @param middlewares 中间件列表
 * @returns
 */
export function mergeMiddlewares(middlewares: Middleware[]): Middleware {
    return (req, res, next) => {
        let index = 0;
        function dispatch() {
            if (index < middlewares.length) {
                middlewares[index](req, res, () => {
                    index++;
                    dispatch();
                });
                return;
            } else {
                next();
            }
        }
        dispatch();
    };
}

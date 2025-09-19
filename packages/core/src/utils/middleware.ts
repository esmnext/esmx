import type { IncomingMessage, ServerResponse } from 'node:http';
import path from 'node:path';
import send from 'send';
import type { Esmx } from '../core';

/**
 * Middleware function type definition
 *
 * @description
 * Middleware is a function used to handle HTTP requests. It receives the request object, response object, and the next middleware function as parameters.
 * Middleware can perform the following operations:
 * - Modify request and response objects
 * - End the request-response cycle
 * - Call the next middleware
 *
 * @example
 * ```ts
 * // Create a simple logging middleware
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
 * Determine if a file path is an immutable file that complies with esmx specifications
 * @param path File path
 */
export function isImmutableFile(filename: string) {
    return reFinal.test(filename);
}

/**
 * Create middleware for Esmx application
 *
 * @param esmx - Esmx instance
 * @returns Returns a middleware that handles static resources
 *
 * @description
 * This function creates a middleware to handle static resource requests for modules. It will:
 * - Create corresponding static resource middleware based on module configuration
 * - Handle cache control for resources
 * - Support long-term caching for immutable files
 *
 * @example
 * ```ts
 * import { Esmx, createMiddleware } from '@esmx/core';
 *
 * const esmx = new Esmx();
 * const middleware = createMiddleware(esmx);
 *
 * // Use in HTTP server
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
 * Merge multiple middlewares into one middleware execution
 * @param middlewares List of middlewares
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

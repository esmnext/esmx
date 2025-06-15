import { IncomingMessage, ServerResponse } from 'node:http';
import { Socket } from 'node:net';
/**
 * @vitest-environment node
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parsedOptions } from './options';
import { Route } from './route';
import { RouteType, RouterMode } from './types';
import type { RouterOptions } from './types';

// 创建真实的 IncomingMessage 对象
function createIncomingMessage(options: {
    headers?: Record<string, string | string[]>;
    url?: string;
    method?: string;
    httpVersion?: string;
}): IncomingMessage {
    const socket = new Socket();
    const req = new IncomingMessage(socket);

    // 设置基本属性
    req.method = options.method || 'GET';
    req.url = options.url || '/';
    req.httpVersion = options.httpVersion || '1.1';
    req.httpVersionMajor = 1;
    req.httpVersionMinor = 1;

    // 设置 headers
    if (options.headers) {
        Object.assign(req.headers, options.headers);
    }

    return req;
}

// 创建真实的 ServerResponse 对象
function createServerResponse(): ServerResponse {
    const socket = new Socket();
    const res = new ServerResponse(new IncomingMessage(socket));

    // 添加测试需要的方法
    const headers: Record<string, string> = {};
    const originalSetHeader = res.setHeader.bind(res);
    res.setHeader = vi.fn(
        (name: string, value: string | number | readonly string[]) => {
            headers[name.toLowerCase()] = String(value);
            return originalSetHeader(name, value);
        }
    );
    res.getHeader = vi.fn((name: string) => headers[name.toLowerCase()]);
    res.end = vi.fn();

    return res;
}

// 创建真实的 Route 对象
function createRoute(
    options: {
        path?: string;
        url?: string;
        statusCode?: number | null;
        type?: RouteType;
        isPush?: boolean;
    } = {}
): Route {
    // 创建基础的 RouterParsedOptions
    const routerOptions = parsedOptions({
        base: new URL('http://localhost/'),
        routes: [{ path: '/test', component: 'TestComponent' }]
    });

    // 构造 RouteOptions 参数
    const routeOptions = {
        options: routerOptions,
        toType: options.type || RouteType.none,
        toInput: options.url || options.path || '/',
        from: null
    };

    const route = new Route(routeOptions);

    // 设置 statusCode（如果需要）
    if (options.statusCode !== undefined) {
        route.statusCode = options.statusCode;
    }

    return route;
}

describe('options.ts - Node.js Environment Tests', () => {
    beforeEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
    });

    describe('getBaseUrl edge cases in Node.js environment', () => {
        it('should trigger unknown context branch when isBrowser is dynamically true', async () => {
            // 这个测试专门覆盖第 44 行的 'unknown context' 分支
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            let callCount = 0;
            // 精确控制 isBrowser 的返回值：
            // 第1次调用（第17行条件检查）: false - 跳过浏览器分支
            // 第2次调用（第41行设置context）: true - 设置为 'unknown context'
            // 第3次调用（第75行设置mode）: false - 设置为 memory 模式
            vi.doMock('./util', () => ({
                get isBrowser() {
                    callCount++;
                    // 只有第2次调用返回 true，其他都返回 false
                    return callCount === 2;
                }
            }));

            // 模拟 URL.parse 失败以触发警告
            const originalURLParse = URL.parse;
            URL.parse = vi.fn().mockReturnValue(null);

            try {
                const { parsedOptions } = await import('./options');

                // 创建一个没有 base 和 req 的选项，这会进入最后的 else 分支
                const options: RouterOptions = {};
                const opts = parsedOptions(options);

                // 应该使用默认 URL
                expect(opts.base.href).toBe('https://www.esmnext.com/');

                // 应该有警告信息包含 'unknown context'
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('unknown context')
                );
            } finally {
                URL.parse = originalURLParse;
                consoleSpy.mockRestore();
            }
        });

        it('should trigger unknown context with invalid sourceUrl', async () => {
            // 测试当 sourceUrl 无效时触发警告的情况
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            let callCount = 0;
            // 模拟一个会导致 URL.parse 失败的情况
            vi.doMock('./util', () => ({
                get isBrowser() {
                    callCount++;
                    if (callCount === 2) {
                        // 第2次调用时返回 true，触发 'unknown context'
                        return true;
                    }
                    return false;
                }
            }));

            // 模拟 URL.parse 失败
            const originalURLParse = URL.parse;
            URL.parse = vi.fn().mockReturnValue(null);

            try {
                const { parsedOptions } = await import('./options');

                const options: RouterOptions = {};
                const opts = parsedOptions(options);

                // 应该回退到默认 URL
                expect(opts.base.href).toBe('https://www.esmnext.com/');

                // 应该有警告信息包含 'unknown context'
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining('unknown context')
                );
            } finally {
                URL.parse = originalURLParse;
                consoleSpy.mockRestore();
            }
        });

        it('should handle server environment without request context', async () => {
            // 测试服务端环境且没有 req 的情况（第 42 行）
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            // 模拟纯服务端环境（isBrowser 始终为 false）
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { parsedOptions } = await import('./options');

            // 创建一个没有 base 和 req 的选项
            const options: RouterOptions = {};
            const opts = parsedOptions(options);

            // 应该使用默认 URL
            expect(opts.base.href).toBe('https://www.esmnext.com/');

            // 在这种情况下，context 应该是 'server environment without request context'
            // 如果 URL.parse 失败，应该有相应的警告
            if (consoleSpy.mock.calls.length > 0) {
                expect(consoleSpy).toHaveBeenCalledWith(
                    expect.stringContaining(
                        'server environment without request context'
                    )
                );
            }

            consoleSpy.mockRestore();
        });

        it('should handle complex server environment scenarios', async () => {
            // 测试复杂的服务端场景
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { parsedOptions } = await import('./options');

            // 测试各种服务端配置
            const testCases = [
                { options: {}, expectedUrl: 'https://www.esmnext.com/' },
                {
                    options: { base: 'https://custom.com' },
                    expectedUrl: 'https://custom.com/'
                },
                {
                    options: {
                        req: createIncomingMessage({
                            headers: { host: 'example.com' },
                            url: '/test'
                        })
                    },
                    // URL.parse 会清理路径，所以最终结果是 http://example.com/
                    expectedUrl: 'http://example.com/'
                },
                {
                    // 测试包含端口号的情况（覆盖第 35 行）
                    options: {
                        req: createIncomingMessage({
                            headers: {
                                host: 'example.com',
                                'x-forwarded-port': '8080'
                            },
                            url: '/api'
                        })
                    },
                    expectedUrl: 'http://example.com:8080/'
                }
            ];

            for (const testCase of testCases) {
                const opts = parsedOptions(testCase.options as RouterOptions);
                expect(opts.base.href).toBe(testCase.expectedUrl);
            }

            consoleSpy.mockRestore();
        });

        it('should specifically test port number logic for line 35 coverage', async () => {
            // 专门测试第 35 行的端口号逻辑
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { parsedOptions } = await import('./options');

            // 创建一个明确包含端口号的请求
            const options: RouterOptions = {
                req: createIncomingMessage({
                    headers: {
                        host: 'localhost',
                        'x-forwarded-port': '3000'
                    },
                    url: '/'
                })
            };

            const opts = parsedOptions(options);

            // 验证端口号被正确包含在 URL 中
            expect(opts.base.href).toBe('http://localhost:3000/');
            expect(opts.base.port).toBe('3000');
        });

        it('should test line 35 without port number', async () => {
            // 测试第 35 行没有端口号的分支
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { parsedOptions } = await import('./options');

            // 创建一个没有端口号的请求
            const options: RouterOptions = {
                req: createIncomingMessage({
                    headers: {
                        host: 'localhost'
                        // 注意：没有 'x-forwarded-port'
                    },
                    url: '/'
                })
            };

            const opts = parsedOptions(options);

            // 验证没有端口号的 URL
            expect(opts.base.href).toBe('http://localhost/');
            expect(opts.base.port).toBe('');
        });

        it('should handle req.url being undefined (line 34 coverage)', async () => {
            // 测试第 34 行的 req.url || '' 分支
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { parsedOptions } = await import('./options');

            // 创建一个 req.url 为 undefined 的请求
            const req = createIncomingMessage({
                headers: {
                    host: 'example.com'
                }
                // 注意：没有 url 属性，所以 req.url 为 undefined
            });

            // 手动设置 url 为 undefined
            req.url = undefined;

            const options: RouterOptions = { req };
            const opts = parsedOptions(options);

            // 验证 URL 构建正确，path 部分应该是空字符串
            expect(opts.base.href).toBe('http://example.com/');
        });
    });

    describe('DEFAULT_LOCATION in Node.js environment', () => {
        it('should handle server-side redirects properly', async () => {
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { DEFAULT_LOCATION } = await import('./options');

            const res = createServerResponse();
            const route = createRoute({
                url: 'https://example.com/redirect',
                statusCode: 301
            });

            DEFAULT_LOCATION(route, null, { res });

            expect(res.statusCode).toBe(301);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                'https://example.com/redirect'
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should do nothing when no res context in server environment', async () => {
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { DEFAULT_LOCATION } = await import('./options');

            const route = createRoute({
                url: 'https://example.com/test'
            });

            // 在服务端环境且没有 res 上下文时，不应该抛出错误
            expect(() => DEFAULT_LOCATION(route, null)).not.toThrow();
            expect(() => DEFAULT_LOCATION(route, null, {})).not.toThrow();
        });

        it('should handle invalid redirect status codes', async () => {
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { DEFAULT_LOCATION } = await import('./options');

            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            const res = createServerResponse();
            const route = createRoute({
                url: 'https://example.com/redirect',
                statusCode: 200 // 无效的重定向状态码
            });

            DEFAULT_LOCATION(route, null, { res });

            // 应该使用默认的 302 状态码
            expect(res.statusCode).toBe(302);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid redirect status code 200')
            );

            consoleSpy.mockRestore();
        });

        it('should handle valid redirect status codes', async () => {
            vi.doMock('./util', () => ({
                isBrowser: false
            }));

            const { DEFAULT_LOCATION } = await import('./options');

            const res = createServerResponse();

            // 测试所有有效的重定向状态码
            const validCodes = [300, 301, 302, 303, 304, 307, 308];

            for (const statusCode of validCodes) {
                const route = createRoute({
                    url: 'https://example.com/redirect',
                    statusCode
                });

                DEFAULT_LOCATION(route, null, { res });
                expect(res.statusCode).toBe(statusCode);
            }
        });
    });
});

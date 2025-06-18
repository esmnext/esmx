import type { IncomingMessage, ServerResponse } from 'node:http';
/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Route } from './route';
import {
    type RouteConfig,
    RouteType,
    RouterMode,
    type RouterOptions
} from './types';

// 创建真实的 IncomingMessage 模拟对象
const createMockReq = (
    headers: Record<string, string> = {},
    url = '/',
    encrypted = false
): Partial<IncomingMessage> => {
    const req: Partial<IncomingMessage> = {
        headers,
        url,
        socket: { encrypted } as any
    };
    return req;
};

// 创建真实的 ServerResponse 模拟对象
const createMockRes = (): Partial<ServerResponse> => {
    const res: Partial<ServerResponse> = {
        statusCode: 200,
        setHeader: vi.fn(),
        end: vi.fn()
    };
    return res;
};

// 创建真实的 Route 对象
const createRoute = (
    options: {
        url?: string;
        statusCode?: number | null;
        isPush?: boolean;
        state?: Record<string, unknown>;
    } = {}
): Route => {
    const routeLocation = options.url || 'http://example.com/test';
    const route = new Route({
        toInput: {
            url: routeLocation,
            statusCode: options.statusCode ?? null,
            state: options.state
        },
        toType: options.isPush ? RouteType.push : RouteType.none
    });
    return route;
};

describe('parsedOptions', () => {
    afterEach(() => {
        vi.resetModules();
    });

    it('should use location.origin if base is missing in browser environment', async () => {
        const { parsedOptions } = await import('./options');
        const opts = parsedOptions({});
        expect(opts.base.href).toBe(location.origin + '/');
    });

    it('should use default base if base is invalid', async () => {
        const { parsedOptions } = await import('./options');
        const consoleSpy = vi
            .spyOn(console, 'warn')
            .mockImplementation(() => {});

        // 这里我们需要测试无效的 base，但 RouterOptions 要求 URL 类型
        // 我们通过类型断言来测试错误处理逻辑
        const invalidOptions = {
            base: 'not-a-url'
        } as unknown as RouterOptions;
        const opts = parsedOptions(invalidOptions);
        expect(opts.base.href).toBe('https://www.esmnext.com/');
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Failed to parse base URL')
        );
        consoleSpy.mockRestore();
    });

    it('should set mode to options.mode or default to history in browser', async () => {
        const { parsedOptions } = await import('./options');

        const options1: RouterOptions = {
            base: new URL('http://a.com'),
            mode: RouterMode.memory,
            routes: []
        };
        const opts1 = parsedOptions(options1);
        expect(opts1.mode).toBe(RouterMode.memory);

        const options2: RouterOptions = {
            base: new URL('http://a.com'),
            routes: []
        };
        const opts2 = parsedOptions(options2);
        expect(opts2.mode).toBe(RouterMode.history);
    });

    it('should assign apps as function or object', async () => {
        const { parsedOptions } = await import('./options');

        const appsFn = () => ({ mount: vi.fn(), unmount: vi.fn() });
        const options1: RouterOptions = {
            base: new URL('http://a.com'),
            apps: appsFn,
            routes: []
        };
        const opts1 = parsedOptions(options1);
        expect(opts1.apps).toBe(appsFn);

        const appsObj = { a: () => ({ mount: vi.fn(), unmount: vi.fn() }) };
        const options2: RouterOptions = {
            base: new URL('http://a.com'),
            apps: appsObj,
            routes: []
        };
        const opts2 = parsedOptions(options2);
        expect(opts2.apps).not.toBe(appsObj); // 应该是新对象
        expect(opts2.apps).toEqual(appsObj);
    });

    it('should use location.origin + "/" if base is not provided (in browser)', async () => {
        const { parsedOptions } = await import('./options');
        const options: RouterOptions = { routes: [] };
        const opts = parsedOptions(options);
        expect(opts.base.href).toBe(location.origin + '/');
    });

    it('should use empty array if routes is not provided', async () => {
        const { parsedOptions } = await import('./options');
        const options: RouterOptions = { base: new URL('http://a.com') };
        const opts = parsedOptions(options);
        expect(Array.isArray(opts.routes)).toBe(true);
        expect(opts.routes.length).toBe(0);
    });

    it('should clone rootStyle if provided, otherwise false', async () => {
        const { parsedOptions } = await import('./options');

        const style: Partial<CSSStyleDeclaration> = { color: 'red' };
        const options1: RouterOptions = {
            base: new URL('http://a.com'),
            routes: [],
            rootStyle: style
        };
        const opts1 = parsedOptions(options1);
        expect(opts1.rootStyle).not.toBe(style);
        expect(opts1.rootStyle).toEqual(style);

        const options2: RouterOptions = {
            base: new URL('http://a.com'),
            routes: []
        };
        const opts2 = parsedOptions(options2);
        expect(opts2.rootStyle).toBe(false);
    });

    it('should clone layer if provided, otherwise null', async () => {
        const { parsedOptions } = await import('./options');

        const layer = { enable: true };
        const options1: RouterOptions = {
            base: new URL('http://a.com'),
            routes: [],
            layer
        };
        const opts1 = parsedOptions(options1);
        expect(opts1.layer).not.toBe(layer);
        expect(opts1.layer).toEqual(layer);

        const options2: RouterOptions = {
            base: new URL('http://a.com'),
            routes: []
        };
        const opts2 = parsedOptions(options2);
        expect(opts2.layer).toBe(null);
    });

    it('should use default onBackNoResponse if not provided', async () => {
        const { parsedOptions } = await import('./options');
        const options: RouterOptions = {
            base: new URL('http://a.com'),
            routes: []
        };
        const opts = parsedOptions(options);
        expect(typeof opts.onBackNoResponse).toBe('function');
        // 默认函数应可调用且无异常
        expect(() => opts.onBackNoResponse({} as any)).not.toThrow();
    });

    it('should NOT clone context object', async () => {
        const { parsedOptions } = await import('./options');
        const context = { user: 'test' };
        const options: RouterOptions = {
            base: new URL('http://a.com'),
            routes: [],
            context
        };
        const opts = parsedOptions(options);
        expect(opts.context).toBe(context);
        expect(opts.context.user).toBe('test');
        opts.context.user = 'changed';
        expect(context.user).toBe('changed');
    });

    describe('request parameter handling in browser environment', () => {
        it('should ignore req parameter in browser environment and use location.origin', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq(
                {
                    host: 'example.com',
                    'x-forwarded-proto': 'https'
                },
                '/api/test'
            );

            const options: RouterOptions = { req: req as IncomingMessage };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe(location.origin + '/');
        });

        it('should ignore various req headers in browser environment', async () => {
            const { parsedOptions } = await import('./options');

            const testCases = [
                createMockReq({
                    host: 'internal.com',
                    'x-forwarded-host': 'public.com',
                    'x-forwarded-proto': 'https'
                }),
                createMockReq({
                    host: 'example.com',
                    'x-forwarded-proto': 'https',
                    'x-forwarded-port': '8443'
                }),
                createMockReq({
                    host: 'example.com:3000',
                    'x-forwarded-proto': 'http'
                })
            ];

            for (const req of testCases) {
                const options: RouterOptions = { req: req as IncomingMessage };
                const opts = parsedOptions(options);
                expect(opts.base.href).toBe(location.origin + '/');
            }
        });

        it('should handle invalid base URL and fallback to default', async () => {
            const { parsedOptions } = await import('./options');
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            const invalidOptions = {
                base: 'invalid-url'
            } as unknown as RouterOptions;
            const options = parsedOptions(invalidOptions);
            expect(options.base.href).toBe('https://www.esmnext.com/');
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Failed to parse base URL')
            );
            consoleSpy.mockRestore();
        });

        it('should use provided base URL object', async () => {
            const { parsedOptions } = await import('./options');
            const baseUrl = new URL('https://custom.com/app/');
            const options: RouterOptions = { base: baseUrl };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://custom.com/app/');
        });

        it('should handle routes array', async () => {
            const { parsedOptions } = await import('./options');
            const routes: RouteConfig[] = [
                { path: '/home', component: 'HomeComponent' },
                { path: '/about', component: 'AboutComponent' }
            ];
            const options: RouterOptions = {
                base: new URL('http://a.com'),
                routes
            };
            const opts = parsedOptions(options);
            expect(opts.routes).toEqual(routes);
            expect(opts.routes).not.toBe(routes); // 应该是新数组
        });

        it('should handle normalizeURL function', async () => {
            const { parsedOptions } = await import('./options');
            const normalizeURL = (url: URL) => {
                url.pathname = url.pathname.toLowerCase();
                return url;
            };
            const options: RouterOptions = {
                base: new URL('http://a.com'),
                normalizeURL
            };
            const opts = parsedOptions(options);
            expect(opts.normalizeURL).toBe(normalizeURL);
        });

        it('should handle custom location function', async () => {
            const { parsedOptions } = await import('./options');
            const customLocation = vi.fn();
            const options: RouterOptions = {
                base: new URL('http://a.com'),
                location: customLocation
            };
            const opts = parsedOptions(options);
            expect(opts.location).toBe(customLocation);
        });
    });
});

describe('DEFAULT_LOCATION', () => {
    afterEach(() => {
        vi.clearAllMocks();
        vi.resetModules();
    });

    describe('browser environment behavior with res parameter', () => {
        it('should ignore res parameter in browser environment and use location.href', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute();
            const res = createMockRes();
            const originalHref = location.href;

            DEFAULT_LOCATION(route, null, { res });

            // 在浏览器环境中，不会设置 res.statusCode，而是设置 location.href
            expect(res.statusCode).toBe(200); // 保持初始值
            expect(res.setHeader).not.toHaveBeenCalled();
            expect(res.end).not.toHaveBeenCalled();
            expect(location.href).toBe(route.url.href);

            // 恢复原始 href
            location.href = originalHref;
        });

        it('should handle push navigation with window.open in browser environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute({ isPush: true });
            const res = createMockRes();
            const mockWindow = { opener: 'original' } as Window;

            // 为这个测试设置 window.open spy
            const openSpy = vi
                .spyOn(window, 'open')
                .mockReturnValue(mockWindow);

            const result = DEFAULT_LOCATION(route, null, { res });

            // 在浏览器环境中，即使传入 res 也会使用 window.open
            expect(window.open).toHaveBeenCalledWith(route.url.href);
            expect(mockWindow.opener).toBe(null);
            expect(result).toBe(mockWindow);
            expect(res.statusCode).toBe(200); // res 参数被忽略

            // 清理 spy
            openSpy.mockRestore();
        });

        it('should not perform server redirect in browser environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute();

            // 在浏览器环境中，没有 res 参数时正常工作
            expect(() => DEFAULT_LOCATION(route, null)).not.toThrow();
        });
    });

    describe('client-side behavior', () => {
        beforeEach(() => {
            // 在 happy-dom 环境中，window 和 location 已经存在
            // 我们只需要模拟 window.open 方法
            vi.spyOn(window, 'open').mockImplementation(vi.fn());
            vi.resetModules();
        });

        it('should set location.href for non-push navigation', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute({ isPush: false });

            DEFAULT_LOCATION(route, null);

            expect(location.href).toBe(route.url.href);
        });

        it('should open new window for push navigation', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const mockWindow = { opener: 'original' } as Window;
            const route = createRoute({ isPush: true });

            vi.mocked(window.open).mockReturnValue(mockWindow);

            const result = DEFAULT_LOCATION(route, null);

            expect(window.open).toHaveBeenCalledWith(route.url.href);
            expect(mockWindow.opener).toBe(null);
            expect(result).toBe(mockWindow);
        });

        it('should fallback to location.href when window.open fails', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute({ isPush: true });

            vi.mocked(window.open).mockReturnValue(null);

            DEFAULT_LOCATION(route, null);

            expect(window.open).toHaveBeenCalledWith(route.url.href);
            expect(location.href).toBe(route.url.href);
        });

        it('should handle window.open exception', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute({ isPush: true });

            vi.mocked(window.open).mockImplementation(() => {
                throw new Error('Popup blocked');
            });

            DEFAULT_LOCATION(route, null);

            expect(location.href).toBe(route.url.href);
        });
    });

    describe('edge cases in browser environment', () => {
        it('should handle null statusCode in browser environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute({ statusCode: null });
            const res = createMockRes();
            const originalHref = location.href;

            // 在浏览器环境中，statusCode 被忽略，直接设置 location.href
            DEFAULT_LOCATION(route, null, { res });

            expect(res.statusCode).toBe(200); // 保持初始值
            expect(location.href).toBe(route.url.href);

            // 恢复原始 href
            location.href = originalHref;
        });

        it('should handle zero statusCode in browser environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute({ statusCode: 0 });
            const res = createMockRes();
            const originalHref = location.href;

            // 在浏览器环境中，statusCode 被忽略，直接设置 location.href
            DEFAULT_LOCATION(route, null, { res });

            expect(res.statusCode).toBe(200); // 保持初始值
            expect(location.href).toBe(route.url.href);

            // 恢复原始 href
            location.href = originalHref;
        });

        it('should handle undefined context in browser environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute();

            // 在浏览器环境中，没有 context 参数时正常工作
            expect(() =>
                DEFAULT_LOCATION(route, null, undefined)
            ).not.toThrow();
        });

        it('should handle context without res in browser environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute();

            // 在浏览器环境中，context 对象不包含 res 时正常工作
            expect(() => DEFAULT_LOCATION(route, null, {})).not.toThrow();
        });
    });
});

// 专门测试服务端逻辑的测试组
describe('Server-side logic (mocked environment)', () => {
    beforeEach(() => {
        // 模拟服务端环境
        vi.doMock('./util', () => ({
            isBrowser: false
        }));
        vi.resetModules();
    });

    afterEach(() => {
        // 恢复模拟
        vi.doUnmock('./util');
        vi.resetModules();
    });

    describe('parsedOptions in server environment', () => {
        it('should parse base URL from request headers', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq(
                {
                    host: 'example.com',
                    'x-forwarded-proto': 'https'
                },
                '/api/test'
            );

            const options: RouterOptions = { req: req as IncomingMessage };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://example.com/api/');
        });

        it('should handle x-forwarded-host header', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq({
                host: 'internal.com',
                'x-forwarded-host': 'public.com',
                'x-forwarded-proto': 'https'
            });

            const options: RouterOptions = { req: req as IncomingMessage };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://public.com/');
        });

        it('should handle x-forwarded-port header', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq({
                host: 'example.com',
                'x-forwarded-proto': 'https',
                'x-forwarded-port': '8443'
            });

            const options: RouterOptions = { req: req as IncomingMessage };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://example.com:8443/');
        });

        it('should handle encrypted socket', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq(
                {
                    host: 'example.com'
                },
                '/',
                true
            );

            const options: RouterOptions = { req: req as IncomingMessage };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://example.com/');
        });

        it('should handle non-encrypted socket', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq(
                {
                    host: 'example.com'
                },
                '/',
                false
            );

            const options: RouterOptions = { req: req as IncomingMessage };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('http://example.com/');
        });

        it('should handle missing host header', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq({
                'x-forwarded-proto': 'https'
            });

            const options: RouterOptions = { req: req as IncomingMessage };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://localhost/');
        });

        it('should handle x-real-ip header as fallback', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq({
                'x-real-ip': 'real.example.com',
                'x-forwarded-proto': 'https'
            });

            const options: RouterOptions = { req: req as IncomingMessage };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://real.example.com/');
        });

        it('should handle complex URL path', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq(
                {
                    host: 'example.com',
                    'x-forwarded-proto': 'https'
                },
                '/api/v1/users?id=123'
            );

            const options: RouterOptions = { req: req as IncomingMessage };
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://example.com/api/v1/');
        });

        it('should use default URL when no req provided in server environment', async () => {
            const { parsedOptions } = await import('./options');
            const options: RouterOptions = {};
            const opts = parsedOptions(options);
            expect(opts.base.href).toBe('https://www.esmnext.com/');
        });
    });

    describe('DEFAULT_LOCATION in server environment', () => {
        it('should handle server-side redirect with default status code', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute();
            const res = createMockRes();
            const consoleSpy = vi
                .spyOn(console, 'log')
                .mockImplementation(() => {});

            DEFAULT_LOCATION(route, null, { res });

            expect(res.statusCode).toBe(302);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                route.url.href
            );
            expect(res.end).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should use custom status code when valid', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute({ statusCode: 301 });
            const res = createMockRes();

            DEFAULT_LOCATION(route, null, { res });

            expect(res.statusCode).toBe(301);
            expect(res.setHeader).toHaveBeenCalledWith(
                'Location',
                route.url.href
            );
            expect(res.end).toHaveBeenCalled();
        });

        it('should warn and use default for invalid status code', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute({ statusCode: 200 }); // 200 不是有效的重定向状态码
            const res = createMockRes();
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            DEFAULT_LOCATION(route, null, { res });

            expect(res.statusCode).toBe(302);
            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Invalid redirect status code 200')
            );
            consoleSpy.mockRestore();
        });

        it('should handle all valid redirect status codes', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const validCodes = [300, 301, 302, 303, 304, 307, 308];

            for (const statusCode of validCodes) {
                const route = createRoute({ statusCode });
                const res = createMockRes();

                DEFAULT_LOCATION(route, null, { res });

                expect(res.statusCode).toBe(statusCode);
                expect(res.setHeader).toHaveBeenCalledWith(
                    'Location',
                    route.url.href
                );
                expect(res.end).toHaveBeenCalled();

                vi.clearAllMocks();
            }
        });

        it('should handle null statusCode in server environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute({ statusCode: null });
            const res = createMockRes();

            DEFAULT_LOCATION(route, null, { res });

            expect(res.statusCode).toBe(302);
        });

        it('should handle zero statusCode in server environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute({ statusCode: 0 });
            const res = createMockRes();
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            DEFAULT_LOCATION(route, null, { res });

            // statusCode 为 0 时，由于是 falsy 值，不会触发警告，直接使用默认值 302
            expect(res.statusCode).toBe(302);
            expect(consoleSpy).not.toHaveBeenCalled();
            consoleSpy.mockRestore();
        });

        it('should not redirect when no res context in server environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createRoute();

            // 在服务端环境中，没有 res 上下文时不做任何操作
            expect(() => DEFAULT_LOCATION(route, null)).not.toThrow();
            expect(() => DEFAULT_LOCATION(route, null, {})).not.toThrow();
        });
    });
});

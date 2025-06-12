import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RouterMode } from './types';

const setIsBrowserTrue = () => {
    vi.stubGlobal('window', {
        location: {
            href: 'http://test.com/base/',
            origin: 'http://test.com'
        },
        open: vi.fn()
    });
    vi.stubGlobal('location', {
        href: 'http://test.com/base/',
        origin: 'http://test.com'
    });
    vi.resetModules();
};

const setIsBrowserFalse = () => {
    vi.unstubAllGlobals();
    vi.resetModules();
};

// 创建模拟的 IncomingMessage 对象
const createMockReq = (
    headers: Record<string, string> = {},
    url = '/',
    encrypted = false
) => ({
    headers,
    url,
    socket: encrypted ? { encrypted: true } : { encrypted: false }
});

// 创建模拟的 ServerResponse 对象
const createMockRes = () => {
    const res = {
        statusCode: 200,
        headers: {} as Record<string, string>,
        setHeader: vi.fn((name: string, value: string) => {
            res.headers[name] = value;
        }),
        end: vi.fn()
    };
    return res;
};

// 创建模拟的 Route 对象
const createMockRoute = (overrides: any = {}) => ({
    url: new URL('http://example.com/test'),
    statusCode: null,
    isPush: false,
    ...overrides
});

describe('parsedOptions', () => {
    afterEach(setIsBrowserFalse);

    it('should use default base if base is missing and not in browser', async () => {
        const { parsedOptions } = await import('./options');
        const opts = parsedOptions({} as any);
        expect(opts.base.href).toBe('https://www.esmnext.com/');
    });

    it('should use default base if base is invalid', async () => {
        const { parsedOptions } = await import('./options');
        const consoleSpy = vi
            .spyOn(console, 'warn')
            .mockImplementation(() => {});
        const opts = parsedOptions({ base: 'not-a-url' } as any);
        expect(opts.base.href).toBe('https://www.esmnext.com/');
        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Failed to parse base URL')
        );
        consoleSpy.mockRestore();
    });

    it('should set mode to options.mode or default to history in browser', async () => {
        setIsBrowserTrue();
        const { parsedOptions } = await import('./options');
        const opts = parsedOptions({
            base: 'http://a.com',
            mode: RouterMode.abstract,
            routes: []
        } as any);
        expect(opts.mode).toBe(RouterMode.abstract);
        const opts2 = parsedOptions({
            base: 'http://a.com',
            routes: []
        } as any);
        expect(opts2.mode).toBe(RouterMode.history);
    });

    it('should assign apps as function or object', async () => {
        setIsBrowserTrue();
        const { parsedOptions } = await import('./options');
        const fn = () => 'apps';
        const optsFn = parsedOptions({
            base: 'http://a.com',
            apps: fn,
            routes: []
        } as any);
        expect(optsFn.apps).toBe(fn);
        const obj = { a: 1 };
        const optsObj = parsedOptions({
            base: 'http://a.com',
            apps: obj,
            routes: []
        } as any);
        expect(optsObj.apps).not.toBe(obj); // 应该是新对象
        expect(optsObj.apps).toEqual(obj);
        (optsObj.apps as any).a = 2;
        expect(obj.a).toBe(1);
    });

    it('should use location.origin + "/" if base is not provided (in browser)', async () => {
        setIsBrowserTrue();
        const { parsedOptions } = await import('./options');
        const opts = parsedOptions({ routes: [] } as any);
        expect(opts.base.href).toBe(location.origin + '/');
    });

    it('should use empty array if routes is not provided', async () => {
        const { parsedOptions } = await import('./options');
        const opts = parsedOptions({ base: 'http://a.com' } as any);
        expect(Array.isArray(opts.routes)).toBe(true);
        expect(opts.routes.length).toBe(0);
    });

    it('should clone rootStyle if provided, otherwise false', async () => {
        const { parsedOptions } = await import('./options');
        const style = { color: 'red' };
        const opts = parsedOptions({
            base: 'http://a.com',
            routes: [],
            rootStyle: style
        } as any);
        expect(opts.rootStyle).not.toBe(style);
        expect(opts.rootStyle).toEqual(style);
        const opts2 = parsedOptions({
            base: 'http://a.com',
            routes: []
        } as any);
        expect(opts2.rootStyle).toBe(false);
    });

    it('should clone layer if provided, otherwise null', async () => {
        const { parsedOptions } = await import('./options');
        const layer = { enable: true };
        const opts = parsedOptions({
            base: 'http://a.com',
            routes: [],
            layer
        } as any);
        expect(opts.layer).not.toBe(layer);
        expect(opts.layer).toEqual(layer);
        const opts2 = parsedOptions({
            base: 'http://a.com',
            routes: []
        } as any);
        expect(opts2.layer).toBe(null);
    });

    it('should use default onBackNoResponse if not provided', async () => {
        const { parsedOptions } = await import('./options');
        const opts = parsedOptions({ base: 'http://a.com', routes: [] } as any);
        expect(typeof opts.onBackNoResponse).toBe('function');
        // 默认函数应可调用且无异常
        expect(() => opts.onBackNoResponse({} as any)).not.toThrow();
    });

    it('should NOT clone context object', async () => {
        const { parsedOptions } = await import('./options');
        const context = { user: 'test' };
        const opts = parsedOptions({
            base: 'http://a.com',
            routes: [],
            context
        } as any);
        expect(opts.context).toBe(context);
        expect(opts.context.user).toBe('test');
        opts.context.user = 'changed';
        expect(context.user).toBe('changed');
    });

    // 新增测试：服务端请求头解析
    describe('server-side base URL parsing', () => {
        it('should parse base URL from request headers', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq(
                {
                    host: 'example.com',
                    'x-forwarded-proto': 'https'
                },
                '/api/test'
            );

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('https://example.com/api/');
        });

        it('should handle x-forwarded-host header', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq({
                host: 'internal.com',
                'x-forwarded-host': 'public.com',
                'x-forwarded-proto': 'https'
            });

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('https://public.com/');
        });

        it('should handle x-forwarded-port header', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq({
                host: 'example.com',
                'x-forwarded-proto': 'https',
                'x-forwarded-port': '8443'
            });

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('https://example.com:8443/');
        });

        it('should detect HTTPS from encrypted socket', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq(
                {
                    host: 'example.com'
                },
                '/',
                true
            ); // encrypted = true

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('https://example.com/');
        });

        it('should fallback to HTTP for non-encrypted socket', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq(
                {
                    host: 'example.com'
                },
                '/',
                false
            ); // encrypted = false

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('http://example.com/');
        });

        it('should handle x-forwarded-protocol header', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq({
                host: 'example.com',
                'x-forwarded-protocol': 'https'
            });

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('https://example.com/');
        });

        it('should use x-real-ip as fallback for host', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq({
                'x-real-ip': '192.168.1.1',
                'x-forwarded-proto': 'http'
            });

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('http://192.168.1.1/');
        });

        it('should use localhost as ultimate fallback', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq({
                'x-forwarded-proto': 'http'
            });

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('http://localhost/');
        });

        it('should strip path, query and hash from base URL', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq(
                {
                    host: 'example.com',
                    'x-forwarded-proto': 'https'
                },
                '/api/test?param=value#hash'
            );

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('https://example.com/api/');
            expect(opts.base.search).toBe('');
            expect(opts.base.hash).toBe('');
        });

        it('should handle empty req.url', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq(
                {
                    host: 'example.com',
                    'x-forwarded-proto': 'https'
                },
                '' // 空字符串
            );

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('https://example.com/');
        });

        it('should handle undefined req.url', async () => {
            const { parsedOptions } = await import('./options');
            const req = {
                headers: {
                    host: 'example.com',
                    'x-forwarded-proto': 'https'
                },
                socket: { encrypted: false },
                url: undefined // 明确设置为undefined
            };

            const opts = parsedOptions({ req } as any);
            expect(opts.base.href).toBe('https://example.com/');
        });

        it('should fallback to default URL in server environment without req', async () => {
            const { parsedOptions } = await import('./options');
            // 确保在服务端环境（没有浏览器全局变量）
            vi.stubGlobal('window', undefined);
            vi.stubGlobal('location', undefined);

            const options = parsedOptions({}); // 没有传入req
            expect(options.base.href).toBe('https://www.esmnext.com/');
        });

        it('should handle browser environment with location.href error (unknown context)', async () => {
            const { parsedOptions } = await import('./options');

            // 模拟浏览器环境，但是访问location.href时抛出异常
            // 这样会进入第44行的'unknown context'分支
            vi.stubGlobal('window', {});
            const mockLocation = {
                get href() {
                    throw new Error('Cannot access location.href');
                }
            };
            vi.stubGlobal('location', mockLocation);

            const options = parsedOptions({}); // 没有传入base和req
            expect(options.base.href).toBe('https://www.esmnext.com/');
        });

        it('should handle URL parsing failure and fallback to default', async () => {
            const { parsedOptions } = await import('./options');

            // 模拟URL.parse返回null的情况
            const originalParse = URL.parse;
            vi.spyOn(URL, 'parse').mockReturnValueOnce(null);

            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            const req = createMockReq({
                host: 'example.com',
                'x-forwarded-proto': 'https'
            });

            const opts = parsedOptions({ req } as any);

            expect(consoleSpy).toHaveBeenCalledWith(
                expect.stringContaining('Failed to parse base URL')
            );
            expect(opts.base.href).toBe('https://www.esmnext.com/');

            consoleSpy.mockRestore();
            URL.parse = originalParse;
        });
    });

    // 新增测试：其他选项处理
    describe('other options handling', () => {
        it('should use provided base URL object', async () => {
            const { parsedOptions } = await import('./options');
            const baseUrl = new URL('https://custom.com/app/');
            const opts = parsedOptions({ base: baseUrl } as any);
            expect(opts.base.href).toBe('https://custom.com/app/');
        });

        it('should use provided base URL string', async () => {
            const { parsedOptions } = await import('./options');
            const opts = parsedOptions({
                base: 'https://custom.com/app/'
            } as any);
            expect(opts.base.href).toBe('https://custom.com/app/');
        });

        it('should set default id to "app"', async () => {
            const { parsedOptions } = await import('./options');
            const opts = parsedOptions({ base: 'http://a.com' } as any);
            expect(opts.id).toBe('app');
        });

        it('should use provided id', async () => {
            const { parsedOptions } = await import('./options');
            const opts = parsedOptions({
                base: 'http://a.com',
                id: 'custom-app'
            } as any);
            expect(opts.id).toBe('custom-app');
        });

        it('should set default env to empty string', async () => {
            const { parsedOptions } = await import('./options');
            const opts = parsedOptions({ base: 'http://a.com' } as any);
            expect(opts.env).toBe('');
        });

        it('should use provided env', async () => {
            const { parsedOptions } = await import('./options');
            const opts = parsedOptions({
                base: 'http://a.com',
                env: 'production'
            } as any);
            expect(opts.env).toBe('production');
        });

        it('should handle req and res options', async () => {
            const { parsedOptions } = await import('./options');
            const req = createMockReq();
            const res = createMockRes();
            const opts = parsedOptions({
                base: 'http://a.com',
                req,
                res
            } as any);
            expect(opts.req).toBe(req);
            expect(opts.res).toBe(res);
        });

        it('should use provided normalizeURL function', async () => {
            const { parsedOptions } = await import('./options');
            const normalizeURL = vi.fn((url) => url);
            const opts = parsedOptions({
                base: 'http://a.com',
                normalizeURL
            } as any);
            expect(opts.normalizeURL).toBe(normalizeURL);
        });

        it('should use provided location function', async () => {
            const { parsedOptions } = await import('./options');
            const location = vi.fn();
            const opts = parsedOptions({
                base: 'http://a.com',
                location
            } as any);
            expect(opts.location).toBe(location);
        });

        it('should use provided onBackNoResponse function', async () => {
            const { parsedOptions } = await import('./options');
            const onBackNoResponse = vi.fn();
            const opts = parsedOptions({
                base: 'http://a.com',
                onBackNoResponse
            } as any);
            expect(opts.onBackNoResponse).toBe(onBackNoResponse);
        });

        it('should create matcher from routes', async () => {
            const { parsedOptions } = await import('./options');
            const routes = [{ path: '/test', component: 'TestComponent' }];
            const opts = parsedOptions({ base: 'http://a.com', routes } as any);
            expect(typeof opts.matcher).toBe('function');
        });

        it('should return frozen object', async () => {
            const { parsedOptions } = await import('./options');
            const opts = parsedOptions({ base: 'http://a.com' } as any);
            expect(Object.isFrozen(opts)).toBe(true);
        });
    });
});

describe('DEFAULT_LOCATION', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    describe('server-side behavior', () => {
        beforeEach(() => {
            // 确保在服务端环境
            vi.stubGlobal('window', undefined);
            vi.stubGlobal('location', undefined);
        });

        it('should handle server-side redirect with default status code', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createMockRoute();
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
            const route = createMockRoute({ statusCode: 301 });
            const res = createMockRes();
            const consoleSpy = vi
                .spyOn(console, 'log')
                .mockImplementation(() => {});

            DEFAULT_LOCATION(route, null, { res });

            expect(res.statusCode).toBe(301);
            consoleSpy.mockRestore();
        });

        it('should validate redirect status codes', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const validCodes = [300, 301, 302, 303, 304, 307, 308];

            for (const code of validCodes) {
                const route = createMockRoute({ statusCode: code });
                const res = createMockRes();

                DEFAULT_LOCATION(route, null, { res });

                expect(res.statusCode).toBe(code);
            }
        });

        it('should fallback to 302 for invalid status codes', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const invalidCodes = [200, 404, 500, 100, 600];
            const consoleSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            for (const code of invalidCodes) {
                const route = createMockRoute({ statusCode: code });
                const res = createMockRes();

                DEFAULT_LOCATION(route, null, { res });

                expect(res.statusCode).toBe(302);
            }

            consoleSpy.mockRestore();
        });

        it('should not redirect without res context', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createMockRoute();

            // 在服务端环境下，没有 res 时应该不做任何操作
            expect(() => DEFAULT_LOCATION(route, null)).not.toThrow();
        });
    });

    describe('client-side behavior', () => {
        beforeEach(() => {
            // 设置浏览器环境
            vi.stubGlobal('window', {
                open: vi.fn()
            });
            vi.stubGlobal('location', {
                href: ''
            });
            vi.resetModules(); // 重置模块以重新计算 isBrowser
        });

        it('should set location.href for non-push navigation', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createMockRoute({ isPush: false });

            DEFAULT_LOCATION(route, null);

            expect(location.href).toBe(route.url.href);
        });

        it('should open new window for push navigation', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const mockWindow = { opener: 'original' } as any;
            const route = createMockRoute({ isPush: true });

            vi.mocked(window.open).mockReturnValue(mockWindow);

            const result = DEFAULT_LOCATION(route, null);

            expect(window.open).toHaveBeenCalledWith(route.url.href);
            expect(mockWindow.opener).toBe(null);
            expect(result).toBe(mockWindow);
        });

        it('should fallback to location.href when window.open fails', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createMockRoute({ isPush: true });

            vi.mocked(window.open).mockReturnValue(null);

            DEFAULT_LOCATION(route, null);

            expect(window.open).toHaveBeenCalledWith(route.url.href);
            expect(location.href).toBe(route.url.href);
        });

        it('should handle window.open exception', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createMockRoute({ isPush: true });

            vi.mocked(window.open).mockImplementation(() => {
                throw new Error('Popup blocked');
            });

            DEFAULT_LOCATION(route, null);

            expect(location.href).toBe(route.url.href);
        });
    });

    describe('edge cases', () => {
        it('should handle null statusCode in server environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createMockRoute({ statusCode: null });
            const res = createMockRes();

            vi.stubGlobal('window', undefined);
            vi.stubGlobal('location', undefined);
            vi.resetModules();

            const { DEFAULT_LOCATION: serverDefaultLocation } = await import(
                './options'
            );
            serverDefaultLocation(route, null, { res });

            expect(res.statusCode).toBe(302);
        });

        it('should handle zero statusCode in server environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createMockRoute({ statusCode: 0 });
            const res = createMockRes();

            vi.stubGlobal('window', undefined);
            vi.stubGlobal('location', undefined);
            vi.resetModules();

            const { DEFAULT_LOCATION: serverDefaultLocation } = await import(
                './options'
            );
            serverDefaultLocation(route, null, { res });

            expect(res.statusCode).toBe(302);
        });

        it('should handle undefined context in server environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createMockRoute();

            vi.stubGlobal('window', undefined);
            vi.stubGlobal('location', undefined);
            vi.resetModules();

            const { DEFAULT_LOCATION: serverDefaultLocation } = await import(
                './options'
            );
            expect(() =>
                serverDefaultLocation(route, null, undefined)
            ).not.toThrow();
        });

        it('should handle context without res in server environment', async () => {
            const { DEFAULT_LOCATION } = await import('./options');
            const route = createMockRoute();

            vi.stubGlobal('window', undefined);
            vi.stubGlobal('location', undefined);
            vi.resetModules();

            const { DEFAULT_LOCATION: serverDefaultLocation } = await import(
                './options'
            );
            expect(() => serverDefaultLocation(route, null, {})).not.toThrow();
        });
    });
});

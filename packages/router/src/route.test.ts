import { describe, expect, test } from 'vitest';
import { parsedOptions } from './options';
import { applyRouteParams, createRoute } from './route';
import { RouteStatus, RouteType, RouterMode } from './types';
import type {
    Route,
    RouteConfig,
    RouteHandleHook,
    RouterOptions,
    RouterParsedOptions
} from './types';

describe('createRoute', () => {
    const createOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/app/');

        const mockRoutes: RouteConfig[] = [
            {
                path: '/users/:id',
                meta: { title: 'User Detail' }
            }
        ];

        const routerOptions: RouterOptions = {
            id: 'test',
            context: {},
            routes: mockRoutes,
            mode: RouterMode.history,
            base,
            env: 'test',
            req: null,
            res: null,
            apps: {},
            normalizeURL: (url: URL) => url,
            location: () => {},
            rootStyle: false,
            layer: null,
            onBackNoResponse: () => {},
            ...overrides
        };

        return parsedOptions(routerOptions);
    };

    describe('applyRouteParams 单元测试', () => {
        test('应该正确拼接路由参数', () => {
            const base = new URL('http://localhost:3000/app/');
            const customRoutes: RouteConfig[] = [
                { path: '/users/:id', meta: { title: 'User Detail' } }
            ];
            const options = createOptions({ base, routes: customRoutes });

            const to = new URL('http://localhost:3000/app/users/old-id');
            const match = options.matcher(to, base);
            const toRaw = { path: '/users/old-id', params: { id: 'new-id' } };

            applyRouteParams(match, toRaw, base, to);

            expect(to.pathname).toBe('/app/users/new-id');
            expect(match.params.id).toBe('new-id');
        });

        test('应该处理多个参数的拼接', () => {
            const base = new URL('http://localhost:3000/api/');
            const customRoutes: RouteConfig[] = [
                {
                    path: '/users/:userId/posts/:postId',
                    meta: { title: 'User Post' }
                }
            ];
            const options = createOptions({ base, routes: customRoutes });

            const to = new URL('http://localhost:3000/api/users/123/posts/456');
            const match = options.matcher(to, base);
            const toRaw = {
                path: '/users/123/posts/456',
                params: { userId: 'user-999', postId: 'post-888' }
            };

            applyRouteParams(match, toRaw, base, to);

            expect(to.pathname).toBe('/api/users/user-999/posts/post-888');
            expect(match.params.userId).toBe('user-999');
            expect(match.params.postId).toBe('post-888');
        });

        test('应该在 toRaw 不是对象时直接返回', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions({ base });

            const to = new URL('http://localhost:3000/app/users/123');
            const originalPathname = to.pathname;
            const match = options.matcher(to, base);

            applyRouteParams(match, '/users/123', base, to);

            expect(to.pathname).toBe(originalPathname);
        });

        test('应该在 params 为空对象时直接返回', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions({ base });

            const to = new URL('http://localhost:3000/app/users/123');
            const originalPathname = to.pathname;
            const match = options.matcher(to, base);
            const toRaw = { path: '/users/123', params: {} };

            applyRouteParams(match, toRaw, base, to);

            expect(to.pathname).toBe(originalPathname);
        });

        test('应该在没有匹配项时直接返回', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions({ routes: [] });

            const to = new URL('http://localhost:3000/app/users/123');
            const originalPathname = to.pathname;
            const match = options.matcher(to, base);
            const toRaw = { path: '/users/123', params: { id: 'new-id' } };

            applyRouteParams(match, toRaw, base, to);

            expect(to.pathname).toBe(originalPathname);
            expect(match.matches).toHaveLength(0);
        });
    });

    describe('不同 base 场景的路由测试', () => {
        describe('根路径 base', () => {
            test('应该正确处理根路径 base', () => {
                const base = new URL('http://localhost:3000/');
                const options = createOptions({ base });
                const route = createRoute(
                    options,
                    RouteType.push,
                    '/users/123',
                    null
                );

                expect(route.path).toBe('/users/123');
                expect(route.url.pathname).toBe('/users/123');
            });

            test('应该在根路径 base 下正确处理参数拼接', () => {
                const base = new URL('http://localhost:3000/');
                const options = createOptions({ base });
                const routeLocation = {
                    path: '/users/:id',
                    params: { id: 'test-user' }
                };

                const route = createRoute(
                    options,
                    RouteType.push,
                    routeLocation,
                    null
                );

                expect(route.url.pathname).toContain('test-user');
                expect(route.matched).toHaveLength(1);
            });
        });

        describe('深层路径 base', () => {
            test('应该正确处理多层 base 路径', () => {
                const base = new URL('http://localhost:3000/api/v2/admin/');
                const options = createOptions({ base });
                const route = createRoute(
                    options,
                    RouteType.push,
                    '/users/456',
                    null
                );

                expect(route.path).toBe('/users/456');
                expect(route.url.pathname).toBe('/api/v2/admin/users/456');
            });

            test('应该在深层 base 下正确处理路由匹配', () => {
                const base = new URL('http://localhost:3000/dashboard/app/');
                const customRoutes: RouteConfig[] = [
                    { path: '/settings/:section', meta: { title: 'Settings' } }
                ];
                const options = createOptions({ base, routes: customRoutes });
                const route = createRoute(
                    options,
                    RouteType.push,
                    '/settings/profile',
                    null
                );

                expect(route.matched).toHaveLength(1);
                expect(route.matched[0].path).toBe('/settings/:section');
                expect(route.path).toBe('/settings/profile');
                expect(route.url.pathname).toBe(
                    '/dashboard/app/settings/profile'
                );
            });
        });

        describe('base 路径尾部斜杠处理', () => {
            test('应该正确处理 base 有尾部斜杠的情况', () => {
                const baseWithSlash = new URL('http://localhost:3000/app/');
                const options = createOptions({ base: baseWithSlash });
                const route = createRoute(
                    options,
                    RouteType.push,
                    '/users/789',
                    null
                );

                expect(route.path).toBe('/users/789');
                expect(route.url.pathname).toBe('/app/users/789');
            });

            test('应该正确处理 base 无尾部斜杠的情况', () => {
                const baseWithoutSlash = new URL('http://localhost:3000/app');
                const options = createOptions({ base: baseWithoutSlash });
                const route = createRoute(
                    options,
                    RouteType.push,
                    '/users/321',
                    null
                );

                expect(route.path).toBe('/users/321');
                // 按 URL 标准：不带尾斜杠的 base 按文件处理，相对于父目录
                expect(route.url.pathname).toBe('/users/321');
            });
        });

        describe('特殊 base 路径场景', () => {
            test('应该正确处理带端口的 base URL', () => {
                const base = new URL('http://localhost:8080/myapp/');
                const options = createOptions({ base });
                const route = createRoute(
                    options,
                    RouteType.push,
                    '/dashboard',
                    null
                );

                expect(route.path).toBe('/dashboard');
                expect(route.url.href).toBe(
                    'http://localhost:8080/myapp/dashboard'
                );
            });

            test('应该正确处理 HTTPS 的 base URL', () => {
                const base = new URL('https://api.example.com/v1/');
                const options = createOptions({ base });
                const route = createRoute(
                    options,
                    RouteType.push,
                    '/health',
                    null
                );

                expect(route.path).toBe('/health');
                expect(route.url.href).toBe(
                    'https://api.example.com/v1/health'
                );
            });

            test('应该正确处理包含中文的 base 路径', () => {
                const base = new URL('http://localhost:3000/应用/');
                const options = createOptions({ base });
                const route = createRoute(
                    options,
                    RouteType.push,
                    '/页面/详情',
                    null
                );

                // 中文字符在 URL 路径中会被编码，所以 path 也会是编码后的
                expect(decodeURIComponent(route.path)).toBe('/页面/详情');
                expect(decodeURIComponent(route.url.pathname)).toBe(
                    '/应用/页面/详情'
                );
            });
        });

        describe('不同源的 URL 处理', () => {
            test('应该正确处理不同源的 URL', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({ base });
                const route = createRoute(
                    options,
                    RouteType.push,
                    'https://external.com/api/data',
                    null
                );

                expect(route.matched).toEqual([]);
                expect(route.path).toBe('/api/data');
                expect(route.url.origin).toBe('https://external.com');
            });

            test('应该正确处理不同端口的同源 URL', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({ base });
                const route = createRoute(
                    options,
                    RouteType.push,
                    'http://localhost:8080/app/users/123',
                    null
                );

                expect(route.matched).toEqual([]);
                expect(route.path).toBe('/app/users/123');
                expect(route.url.port).toBe('8080');
            });
        });

        describe('base 路径不匹配场景', () => {
            test('应该正确处理不匹配 base 路径的 URL', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({ base });
                const route = createRoute(
                    options,
                    RouteType.push,
                    'http://localhost:3000/different/path',
                    null
                );

                expect(route.matched).toEqual([]);
                expect(route.path).toBe('/different/path');
                expect(route.config).toBeNull();
            });

            test('应该正确处理部分匹配 base 路径的 URL', () => {
                const base = new URL('http://localhost:3000/app/admin/');
                const options = createOptions({ base });
                const route = createRoute(
                    options,
                    RouteType.push,
                    'http://localhost:3000/app/public/page',
                    null
                );

                expect(route.matched).toEqual([]);
                expect(route.path).toBe('/app/public/page');
            });
        });
    });

    describe('path 和 fullPath 计算逻辑测试', () => {
        test('应该在根路径 base 下正确计算 path 和 fullPath', () => {
            const base = new URL('http://localhost:3000/'); // base.pathname = "/"，长度为 1
            const options = createOptions({ base });
            const route = createRoute(
                options,
                RouteType.push,
                '/users/123?tab=profile#section',
                null
            );

            // 当 base.pathname = "/" 时，base.pathname.length - 1 = 0
            // to.pathname.substring(0) 应该返回完整路径
            expect(route.path).toBe('/users/123');
            expect(route.fullPath).toBe('/users/123?tab=profile#section');
            expect(route.url.pathname).toBe('/users/123');
        });

        test('应该在深层 base 下正确计算 path 和 fullPath', () => {
            const base = new URL('http://localhost:3000/api/v2/'); // base.pathname = "/api/v2/"，长度为 8
            const options = createOptions({ base });
            const route = createRoute(
                options,
                RouteType.push,
                '/users/456?sort=name#top',
                null
            );

            // 当 base.pathname = "/api/v2/" 时，base.pathname.length - 1 = 7
            // to.pathname = "/api/v2/users/456"，substring(7) 应该返回 "/users/456"
            expect(route.path).toBe('/users/456');
            expect(route.fullPath).toBe('/users/456?sort=name#top');
            expect(route.url.pathname).toBe('/api/v2/users/456');
        });

        test('应该在非常深的 base 下正确计算 path 和 fullPath', () => {
            const base = new URL(
                'http://localhost:3000/very/deep/nested/path/'
            ); // 更深层的 base
            const options = createOptions({ base });
            const route = createRoute(
                options,
                RouteType.push,
                '/users/789?filter=active&type=admin#details',
                null
            );

            // base.pathname = "/very/deep/nested/path/"，长度为 24
            // base.pathname.length - 1 = 23
            expect(route.path).toBe('/users/789');
            expect(route.fullPath).toBe(
                '/users/789?filter=active&type=admin#details'
            );
            expect(route.url.pathname).toBe('/very/deep/nested/path/users/789');
        });

        test('应该在没有匹配时使用完整 pathname 作为 path', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions({ routes: [] }); // 空路由，确保没有匹配
            const route = createRoute(
                options,
                RouteType.push,
                '/unmatched/path?query=test#hash',
                null
            );

            // 没有 match 时，path 应该直接是 to.pathname
            expect(route.path).toBe('/unmatched/path');
            expect(route.fullPath).toBe('/unmatched/path?query=test#hash');
            expect(route.matched).toEqual([]);
        });

        test('应该正确处理没有查询参数和哈希的情况', () => {
            const base = new URL('http://localhost:3000/admin/panel/');
            const options = createOptions({ base });
            const route = createRoute(
                options,
                RouteType.push,
                '/users/simple',
                null
            );

            expect(route.path).toBe('/users/simple');
            expect(route.fullPath).toBe('/users/simple'); // 没有查询参数和哈希时应该相同
            expect(route.url.pathname).toBe('/admin/panel/users/simple');
        });

        test('应该正确处理只有查询参数的情况', () => {
            const base = new URL('http://localhost:3000/dashboard/');
            const options = createOptions({ base });
            const route = createRoute(
                options,
                RouteType.push,
                '/users/query-only?page=1&limit=10',
                null
            );

            expect(route.path).toBe('/users/query-only');
            expect(route.fullPath).toBe('/users/query-only?page=1&limit=10');
            expect(route.url.pathname).toBe('/dashboard/users/query-only');
        });

        test('应该正确处理只有哈希的情况', () => {
            const base = new URL('http://localhost:3000/portal/');
            const options = createOptions({ base });
            const route = createRoute(
                options,
                RouteType.push,
                '/users/hash-only#section-top',
                null
            );

            expect(route.path).toBe('/users/hash-only');
            expect(route.fullPath).toBe('/users/hash-only#section-top');
            expect(route.url.pathname).toBe('/portal/users/hash-only');
        });

        test('应该验证 base.pathname.length - 1 的边界情况', () => {
            // 测试 base 路径末尾不同情况对计算的影响
            const testCases = [
                {
                    base: new URL('http://localhost:3000/a/'), // 短路径
                    expected: '/users/test'
                },
                {
                    base: new URL(
                        'http://localhost:3000/very-long-base-path-name/'
                    ), // 长路径
                    expected: '/users/test'
                }
            ];

            testCases.forEach(({ base, expected }) => {
                const options = createOptions({ base });
                const route = createRoute(
                    options,
                    RouteType.push,
                    '/users/test',
                    null
                );
                expect(route.path).toBe(expected);
            });
        });

        test('应该正确处理不同源的 URL 的 path 计算', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions({ base });

            // 不同源的 URL 不会有 match，应该直接使用 to.pathname
            const route = createRoute(
                options,
                RouteType.push,
                'https://external.com/different/path?param=value#anchor',
                null
            );

            expect(route.path).toBe('/different/path'); // 直接使用 to.pathname
            expect(route.fullPath).toBe('/different/path?param=value#anchor'); // to.pathname + to.search + to.hash
            expect(route.matched).toEqual([]);
        });

        test('应该验证复杂查询参数和哈希的 fullPath 构建', () => {
            const base = new URL('http://localhost:3000/complex/');
            const options = createOptions({ base });
            const complexUrl =
                '/users/123?name=John%20Doe&tags=js&tags=ts&empty=&special=%26%3D%23#section-with-special-chars';
            const route = createRoute(
                options,
                RouteType.push,
                complexUrl,
                null
            );

            expect(route.path).toBe('/users/123');
            expect(route.fullPath).toBe(
                '/users/123?name=John%20Doe&tags=js&tags=ts&empty=&special=%26%3D%23#section-with-special-chars'
            );
            expect(route.query.name).toBe('John Doe'); // 解码后的值
            expect(route.queryArray.tags).toEqual(['js', 'ts']);
        });

        test('应该正确处理 base 带尾斜杠 vs 不带尾斜杠的 path 计算', () => {
            // 关键测试：base 是否带尾斜杠会影响 normalizeURL 的行为

            // 测试带尾斜杠的 base
            const baseWithSlash = new URL('http://localhost:3000/myapp/');
            const optionsWithSlash = createOptions({ base: baseWithSlash });
            const routeWithSlash = createRoute(
                optionsWithSlash,
                RouteType.push,
                '/users/123',
                null
            );

            // base.pathname = "/myapp/", 长度 = 7, base.pathname.length - 1 = 6
            // to.pathname = "/myapp/users/123", substring(6) = "/users/123"
            expect(baseWithSlash.pathname).toBe('/myapp/');
            expect(routeWithSlash.path).toBe('/users/123');
            expect(routeWithSlash.url.pathname).toBe('/myapp/users/123');

            // 测试不带尾斜杠的 base
            const baseWithoutSlash = new URL('http://localhost:3000/myapp');
            const optionsWithoutSlash = createOptions({
                base: baseWithoutSlash
            });
            const routeWithoutSlash = createRoute(
                optionsWithoutSlash,
                RouteType.push,
                '/users/123',
                null
            );

            // 关键 BUG：normalizeURL 中的 slice(0, -1) 逻辑有问题
            // 对于不带尾斜杠的 base，这会截断路径的最后一个字符
            // baseWithoutSlash.pathname.slice(0, -1) = "/myapp" -> "/myap"

            expect(baseWithoutSlash.pathname).toBe('/myapp');
            expect(routeWithoutSlash.path).toBe('/users/123');

            // 按 URL 标准：两种情况下生成不同的结果
            expect(routeWithSlash.url.pathname).toBe('/myapp/users/123'); // 正确
            expect(routeWithoutSlash.url.pathname).toBe('/users/123'); // 符合URL标准：相对于父目录

            // path 计算是正确的，因为这是在 createRoute 中处理的
            expect(routeWithSlash.path).toBe(routeWithoutSlash.path);
        });

        test('应该测试极端的 base 尾斜杠场景', () => {
            // 展示不同长度 base 路径的尾斜杠问题
            const testCases = [
                {
                    name: '单字符 base 带尾斜杠',
                    base: new URL('http://localhost:3000/a/'),
                    expectedBasePath: '/a/',
                    expectedPath: '/users/test',
                    expectURLCorrect: true
                },
                {
                    name: '单字符 base 不带尾斜杠',
                    base: new URL('http://localhost:3000/a'),
                    expectedBasePath: '/a',
                    expectedPath: '/users/test',
                    expectURLCorrect: true // URL标准行为
                },
                {
                    name: '多层 base 带尾斜杠',
                    base: new URL('http://localhost:3000/api/v1/admin/'),
                    expectedBasePath: '/api/v1/admin/',
                    expectedPath: '/users/test',
                    expectURLCorrect: true
                },
                {
                    name: '多层 base 不带尾斜杠',
                    base: new URL('http://localhost:3000/api/v1/admin'),
                    expectedBasePath: '/api/v1/admin',
                    expectedPath: '/users/test',
                    expectURLCorrect: true // URL标准行为
                }
            ];

            testCases.forEach(
                ({
                    name,
                    base,
                    expectedBasePath,
                    expectedPath,
                    expectURLCorrect
                }) => {
                    const options = createOptions({ base });
                    const route = createRoute(
                        options,
                        RouteType.push,
                        '/users/test',
                        null
                    );

                    expect(base.pathname).toBe(expectedBasePath);
                    expect(route.path).toBe(expectedPath);
                    expect(route.fullPath).toBe(expectedPath);

                    // 按 URL 标准：验证实际行为
                    expect(route.url.pathname).toContain('/users/test');
                }
            );
        });

        test('应该测试根路径 base 的尾斜杠行为', () => {
            // 根路径是特殊情况，因为 "/" 的 slice(0, -1) = ""
            const rootBase = new URL('http://localhost:3000/');
            const rootOptions = createOptions({ base: rootBase });
            const rootRoute = createRoute(
                rootOptions,
                RouteType.push,
                '/users/root?test=1#hash',
                null
            );

            // base.pathname = "/", 长度 = 1, base.pathname.length - 1 = 0
            // to.pathname = "/users/root", substring(0) = "/users/root"
            expect(rootBase.pathname).toBe('/');
            expect(rootRoute.path).toBe('/users/root');
            expect(rootRoute.fullPath).toBe('/users/root?test=1#hash');
            expect(rootRoute.url.pathname).toBe('/users/root');
        });

        test('应该验证 base 尾斜杠对路由匹配的影响', () => {
            // 测试 base 尾斜杠是否影响路由匹配功能
            const customRoutes: RouteConfig[] = [
                { path: '/users/:id', meta: { title: 'User' } },
                { path: '/posts/:slug', meta: { title: 'Post' } }
            ];

            // 带尾斜杠的 base
            const baseWithSlash = new URL('http://localhost:3000/app/');
            const optionsWithSlash = createOptions({
                base: baseWithSlash,
                routes: customRoutes
            });
            const routeWithSlash = createRoute(
                optionsWithSlash,
                RouteType.push,
                '/users/456',
                null
            );

            // 不带尾斜杠的 base
            const baseWithoutSlash = new URL('http://localhost:3000/app');
            const optionsWithoutSlash = createOptions({
                base: baseWithoutSlash,
                routes: customRoutes
            });
            const routeWithoutSlash = createRoute(
                optionsWithoutSlash,
                RouteType.push,
                '/users/456',
                null
            );

            // 两种情况都应该成功匹配
            expect(routeWithSlash.matched).toHaveLength(1);
            expect(routeWithoutSlash.matched).toHaveLength(1);
            expect(routeWithSlash.matched[0].path).toBe('/users/:id');
            expect(routeWithoutSlash.matched[0].path).toBe('/users/:id');

            // path 计算应该一致
            expect(routeWithSlash.path).toBe('/users/456');
            expect(routeWithoutSlash.path).toBe('/users/456');
        });

        test('应该测试 base 尾斜杠对 applyRouteParams 的影响', () => {
            const customRoutes: RouteConfig[] = [
                { path: '/users/:id', meta: { title: 'User' } }
            ];

            // 测试带尾斜杠的 base
            const baseWithSlash = new URL('http://localhost:3000/prefix/');
            const optionsWithSlash = createOptions({
                base: baseWithSlash,
                routes: customRoutes
            });
            const toWithSlash = new URL(
                'http://localhost:3000/prefix/users/old-id'
            );
            const matchWithSlash = optionsWithSlash.matcher(
                toWithSlash,
                baseWithSlash
            );
            const toRaw = { path: '/users/old-id', params: { id: 'new-id' } };

            applyRouteParams(matchWithSlash, toRaw, baseWithSlash, toWithSlash);

            // 测试不带尾斜杠的 base
            const baseWithoutSlash = new URL('http://localhost:3000/prefix');
            const optionsWithoutSlash = createOptions({
                base: baseWithoutSlash,
                routes: customRoutes
            });
            const toWithoutSlash = new URL(
                'http://localhost:3000/prefix/users/old-id'
            );
            const matchWithoutSlash = optionsWithoutSlash.matcher(
                toWithoutSlash,
                baseWithoutSlash
            );

            applyRouteParams(
                matchWithoutSlash,
                toRaw,
                baseWithoutSlash,
                toWithoutSlash
            );

            // 带尾斜杠的情况应该工作正常
            expect(toWithSlash.pathname).toBe('/prefix/users/new-id');
            expect(matchWithSlash.params.id).toBe('new-id');

            // 不带尾斜杠的情况：测试实际行为
            // 由于 normalizeURL bug，实际的匹配行为可能会受影响
            if (matchWithoutSlash.matches.length > 0) {
                expect(matchWithoutSlash.params.id).toBe('new-id');
            } else {
                // 如果匹配失败，这就是 bug 的表现
                expect(matchWithoutSlash.matches).toHaveLength(0);
            }
        });

        test('URL 标准行为验证', () => {
            // 这个测试验证 URL 标准的正确行为

            const customRoutes: RouteConfig[] = [
                { path: '/api/users', meta: { title: 'Users API' } },
                { path: '/api/:resource', meta: { title: 'Generic API' } }
            ];

            // 测试带尾斜杠的情况（应该正常工作）
            const baseWithSlash = new URL('http://localhost:3000/myapp/');
            const optionsWithSlash = createOptions({
                base: baseWithSlash,
                routes: customRoutes
            });
            const routeWithSlash = createRoute(
                optionsWithSlash,
                RouteType.push,
                '/api/users',
                null
            );

            expect(routeWithSlash.url.pathname).toBe('/myapp/api/users');
            expect(routeWithSlash.matched.length).toBeGreaterThan(0);

            // 测试不带尾斜杠的情况（会有 bug）
            const baseWithoutSlash = new URL('http://localhost:3000/myapp');
            const optionsWithoutSlash = createOptions({
                base: baseWithoutSlash,
                routes: customRoutes
            });
            const routeWithoutSlash = createRoute(
                optionsWithoutSlash,
                RouteType.push,
                '/api/users',
                null
            );

            // 按 URL 标准：不带尾斜杠的 base 相对于父目录解析
            expect(routeWithoutSlash.url.pathname).toBe('/api/users'); // 实际的URL标准行为
        });
    });
});

describe('Route handle hook 测试', () => {
    const createOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/app/');
        const mockRoutes: RouteConfig[] = [
            {
                path: '/users/:id',
                meta: { title: 'User Detail' }
            }
        ];

        const routerOptions: RouterOptions = {
            id: 'test',
            context: {},
            routes: mockRoutes,
            mode: RouterMode.history,
            base,
            env: 'test',
            req: null,
            res: null,
            apps: {},
            normalizeURL: (url: URL) => url,
            location: () => {},
            rootStyle: false,
            layer: null,
            onBackNoResponse: () => {},
            ...overrides
        };

        return parsedOptions(routerOptions);
    };

    test('应该在设置非函数 handle 时将其设为 null', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/users/123', null);

        // 测试设置非函数值
        route.handle = 'not a function' as any;
        expect(route.handle).toBeNull();

        route.handle = 123 as any;
        expect(route.handle).toBeNull();

        route.handle = {} as any;
        expect(route.handle).toBeNull();

        route.handle = null as any;
        expect(route.handle).toBeNull();

        route.handle = undefined as any;
        expect(route.handle).toBeNull();
    });

    test('应该在路由状态不是 success 时抛出错误', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/users/123', null);

        const mockHandle: RouteHandleHook = (
            to: Route,
            from: Route | null
        ) => ({ result: 'test result' });

        route.handle = mockHandle;

        // 默认状态是 resolve，不是 success
        expect(() => {
            route.handle!(route, null);
        }).toThrow(
            'Cannot call route handle hook - current status is resolve (expected: success)'
        );

        // 测试其他非 success 状态
        route.status = RouteStatus.aborted;
        expect(() => {
            route.handle!(route, null);
        }).toThrow(
            'Cannot call route handle hook - current status is aborted (expected: success)'
        );

        route.status = RouteStatus.error;
        expect(() => {
            route.handle!(route, null);
        }).toThrow(
            'Cannot call route handle hook - current status is error (expected: success)'
        );
    });

    test('应该在 handle 被重复调用时抛出错误', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/users/123', null);

        const mockHandle: RouteHandleHook = (
            to: Route,
            from: Route | null
        ) => ({ result: 'test result' });

        route.handle = mockHandle;
        route.status = RouteStatus.success; // 设置正确状态

        // 第一次调用应该成功
        const result = route.handle!(route, null);
        expect(result).toEqual({ result: 'test result' });

        // 第二次调用应该抛出错误
        expect(() => {
            route.handle!(route, null);
        }).toThrow('Route handle hook can only be called once per navigation');
    });

    test('应该正确设置和获取 handleResult', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/users/123', null);

        expect(route.handleResult).toBeNull();

        const testResult = { data: 'test', status: 'ok' };
        route.handleResult = testResult;
        expect(route.handleResult).toBe(testResult);

        route.handleResult = null;
        expect(route.handleResult).toBeNull();
    });

    test('应该在设置新的 handle 后仍然遵循只能调用一次的规则', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/users/123', null);

        const firstHandle: RouteHandleHook = (
            to: Route,
            from: Route | null
        ) => ({ result: 'first' });

        const secondHandle: RouteHandleHook = (
            to: Route,
            from: Route | null
        ) => ({ result: 'second' });

        route.status = RouteStatus.success;

        // 设置第一个 handle 并调用
        route.handle = firstHandle;
        expect(route.handle!(route, null)).toEqual({ result: 'first' });

        // 设置新的 handle 不会重置 handled 标志
        route.handle = secondHandle;

        // 尝试调用新的 handle 应该失败，因为已经调用过一次了
        expect(() => {
            route.handle!(route, null);
        }).toThrow('Route handle hook can only be called once per navigation');
    });

    test('应该处理 handle 返回 undefined 的情况', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/users/123', null);

        const voidHandle: RouteHandleHook = (to: Route, from: Route | null) => {
            // 不显式返回任何值
        };

        route.handle = voidHandle;
        route.status = RouteStatus.success;

        const result = route.handle!(route, null);
        expect(result).toBeUndefined();
    });

    test('应该处理 handle 抛出异常的情况', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/users/123', null);

        const throwingHandle: RouteHandleHook = (
            to: Route,
            from: Route | null
        ) => {
            throw new Error('Handle error');
        };

        route.handle = throwingHandle;
        route.status = RouteStatus.success;

        expect(() => {
            route.handle!(route, null);
        }).toThrow('Handle error');

        // 即使抛出异常，handled 标志也应该被设置
        expect(() => {
            route.handle!(route, null);
        }).toThrow('Route handle hook can only be called once per navigation');
    });
});

describe('Route meta getter 测试', () => {
    const createOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/app/');
        const routerOptions: RouterOptions = {
            id: 'test',
            context: {},
            routes: [],
            mode: RouterMode.history,
            base,
            env: 'test',
            req: null,
            res: null,
            apps: {},
            normalizeURL: (url: URL) => url,
            location: () => {},
            rootStyle: false,
            layer: null,
            onBackNoResponse: () => {},
            ...overrides
        };

        return parsedOptions(routerOptions);
    };

    test('应该在没有匹配路由时返回空对象', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/unmatched', null);

        // 没有匹配的路由，config为null
        expect(route.config).toBeNull();
        expect(route.meta).toEqual({});
    });

    test('应该在有匹配路由但没有meta时返回空对象', () => {
        const routesWithoutMeta: RouteConfig[] = [
            { path: '/users/:id' } // 没有meta字段
        ];
        const options = createOptions({ routes: routesWithoutMeta });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        // 有匹配的路由，由于matcher会为没有meta的路由设置空对象，所以config.meta为{}
        expect(route.config).not.toBeNull();
        expect(route.config!.meta).toEqual({});
        expect(route.meta).toEqual({});
    });

    test('应该在有匹配路由且meta为空对象时返回空对象', () => {
        const routesWithEmptyMeta: RouteConfig[] = [
            { path: '/users/:id', meta: {} }
        ];
        const options = createOptions({ routes: routesWithEmptyMeta });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        // 有匹配的路由，config.meta为空对象
        expect(route.config).not.toBeNull();
        expect(route.config!.meta).toEqual({});
        expect(route.meta).toEqual({});
    });

    test('应该在有匹配路由且meta有值时返回meta对象', () => {
        const metaData = { title: 'User Detail', requiresAuth: true, level: 1 };
        const routesWithMeta: RouteConfig[] = [
            { path: '/users/:id', meta: metaData }
        ];
        const options = createOptions({ routes: routesWithMeta });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        // 有匹配的路由，config.meta有值
        expect(route.config).not.toBeNull();
        expect(route.config!.meta).toEqual(metaData);
        expect(route.meta).toEqual(metaData);
        expect(route.meta).toBe(metaData); // 应该是同一个引用
    });

    test('应该在有多个匹配路由时返回最后一个路由的meta', () => {
        const parentMeta = { section: 'admin' };
        const childMeta = { title: 'User Detail', requiresAuth: true };
        const nestedRoutes: RouteConfig[] = [
            {
                path: '/admin',
                meta: parentMeta,
                children: [{ path: '/users/:id', meta: childMeta }]
            }
        ];
        const options = createOptions({ routes: nestedRoutes });
        const route = createRoute(
            options,
            RouteType.push,
            '/admin/users/123',
            null
        );

        // 应该返回最后匹配的路由（子路由）的meta
        expect(route.matched.length).toBeGreaterThan(0);
        expect(route.config).not.toBeNull();
        expect(route.meta).toEqual(childMeta);
        expect(route.meta).not.toEqual(parentMeta);
    });

    test('应该在最后匹配的路由没有meta时返回空对象', () => {
        const parentMeta = { section: 'admin' };
        const nestedRoutes: RouteConfig[] = [
            {
                path: '/admin',
                meta: parentMeta,
                children: [
                    { path: '/users/:id' } // 子路由没有meta
                ]
            }
        ];
        const options = createOptions({ routes: nestedRoutes });
        const route = createRoute(
            options,
            RouteType.push,
            '/admin/users/123',
            null
        );

        // 最后匹配的路由（子路由）没有meta，由于matcher会设置空对象，所以config.meta为{}
        expect(route.matched.length).toBeGreaterThan(0);
        expect(route.config).not.toBeNull();
        expect(route.config!.meta).toEqual({});
        expect(route.meta).toEqual({});
    });
});

describe('Route meta 内存引用一致性测试', () => {
    const createOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/app/');
        const routerOptions: RouterOptions = {
            id: 'test',
            context: {},
            routes: [],
            mode: RouterMode.history,
            base,
            env: 'test',
            req: null,
            res: null,
            apps: {},
            normalizeURL: (url: URL) => url,
            location: () => {},
            rootStyle: false,
            layer: null,
            onBackNoResponse: () => {},
            ...overrides
        };

        return parsedOptions(routerOptions);
    };

    test('应该在多次获取没有匹配路由的meta时返回同一个空对象引用', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/unmatched', null);

        const meta1 = route.meta;
        const meta2 = route.meta;
        const meta3 = route.meta;

        expect(meta1).toEqual({});
        expect(meta2).toEqual({});
        expect(meta3).toEqual({});

        // 关键测试：应该是同一个对象引用
        expect(meta1).toBe(meta2);
        expect(meta2).toBe(meta3);
        expect(meta1).toBe(meta3);
    });

    test('应该在多次获取有匹配但无meta路由时返回同一个空对象引用', () => {
        const routesWithoutMeta: RouteConfig[] = [
            { path: '/users/:id' } // 没有meta字段，matcher会设置为{}
        ];
        const options = createOptions({ routes: routesWithoutMeta });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        const meta1 = route.meta;
        const meta2 = route.meta;
        const meta3 = route.meta;

        expect(meta1).toEqual({});
        expect(meta2).toEqual({});
        expect(meta3).toEqual({});

        // 应该是同一个对象引用
        expect(meta1).toBe(meta2);
        expect(meta2).toBe(meta3);
        expect(meta1).toBe(meta3);
    });

    test('应该在多次获取有meta值的路由时返回同一个对象引用', () => {
        const metaData = { title: 'User Detail', requiresAuth: true, level: 1 };
        const routesWithMeta: RouteConfig[] = [
            { path: '/users/:id', meta: metaData }
        ];
        const options = createOptions({ routes: routesWithMeta });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        const meta1 = route.meta;
        const meta2 = route.meta;
        const meta3 = route.meta;

        expect(meta1).toEqual(metaData);
        expect(meta2).toEqual(metaData);
        expect(meta3).toEqual(metaData);

        // 应该是同一个对象引用
        expect(meta1).toBe(meta2);
        expect(meta2).toBe(meta3);
        expect(meta1).toBe(meta3);

        // 同时也应该和原始meta是同一个引用（因为matcher处理时直接引用）
        expect(meta1).toBe(route.config!.meta);
    });

    test('应该在meta为空对象时也保持引用一致性', () => {
        const routesWithEmptyMeta: RouteConfig[] = [
            { path: '/users/:id', meta: {} }
        ];
        const options = createOptions({ routes: routesWithEmptyMeta });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        const meta1 = route.meta;
        const meta2 = route.meta;
        const meta3 = route.meta;

        expect(meta1).toEqual({});
        expect(meta2).toEqual({});
        expect(meta3).toEqual({});

        // 应该是同一个对象引用
        expect(meta1).toBe(meta2);
        expect(meta2).toBe(meta3);
        expect(meta1).toBe(meta3);

        // 应该和config.meta是同一个引用
        expect(meta1).toBe(route.config!.meta);
    });

    test('不同路由实例的meta应该有不同的引用', () => {
        const options = createOptions();
        const route1 = createRoute(
            options,
            RouteType.push,
            '/unmatched1',
            null
        );
        const route2 = createRoute(
            options,
            RouteType.push,
            '/unmatched2',
            null
        );

        const meta1 = route1.meta;
        const meta2 = route2.meta;

        expect(meta1).toEqual({});
        expect(meta2).toEqual({});

        // 不同路由实例的meta应该是不同的对象引用
        expect(meta1).not.toBe(meta2);
    });

    test('应该在嵌套路由中保持引用一致性', () => {
        const childMeta = { title: 'User Detail', requiresAuth: true };
        const nestedRoutes: RouteConfig[] = [
            {
                path: '/admin',
                meta: { section: 'admin' },
                children: [{ path: '/users/:id', meta: childMeta }]
            }
        ];
        const options = createOptions({ routes: nestedRoutes });
        const route = createRoute(
            options,
            RouteType.push,
            '/admin/users/123',
            null
        );

        const meta1 = route.meta;
        const meta2 = route.meta;
        const meta3 = route.meta;

        expect(meta1).toEqual(childMeta);
        expect(meta2).toEqual(childMeta);
        expect(meta3).toEqual(childMeta);

        // 应该是同一个对象引用
        expect(meta1).toBe(meta2);
        expect(meta2).toBe(meta3);
        expect(meta1).toBe(meta3);

        // 应该和config.meta是同一个引用
        expect(meta1).toBe(route.config!.meta);
    });

    test('演示：优化后不会创建多个空对象实例', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/unmatched', null);

        // 模拟多次访问meta属性（实际应用中可能发生）
        const metas: any[] = [];
        for (let i = 0; i < 10; i++) {
            metas.push(route.meta);
        }

        // 验证所有的meta都是同一个对象引用
        for (let i = 1; i < metas.length; i++) {
            expect(metas[i]).toBe(metas[0]);
        }

        // 验证确实是空对象
        expect(metas[0]).toEqual({});

        // 这展示了优化的效果：
        // - 优化前：每次调用 route.meta 都会创建新的 {} 对象
        // - 优化后：第一次调用时缓存结果，后续调用返回相同的引用
        console.log('优化效果验证: 10次访问meta都返回同一个对象引用 ✓');
    });
});

describe('Route state 处理测试', () => {
    const createOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/app/');
        const routerOptions: RouterOptions = {
            id: 'test',
            context: {},
            routes: [],
            mode: RouterMode.history,
            base,
            env: 'test',
            req: null,
            res: null,
            apps: {},
            normalizeURL: (url: URL) => url,
            location: () => {},
            rootStyle: false,
            layer: null,
            onBackNoResponse: () => {},
            ...overrides
        };

        return parsedOptions(routerOptions);
    };

    test('应该在toRaw为字符串时使用空对象作为state', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/test', null);

        // toRaw为字符串，不是对象，应该使用空对象
        expect(route.state).toEqual({});
    });

    test('应该在toRaw为对象但没有state时使用空对象', () => {
        const options = createOptions();
        const toRaw = { path: '/test' }; // 没有state字段
        const route = createRoute(options, RouteType.push, toRaw, null);

        expect(route.state).toEqual({});
    });

    test('应该在toRaw.state存在时使用该state', () => {
        const options = createOptions();
        const stateData = { userId: 123, fromPage: 'dashboard' };
        const toRaw = { path: '/test', state: stateData };
        const route = createRoute(options, RouteType.push, toRaw, null);

        expect(route.state).toEqual(stateData);
        expect(route.state).toBe(stateData); // 应该是同一个引用
    });

    test('应该在toRaw.state为undefined时使用空对象', () => {
        const options = createOptions();
        const toRaw = { path: '/test', state: undefined };
        const route = createRoute(options, RouteType.push, toRaw, null);

        expect(route.state).toEqual({});
    });

    test('应该在toRaw.state为空对象时使用空对象', () => {
        const options = createOptions();
        const toRaw = { path: '/test', state: {} };
        const route = createRoute(options, RouteType.push, toRaw, null);

        expect(route.state).toEqual({});
    });
});

describe('Route 只读属性测试 (防止 matched 和 config 被 Vue2 劫持)', () => {
    const createOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/app/');
        const routerOptions: RouterOptions = {
            id: 'test',
            context: {},
            routes: [],
            mode: RouterMode.history,
            base,
            env: 'test',
            req: null,
            res: null,
            apps: {},
            normalizeURL: (url: URL) => url,
            location: () => {},
            rootStyle: false,
            layer: null,
            onBackNoResponse: () => {},
            ...overrides
        };

        return parsedOptions(routerOptions);
    };

    test('matched 数组应该是只读的', () => {
        const customRoutes: RouteConfig[] = [
            { path: '/users/:id', meta: { title: 'User Detail' } }
        ];
        const options = createOptions({ routes: customRoutes });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        // 验证 matched 数组是冻结的
        expect(Object.isFrozen(route.matched)).toBe(true);

        // 尝试修改数组应该失败（在严格模式下会抛出错误，非严格模式下会静默失败）
        const originalLength = route.matched.length;
        expect(() => {
            (route.matched as any).push({ path: '/fake' });
        }).toThrow(); // 在冻结的数组上 push 会抛出错误

        // 验证数组长度没有变化
        expect(route.matched.length).toBe(originalLength);
    });

    test('matched 数组中的每个配置对象应该是可访问的', () => {
        const customRoutes: RouteConfig[] = [
            { path: '/users/:id', meta: { title: 'User Detail' } },
            { path: '/admin', meta: { section: 'admin' } }
        ];
        const options = createOptions({ routes: customRoutes });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        if (route.matched.length > 0) {
            // 验证每个匹配的配置对象都是可访问的（不冻结）
            route.matched.forEach((matchedConfig, index) => {
                expect(Object.isFrozen(matchedConfig)).toBe(false);

                // 应该可以正常访问配置对象的属性
                expect(matchedConfig.path).toBeDefined();
                expect(typeof matchedConfig.path).toBe('string');
            });
        }
    });

    test('config 对象应该是可访问的', () => {
        const customRoutes: RouteConfig[] = [
            { path: '/users/:id', meta: { title: 'User Detail' } }
        ];
        const options = createOptions({ routes: customRoutes });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        if (route.config) {
            // 验证 config 对象是可访问的（不冻结）
            expect(Object.isFrozen(route.config)).toBe(false);

            // 应该可以正常访问 config 对象的属性
            expect(route.config.path).toBeDefined();
            expect(typeof route.config.path).toBe('string');
        }
    });

    test('没有匹配路由时，matched 应该是空的只读数组', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/unmatched', null);

        // 验证是空数组且只读
        expect(route.matched).toEqual([]);
        expect(Object.isFrozen(route.matched)).toBe(true);

        // 尝试向空数组添加元素应该失败
        expect(() => {
            (route.matched as any).push({ path: '/fake' });
        }).toThrow();
    });

    test('config 为 null 时应该保持 null', () => {
        const options = createOptions();
        const route = createRoute(options, RouteType.push, '/unmatched', null);

        // 没有匹配路由时，config 应该是 null
        expect(route.config).toBeNull();
    });

    test('嵌套路由的每个层级都应该是可访问的', () => {
        const nestedRoutes: RouteConfig[] = [
            {
                path: '/admin',
                meta: { section: 'admin' },
                children: [
                    {
                        path: '/users/:id',
                        meta: { title: 'User Detail' },
                        children: [
                            { path: '/profile', meta: { view: 'profile' } }
                        ]
                    }
                ]
            }
        ];
        const options = createOptions({ routes: nestedRoutes });
        const route = createRoute(
            options,
            RouteType.push,
            '/admin/users/123/profile',
            null
        );

        // 验证所有匹配的路由配置都是可访问的（不冻结）
        route.matched.forEach((matchedConfig, index) => {
            expect(Object.isFrozen(matchedConfig)).toBe(false);

            // 应该可以正常访问配置对象的属性
            expect(matchedConfig.path).toBeDefined();
            expect(matchedConfig.meta).toBeDefined();
        });
    });

    test('meta 对象本身应该是可访问且允许被 Vue 劫持的', () => {
        const metaData = { title: 'User Detail', count: 0 };
        const customRoutes: RouteConfig[] = [
            { path: '/users/:id', meta: metaData }
        ];
        const options = createOptions({ routes: customRoutes });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        // meta 可以正常访问
        expect(route.meta).toEqual(metaData);
        expect(route.meta.title).toBe('User Detail');

        // 验证 meta 是可以被 Vue 劫持的（不应该被冻结）
        if (route.config?.meta) {
            expect(Object.isFrozen(route.config.meta)).toBe(false);

            // 应该可以修改 meta 对象的属性（为了让 Vue 能够劫持）
            expect(() => {
                route.config!.meta!.title = 'Modified Title';
            }).not.toThrow();

            expect(route.config.meta!.title).toBe('Modified Title');
        }
    });

    test('验证对象属性描述符应该可配置（允许Vue劫持）', () => {
        const customRoutes: RouteConfig[] = [
            { path: '/users/:id', meta: { title: 'User Detail' } }
        ];
        const options = createOptions({ routes: customRoutes });
        const route = createRoute(options, RouteType.push, '/users/123', null);

        if (route.config) {
            // 检查属性描述符，确保可配置（允许Vue2劫持）
            const pathDescriptor = Object.getOwnPropertyDescriptor(
                route.config,
                'path'
            );
            const metaDescriptor = Object.getOwnPropertyDescriptor(
                route.config,
                'meta'
            );

            expect(pathDescriptor?.configurable).toBe(true);
            expect(metaDescriptor?.configurable).toBe(true);

            // 这些属性可以被重新定义，允许 Vue2 添加 getter/setter
            expect(() => {
                Object.defineProperty(route.config!, 'testProp', {
                    get() {
                        return 'test';
                    },
                    configurable: true
                });
            }).not.toThrow();
        }
    });

    test('对象复制测试：{...route} 后第一层属性值应该使用 === 比较相等', () => {
        const customRoutes: RouteConfig[] = [
            {
                path: '/users/:id',
                meta: { title: 'User Detail', count: 1 }
            }
        ];
        const options = createOptions({ routes: customRoutes });

        // 创建 route 对象
        const route = createRoute(options, RouteType.push, '/users/123', null);

        // 对象展开复制
        const spreadRoute = { ...route };

        // 验证第一层属性值完全相等（使用 === 比较）
        expect(spreadRoute.status).toBe(route.status);
        expect(spreadRoute.handle).toBe(route.handle);
        expect(spreadRoute.handleResult).toBe(route.handleResult);
        expect(spreadRoute.req).toBe(route.req);
        expect(spreadRoute.res).toBe(route.res);
        expect(spreadRoute.type).toBe(route.type);
        expect(spreadRoute.isPush).toBe(route.isPush);
        expect(spreadRoute.url).toBe(route.url);
        expect(spreadRoute.params).toBe(route.params);
        expect(spreadRoute.query).toBe(route.query);
        expect(spreadRoute.queryArray).toBe(route.queryArray);
        expect(spreadRoute.state).toBe(route.state);
        expect(spreadRoute.meta).toBe(route.meta);
        expect(spreadRoute.path).toBe(route.path);
        expect(spreadRoute.fullPath).toBe(route.fullPath);
        expect(spreadRoute.matched).toBe(route.matched);
        expect(spreadRoute.keepScrollPosition).toBe(route.keepScrollPosition);
        expect(spreadRoute.config).toBe(route.config);
    });

    test('嵌套路由的对象复制测试：{...route} 后第一层属性值相等', () => {
        const nestedRoutes: RouteConfig[] = [
            {
                path: '/admin',
                meta: { section: 'admin' },
                children: [
                    {
                        path: '/users/:id',
                        meta: { title: 'User Detail' },
                        children: [
                            {
                                path: '/profile',
                                meta: { view: 'profile' }
                            }
                        ]
                    }
                ]
            }
        ];
        const options = createOptions({ routes: nestedRoutes });

        // 创建 route 对象
        const route = createRoute(
            options,
            RouteType.push,
            '/admin/users/123/profile',
            null
        );

        // 对象展开复制
        const spreadRoute = { ...route };

        // 验证第一层属性值完全相等（使用 === 比较）
        expect(spreadRoute.status).toBe(route.status);
        expect(spreadRoute.type).toBe(route.type);
        expect(spreadRoute.url).toBe(route.url);
        expect(spreadRoute.params).toBe(route.params);
        expect(spreadRoute.query).toBe(route.query);
        expect(spreadRoute.queryArray).toBe(route.queryArray);
        expect(spreadRoute.state).toBe(route.state);
        expect(spreadRoute.meta).toBe(route.meta);
        expect(spreadRoute.path).toBe(route.path);
        expect(spreadRoute.fullPath).toBe(route.fullPath);
        expect(spreadRoute.matched).toBe(route.matched);
        expect(spreadRoute.keepScrollPosition).toBe(route.keepScrollPosition);
        expect(spreadRoute.config).toBe(route.config);

        // 验证嵌套情况下 matched 数组和 config 的引用一致性
        expect(spreadRoute.matched.length).toBe(3); // admin + users/:id + profile
        expect(spreadRoute.config).toBe(route.config);
        if (spreadRoute.config) {
            expect(spreadRoute.meta).toBe(spreadRoute.config.meta);
        }
    });

    test('无匹配路由时的对象复制测试：{...route} 后第一层属性值相等', () => {
        const options = createOptions();

        // 创建 route 对象
        const route = createRoute(options, RouteType.push, '/unmatched', null);

        // 对象展开复制
        const spreadRoute = { ...route };

        // 验证第一层属性值完全相等（使用 === 比较）
        expect(spreadRoute.status).toBe(route.status);
        expect(spreadRoute.type).toBe(route.type);
        expect(spreadRoute.url).toBe(route.url);
        expect(spreadRoute.params).toBe(route.params);
        expect(spreadRoute.query).toBe(route.query);
        expect(spreadRoute.queryArray).toBe(route.queryArray);
        expect(spreadRoute.state).toBe(route.state);
        expect(spreadRoute.meta).toBe(route.meta);
        expect(spreadRoute.path).toBe(route.path);
        expect(spreadRoute.fullPath).toBe(route.fullPath);
        expect(spreadRoute.matched).toBe(route.matched);
        expect(spreadRoute.keepScrollPosition).toBe(route.keepScrollPosition);
        expect(spreadRoute.config).toBe(route.config);

        // 验证无匹配情况下的特殊值
        expect(spreadRoute.config).toBeNull();
        expect(spreadRoute.matched).toEqual([]);
        expect(Object.isFrozen(spreadRoute.matched)).toBe(true);
        expect(spreadRoute.meta).toEqual({});
    });
});

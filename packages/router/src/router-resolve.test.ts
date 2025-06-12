import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Router } from './router';
import { RouteStatus, RouteType, RouterMode } from './types';
import type { Route } from './types';

describe('Router.resolve 测试', () => {
    let router: Router;

    beforeEach(async () => {
        router = new Router({
            mode: RouterMode.abstract,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/',
                    component: () => 'Home',
                    meta: { title: 'Home Page' }
                },
                {
                    path: '/about',
                    component: () => 'About',
                    meta: { title: 'About Page', requiresAuth: false }
                },
                {
                    path: '/user/:id',
                    component: () => 'User',
                    meta: { title: 'User Profile', requiresAuth: true },
                    children: [
                        {
                            path: '/profile',
                            component: () => 'UserProfile',
                            meta: { section: 'profile' }
                        },
                        {
                            path: '/settings',
                            component: () => 'UserSettings',
                            meta: { section: 'settings' }
                        }
                    ]
                },
                {
                    path: '/admin',
                    component: () => 'Admin',
                    meta: { requiresAuth: true, role: 'admin' },
                    children: [
                        {
                            path: '/users',
                            component: () => 'AdminUsers',
                            meta: { section: 'users' }
                        },
                        {
                            path: '/settings',
                            component: () => 'AdminSettings',
                            meta: { section: 'settings' }
                        }
                    ]
                },
                {
                    path: '/products/:category/:id',
                    component: () => 'Product',
                    meta: { title: 'Product Detail' }
                }
            ]
        });

        await router.replace('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('🎯 核心解析功能', () => {
        test('应该返回完整的 Route 对象', () => {
            const route = router.resolve('/about');

            expect(route).toBeInstanceOf(Object);
            expect(route.type).toBe(RouteType.none);
            expect(route.status).toBe(RouteStatus.resolve);
            expect(route.path).toBe('/about');
            expect(route.fullPath).toBe('/about');
            expect(route.url).toBeInstanceOf(URL);
            expect(route.params).toBeInstanceOf(Object);
            expect(route.query).toBeInstanceOf(Object);
            expect(route.meta).toBeInstanceOf(Object);
            expect(route.matched).toBeInstanceOf(Array);
        });

        test('应该不触发实际导航', () => {
            const originalPath = router.route.path;

            router.resolve('/about');
            router.resolve('/user/123');
            router.resolve('/admin/users');

            // 当前路由应该保持不变
            expect(router.route.path).toBe(originalPath);
        });

        test('应该正确解析字符串路径', () => {
            const route = router.resolve('/user/123');

            expect(route.path).toBe('/user/123');
            expect(route.params.id).toBe('123');
            expect(route.matched.length).toBeGreaterThan(0);
            expect(route.config).not.toBeNull();
        });

        test('应该正确解析对象配置', () => {
            const route = router.resolve({
                path: '/user/456',
                query: { tab: 'profile', active: 'true' },
                hash: '#section1'
            });

            expect(route.path).toBe('/user/456');
            expect(route.params.id).toBe('456');
            expect(route.query.tab).toBe('profile');
            expect(route.query.active).toBe('true');
            expect(route.url.hash).toBe('#section1');
            expect(route.fullPath).toBe(
                '/user/456?tab=profile&active=true#section1'
            );
        });
    });

    describe('🔍 路径解析与参数提取', () => {
        test('应该正确解析单个路径参数', () => {
            const route = router.resolve('/user/123');

            expect(route.params.id).toBe('123');
            expect(route.path).toBe('/user/123');
            expect(route.matched.length).toBe(1);
        });

        test('应该正确解析多个路径参数', () => {
            const route = router.resolve('/products/electronics/laptop-123');

            expect(route.params.category).toBe('electronics');
            expect(route.params.id).toBe('laptop-123');
            expect(route.path).toBe('/products/electronics/laptop-123');
        });

        test('应该正确解析查询参数', () => {
            const route = router.resolve(
                '/about?lang=en&theme=dark&debug=true'
            );

            expect(route.query.lang).toBe('en');
            expect(route.query.theme).toBe('dark');
            expect(route.query.debug).toBe('true');
            expect(route.queryArray.lang).toEqual(['en']);
            expect(route.queryArray.theme).toEqual(['dark']);
        });

        test('应该正确处理重复查询参数', () => {
            const route = router.resolve(
                '/about?tags=vue&tags=router&tags=test'
            );

            expect(route.query.tags).toBe('vue'); // 第一个值
            expect(route.queryArray.tags).toEqual(['vue', 'router', 'test']);
        });

        test('应该正确解析 hash 片段', () => {
            const route = router.resolve('/about#introduction');

            expect(route.url.hash).toBe('#introduction');
            expect(route.fullPath).toBe('/about#introduction');
        });

        test('应该正确处理复杂的 URL 组合', () => {
            const route = router.resolve(
                '/user/123?tab=profile&edit=true#personal-info'
            );

            expect(route.params.id).toBe('123');
            expect(route.query.tab).toBe('profile');
            expect(route.query.edit).toBe('true');
            expect(route.url.hash).toBe('#personal-info');
            expect(route.fullPath).toBe(
                '/user/123?tab=profile&edit=true#personal-info'
            );
        });
    });

    describe('🏗️ 嵌套路由解析', () => {
        test('应该正确解析嵌套路由', () => {
            const route = router.resolve('/user/123/profile');

            expect(route.params.id).toBe('123');
            expect(route.path).toBe('/user/123/profile');
            expect(route.matched.length).toBe(2); // 父路由 + 子路由
            expect(route.config?.meta?.section).toBe('profile');
        });

        test('应该正确解析深层嵌套路由', () => {
            const route = router.resolve('/admin/users');

            expect(route.path).toBe('/admin/users');
            expect(route.matched.length).toBe(2);
            expect(route.config?.meta?.section).toBe('users');
        });

        test('应该返回最后匹配路由的配置', () => {
            const route = router.resolve('/user/123/settings');

            expect(route.config?.meta?.section).toBe('settings');
            expect(route.meta.section).toBe('settings');
            // 应该是子路由的 meta，不是父路由的
            expect(route.meta.title).toBeUndefined();
        });
    });

    describe('📋 元信息处理', () => {
        test('应该正确返回路由元信息', () => {
            const route = router.resolve('/about');

            expect(route.meta.title).toBe('About Page');
            expect(route.meta.requiresAuth).toBe(false);
        });

        test('应该在嵌套路由中返回最后匹配路由的元信息', () => {
            const route = router.resolve('/user/123/profile');

            expect(route.meta.section).toBe('profile');
            // 应该是子路由的 meta，不包含父路由的 meta
            expect(route.meta.title).toBeUndefined();
            expect(route.meta.requiresAuth).toBeUndefined();
        });

        test('应该在没有元信息时返回空对象', () => {
            // 创建一个没有 meta 的路由
            const testRouter = new Router({
                mode: RouterMode.abstract,
                base: new URL('http://localhost:3000/'),
                routes: [
                    {
                        path: '/no-meta',
                        component: () => 'NoMeta'
                    }
                ]
            });

            const route = testRouter.resolve('/no-meta');
            expect(route.meta).toEqual({});

            testRouter.destroy();
        });
    });

    describe('❌ 错误处理与边界情况', () => {
        test('应该正确处理不存在的路由', () => {
            const route = router.resolve('/non-existent');

            expect(route.matched).toEqual([]);
            expect(route.config).toBeNull();
            expect(route.meta).toEqual({});
            expect(route.params).toEqual({});
            expect(route.path).toBe('/non-existent');
        });

        test('应该正确处理根路径', () => {
            const route = router.resolve('/');

            expect(route.path).toBe('/');
            expect(route.matched.length).toBe(1);
            expect(route.meta.title).toBe('Home Page');
        });

        test('应该正确处理空字符串路径', () => {
            const route = router.resolve('');

            expect(route.path).toBe('/');
            expect(route.matched.length).toBe(1);
        });

        test('应该正确处理相对路径', () => {
            const route = router.resolve('about');

            expect(route.path).toBe('/about');
            expect(route.matched.length).toBe(1);
        });

        test('应该正确处理带有特殊字符的路径', () => {
            const route = router.resolve('/user/test%20user');

            expect(route.params.id).toBe('test%20user');
            expect(route.path).toBe('/user/test%20user');
        });

        test('应该正确处理 URL 编码的参数', () => {
            const route = router.resolve('/user/john%40example.com');

            expect(route.params.id).toBe('john%40example.com');
            expect(route.path).toBe('/user/john%40example.com');
        });
    });

    describe('🔗 对象参数解析', () => {
        test('应该正确处理带有 params 的对象', () => {
            const route = router.resolve({
                path: '/user/789'
            });

            expect(route.params.id).toBe('789');
            expect(route.path).toBe('/user/789');
        });

        test('应该正确处理带有 query 的对象', () => {
            const route = router.resolve({
                path: '/about',
                query: { lang: 'zh', version: '2.0' }
            });

            expect(route.query.lang).toBe('zh');
            expect(route.query.version).toBe('2.0');
            expect(route.fullPath).toBe('/about?lang=zh&version=2.0');
        });

        test('应该正确处理带有 hash 的对象', () => {
            const route = router.resolve({
                path: '/about',
                hash: '#features'
            });

            expect(route.url.hash).toBe('#features');
            expect(route.fullPath).toBe('/about#features');
        });

        test('应该正确处理带有 state 的对象', () => {
            const customState = { from: 'navigation', timestamp: Date.now() };
            const route = router.resolve({
                path: '/about',
                state: customState
            });

            expect(route.state).toEqual(customState);
        });

        test('应该正确处理 keepScrollPosition 选项', () => {
            const route = router.resolve({
                path: '/about',
                keepScrollPosition: true
            });

            expect(route.keepScrollPosition).toBe(true);
        });
    });

    describe('🔄 URL 处理', () => {
        test('应该正确处理完整的 URL', () => {
            const route = router.resolve('http://localhost:3000/about');

            expect(route.path).toBe('/about');
            expect(route.url.href).toBe('http://localhost:3000/about');
        });

        test('应该正确处理不同域名的 URL', () => {
            const route = router.resolve('https://example.com/external');

            // 外部 URL 不应该匹配路由
            expect(route.matched).toEqual([]);
            expect(route.config).toBeNull();
        });

        test('应该正确处理带端口的 URL', () => {
            const route = router.resolve('http://localhost:8080/about');

            // 不同端口应该被视为外部 URL
            expect(route.matched).toEqual([]);
            expect(route.config).toBeNull();
        });
    });

    describe('🎭 类型和状态验证', () => {
        test('解析的路由应该具有正确的类型', () => {
            const route = router.resolve('/about');

            expect(route.type).toBe(RouteType.none);
            expect(route.isPush).toBe(false);
        });

        test('解析的路由应该具有 resolve 状态', () => {
            const route = router.resolve('/about');

            expect(route.status).toBe(RouteStatus.resolve);
        });

        test('解析的路由应该具有正确的 URL 对象', () => {
            const route = router.resolve('/about?lang=en#intro');

            expect(route.url).toBeInstanceOf(URL);
            expect(route.url.pathname).toBe('/about');
            expect(route.url.search).toBe('?lang=en');
            expect(route.url.hash).toBe('#intro');
        });

        test('解析的路由应该具有冻结的 matched 数组', () => {
            const route = router.resolve('/about');

            expect(Object.isFrozen(route.matched)).toBe(true);
        });
    });

    describe('🔧 实用场景测试', () => {
        test('应该支持生成链接 URL 而不进行跳转', () => {
            const route = router.resolve('/user/123?tab=profile');
            const linkUrl = route.url.href;

            expect(linkUrl).toBe('http://localhost:3000/user/123?tab=profile');
            expect(router.route.path).toBe('/'); // 当前路由未改变
        });

        test('应该支持预检查路由匹配情况', () => {
            const validRoute = router.resolve('/about');
            const invalidRoute = router.resolve('/non-existent');

            expect(validRoute.matched.length).toBeGreaterThan(0);
            expect(invalidRoute.matched.length).toBe(0);
        });

        test('应该支持获取路由参数和元信息', () => {
            const route = router.resolve('/user/123/profile');

            expect(route.params.id).toBe('123');
            expect(route.meta.section).toBe('profile');
            expect(route.config?.path).toBe('/profile');
        });

        test('应该支持测试路由配置的有效性', () => {
            const testCases = [
                { path: '/', shouldMatch: true },
                { path: '/about', shouldMatch: true },
                { path: '/user/123', shouldMatch: true },
                { path: '/admin/users', shouldMatch: true },
                { path: '/invalid', shouldMatch: false },
                { path: '/user', shouldMatch: false } // 缺少必需参数
            ];

            testCases.forEach(({ path, shouldMatch }) => {
                const route = router.resolve(path);
                if (shouldMatch) {
                    expect(route.matched.length).toBeGreaterThan(0);
                    expect(route.config).not.toBeNull();
                } else {
                    expect(route.matched.length).toBe(0);
                    expect(route.config).toBeNull();
                }
            });
        });
    });
});

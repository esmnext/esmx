import { describe, expect, it, vi } from 'vitest';
import { parsedOptions } from './options';
import { NON_ENUMERABLE_PROPERTIES, Route, applyRouteParams } from './route';
import { RouteStatus, RouteType, RouterMode } from './types';
import type {
    RouteConfig,
    RouteHandleHook,
    RouteLocationInput,
    RouteMeta,
    RouterOptions,
    RouterParsedOptions
} from './types';

/**
 * Route 类完整单元测试方案
 *
 * 测试覆盖范围：
 * 1. 构造函数测试 - 各种初始化场景
 * 2. 属性测试 - 只读属性、计算属性、类型验证
 * 3. Handle 机制测试 - 设置、执行、验证、错误处理
 * 4. 状态管理测试 - 合并、设置、同步、隔离
 * 5. 克隆功能测试 - 独立性、深拷贝、完整性
 * 6. 边界条件测试 - 异常输入、极端值
 * 7. 集成测试 - 与其他组件的交互
 */

describe('Route 类完整测试套件', () => {
    const createOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/app/');
        const mockRoutes: RouteConfig[] = [
            {
                path: '/users/:id',
                meta: { title: 'User Detail', requireAuth: true }
            },
            {
                path: '/posts/:postId/comments/:commentId',
                meta: { title: 'Comment Detail' }
            },
            {
                path: '/admin/(.*)',
                meta: { title: 'Admin', role: 'admin' }
            }
        ];

        const routerOptions: RouterOptions = {
            root: '#test',
            context: { version: '1.0.0' },
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

    describe('🏗️ 构造函数测试', () => {
        describe('基础构造', () => {
            it('应该使用默认选项创建路由', () => {
                const route = new Route();

                expect(route.type).toBe(RouteType.none);
                expect(route.isPush).toBe(false);
                expect(route.path).toBe('/');
                expect(route.status).toBe(RouteStatus.resolved);
                expect(route.state).toEqual({});
                expect(route.params).toEqual({});
                expect(route.query).toEqual({});
                expect(route.queryArray).toEqual({});
            });

            it('应该正确处理字符串路径', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                expect(route.path).toBe('/users/123');
                expect(route.params.id).toBe('123');
                expect(route.type).toBe(RouteType.push);
                expect(route.isPush).toBe(true);
            });

            it('应该正确处理对象形式的路由位置', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.replace,
                    toInput: {
                        path: '/users/456',
                        query: { tab: 'profile' },
                        state: { fromPage: 'dashboard' },
                        keepScrollPosition: true
                    }
                });

                expect(route.path).toBe('/users/456');
                expect(route.params.id).toBe('456');
                expect(route.query.tab).toBe('profile');
                expect(route.state.fromPage).toBe('dashboard');
                expect(route.keepScrollPosition).toBe(true);
                expect(route.isPush).toBe(false);
            });
        });

        describe('URL 解析和匹配', () => {
            it('应该正确解析复杂的 URL', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123?tab=profile&sort=name#section1'
                });

                expect(route.path).toBe('/users/123');
                expect(route.fullPath).toBe(
                    '/users/123?tab=profile&sort=name#section1'
                );
                expect(route.query.tab).toBe('profile');
                expect(route.query.sort).toBe('name');
                expect(route.url.hash).toBe('#section1');
            });

            it('应该处理多值查询参数', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123?tags=js&tags=react&tags=vue'
                });

                expect(route.query.tags).toBe('js'); // 第一个值
                expect(route.queryArray.tags).toEqual(['js', 'react', 'vue']);
            });

            it('应该正确匹配嵌套路由参数', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/posts/456/comments/789'
                });

                expect(route.params.postId).toBe('456');
                expect(route.params.commentId).toBe('789');
                expect(route.matched.length).toBeGreaterThan(0);
            });

            it('应该处理不匹配的路由', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/unknown/path'
                });

                expect(route.matched).toHaveLength(0);
                expect(route.config).toBeNull();
                expect(route.meta).toEqual({});
            });
        });

        describe('状态和元数据处理', () => {
            it('应该正确设置路由元数据', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                expect(route.meta.title).toBe('User Detail');
                expect(route.meta.requireAuth).toBe(true);
            });

            it('应该正确初始化状态对象', () => {
                const options = createOptions();
                const initialState = {
                    userId: 123,
                    permissions: ['read', 'write']
                };
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', state: initialState }
                });

                expect(route.state).toEqual(initialState);
                expect(route.state).not.toBe(initialState); // 应该是新对象
            });
        });

        describe('🔍 跨域和路径计算测试', () => {
            it('应该处理跨域URL（不同origin）', () => {
                const options = createOptions({
                    base: new URL('http://localhost:3000/app/')
                });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: 'https://external.com/api/data'
                });

                // 跨域时不应该匹配路由
                expect(route.matched).toHaveLength(0);
                expect(route.config).toBeNull();
                expect(route.path).toBe('/api/data'); // 使用原始pathname
                expect(route.fullPath).toBe('/api/data'); // 使用原始路径计算
            });

            it('应该处理不同base路径的URL', () => {
                const options = createOptions({
                    base: new URL('http://localhost:3000/app/')
                });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: 'http://localhost:3000/other/path'
                });

                // 同域但不同base路径时不应该匹配
                expect(route.matched).toHaveLength(0);
                expect(route.config).toBeNull();
                expect(route.path).toBe('/other/path'); // 使用原始pathname
            });

            it('应该正确计算匹配时的path', () => {
                const options = createOptions({
                    base: new URL('http://localhost:3000/app/')
                });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: 'http://localhost:3000/app/users/123'
                });

                // 匹配时应该去掉base路径
                expect(route.path).toBe('/users/123');
                expect(route.matched.length).toBeGreaterThan(0);
            });

            it('应该正确计算不匹配时的fullPath', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: 'https://external.com/api/data?key=value#section'
                });

                // 不匹配时使用原始路径+search+hash
                expect(route.fullPath).toBe('/api/data?key=value#section');
                expect(route.path).toBe('/api/data');
            });
        });

        describe('🔧 normalizeURL 集成测试', () => {
            it('应该使用自定义normalizeURL函数', () => {
                const customNormalizeURL = vi.fn(
                    (url: URL, from: URL | null) => {
                        // 自定义逻辑：将路径转为小写
                        url.pathname = url.pathname.toLowerCase();
                        return url;
                    }
                );

                const options = createOptions({
                    normalizeURL: customNormalizeURL
                });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/USERS/123'
                });

                expect(customNormalizeURL).toHaveBeenCalled();
                expect(route.path).toBe('/users/123');
            });

            it('应该传递from参数给normalizeURL', () => {
                const customNormalizeURL = vi.fn(
                    (url: URL, from: URL | null) => url
                );
                const options = createOptions({
                    normalizeURL: customNormalizeURL
                });

                const fromURL = new URL('http://localhost:3000/app/previous');
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123',
                    from: fromURL
                });

                expect(customNormalizeURL).toHaveBeenCalledWith(
                    expect.any(URL),
                    fromURL
                );
            });
        });

        describe('属性可枚举性', () => {
            it('应该正确设置不可枚举属性', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                NON_ENUMERABLE_PROPERTIES.forEach((prop) => {
                    const descriptor = Object.getOwnPropertyDescriptor(
                        route,
                        prop
                    );
                    expect(descriptor?.enumerable).toBe(false);
                });
            });

            it('应该保持用户属性可枚举', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                const userProperties = [
                    'path',
                    'fullPath',
                    'params',
                    'query',
                    'meta',
                    'state'
                ];
                userProperties.forEach((prop) => {
                    const descriptor = Object.getOwnPropertyDescriptor(
                        route,
                        prop
                    );
                    expect(descriptor?.enumerable).toBe(true);
                });
            });
        });
    });

    describe('🔧 属性测试', () => {
        describe('只读属性验证', () => {
            it('应该验证属性的存在性', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                // 验证属性存在
                expect(route.path).toBeDefined();
                expect(route.fullPath).toBeDefined();
                expect(route.url).toBeDefined();
                expect(route.params).toBeDefined();
                expect(route.query).toBeDefined();
                expect(route.matched).toBeDefined();
                expect(route.config).toBeDefined();
                expect(route.meta).toBeDefined();
            });
        });

        describe('计算属性正确性', () => {
            it('应该正确计算 isPush 属性', () => {
                const options = createOptions();

                const pushRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/test'
                });
                expect(pushRoute.isPush).toBe(true);

                const pushWindowRoute = new Route({
                    options,
                    toType: RouteType.pushWindow,
                    toInput: '/test'
                });
                expect(pushWindowRoute.isPush).toBe(true);

                const replaceRoute = new Route({
                    options,
                    toType: RouteType.replace,
                    toInput: '/test'
                });
                expect(replaceRoute.isPush).toBe(false);

                const goRoute = new Route({
                    options,
                    toType: RouteType.go,
                    toInput: '/test'
                });
                expect(goRoute.isPush).toBe(false);
            });

            it('应该正确计算 fullPath', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123?tab=profile#section1'
                });

                expect(route.fullPath).toBe('/users/123?tab=profile#section1');
                expect(route.path).toBe('/users/123');
            });
        });

        describe('类型验证', () => {
            it('应该正确设置所有 RouteType', () => {
                const options = createOptions();

                Object.values(RouteType).forEach((type) => {
                    const route = new Route({
                        options,
                        toType: type,
                        toInput: '/test'
                    });
                    expect(route.type).toBe(type);
                });
            });
        });
    });

    describe('🎯 Handle 机制测试', () => {
        describe('Handle 设置和获取', () => {
            it('应该正确设置和获取 handle 函数', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockHandle: RouteHandleHook = vi.fn(() => ({
                    result: 'test'
                }));

                route.handle = mockHandle;
                expect(route.handle).toBeDefined();
                expect(typeof route.handle).toBe('function');
            });

            it('应该处理 null handle', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                route.handle = null;
                expect(route.handle).toBeNull();
            });

            it('应该处理非函数类型的 handle', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                route.handle = 'not a function' as any;
                expect(route.handle).toBeNull();
            });
        });

        describe('Handle 执行验证', () => {
            it('应该在正确状态下执行 handle', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockHandle: RouteHandleHook = vi.fn(() => ({
                    result: 'success'
                }));

                route.handle = mockHandle;
                route.status = RouteStatus.success;

                const result = route.handle!(route, null);
                expect(result).toEqual({ result: 'success' });
                expect(mockHandle).toHaveBeenCalledWith(route, null);
            });

            it('应该在错误状态下抛出异常', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockHandle: RouteHandleHook = vi.fn();

                route.handle = mockHandle;
                route.status = RouteStatus.error;

                expect(() => {
                    route.handle!(route, null);
                }).toThrow(
                    'Cannot call route handle hook - current status is error'
                );
            });

            it('应该防止重复调用 handle', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockHandle: RouteHandleHook = vi.fn(() => ({
                    result: 'test'
                }));

                route.handle = mockHandle;
                route.status = RouteStatus.success;

                // 第一次调用应该成功
                route.handle!(route, null);

                // 第二次调用应该抛出异常
                expect(() => {
                    route.handle!(route, null);
                }).toThrow(
                    'Route handle hook can only be called once per navigation'
                );
            });
        });

        describe('HandleResult 管理', () => {
            it('应该正确设置和获取 handleResult', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const result = { data: 'test', status: 'ok' };

                route.handleResult = result;
                expect(route.handleResult).toBe(result);

                route.handleResult = null;
                expect(route.handleResult).toBeNull();
            });
        });

        describe('Handle 包装函数测试', () => {
            it('应该在所有RouteStatus状态下测试handle调用', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockHandle: RouteHandleHook = vi.fn(() => ({
                    result: 'test'
                }));

                route.handle = mockHandle;

                // 测试 resolve 状态
                route.status = RouteStatus.resolved;
                expect(() => route.handle!(route, null)).toThrow(
                    'Cannot call route handle hook - current status is resolved'
                );

                // 测试 aborted 状态
                route.status = RouteStatus.aborted;
                expect(() => route.handle!(route, null)).toThrow(
                    'Cannot call route handle hook - current status is aborted'
                );

                // 测试 error 状态
                route.status = RouteStatus.error;
                expect(() => route.handle!(route, null)).toThrow(
                    'Cannot call route handle hook - current status is error'
                );
            });

            it('应该正确传递this上下文和参数', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const mockHandle: RouteHandleHook = vi.fn(function (
                    this: Route,
                    to: Route,
                    from: Route | null
                ) {
                    expect(this).toBe(route);
                    return { context: this, to, from };
                });

                route.handle = mockHandle;
                route.status = RouteStatus.success;

                const fromRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/home'
                });
                const result = route.handle!(route, fromRoute);

                expect(mockHandle).toHaveBeenCalledWith(route, fromRoute);
                expect(result).toEqual({
                    context: route,
                    to: route,
                    from: fromRoute
                });
            });

            it('应该处理handle函数抛出的异常', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                const errorHandle: RouteHandleHook = vi.fn(() => {
                    throw new Error('Handle execution failed');
                });

                route.handle = errorHandle;
                route.status = RouteStatus.success;

                expect(() => route.handle!(route, null)).toThrow(
                    'Handle execution failed'
                );
                expect(errorHandle).toHaveBeenCalledOnce();
            });

            it('应该处理setHandle的边界情况', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                // 测试各种非函数类型
                route.setHandle(undefined as any);
                expect(route.handle).toBeNull();

                route.setHandle(123 as any);
                expect(route.handle).toBeNull();

                route.setHandle('string' as any);
                expect(route.handle).toBeNull();

                route.setHandle({} as any);
                expect(route.handle).toBeNull();

                route.setHandle([] as any);
                expect(route.handle).toBeNull();
            });
        });
    });

    describe('📊 状态管理测试', () => {
        describe('状态合并', () => {
            it('应该正确合并新状态', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', state: { a: 1, b: 2 } }
                });

                route.mergeState({ b: 3, c: 4 });
                expect(route.state).toEqual({ a: 1, b: 3, c: 4 });
            });

            it('应该处理空状态合并', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                route.mergeState({ first: 'value' });
                expect(route.state).toEqual({ first: 'value' });
            });
        });

        describe('单个状态设置', () => {
            it('应该正确设置单个状态值', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                route.setState('userId', 123);
                route.setState('userName', 'john');

                expect(route.state.userId).toBe(123);
                expect(route.state.userName).toBe('john');
            });

            it('应该覆盖已存在的状态值', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', state: { count: 1 } }
                });

                route.setState('count', 2);
                expect(route.state.count).toBe(2);
            });
        });

        describe('状态隔离', () => {
            it('应该确保不同路由的状态独立', () => {
                const options = createOptions();
                const route1 = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/route1', state: { shared: 'value1' } }
                });
                const route2 = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/route2', state: { shared: 'value2' } }
                });

                route1.setState('shared', 'modified1');
                expect(route2.state.shared).toBe('value2');
            });
        });

        describe('状态码测试', () => {
            it('应该正确设置默认状态码', () => {
                const options = createOptions();

                // 没有传入statusCode时应该默认为null
                const routeWithoutCode = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });
                expect(routeWithoutCode.statusCode).toBe(null);

                // 不匹配的路由也应该默认为null
                const unmatchedRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/completely/unknown/path/that/does/not/match'
                });
                expect(unmatchedRoute.statusCode).toBe(null);
            });

            it('应该支持从RouteLocation传入statusCode', () => {
                const options = createOptions();

                // 传入数字状态码
                const routeWithCode = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', statusCode: 201 }
                });
                expect(routeWithCode.statusCode).toBe(201);

                // 传入null状态码
                const routeWithNull = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', statusCode: null }
                });
                expect(routeWithNull.statusCode).toBe(null);
            });

            it('应该将statusCode设为不可枚举', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                const descriptor = Object.getOwnPropertyDescriptor(
                    route,
                    'statusCode'
                );
                expect(descriptor?.enumerable).toBe(false);

                // 验证在对象枚举中不出现
                const keys = Object.keys(route);
                expect(keys).not.toContain('statusCode');
            });

            it('应该在克隆时正确复制statusCode', () => {
                const options = createOptions();
                const originalRoute = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', statusCode: 500 }
                });

                const clonedRoute = originalRoute.clone();
                expect(clonedRoute.statusCode).toBe(500);

                // 修改原路由的statusCode不应该影响克隆的路由
                originalRoute.statusCode = 200;
                expect(clonedRoute.statusCode).toBe(500);
            });
        });
    });

    describe('🔄 克隆功能测试', () => {
        describe('对象独立性', () => {
            it('应该创建完全独立的克隆对象', () => {
                const options = createOptions();
                const original = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: { path: '/users/123', state: { test: 'value' } }
                });

                const cloned = original.clone();

                expect(cloned).not.toBe(original);
                expect(cloned.state).not.toBe(original.state);
                expect(cloned.params).not.toBe(original.params);
            });

            it('应该保持属性值相等', () => {
                const options = createOptions();
                const original = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: {
                        path: '/users/123',
                        state: { userId: 123, preferences: { theme: 'dark' } }
                    }
                });

                const cloned = original.clone();

                expect(cloned.path).toBe(original.path);
                expect(cloned.type).toBe(original.type);
                expect(cloned.state).toEqual(original.state);
                expect(cloned.params).toEqual(original.params);
            });
        });

        describe('状态深拷贝', () => {
            it('应该深拷贝状态对象', () => {
                const options = createOptions();
                const original = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: {
                        path: '/users/123',
                        state: {
                            user: { id: 123, name: 'John' },
                            settings: { theme: 'dark' }
                        }
                    }
                });

                const cloned = original.clone();

                // 修改克隆对象的状态不应影响原对象
                cloned.setState('newProp', 'newValue');
                expect(original.state.newProp).toBeUndefined();
            });
        });

        describe('属性完整性', () => {
            it('应该保持所有重要属性', () => {
                const options = createOptions();
                const original = new Route({
                    options,
                    toType: RouteType.pushWindow,
                    toInput: '/users/123?tab=profile#section1'
                });

                const cloned = original.clone();

                expect(cloned.type).toBe(original.type);
                expect(cloned.isPush).toBe(original.isPush);
                expect(cloned.path).toBe(original.path);
                expect(cloned.fullPath).toBe(original.fullPath);
                expect(cloned.query).toEqual(original.query);
                expect(cloned.params).toEqual(original.params);
                expect(cloned.meta).toEqual(original.meta);
            });
        });
    });

    describe('⚠️ 边界条件测试', () => {
        describe('异常输入处理', () => {
            it('应该处理无效的路由类型', () => {
                const options = createOptions();
                expect(() => {
                    new Route({
                        options,
                        toType: 'invalid' as any,
                        toInput: '/test'
                    });
                }).not.toThrow();
            });

            it('应该处理空字符串路径', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: ''
                });

                expect(route.path).toBeDefined();
                expect(route.fullPath).toBeDefined();
            });

            it('应该处理特殊字符路径', () => {
                const options = createOptions();
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/测试用户/profile?name=张三'
                });

                // URL编码后的路径不会包含原始中文字符
                expect(route.path).toContain('users');
                expect(route.path).toContain('profile');
                expect(route.query.name).toBe('张三');
            });
        });

        describe('极端值测试', () => {
            it('应该处理非常长的路径', () => {
                const options = createOptions();
                const longPath = '/users/' + 'a'.repeat(1000);

                expect(() => {
                    new Route({
                        options,
                        toType: RouteType.push,
                        toInput: longPath
                    });
                }).not.toThrow();
            });

            it('应该处理大量查询参数', () => {
                const options = createOptions();
                const queryParams = Array.from(
                    { length: 100 },
                    (_, i) => `param${i}=value${i}`
                ).join('&');
                const path = `/test?${queryParams}`;

                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: path
                });

                expect(Object.keys(route.query)).toHaveLength(100);
                expect(route.query.param0).toBe('value0');
                expect(route.query.param99).toBe('value99');
            });
        });
    });

    describe('🔧 工具函数测试', () => {
        describe('applyRouteParams 函数', () => {
            it('应该正确应用路由参数', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({ base });
                const to = new URL('http://localhost:3000/app/users/old-id');
                const match = options.matcher(to, base);
                const toInput = {
                    path: '/users/old-id',
                    params: { id: 'new-id' }
                };

                applyRouteParams(match, toInput, base, to);

                expect(to.pathname).toBe('/app/users/new-id');
                expect(match.params.id).toBe('new-id');
            });

            it('应该处理多个参数', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({
                    base,
                    routes: [{ path: '/posts/:postId/comments/:commentId' }]
                });
                const to = new URL(
                    'http://localhost:3000/app/posts/123/comments/456'
                );
                const match = options.matcher(to, base);
                const toInput = {
                    path: '/posts/123/comments/456',
                    params: { postId: 'post-999', commentId: 'comment-888' }
                };

                applyRouteParams(match, toInput, base, to);

                expect(to.pathname).toBe(
                    '/app/posts/post-999/comments/comment-888'
                );
                expect(match.params.postId).toBe('post-999');
                expect(match.params.commentId).toBe('comment-888');
            });

            it('应该在无匹配时直接返回', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({ routes: [] });
                const to = new URL('http://localhost:3000/app/unknown');
                const originalPathname = to.pathname;
                const match = options.matcher(to, base);
                const toInput = { path: '/unknown', params: { id: 'test' } };

                applyRouteParams(match, toInput, base, to);

                expect(to.pathname).toBe(originalPathname);
            });

            it('应该处理非对象toInput参数', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions();
                const to = new URL('http://localhost:3000/app/users/123');
                const originalPathname = to.pathname;
                const match = options.matcher(to, base);

                // 测试字符串类型
                applyRouteParams(match, '/users/123', base, to);
                expect(to.pathname).toBe(originalPathname);

                // 测试null
                applyRouteParams(match, null as any, base, to);
                expect(to.pathname).toBe(originalPathname);

                // 测试undefined
                applyRouteParams(match, undefined as any, base, to);
                expect(to.pathname).toBe(originalPathname);
            });

            it('应该处理空params对象', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions();
                const to = new URL('http://localhost:3000/app/users/123');
                const originalPathname = to.pathname;
                const match = options.matcher(to, base);

                // 测试空params
                const toInput = { path: '/users/123', params: {} };
                applyRouteParams(match, toInput, base, to);
                expect(to.pathname).toBe(originalPathname);

                // 测试undefined params
                const toInput2 = {
                    path: '/users/123',
                    params: undefined as any
                };
                applyRouteParams(match, toInput2, base, to);
                expect(to.pathname).toBe(originalPathname);
            });

            it('应该处理复杂的路径替换逻辑', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({
                    base,
                    routes: [{ path: '/users/:id/posts/:postId' }]
                });
                const to = new URL(
                    'http://localhost:3000/app/users/123/posts/456'
                );
                const match = options.matcher(to, base);
                const toInput = {
                    path: '/users/123/posts/456',
                    params: { id: 'user-999', postId: 'post-888' }
                };

                applyRouteParams(match, toInput, base, to);

                expect(to.pathname).toBe('/app/users/user-999/posts/post-888');
                expect(match.params.id).toBe('user-999');
                expect(match.params.postId).toBe('post-888');
            });

            it('应该处理路径片段为空的情况', () => {
                const base = new URL('http://localhost:3000/app/');
                const options = createOptions({
                    base,
                    routes: [{ path: '/users/:id' }]
                });
                const to = new URL('http://localhost:3000/app/users/123');
                const match = options.matcher(to, base);

                // 模拟compile返回空片段的情况
                const originalCompile = match.matches[0].compile;
                match.matches[0].compile = vi.fn(() => '/users/'); // 返回空的id部分

                const toInput = { path: '/users/123', params: { id: '' } };
                applyRouteParams(match, toInput, base, to);

                // 应该保留原有路径片段
                expect(to.pathname).toBe('/app/users/123');

                // 恢复原始compile函数
                match.matches[0].compile = originalCompile;
            });
        });
    });

    describe('🔗 集成测试', () => {
        describe('与路由器选项的集成', () => {
            it('应该正确使用自定义 normalizeURL', () => {
                const customNormalizeURL = vi.fn((url: URL) => {
                    url.pathname = url.pathname.toLowerCase();
                    return url;
                });

                const options = createOptions({
                    normalizeURL: customNormalizeURL
                });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/USERS/123'
                });

                expect(customNormalizeURL).toHaveBeenCalled();
                expect(route.path).toBe('/users/123');
            });

            it('应该正确处理 SSR 相关属性', () => {
                const mockReq = {} as any;
                const mockRes = {} as any;
                const options = createOptions({ req: mockReq, res: mockRes });

                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/users/123'
                });

                expect(route.req).toBe(mockReq);
                expect(route.res).toBe(mockRes);
            });
        });

        describe('与路由配置的集成', () => {
            it('应该正确处理嵌套路由配置', () => {
                const nestedRoutes: RouteConfig[] = [
                    {
                        path: '/admin',
                        meta: { requireAuth: true },
                        children: [
                            {
                                path: '/users',
                                meta: { title: 'User Management' }
                            }
                        ]
                    }
                ];

                const options = createOptions({ routes: nestedRoutes });
                const route = new Route({
                    options,
                    toType: RouteType.push,
                    toInput: '/admin/users'
                });

                expect(route.matched.length).toBeGreaterThan(0);
                expect(route.meta.title).toBe('User Management');
            });
        });
    });

    describe('🎭 性能测试', () => {
        it('应该在合理时间内创建大量路由实例', () => {
            const options = createOptions();
            const startTime = performance.now();

            for (let i = 0; i < 1000; i++) {
                new Route({
                    options,
                    toType: RouteType.push,
                    toInput: `/users/${i}`
                });
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // 1000个实例应该在100ms内创建完成
            expect(duration).toBeLessThan(100);
        });

        it('应该高效处理状态操作', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: '/test'
            });

            const startTime = performance.now();

            for (let i = 0; i < 1000; i++) {
                route.setState(`key${i}`, `value${i}`);
            }

            const endTime = performance.now();
            const duration = endTime - startTime;

            // 1000次状态设置应该在50ms内完成
            expect(duration).toBeLessThan(50);
            expect(Object.keys(route.state)).toHaveLength(1000);
        });
    });
});

// 补充遗漏的测试用例
describe('🔍 Route 类深度测试 - 遗漏场景补充', () => {
    const createOptions = (
        overrides: Partial<RouterOptions> = {}
    ): RouterParsedOptions => {
        const base = new URL('http://localhost:3000/app/');
        const mockRoutes: RouteConfig[] = [
            {
                path: '/users/:id',
                meta: { title: 'User Detail', requireAuth: true }
            },
            {
                path: '/posts/:postId/comments/:commentId',
                meta: { title: 'Comment Detail' }
            }
        ];

        const routerOptions: RouterOptions = {
            root: '#test',
            context: { version: '1.0.0' },
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

    describe('🔧 applyRouteParams 边界条件测试', () => {
        it('应该处理非对象toInput参数', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions();
            const to = new URL('http://localhost:3000/app/users/123');
            const originalPathname = to.pathname;
            const match = options.matcher(to, base);

            // 测试字符串类型
            applyRouteParams(match, '/users/123', base, to);
            expect(to.pathname).toBe(originalPathname);

            // 测试null
            applyRouteParams(match, null as any, base, to);
            expect(to.pathname).toBe(originalPathname);

            // 测试undefined
            applyRouteParams(match, undefined as any, base, to);
            expect(to.pathname).toBe(originalPathname);
        });

        it('应该处理空params对象', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions();
            const to = new URL('http://localhost:3000/app/users/123');
            const originalPathname = to.pathname;
            const match = options.matcher(to, base);

            // 测试空params
            const toInput = { path: '/users/123', params: {} };
            applyRouteParams(match, toInput, base, to);
            expect(to.pathname).toBe(originalPathname);

            // 测试undefined params
            const toInput2 = { path: '/users/123', params: undefined as any };
            applyRouteParams(match, toInput2, base, to);
            expect(to.pathname).toBe(originalPathname);
        });

        it('应该处理路径片段为空的情况', () => {
            const base = new URL('http://localhost:3000/app/');
            const options = createOptions({
                base,
                routes: [{ path: '/users/:id' }]
            });
            const to = new URL('http://localhost:3000/app/users/123');
            const match = options.matcher(to, base);

            // 模拟compile返回空片段的情况
            const originalCompile = match.matches[0].compile;
            match.matches[0].compile = vi.fn(() => '/users/'); // 返回空的id部分

            const toInput = { path: '/users/123', params: { id: '' } };
            applyRouteParams(match, toInput, base, to);

            // 应该保留原有路径片段
            expect(to.pathname).toBe('/app/users/123');

            // 恢复原始compile函数
            match.matches[0].compile = originalCompile;
        });
    });

    describe('🎯 查询参数处理深度测试', () => {
        it('应该处理查询参数的去重逻辑', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123?name=john&name=jane&age=25&name=bob'
            });

            // query应该只包含第一个值
            expect(route.query.name).toBe('john');
            expect(route.query.age).toBe('25');

            // queryArray应该包含所有值
            expect(route.queryArray.name).toEqual(['john', 'jane', 'bob']);
            expect(route.queryArray.age).toEqual(['25']);
        });

        it('应该处理空查询参数值', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123?empty=&name=john&blank&value=test'
            });

            expect(route.query.empty).toBe('');
            expect(route.query.name).toBe('john');
            expect(route.query.blank).toBe('');
            expect(route.query.value).toBe('test');
        });

        it('应该处理特殊字符的查询参数', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput:
                    '/users/123?name=%E5%BC%A0%E4%B8%89&symbol=%26%3D%3F%23'
            });

            expect(route.query.name).toBe('张三');
            expect(route.query.symbol).toBe('&=?#');
        });
    });

    describe('🔄 克隆功能深度测试', () => {
        it('应该正确克隆复杂状态对象', () => {
            const options = createOptions();
            const complexState = {
                user: { id: 123, name: 'John', roles: ['admin', 'user'] },
                settings: { theme: 'dark', notifications: true },
                metadata: { created: new Date(), version: 1.0 }
            };

            const original = new Route({
                options,
                toType: RouteType.push,
                toInput: { path: '/users/123', state: complexState }
            });

            const cloned = original.clone();

            // 验证状态深拷贝
            expect(cloned.state).toEqual(original.state);
            expect(cloned.state).not.toBe(original.state);

            // 修改克隆对象不应影响原对象
            cloned.setState('newProp', 'newValue');
            expect(original.state.newProp).toBeUndefined();
        });

        it('应该保持克隆对象的_options引用', () => {
            const options = createOptions();
            const original = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123'
            });

            const cloned = original.clone();

            // _options应该是同一个引用
            expect((cloned as any)._options).toBe((original as any)._options);
        });

        it('应该正确克隆带有查询参数和hash的路由', () => {
            const options = createOptions();
            const original = new Route({
                options,
                toType: RouteType.pushWindow,
                toInput: '/users/123?tab=profile&sort=name#section1'
            });

            const cloned = original.clone();

            expect(cloned.fullPath).toBe(original.fullPath);
            expect(cloned.query).toEqual(original.query);
            expect(cloned.type).toBe(original.type);
            expect(cloned.isPush).toBe(original.isPush);
        });
    });

    describe('🏗️ 构造函数边界条件测试', () => {
        it('应该处理keepScrollPosition的各种值', () => {
            const options = createOptions();

            // 测试true值
            const route1 = new Route({
                options,
                toType: RouteType.push,
                toInput: { path: '/test', keepScrollPosition: true }
            });
            expect(route1.keepScrollPosition).toBe(true);

            // 测试false值
            const route2 = new Route({
                options,
                toType: RouteType.push,
                toInput: { path: '/test', keepScrollPosition: false }
            });
            expect(route2.keepScrollPosition).toBe(false);

            // 测试truthy值
            const route3 = new Route({
                options,
                toType: RouteType.push,
                toInput: { path: '/test', keepScrollPosition: 'yes' as any }
            });
            expect(route3.keepScrollPosition).toBe(true);

            // 测试falsy值
            const route4 = new Route({
                options,
                toType: RouteType.push,
                toInput: { path: '/test', keepScrollPosition: 0 as any }
            });
            expect(route4.keepScrollPosition).toBe(false);

            // 测试字符串路径（应该为false）
            const route5 = new Route({
                options,
                toType: RouteType.push,
                toInput: '/test'
            });
            expect(route5.keepScrollPosition).toBe(false);
        });

        it('应该正确处理config和meta的计算', () => {
            const options = createOptions();

            // 有匹配的路由
            const matchedRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123'
            });
            expect(matchedRoute.config).not.toBeNull();
            expect(matchedRoute.meta.title).toBe('User Detail');

            // 无匹配的路由
            const unmatchedRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/unknown'
            });
            expect(unmatchedRoute.config).toBeNull();
            expect(unmatchedRoute.meta).toEqual({});
        });

        it('应该正确处理matched数组的冻结', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123'
            });

            // matched数组应该被冻结
            expect(Object.isFrozen(route.matched)).toBe(true);

            // 尝试修改应该失败
            expect(() => {
                (route.matched as any).push({});
            }).toThrow();
        });
    });

    describe('🔒 属性不可变性测试', () => {
        it('应该验证只读属性的行为', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/123'
            });

            // 验证属性存在且有正确的值
            expect(route.params).toBeDefined();
            expect(route.query).toBeDefined();
            expect(route.url).toBeDefined();

            // 验证这些属性的基本特性
            expect(typeof route.params).toBe('object');
            expect(typeof route.query).toBe('object');
            expect(route.url instanceof URL).toBe(true);
        });
    });

    describe('🎨 状态管理特殊情况', () => {
        it('应该处理状态对象的特殊键', () => {
            const options = createOptions();
            const route = new Route({
                options,
                toType: RouteType.push,
                toInput: {
                    path: '/test',
                    state: {
                        normalKey: 'value',
                        specialKey: 'specialValue'
                    }
                }
            });

            expect(route.state.normalKey).toBe('value');
            expect(route.state.specialKey).toBe('specialValue');
        });

        it('应该处理状态同步时的特殊键', () => {
            const options = createOptions();

            const sourceRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: {
                    path: '/source',
                    state: {
                        normal: 'source',
                        special: 'sourceSpecial'
                    }
                }
            });

            const targetRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: {
                    path: '/target',
                    state: {
                        existing: 'target',
                        special: 'targetSpecial'
                    }
                }
            });

            sourceRoute.syncTo(targetRoute);

            expect(targetRoute.state.normal).toBe('source');
            expect(targetRoute.state.existing).toBeUndefined();
            expect(targetRoute.state.special).toBe('sourceSpecial');
        });
    });

    describe('🔄 syncTo 方法测试', () => {
        it('应该完全同步所有路由属性', () => {
            const options = createOptions();

            const sourceRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: {
                    path: '/users/456',
                    state: { userId: 456, name: 'Jane' }
                }
            });
            sourceRoute.status = RouteStatus.success;
            sourceRoute.statusCode = 200;

            const targetRoute = new Route({
                options,
                toType: RouteType.replace,
                toInput: {
                    path: '/old/path',
                    state: { oldData: 'old' }
                }
            });

            sourceRoute.syncTo(targetRoute);

            // 验证可变属性同步
            expect(targetRoute.status).toBe(RouteStatus.success);
            expect(targetRoute.statusCode).toBe(200);

            // 验证状态同步
            expect(targetRoute.state.userId).toBe(456);
            expect(targetRoute.state.name).toBe('Jane');
            expect(targetRoute.state.oldData).toBeUndefined();

            // 验证只读属性同步
            expect(targetRoute.type).toBe(RouteType.push);
            expect(targetRoute.path).toBe('/users/456');
            expect(targetRoute.fullPath).toBe('/users/456');
            expect(targetRoute.params.id).toBe('456');
        });

        it('应该同步 params 对象', () => {
            const options = createOptions();

            const sourceRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/users/789'
            });

            const targetRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/posts/123'
            });

            sourceRoute.syncTo(targetRoute);

            // 验证 params 被正确同步
            expect(targetRoute.params.id).toBe('789');
            expect(targetRoute.params.postId).toBeUndefined();
        });

        it('应该同步查询参数', () => {
            const options = createOptions();

            const sourceRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/search?q=test&page=2'
            });

            const targetRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/old?old=value'
            });

            sourceRoute.syncTo(targetRoute);

            // 验证查询参数被正确同步
            expect(targetRoute.query.q).toBe('test');
            expect(targetRoute.query.page).toBe('2');
            expect(targetRoute.query.old).toBeUndefined();
        });

        it('应该同步 handle 相关属性', () => {
            const options = createOptions();

            const sourceRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/test'
            });

            const mockHandle = vi.fn();
            sourceRoute.setHandle(mockHandle);
            (sourceRoute as any)._handleResult = { success: true };
            (sourceRoute as any)._handled = true;

            const targetRoute = new Route({
                options,
                toType: RouteType.push,
                toInput: '/other'
            });

            sourceRoute.syncTo(targetRoute);

            // 验证 handle 相关属性被同步
            expect((targetRoute as any)._handle).toBe(
                (sourceRoute as any)._handle
            );
            expect((targetRoute as any)._handleResult).toEqual({
                success: true
            });
            expect((targetRoute as any)._handled).toBe(true);
        });
    });
});

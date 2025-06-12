import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MicroApp } from './micro-app';
import { parsedOptions } from './options';
import { Route } from './route';
import type { Router } from './router';
import type {
    RouteParsedConfig,
    RouterMicroAppCallback,
    RouterMicroAppOptions,
    RouterOptions,
    RouterParsedOptions
} from './types';
import { RouteStatus, RouteType, RouterMode } from './types';

// 模拟浏览器环境
const setIsBrowserTrue = () => {
    // 模拟 DOM 环境
    const mockDocument = {
        getElementById: vi.fn(),
        createElement: vi.fn(() => ({
            id: '',
            style: {},
            parentNode: null,
            remove: vi.fn()
        })),
        body: {
            appendChild: vi.fn()
        }
    };

    vi.stubGlobal('document', mockDocument);
    vi.stubGlobal('window', { document: mockDocument });

    // 模拟 Object.assign
    vi.spyOn(Object, 'assign').mockImplementation((target, ...sources) => {
        sources.forEach((source) => {
            if (source) {
                Object.keys(source).forEach((key) => {
                    target[key] = source[key];
                });
            }
        });
        return target;
    });

    vi.resetModules();
};

const setIsBrowserFalse = () => {
    vi.unstubAllGlobals();

    // 恢复 Object.assign 模拟
    vi.restoreAllMocks();

    vi.resetModules();
};

// 创建模拟的路由配置
const createMockParsedConfig = (
    app?: string | RouterMicroAppCallback
): RouteParsedConfig => ({
    path: '/test',
    compilePath: '/test',
    children: [],
    match: vi.fn(),
    compile: vi.fn(),
    meta: {},
    app
});

// 创建模拟的 Router 对象
const createMockRouter = (
    overrides: {
        id?: string;
        matched?: Array<{ app?: string | RouterMicroAppCallback }>;
        options?: any;
        parsedOptions?: Partial<RouterParsedOptions>;
    } = {}
): Router => {
    // 创建基础的路由选项
    const baseOptions: RouterOptions = {
        id: overrides.id || 'test-router',
        context: {},
        routes: [],
        mode: RouterMode.abstract,
        base: new URL('http://test.com'),
        env: 'test',
        req: null,
        res: null,
        apps: overrides.options?.apps || {},
        normalizeURL: (url: URL) => url,
        location: () => {},
        rootStyle: false,
        layer: null,
        onBackNoResponse: () => {}
    };

    // 创建解析后的选项，如果需要自定义匹配结果，修改 matcher
    const mockParsedOptions = {
        ...parsedOptions(baseOptions),
        ...overrides.parsedOptions
    };

    // 如果需要自定义匹配结果，创建自定义 matcher
    if (overrides.matched) {
        const customMatched = overrides.matched.map((item) =>
            createMockParsedConfig(item.app || 'test-app')
        );

        mockParsedOptions.matcher = () => ({
            matches: customMatched,
            params: {}
        });
    }

    // 使用真实的 Route 构造函数创建路由对象
    const mockRoute = new Route({
        options: mockParsedOptions,
        toType: RouteType.push,
        toRaw: '/test'
    });

    return {
        id: overrides.id || 'test-router',
        route: mockRoute,
        options: overrides.options || {},
        parsedOptions: mockParsedOptions
    } as Router;
};

// 创建模拟的微应用
const createMockApp = (): RouterMicroAppOptions => ({
    mount: vi.fn(),
    unmount: vi.fn(),
    renderToString: vi.fn().mockResolvedValue('<div>rendered</div>')
});

describe('MicroApp', () => {
    let microApp: MicroApp;

    beforeEach(() => {
        microApp = new MicroApp();
    });

    afterEach(() => {
        setIsBrowserFalse();
        vi.clearAllMocks();
    });

    describe('初始状态', () => {
        it('应该初始化为空状态', () => {
            expect(microApp.app).toBeNull();
            expect(microApp.root).toBeNull();
            expect((microApp as any)._factory).toBeNull();
        });
    });

    describe('_getNextFactory', () => {
        it('应该从路由匹配结果中获取应用名称并返回对应的工厂函数', () => {
            const mockFactory = vi.fn();
            const router = createMockRouter({
                matched: [{ app: 'vue-app' }],
                options: { apps: { 'vue-app': mockFactory } }
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBe(mockFactory);
        });

        it('应该在应用名称不存在时返回 null', () => {
            const router = createMockRouter({
                matched: [{ app: 'non-existent-app' }],
                options: { apps: { 'vue-app': vi.fn() } }
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBeNull();
        });

        it('应该处理匹配结果中的函数类型应用', () => {
            const mockFactory = vi.fn();
            const router = createMockRouter({
                matched: [{ app: mockFactory }]
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBe(mockFactory);
        });

        it('应该处理 options.apps 为函数的情况', () => {
            const mockFactory = vi.fn();
            const router = createMockRouter({
                matched: [{ app: 'any-app' }],
                options: { apps: mockFactory }
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBe(mockFactory);
        });

        it('应该在没有匹配结果时返回 null', () => {
            const router = createMockRouter({
                matched: []
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBeNull();
        });

        it('应该在 options.apps 为空对象时返回 null', () => {
            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: {} }
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBeNull();
        });
    });

    describe('_update 方法', () => {
        describe('非浏览器环境', () => {
            it('应该更新工厂函数但不执行 DOM 操作', () => {
                const mockFactory = vi.fn().mockReturnValue(createMockApp());
                const router = createMockRouter({
                    matched: [{ app: 'test-app' }],
                    options: { apps: { 'test-app': mockFactory } }
                });

                microApp._update(router);

                expect((microApp as any)._factory).toBe(mockFactory);
                expect(mockFactory).toHaveBeenCalledWith(router);
                expect(microApp.app).not.toBeNull();
                expect(microApp.root).toBeNull(); // 非浏览器环境不操作 DOM
            });

            it('应该在 force=false 且工厂函数未变化时跳过更新', () => {
                const mockFactory = vi.fn().mockReturnValue(createMockApp());
                const router = createMockRouter({
                    matched: [{ app: 'test-app' }],
                    options: { apps: { 'test-app': mockFactory } }
                });

                // 第一次更新
                microApp._update(router);
                expect(mockFactory).toHaveBeenCalledTimes(1);

                // 第二次更新，应该跳过
                microApp._update(router);
                expect(mockFactory).toHaveBeenCalledTimes(1);
            });

            it('应该在 force=true 时强制更新', () => {
                const mockFactory = vi.fn().mockReturnValue(createMockApp());
                const router = createMockRouter({
                    matched: [{ app: 'test-app' }],
                    options: { apps: { 'test-app': mockFactory } }
                });

                // 第一次更新
                microApp._update(router);
                expect(mockFactory).toHaveBeenCalledTimes(1);

                // 强制更新
                microApp._update(router, true);
                expect(mockFactory).toHaveBeenCalledTimes(2);
            });

            it('应该在没有工厂函数时设置应用为 null', () => {
                const router = createMockRouter({
                    matched: [{ app: 'non-existent' }],
                    options: { apps: {} }
                });

                microApp._update(router);

                expect(microApp.app).toBeNull();
                expect((microApp as any)._factory).toBeNull();
            });
        });

        describe('浏览器环境', () => {
            beforeEach(() => {
                setIsBrowserTrue();
            });

            it('应该创建新的根元素并挂载应用', async () => {
                const { MicroApp } = await import('./micro-app');
                const microApp = new MicroApp();

                const mockApp = createMockApp();
                const mockFactory = vi.fn().mockReturnValue(mockApp);
                const mockElement = {
                    id: '',
                    style: {},
                    parentNode: null,
                    remove: vi.fn()
                };

                document.getElementById = vi.fn().mockReturnValue(null);
                document.createElement = vi.fn().mockReturnValue(mockElement);

                const router = createMockRouter({
                    id: 'test-router',
                    matched: [{ app: 'test-app' }],
                    options: { apps: { 'test-app': mockFactory } }
                });

                microApp._update(router);

                expect(document.createElement).toHaveBeenCalledWith('div');
                expect(mockElement.id).toBe('test-router');
                expect(mockApp.mount).toHaveBeenCalledWith(mockElement);
                expect(document.body.appendChild).toHaveBeenCalledWith(
                    mockElement
                );
                expect(microApp.root).toBe(mockElement);
            });

            it('应该使用现有的根元素', async () => {
                const { MicroApp } = await import('./micro-app');
                const microApp = new MicroApp();

                const mockApp = createMockApp();
                const mockFactory = vi.fn().mockReturnValue(mockApp);
                const existingElement = {
                    id: 'test-router',
                    style: {},
                    parentNode: document.body,
                    remove: vi.fn()
                };

                document.getElementById = vi
                    .fn()
                    .mockReturnValue(existingElement);

                const router = createMockRouter({
                    id: 'test-router',
                    matched: [{ app: 'test-app' }],
                    options: { apps: { 'test-app': mockFactory } }
                });

                microApp._update(router);

                expect(document.getElementById).toHaveBeenCalledWith(
                    'test-router'
                );
                expect(document.createElement).not.toHaveBeenCalled();
                expect(mockApp.mount).toHaveBeenCalledWith(existingElement);
                expect(microApp.root).toBe(existingElement);
            });

            it('应该使用已设置的根元素', async () => {
                const { MicroApp } = await import('./micro-app');
                const microApp = new MicroApp();

                const mockApp = createMockApp();
                const mockFactory = vi.fn().mockReturnValue(mockApp);
                const existingRoot = {
                    id: 'existing-root',
                    style: {},
                    parentNode: document.body,
                    remove: vi.fn()
                };

                microApp.root = existingRoot as any;

                const router = createMockRouter({
                    matched: [{ app: 'test-app' }],
                    options: { apps: { 'test-app': mockFactory } }
                });

                microApp._update(router);

                expect(document.getElementById).not.toHaveBeenCalled();
                expect(document.createElement).not.toHaveBeenCalled();
                expect(mockApp.mount).toHaveBeenCalledWith(existingRoot);
                expect(microApp.root).toBe(existingRoot);
            });

            it('应该应用 rootStyle 样式', async () => {
                const { MicroApp } = await import('./micro-app');
                const microApp = new MicroApp();

                const mockApp = createMockApp();
                const mockFactory = vi.fn().mockReturnValue(mockApp);
                const mockElement = {
                    id: '',
                    style: {},
                    parentNode: null,
                    remove: vi.fn()
                };

                document.getElementById = vi.fn().mockReturnValue(null);
                document.createElement = vi.fn().mockReturnValue(mockElement);

                const router = createMockRouter({
                    matched: [{ app: 'test-app' }],
                    options: { apps: { 'test-app': mockFactory } },
                    parsedOptions: {
                        rootStyle: { color: 'red', fontSize: '16px' }
                    }
                });

                microApp._update(router);

                expect(Object.assign).toHaveBeenCalledWith(mockElement.style, {
                    color: 'red',
                    fontSize: '16px'
                });
            });

            it('应该在旧应用存在时卸载它', async () => {
                const { MicroApp } = await import('./micro-app');
                const microApp = new MicroApp();

                const oldApp = createMockApp();
                const newApp = createMockApp();
                const oldFactory = vi.fn().mockReturnValue(oldApp);
                const newFactory = vi.fn().mockReturnValue(newApp);

                const mockElement = {
                    id: '',
                    style: {},
                    parentNode: null,
                    remove: vi.fn()
                };

                document.getElementById = vi.fn().mockReturnValue(null);
                document.createElement = vi.fn().mockReturnValue(mockElement);

                // 第一次更新
                const router1 = createMockRouter({
                    matched: [{ app: 'old-app' }],
                    options: { apps: { 'old-app': oldFactory } }
                });
                microApp._update(router1);

                expect(microApp.app).toBe(oldApp);
                expect(oldApp.unmount).not.toHaveBeenCalled();

                // 第二次更新，应该卸载旧应用
                const router2 = createMockRouter({
                    matched: [{ app: 'new-app' }],
                    options: { apps: { 'new-app': newFactory } }
                });
                microApp._update(router2);

                expect(oldApp.unmount).toHaveBeenCalled();
                expect(microApp.app).toBe(newApp);
            });

            it('应该将根元素添加到 body 中（如果不在 DOM 中）', async () => {
                const { MicroApp } = await import('./micro-app');
                const microApp = new MicroApp();

                const mockApp = createMockApp();
                const mockFactory = vi.fn().mockReturnValue(mockApp);
                const mockElement = {
                    id: '',
                    style: {},
                    parentNode: null, // 不在 DOM 中
                    remove: vi.fn()
                };

                document.getElementById = vi.fn().mockReturnValue(null);
                document.createElement = vi.fn().mockReturnValue(mockElement);

                const router = createMockRouter({
                    matched: [{ app: 'test-app' }],
                    options: { apps: { 'test-app': mockFactory } }
                });

                microApp._update(router);

                expect(document.body.appendChild).toHaveBeenCalledWith(
                    mockElement
                );
            });

            it('应该不将根元素添加到 body 中（如果已在 DOM 中）', async () => {
                const { MicroApp } = await import('./micro-app');
                const microApp = new MicroApp();

                const mockApp = createMockApp();
                const mockFactory = vi.fn().mockReturnValue(mockApp);
                const mockElement = {
                    id: '',
                    style: {},
                    parentNode: document.body, // 已在 DOM 中
                    remove: vi.fn()
                };

                document.getElementById = vi.fn().mockReturnValue(null);
                document.createElement = vi.fn().mockReturnValue(mockElement);

                const router = createMockRouter({
                    matched: [{ app: 'test-app' }],
                    options: { apps: { 'test-app': mockFactory } }
                });

                microApp._update(router);

                expect(document.body.appendChild).not.toHaveBeenCalled();
            });

            it('应该在浏览器环境下处理工厂函数为 null 的情况', async () => {
                const { MicroApp } = await import('./micro-app');
                const microApp = new MicroApp();

                // 创建一个没有工厂函数的路由（应该返回 null）
                const router = createMockRouter({
                    matched: [],
                    options: { apps: {} } // 空的 apps 对象，没有对应的工厂函数
                });

                microApp._update(router, true);

                // 在浏览器环境下，当工厂函数为 null 时，app 应该被设置为 null
                expect(microApp.app).toBeNull();
                expect((microApp as any)._factory).toBeNull();

                // 同时验证没有进行任何 DOM 操作
                expect(document.getElementById).not.toHaveBeenCalled();
                expect(document.createElement).not.toHaveBeenCalled();
                expect(document.body.appendChild).not.toHaveBeenCalled();
            });
        });
    });

    describe('destroy 方法', () => {
        it('应该销毁应用和清理状态', () => {
            const mockApp = createMockApp();
            const mockRoot = {
                remove: vi.fn()
            };

            microApp.app = mockApp;
            microApp.root = mockRoot as any;
            (microApp as any)._factory = vi.fn();

            microApp.destroy();

            expect(mockApp.unmount).toHaveBeenCalled();
            expect(mockRoot.remove).toHaveBeenCalled();
            expect(microApp.app).toBeNull();
            expect(microApp.root).toBeNull();
            expect((microApp as any)._factory).toBeNull();
        });

        it('应该安全处理空状态', () => {
            expect(() => microApp.destroy()).not.toThrow();
            expect(microApp.app).toBeNull();
            expect(microApp.root).toBeNull();
            expect((microApp as any)._factory).toBeNull();
        });

        it('应该处理部分状态', () => {
            const mockApp = createMockApp();
            microApp.app = mockApp;
            // root 和 _factory 保持 null

            expect(() => microApp.destroy()).not.toThrow();
            expect(mockApp.unmount).toHaveBeenCalled();
            expect(microApp.app).toBeNull();
        });
    });

    describe('集成测试', () => {
        beforeEach(() => {
            setIsBrowserTrue();
        });

        it('应该完整地处理应用生命周期', async () => {
            const { MicroApp } = await import('./micro-app');
            const microApp = new MicroApp();

            const mockApp1 = createMockApp();
            const mockApp2 = createMockApp();
            const factory1 = vi.fn().mockReturnValue(mockApp1);
            const factory2 = vi.fn().mockReturnValue(mockApp2);

            const mockElement = {
                id: '',
                style: {},
                parentNode: null,
                remove: vi.fn()
            };

            document.getElementById = vi.fn().mockReturnValue(null);
            document.createElement = vi.fn().mockReturnValue(mockElement);

            // 挂载第一个应用
            const router1 = createMockRouter({
                id: 'app1',
                matched: [{ app: 'app1' }],
                options: { apps: { app1: factory1 } }
            });

            microApp._update(router1);

            expect(factory1).toHaveBeenCalledWith(router1);
            expect(mockApp1.mount).toHaveBeenCalledWith(mockElement);
            expect(microApp.app).toBe(mockApp1);

            // 切换到第二个应用
            const router2 = createMockRouter({
                id: 'app2',
                matched: [{ app: 'app2' }],
                options: { apps: { app2: factory2 } }
            });

            microApp._update(router2);

            expect(mockApp1.unmount).toHaveBeenCalled();
            expect(factory2).toHaveBeenCalledWith(router2);
            expect(mockApp2.mount).toHaveBeenCalledWith(mockElement);
            expect(microApp.app).toBe(mockApp2);

            // 销毁
            microApp.destroy();

            expect(mockApp2.unmount).toHaveBeenCalled();
            expect(mockElement.remove).toHaveBeenCalled();
            expect(microApp.app).toBeNull();
            expect(microApp.root).toBeNull();
        });

        it('应该处理复杂的路由应用配置', async () => {
            const { MicroApp } = await import('./micro-app');
            const microApp = new MicroApp();

            const mockApp = createMockApp();
            const dynamicFactory: RouterMicroAppCallback = vi
                .fn()
                .mockReturnValue(mockApp);

            const mockElement = {
                id: '',
                style: {},
                parentNode: null,
                remove: vi.fn()
            };

            document.getElementById = vi.fn().mockReturnValue(null);
            document.createElement = vi.fn().mockReturnValue(mockElement);

            // 测试动态应用工厂
            const router = createMockRouter({
                matched: [{ app: dynamicFactory }],
                options: { apps: {} }
            });

            microApp._update(router);

            expect(dynamicFactory).toHaveBeenCalledWith(router);
            expect(mockApp.mount).toHaveBeenCalledWith(mockElement);
            expect(microApp.app).toBe(mockApp);
        });

        it('应该正确处理 rootStyle 为 false 的情况', async () => {
            const { MicroApp } = await import('./micro-app');
            const microApp = new MicroApp();

            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);
            const mockElement = {
                id: '',
                style: {},
                parentNode: null,
                remove: vi.fn()
            };

            document.getElementById = vi.fn().mockReturnValue(null);
            document.createElement = vi.fn().mockReturnValue(mockElement);

            // 为了避免其他地方的 Object.assign 调用影响测试，我们在调用前清除 mock
            vi.clearAllMocks();

            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } },
                parsedOptions: { rootStyle: false }
            });

            // 在 _update 调用前再次清除，确保只检测 _update 内部的调用
            vi.clearAllMocks();

            microApp._update(router);

            expect(Object.assign).not.toHaveBeenCalledWith(
                mockElement.style,
                expect.anything()
            );
        });
    });

    describe('边界情况测试', () => {
        it('应该处理 route.matched 为空数组的情况', () => {
            const router = createMockRouter({
                matched: []
            });

            expect(() => microApp._update(router)).not.toThrow();
            expect(microApp.app).toBeNull();
        });

        it('应该处理 route.matched[0] 没有 app 属性的情况', () => {
            const router = createMockRouter({
                matched: [{}]
            });

            expect(() => microApp._update(router)).not.toThrow();
            expect(microApp.app).toBeNull();
        });

        it('应该处理工厂函数返回 null 的情况', () => {
            const mockFactory = vi.fn().mockReturnValue(null);
            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect(mockFactory).toHaveBeenCalledWith(router);
            expect(microApp.app).toBeNull();
        });

        it('应该处理工厂函数抛出异常的情况', () => {
            const mockFactory = vi.fn().mockImplementation(() => {
                throw new Error('Factory error');
            });
            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            expect(() => microApp._update(router)).toThrow('Factory error');
        });
    });
});

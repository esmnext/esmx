/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MicroApp, resolveRootElement } from './micro-app';
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
import { RouteType, RouterMode } from './types';

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
        root?: string | HTMLElement;
        matched?: Array<{ app?: string | RouterMicroAppCallback }>;
        options?: any;
        parsedOptions?: Partial<RouterParsedOptions>;
    } = {}
): Router => {
    // 创建基础的路由选项
    const baseOptions: RouterOptions = {
        root: overrides.root || '#test-router',
        context: {},
        routes: [],
        mode: RouterMode.memory,
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
        toInput: '/test'
    });

    return {
        root: overrides.root || '#test-router',
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

describe('resolveRootElement', () => {
    afterEach(() => {
        vi.clearAllMocks();
        // 清理 DOM
        document.body.innerHTML = '';
    });

    describe('基础功能测试', () => {
        it('应该在参数为空时返回 null', () => {
            expect(resolveRootElement()).toBeNull();
            expect(resolveRootElement(undefined)).toBeNull();
        });

        it('应该正确处理直接传入的 HTMLElement', () => {
            const element = document.createElement('div');
            element.id = 'test-element';

            const result = resolveRootElement(element);

            expect(result).toBe(element);
            expect(result!.id).toBe('test-element');
        });

        it('应该正确处理字符串选择器', () => {
            // 创建一个现有元素
            const existingElement = document.createElement('div');
            existingElement.id = 'existing-element';
            document.body.appendChild(existingElement);

            const result = resolveRootElement('#existing-element');

            expect(result).toBe(existingElement);
        });

        it('应该在找不到元素时创建新元素', () => {
            const result = resolveRootElement('#non-existent');

            expect(result).toBeInstanceOf(HTMLElement);
            expect(result!.tagName).toBe('DIV');
            expect(result!.id).toBe('non-existent');
        });
    });

    describe('选择器类型测试', () => {
        it('应该处理 ID 选择器', () => {
            const result = resolveRootElement('#app');

            expect(result).toBeInstanceOf(HTMLElement);
            expect(result!.id).toBe('app');
        });

        it('应该处理类选择器', () => {
            // 创建带类名的元素
            const element = document.createElement('div');
            element.className = 'app-container';
            document.body.appendChild(element);

            const result = resolveRootElement('.app-container');

            expect(result).toBe(element);
        });

        it('应该处理属性选择器', () => {
            // 创建带属性的元素
            const element = document.createElement('div');
            element.setAttribute('data-app', 'main');
            document.body.appendChild(element);

            const result = resolveRootElement('[data-app="main"]');

            expect(result).toBe(element);
        });

        it('应该处理标签选择器', () => {
            // 创建一个 main 标签
            const element = document.createElement('main');
            document.body.appendChild(element);

            const result = resolveRootElement('main');

            expect(result).toBe(element);
        });
    });

    describe('边界情况测试', () => {
        it('应该处理复杂选择器', () => {
            // 创建复杂结构
            const container = document.createElement('div');
            container.className = 'container';
            const app = document.createElement('div');
            app.id = 'app';
            container.appendChild(app);
            document.body.appendChild(container);

            const result = resolveRootElement('.container #app');

            expect(result).toBe(app);
        });

        it('应该返回第一个匹配的元素', () => {
            // 创建多个相同类名的元素
            const element1 = document.createElement('div');
            element1.className = 'multiple';
            element1.textContent = 'first';
            const element2 = document.createElement('div');
            element2.className = 'multiple';
            element2.textContent = 'second';

            document.body.appendChild(element1);
            document.body.appendChild(element2);

            const result = resolveRootElement('.multiple');

            expect(result).toBe(element1);
        });

        it('应该处理非字符串非HTMLElement的输入', () => {
            // @ts-expect-error - 测试错误输入
            expect(resolveRootElement(123)).toBeNull();
            // @ts-expect-error - 测试错误输入
            expect(resolveRootElement({})).toBeNull();
            // @ts-expect-error - 测试错误输入
            expect(resolveRootElement([])).toBeNull();
        });
    });

    describe('类型安全测试', () => {
        it('应该只返回 HTMLElement 类型的节点', () => {
            // 创建 SVG 元素（不是 HTMLElement）
            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            );
            svg.id = 'svg-element';
            document.body.appendChild(svg);

            const result = resolveRootElement('#svg-element');

            // SVG 元素不是 HTMLElement，应该返回 null
            expect(result).toBeNull();
        });

        it('应该处理文本节点等非元素节点', () => {
            // querySelector 不会返回文本节点，但这是类型安全的验证
            const result = resolveRootElement('#non-existent-text');

            expect(result).toBeInstanceOf(HTMLElement);
        });
    });
});

describe('MicroApp', () => {
    let microApp: MicroApp;

    beforeEach(() => {
        microApp = new MicroApp();
    });

    afterEach(() => {
        vi.clearAllMocks();
        // 清理 DOM
        document.body.innerHTML = '';
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
        it('应该更新工厂函数并创建应用', () => {
            const mockFactory = vi.fn().mockReturnValue(createMockApp());
            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect((microApp as any)._factory).toBe(mockFactory);
            expect(mockFactory).toHaveBeenCalledWith(router);
            expect(microApp.app).not.toBeNull();
            expect(microApp.root).not.toBeNull();
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

        it('应该创建新的根元素并挂载应用', () => {
            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                root: '#test-router',
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            // 验证创建了新的 div 元素
            expect(microApp.root).toBeInstanceOf(HTMLElement);
            expect(microApp.root!.tagName).toBe('DIV');
            expect(mockApp.mount).toHaveBeenCalledWith(microApp.root);
            // 验证元素已添加到 body
            expect(document.body.contains(microApp.root!)).toBe(true);
        });

        it('应该使用现有的根元素', () => {
            // 创建一个现有元素
            const existingElement = document.createElement('div');
            existingElement.id = 'test-router';
            document.body.appendChild(existingElement);

            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                root: '#test-router',
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect(microApp.root).toBe(existingElement);
            expect(mockApp.mount).toHaveBeenCalledWith(existingElement);
        });

        it('应该使用已设置的根元素', () => {
            const existingRoot = document.createElement('div');
            existingRoot.id = 'existing-root';
            document.body.appendChild(existingRoot);

            microApp.root = existingRoot;

            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect(microApp.root).toBe(existingRoot);
            expect(mockApp.mount).toHaveBeenCalledWith(existingRoot);
        });

        it('应该应用 rootStyle 样式', () => {
            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } },
                parsedOptions: {
                    rootStyle: { color: 'red', fontSize: '16px' }
                }
            });

            microApp._update(router);

            expect(microApp.root!.style.color).toBe('red');
            expect(microApp.root!.style.fontSize).toBe('16px');
        });

        it('应该在旧应用存在时卸载它', () => {
            const oldApp = createMockApp();
            const newApp = createMockApp();
            const oldFactory = vi.fn().mockReturnValue(oldApp);
            const newFactory = vi.fn().mockReturnValue(newApp);

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

        it('应该将根元素添加到 body 中（如果不在 DOM 中）', () => {
            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            // 验证元素已添加到 body
            expect(document.body.contains(microApp.root!)).toBe(true);
        });

        it('应该不重复添加已在 DOM 中的元素', () => {
            // 创建一个已在 body 中的元素
            const existingElement = document.createElement('div');
            existingElement.id = 'test-router';
            document.body.appendChild(existingElement);

            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                root: '#test-router',
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            // 记录 body 中的子元素数量
            const initialChildCount = document.body.children.length;

            microApp._update(router);

            // 验证没有添加新元素
            expect(document.body.children.length).toBe(initialChildCount);
            expect(microApp.root).toBe(existingElement);
        });

        it('应该处理工厂函数为 null 的情况', () => {
            // 创建一个没有工厂函数的路由
            const router = createMockRouter({
                matched: [],
                options: { apps: {} }
            });

            microApp._update(router, true);

            expect(microApp.app).toBeNull();
            expect((microApp as any)._factory).toBeNull();
        });
    });

    describe('destroy 方法', () => {
        it('应该销毁应用和清理状态', () => {
            const mockApp = createMockApp();
            const mockRoot = document.createElement('div');
            document.body.appendChild(mockRoot);

            microApp.app = mockApp;
            microApp.root = mockRoot;
            (microApp as any)._factory = vi.fn();

            microApp.destroy();

            expect(mockApp.unmount).toHaveBeenCalled();
            expect(document.body.contains(mockRoot)).toBe(false);
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
        it('应该完整地处理应用生命周期', () => {
            const mockApp1 = createMockApp();
            const mockApp2 = createMockApp();
            const factory1 = vi.fn().mockReturnValue(mockApp1);
            const factory2 = vi.fn().mockReturnValue(mockApp2);

            // 挂载第一个应用
            const router1 = createMockRouter({
                root: '#app1',
                matched: [{ app: 'app1' }],
                options: { apps: { app1: factory1 } }
            });

            microApp._update(router1);

            expect(factory1).toHaveBeenCalledWith(router1);
            expect(mockApp1.mount).toHaveBeenCalledWith(microApp.root);
            expect(microApp.app).toBe(mockApp1);

            // 切换到第二个应用
            const router2 = createMockRouter({
                root: '#app2',
                matched: [{ app: 'app2' }],
                options: { apps: { app2: factory2 } }
            });

            microApp._update(router2);

            expect(mockApp1.unmount).toHaveBeenCalled();
            expect(factory2).toHaveBeenCalledWith(router2);
            expect(mockApp2.mount).toHaveBeenCalledWith(microApp.root);
            expect(microApp.app).toBe(mockApp2);

            // 销毁
            microApp.destroy();

            expect(mockApp2.unmount).toHaveBeenCalled();
            expect(document.body.contains(microApp.root!)).toBe(false);
            expect(microApp.app).toBeNull();
            expect(microApp.root).toBeNull();
        });

        it('应该处理复杂的路由应用配置', () => {
            const mockApp = createMockApp();
            const dynamicFactory: RouterMicroAppCallback = vi
                .fn()
                .mockReturnValue(mockApp);

            // 测试动态应用工厂
            const router = createMockRouter({
                matched: [{ app: dynamicFactory }],
                options: { apps: {} }
            });

            microApp._update(router);

            expect(dynamicFactory).toHaveBeenCalledWith(router);
            expect(mockApp.mount).toHaveBeenCalledWith(microApp.root);
            expect(microApp.app).toBe(mockApp);
        });

        it('应该正确处理 rootStyle 为 false 的情况', () => {
            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } },
                parsedOptions: { rootStyle: false }
            });

            microApp._update(router);

            // 当 rootStyle 为 false 时，不应该设置额外的样式
            expect(microApp.root!.style.cssText).toBe('');
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

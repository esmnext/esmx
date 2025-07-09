/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MicroApp, resolveRootElement } from '../src/micro-app';
import { parsedOptions } from '../src/options';
import { Route } from '../src/route';
import type { Router } from '../src/router';
import type {
    RouteParsedConfig,
    RouterMicroAppCallback,
    RouterMicroAppOptions,
    RouterOptions,
    RouterParsedOptions
} from '../src/types';
import { RouteType, RouterMode } from '../src/types';

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

const createMockRouter = (
    overrides: {
        root?: string | HTMLElement;
        matched?: Array<{ app?: string | RouterMicroAppCallback }>;
        options?: any;
        parsedOptions?: Partial<RouterParsedOptions>;
    } = {}
): Router => {
    const baseOptions: RouterOptions = {
        root: overrides.root || '#test-router',
        context: {},
        routes: [],
        mode: RouterMode.memory,
        base: new URL('https://example.com/'),
        req: null,
        res: null,
        apps: overrides.options?.apps || {},
        normalizeURL: (url: URL) => url,
        fallback: () => {},
        rootStyle: false,
        handleBackBoundary: () => {},
        handleLayerClose: () => {}
    };

    const mockParsedOptions = {
        ...parsedOptions(baseOptions),
        ...overrides.parsedOptions
    };

    if (overrides.matched) {
        const customMatched = overrides.matched.map((item) =>
            createMockParsedConfig(item.app || 'test-app')
        );

        mockParsedOptions.matcher = () => ({
            matches: customMatched,
            params: {}
        });
    }

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

const createMockApp = (): RouterMicroAppOptions => ({
    mount: vi.fn(),
    unmount: vi.fn(),
    renderToString: vi.fn().mockResolvedValue('<div>rendered</div>')
});

describe('resolveRootElement', () => {
    afterEach(() => {
        vi.clearAllMocks();
        // Clean up the DOM
        document.body.innerHTML = '';
    });

    describe('Basic functionality tests', () => {
        it('should return a div element when the parameter is empty', () => {
            const result1 = resolveRootElement();
            expect(result1).toBeInstanceOf(HTMLElement);
            expect(result1.tagName).toBe('DIV');

            const result2 = resolveRootElement(undefined);
            expect(result2).toBeInstanceOf(HTMLElement);
            expect(result2.tagName).toBe('DIV');
        });

        it('should correctly handle a directly passed HTMLElement', () => {
            const element = document.createElement('div');
            element.id = 'test-element';

            const result = resolveRootElement(element);

            expect(result).toBe(element);
            expect(result!.id).toBe('test-element');
        });

        it('should correctly handle a string selector', () => {
            const existingElement = document.createElement('div');
            existingElement.id = 'existing-element';
            document.body.appendChild(existingElement);

            const result = resolveRootElement('#existing-element');

            expect(result).toBe(existingElement);
        });

        it('should create a new element when not found', () => {
            const result = resolveRootElement('#non-existent');

            expect(result).toBeInstanceOf(HTMLElement);
            expect(result!.tagName).toBe('DIV');
            expect(result!.id).toBe('');
        });
    });

    describe('Selector type tests', () => {
        it('should handle ID selectors', () => {
            // Test finding an existing element
            const existingElement = document.createElement('div');
            existingElement.id = 'app';
            document.body.appendChild(existingElement);
            const result = resolveRootElement('#app');
            expect(result).toBeInstanceOf(HTMLElement);
            expect(result!.id).toBe('app');

            // Test creating a new element when not found
            const newResult = resolveRootElement('#new-app');
            expect(newResult).toBeInstanceOf(HTMLElement);
            expect(newResult.tagName).toBe('DIV');
            expect(newResult.id).toBe('');
        });

        it('should handle class selectors', () => {
            const element = document.createElement('div');
            element.className = 'app-container';
            document.body.appendChild(element);

            const result = resolveRootElement('.app-container');

            expect(result).toBe(element);
        });

        it('should handle attribute selectors', () => {
            const element = document.createElement('div');
            element.setAttribute('data-app', 'main');
            document.body.appendChild(element);

            const result = resolveRootElement('[data-app="main"]');

            expect(result).toBe(element);
        });

        it('should handle tag selectors', () => {
            const element = document.createElement('main');
            document.body.appendChild(element);

            const result = resolveRootElement('main');

            expect(result).toBe(element);
        });
    });

    describe('Edge case tests', () => {
        it('should handle complex selectors', () => {
            const container = document.createElement('div');
            container.className = 'container';
            const app = document.createElement('div');
            app.id = 'app';
            container.appendChild(app);
            document.body.appendChild(container);

            const result = resolveRootElement('.container #app');

            expect(result).toBe(app);
        });

        it('should return the first matching element', () => {
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

        it('should handle non-string, non-HTMLElement inputs', () => {
            // @ts-expect-error - testing invalid input
            const result1 = resolveRootElement(123);
            expect(result1).toBeInstanceOf(HTMLElement);
            expect(result1.tagName).toBe('DIV');

            // @ts-expect-error - testing invalid input
            const result2 = resolveRootElement({});
            expect(result2).toBeInstanceOf(HTMLElement);
            expect(result2.tagName).toBe('DIV');

            // @ts-expect-error - testing invalid input
            const result3 = resolveRootElement([]);
            expect(result3).toBeInstanceOf(HTMLElement);
            expect(result3.tagName).toBe('DIV');
        });
    });

    describe('Type safety tests', () => {
        it('should return any type of element found', () => {
            const svg = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'svg'
            );
            svg.id = 'svg-element';
            document.body.appendChild(svg);

            const result = resolveRootElement('#svg-element');

            expect(result).toBe(svg);
            expect(result).toBeInstanceOf(SVGElement);
        });

        it('should handle non-element nodes like text nodes', () => {
            // querySelector will not return text nodes, but this is for type safety verification.
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
        // Clean up the DOM
        document.body.innerHTML = '';
    });

    describe('Initial state', () => {
        it('should initialize with a null state', () => {
            expect(microApp.app).toBeNull();
            expect(microApp.root).toBeNull();
            expect((microApp as any)._factory).toBeNull();
        });
    });

    describe('_getNextFactory', () => {
        it('should get the app name from route match and return the corresponding factory', () => {
            const mockFactory = vi.fn();
            const router = createMockRouter({
                matched: [{ app: 'vue-app' }],
                options: { apps: { 'vue-app': mockFactory } }
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBe(mockFactory);
        });

        it('should return null if the app name does not exist', () => {
            const router = createMockRouter({
                matched: [{ app: 'non-existent-app' }],
                options: { apps: { 'vue-app': vi.fn() } }
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBeNull();
        });

        it('should handle function-type apps in the match result', () => {
            const mockFactory = vi.fn();
            const router = createMockRouter({
                matched: [{ app: mockFactory }]
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBe(mockFactory);
        });

        it('should handle options.apps being a function', () => {
            const mockFactory = vi.fn();
            const router = createMockRouter({
                matched: [{ app: 'any-app' }],
                options: { apps: mockFactory }
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBe(mockFactory);
        });

        it('should return null when there are no match results', () => {
            const router = createMockRouter({
                matched: []
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBeNull();
        });

        it('should return null when options.apps is an empty object', () => {
            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: {} }
            });

            const factory = (microApp as any)._getNextFactory(router);
            expect(factory).toBeNull();
        });
    });

    describe('_update method', () => {
        it('should update the factory and create the application', () => {
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

        it('should skip update if factory has not changed and force=false', () => {
            const mockFactory = vi.fn().mockReturnValue(createMockApp());
            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);
            expect(mockFactory).toHaveBeenCalledTimes(1);

            microApp._update(router);
            expect(mockFactory).toHaveBeenCalledTimes(1);
        });

        it('should force update when force=true', () => {
            const mockFactory = vi.fn().mockReturnValue(createMockApp());
            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);
            expect(mockFactory).toHaveBeenCalledTimes(1);

            // Force update
            microApp._update(router, true);
            expect(mockFactory).toHaveBeenCalledTimes(2);
        });

        it('should set the application to null if there is no factory', () => {
            const router = createMockRouter({
                matched: [{ app: 'non-existent' }],
                options: { apps: {} }
            });

            microApp._update(router);

            expect(microApp.app).toBeNull();
            expect((microApp as any)._factory).toBeNull();
        });

        it('should create a new root element and mount the application', () => {
            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                root: '#test-router',
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect(microApp.root).toBeInstanceOf(HTMLElement);
            expect(microApp.root!.tagName).toBe('DIV');
            expect(mockApp.mount).toHaveBeenCalledWith(microApp.root);
            expect(document.body.contains(microApp.root!)).toBe(true);
        });

        it('should use an existing root element', () => {
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

        it('should use the already set root element', () => {
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

        it('should apply rootStyle styles', () => {
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

        it('should unmount the old application if it exists', () => {
            const oldApp = createMockApp();
            const newApp = createMockApp();
            const oldFactory = vi.fn().mockReturnValue(oldApp);
            const newFactory = vi.fn().mockReturnValue(newApp);

            const router1 = createMockRouter({
                matched: [{ app: 'old-app' }],
                options: { apps: { 'old-app': oldFactory } }
            });
            microApp._update(router1);

            expect(microApp.app).toBe(oldApp);
            expect(oldApp.unmount).not.toHaveBeenCalled();

            const router2 = createMockRouter({
                matched: [{ app: 'new-app' }],
                options: { apps: { 'new-app': newFactory } }
            });
            microApp._update(router2);

            expect(oldApp.unmount).toHaveBeenCalled();
            expect(microApp.app).toBe(newApp);
        });

        it('should append the root element to the body if not in DOM', () => {
            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect(document.body.contains(microApp.root!)).toBe(true);
        });

        it('should not re-append an element already in the DOM', () => {
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

            // Record the number of children in the body
            const initialChildCount = document.body.children.length;

            microApp._update(router);

            expect(document.body.children.length).toBe(initialChildCount);
            expect(microApp.root).toBe(existingElement);
        });

        it('should handle the case where the factory function is null', () => {
            const router = createMockRouter({
                matched: [],
                options: { apps: {} }
            });

            microApp._update(router, true);

            expect(microApp.app).toBeNull();
            expect((microApp as any)._factory).toBeNull();
        });
    });

    describe('destroy method', () => {
        it('should destroy the application and clean up the state', () => {
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

        it('should safely handle empty state', () => {
            expect(() => microApp.destroy()).not.toThrow();
            expect(microApp.app).toBeNull();
            expect(microApp.root).toBeNull();
            expect((microApp as any)._factory).toBeNull();
        });

        it('should handle partial state', () => {
            const mockApp = createMockApp();
            microApp.app = mockApp;
            // root and _factory remain null

            expect(() => microApp.destroy()).not.toThrow();
            expect(mockApp.unmount).toHaveBeenCalled();
            expect(microApp.app).toBeNull();
        });
    });

    describe('integration tests', () => {
        it('should fully handle the application lifecycle', () => {
            const mockApp1 = createMockApp();
            const mockApp2 = createMockApp();
            const factory1 = vi.fn().mockReturnValue(mockApp1);
            const factory2 = vi.fn().mockReturnValue(mockApp2);

            // Mount the first application
            const router1 = createMockRouter({
                root: '#app1',
                matched: [{ app: 'app1' }],
                options: { apps: { app1: factory1 } }
            });

            microApp._update(router1);

            expect(factory1).toHaveBeenCalledWith(router1);
            expect(mockApp1.mount).toHaveBeenCalledWith(microApp.root);
            expect(microApp.app).toBe(mockApp1);

            // Switch to the second application
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

            // Destroy
            microApp.destroy();

            expect(mockApp2.unmount).toHaveBeenCalled();
            expect(document.body.contains(microApp.root!)).toBe(false);
            expect(microApp.app).toBeNull();
            expect(microApp.root).toBeNull();
        });

        it('should handle complex route application configuration', () => {
            const mockApp = createMockApp();
            const dynamicFactory: RouterMicroAppCallback = vi
                .fn()
                .mockReturnValue(mockApp);

            // Test dynamic application factory
            const router = createMockRouter({
                matched: [{ app: dynamicFactory }],
                options: { apps: {} }
            });

            microApp._update(router);

            expect(dynamicFactory).toHaveBeenCalledWith(router);
            expect(mockApp.mount).toHaveBeenCalledWith(microApp.root);
            expect(microApp.app).toBe(mockApp);
        });

        it('should correctly handle rootStyle being false', () => {
            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } },
                parsedOptions: { rootStyle: false }
            });

            microApp._update(router);

            expect(microApp.root!.style.cssText).toBe('');
        });
    });

    describe('boundary case tests', () => {
        it('should handle the case where route.matched is an empty array', () => {
            const router = createMockRouter({
                matched: []
            });

            expect(() => microApp._update(router)).not.toThrow();
            expect(microApp.app).toBeNull();
        });

        it('should handle the case where route.matched[0] does not have an app attribute', () => {
            const router = createMockRouter({
                matched: [{}]
            });

            expect(() => microApp._update(router)).not.toThrow();
            expect(microApp.app).toBeNull();
        });

        it('should handle the case where the factory function returns null', () => {
            const mockFactory = vi.fn().mockReturnValue(null);
            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect(mockFactory).toHaveBeenCalledWith(router);
            expect(microApp.app).toBeNull();
        });

        it('should handle the case where the factory function throws an exception', () => {
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

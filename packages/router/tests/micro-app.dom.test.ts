/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getRootElement, MicroApp } from '../src/micro-app';
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
import { RouterMode, RouteType } from '../src/types';

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
        appId?: string;
        matched?: Array<{ app?: string | RouterMicroAppCallback }>;
        options?: any;
        parsedOptions?: Partial<RouterParsedOptions>;
    } = {}
): Router => {
    const baseOptions: RouterOptions = {
        appId: overrides.appId || 'test-router',
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
        appId: overrides.appId || 'test-router',
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

const createMockAppWithHydration = (): RouterMicroAppOptions => ({
    mount: vi.fn(),
    hydration: vi.fn(),
    unmount: vi.fn(),
    renderToString: vi.fn().mockResolvedValue('<div>rendered</div>')
});

describe('getRootElement', () => {
    afterEach(() => {
        vi.clearAllMocks();
        document.body.innerHTML = '';
    });

    describe('Basic functionality tests', () => {
        it('should return element by id', () => {
            const element = document.createElement('div');
            element.id = 'test-app';
            document.body.appendChild(element);

            const result = getRootElement('test-app');

            expect(result).toBe(element);
            expect(result.id).toBe('test-app');
        });

        it('should create new element when not found', () => {
            const result = getRootElement('non-existent');
            expect(result).toBeInstanceOf(HTMLElement);
            expect(result.id).toBe('non-existent');
            expect(document.body.contains(result)).toBe(true);
        });
    });

    describe('Edge case tests', () => {
        it('should create element with empty string id', () => {
            const result = getRootElement('');
            expect(result).toBeInstanceOf(HTMLElement);
            expect(result.id).toBe('');
            expect(document.body.contains(result)).toBe(true);
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

        it('should mount app with a new element as root', () => {
            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            document.body.innerHTML = '';

            const router = createMockRouter({
                appId: 'test-router',
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect(microApp.root).toBeInstanceOf(HTMLElement);
            expect(microApp.root!.id).toBe('test-router');
            // mount should be called with a child element, not the root itself
            expect(mockApp.mount).toHaveBeenCalledTimes(1);
            const mountArg = (mockApp.mount as any).mock.calls[0][0];
            expect(mountArg).toBeInstanceOf(HTMLElement);
            expect(mountArg.parentNode).toBe(microApp.root);
        });

        it('should use an existing root element', () => {
            document.body.innerHTML = '';
            const existingElement = document.createElement('div');
            existingElement.id = 'test-router';
            document.body.appendChild(existingElement);

            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                appId: 'test-router',
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect(microApp.root).toBe(existingElement);
            // mount should be called with a child element
            const mountArg = (mockApp.mount as any).mock.calls[0][0];
            expect(mountArg.parentNode).toBe(existingElement);
        });

        it('should use hydration when data-ssr is present', () => {
            document.body.innerHTML = '';
            const existingElement = document.createElement('div');
            existingElement.id = 'test-router';
            existingElement.setAttribute('data-ssr', '');
            const appRoot = document.createElement('div');
            appRoot.className = 'app-root';
            existingElement.appendChild(appRoot);
            document.body.appendChild(existingElement);

            const mockApp = createMockAppWithHydration();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                appId: 'test-router',
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect(mockApp.hydration).toHaveBeenCalledTimes(1);
            const hydrationArg = (mockApp.hydration as any).mock.calls[0][0];
            expect(hydrationArg).toBe(appRoot);
            expect(mockApp.mount).not.toHaveBeenCalled();
            // data-ssr attribute should be removed after hydration
            expect(existingElement.hasAttribute('data-ssr')).toBe(false);
        });

        it('should throw error when data-ssr is present but hydration is not provided', () => {
            document.body.innerHTML = '';
            const existingElement = document.createElement('div');
            existingElement.id = 'test-router';
            existingElement.setAttribute('data-ssr', '');
            const appRoot = document.createElement('div');
            existingElement.appendChild(appRoot);
            document.body.appendChild(existingElement);

            const mockApp = createMockApp(); // no hydration
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                appId: 'test-router',
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            expect(() => microApp._update(router)).toThrow(
                'SSR content detected but hydration function not provided'
            );
        });

        it('should fallback to mount when data-ssr is present but no child elements', () => {
            document.body.innerHTML = '';
            const existingElement = document.createElement('div');
            existingElement.id = 'test-router';
            existingElement.setAttribute('data-ssr', '');
            // No child elements - Vue 2 comment node scenario
            document.body.appendChild(existingElement);

            const mockApp = createMockAppWithHydration();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                appId: 'test-router',
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);

            expect(mockApp.hydration).not.toHaveBeenCalled();
            expect(mockApp.mount).toHaveBeenCalledTimes(1);
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

        it('should not apply any style when rootStyle is null', () => {
            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } },
                parsedOptions: {
                    rootStyle: null
                }
            });

            microApp._update(router);

            expect(microApp.root!.style.cssText).toBe('');
        });

        it('should unmount old app and remove first child when switching', () => {
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
            const oldMountArg = (oldApp.mount as any).mock.calls[0][0];
            expect(oldMountArg.parentNode).toBe(microApp.root);

            const router2 = createMockRouter({
                matched: [{ app: 'new-app' }],
                options: { apps: { 'new-app': newFactory } }
            });
            microApp._update(router2);

            expect(oldApp.unmount).toHaveBeenCalled();
            expect(microApp.app).toBe(newApp);
            // Old app's element should be removed
            expect(oldMountArg.parentNode).toBeNull();
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
            const mountPoint = document.createElement('div');
            document.body.appendChild(mountPoint);

            // Set up: create app with a child element
            microApp.root = mountPoint;
            microApp.app = mockApp;
            (microApp as any)._factory = vi.fn();
            const appRoot = document.createElement('div');
            mountPoint.appendChild(appRoot);

            microApp.destroy();

            expect(mockApp.unmount).toHaveBeenCalled();
            // First child should be removed
            expect(mountPoint.firstElementChild).toBeNull();
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

        it('should throw error when _update is called after destroy', () => {
            const mockFactory = vi.fn().mockReturnValue(createMockApp());
            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } }
            });

            microApp._update(router);
            expect(microApp.app).not.toBeNull();

            microApp.destroy();

            expect(() => microApp._update(router)).toThrow(
                'MicroApp has been destroyed'
            );
        });

        it('should throw error on multiple destroy calls', () => {
            microApp.destroy();
            expect(() => microApp._update({} as Router)).toThrow(
                'MicroApp has been destroyed'
            );
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
                appId: 'app1',
                matched: [{ app: 'app1' }],
                options: { apps: { app1: factory1 } }
            });

            microApp._update(router1);

            expect(factory1).toHaveBeenCalledWith(router1);
            expect(mockApp1.mount).toHaveBeenCalledTimes(1);
            const mountArg1 = (mockApp1.mount as any).mock.calls[0][0];
            expect(mountArg1.parentNode).toBe(microApp.root);
            expect(microApp.app).toBe(mockApp1);

            // Switch to the second application
            const router2 = createMockRouter({
                appId: 'app1', // Same mount point
                matched: [{ app: 'app2' }],
                options: { apps: { app2: factory2 } }
            });

            microApp._update(router2);

            expect(mockApp1.unmount).toHaveBeenCalled();
            expect(factory2).toHaveBeenCalledWith(router2);
            expect(mockApp2.mount).toHaveBeenCalledTimes(1);
            const mountArg2 = (mockApp2.mount as any).mock.calls[0][0];
            expect(mountArg2.parentNode).toBe(microApp.root);
            expect(microApp.app).toBe(mockApp2);
            // Old app's element should be removed
            expect(mountArg1.parentNode).toBeNull();

            // Destroy
            microApp.destroy();

            expect(mockApp2.unmount).toHaveBeenCalled();
            expect(microApp.app).toBeNull();
            expect(microApp.root).toBeNull();
        });

        it('should handle complex route application configuration', () => {
            const mockApp = createMockApp();
            const dynamicFactory: RouterMicroAppCallback = vi
                .fn()
                .mockReturnValue(mockApp);

            const router = createMockRouter({
                matched: [{ app: dynamicFactory }],
                options: { apps: {} }
            });

            microApp._update(router);

            expect(dynamicFactory).toHaveBeenCalledWith(router);
            expect(mockApp.mount).toHaveBeenCalledTimes(1);
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

        it('should correctly handle rootStyle being null', () => {
            const mockApp = createMockApp();
            const mockFactory = vi.fn().mockReturnValue(mockApp);

            const router = createMockRouter({
                matched: [{ app: 'test-app' }],
                options: { apps: { 'test-app': mockFactory } },
                parsedOptions: { rootStyle: null }
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

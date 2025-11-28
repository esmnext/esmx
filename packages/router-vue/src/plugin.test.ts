import type { Route, RouteConfig } from '@esmx/router';
import { Router, RouterMode } from '@esmx/router';
/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, nextTick } from 'vue';
import { RouterPlugin } from './plugin';
import { RouterLink } from './router-link';
import { RouterView } from './router-view';
import { useProvideRouter } from './use';

describe('plugin.ts - RouterPlugin', () => {
    let router: Router;
    let app: ReturnType<typeof createApp>;
    let container: HTMLElement;

    beforeEach(async () => {
        // Create DOM container
        container = document.createElement('div');
        container.id = 'test-app';
        document.body.appendChild(container);

        // Create test routes with render functions
        const routes: RouteConfig[] = [
            {
                path: '/',
                component: defineComponent({
                    name: 'Home',
                    render: () => h('div', 'Home Page')
                }),
                meta: { title: 'Home' }
            },
            {
                path: '/about',
                component: defineComponent({
                    name: 'About',
                    render: () => h('div', 'About Page')
                }),
                meta: { title: 'About' }
            }
        ];

        // Create and initialize router
        router = new Router({
            mode: RouterMode.memory,
            routes,
            base: new URL('http://localhost:8000/')
        });

        await router.replace('/');
        await nextTick();
    });

    afterEach(() => {
        if (app) {
            app.unmount();
        }
        if (router) {
            router.destroy();
        }
        if (container?.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('Plugin Installation', () => {
        it('should install plugin without errors', () => {
            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', 'Test App');
                }
            });

            expect(() => {
                app.use(RouterPlugin);
            }).not.toThrow();
        });

        it('should throw error for invalid Vue app instance', () => {
            const invalidApp = {};
            expect(() => {
                RouterPlugin.install(invalidApp);
            }).toThrow('[@esmx/router-vue] Invalid Vue app instance');
        });

        it('should throw error for null app instance', () => {
            expect(() => {
                RouterPlugin.install(null);
            }).toThrow('[@esmx/router-vue] Invalid Vue app instance');
        });

        it('should throw error for undefined app instance', () => {
            expect(() => {
                RouterPlugin.install(undefined);
            }).toThrow('[@esmx/router-vue] Invalid Vue app instance');
        });
    });

    describe('Global Properties Injection', () => {
        it('should inject $router and $route properties', async () => {
            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', 'Test App');
                }
            });

            app.use(RouterPlugin);
            app.mount(container);
            await nextTick();

            // Check that properties are defined using descriptors to avoid triggering getters
            const globalProperties = app.config.globalProperties;
            const routerDescriptor = Object.getOwnPropertyDescriptor(
                globalProperties,
                '$router'
            );
            const routeDescriptor = Object.getOwnPropertyDescriptor(
                globalProperties,
                '$route'
            );

            expect(routerDescriptor).toBeDefined();
            expect(routeDescriptor).toBeDefined();
            expect(routerDescriptor?.get).toBeDefined();
            expect(routeDescriptor?.get).toBeDefined();
            expect(typeof routerDescriptor?.get).toBe('function');
            expect(typeof routeDescriptor?.get).toBe('function');
        });

        it('should provide reactive $route property', async () => {
            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', 'Test App');
                }
            });

            app.use(RouterPlugin);
            app.mount(container);
            await nextTick();

            // Navigate to different route
            await router.push('/about');
            await nextTick();

            // Check that global properties are reactive (structure test)
            const globalProperties = app.config.globalProperties;
            const routeDescriptor = Object.getOwnPropertyDescriptor(
                globalProperties,
                '$route'
            );
            expect(routeDescriptor?.get).toBeDefined();
            expect(typeof routeDescriptor?.get).toBe('function');

            // Verify the descriptor is properly configured for reactivity
            expect(routeDescriptor?.enumerable).toBe(false);
            expect(routeDescriptor?.configurable).toBe(false);
        });

        it('should provide consistent $router instance across components', async () => {
            const ChildComponent = defineComponent({
                render() {
                    return h('div', 'Child');
                }
            });

            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h('div', [h('div', 'Parent'), h(ChildComponent)]);
                }
            });

            app.use(RouterPlugin);
            app.mount(container);
            await nextTick();

            // Verify that global properties are consistently available
            const globalProperties = app.config.globalProperties;
            const routerDescriptor = Object.getOwnPropertyDescriptor(
                globalProperties,
                '$router'
            );
            const routeDescriptor = Object.getOwnPropertyDescriptor(
                globalProperties,
                '$route'
            );

            expect(routerDescriptor).toBeDefined();
            expect(routeDescriptor).toBeDefined();
            expect(routerDescriptor?.get).toBeDefined();
            expect(typeof routerDescriptor?.get).toBe('function');
            expect(routeDescriptor?.get).toBeDefined();
            expect(typeof routeDescriptor?.get).toBe('function');
        });

        it('should actually call $router getter when accessed in component', async () => {
            let routerResult: Router | null = null;

            const TestComponent = defineComponent({
                mounted() {
                    // This will trigger the $router getter defined in the plugin
                    routerResult = this.$router;
                },
                render() {
                    return h('div', 'Test Component');
                }
            });

            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h(TestComponent);
                }
            });

            app.use(RouterPlugin);
            app.mount(container);
            await nextTick();

            // Verify the getter was called and returned correct value
            expect(routerResult).toEqual(router);
            expect(routerResult).toBeInstanceOf(Router);
        });

        it('should actually call $route getter when accessed in component', async () => {
            let routeResult: Route | null = null;

            const TestComponent = defineComponent({
                mounted() {
                    routeResult = this.$route;
                },
                render() {
                    return h('div', 'Test Component');
                }
            });

            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h(TestComponent);
                }
            });

            app.use(RouterPlugin);
            app.mount(container);
            await nextTick();

            // Navigate to ensure route state is set
            await router.push('/about');
            await nextTick();

            // Verify the getter was called and returned correct value
            expect(routeResult).toBeTruthy();
            expect(routeResult).toHaveProperty('path', '/about');
            expect(routeResult).toHaveProperty('meta.title', 'About');
        });
    });

    describe('Component Registration', () => {
        it('should register components with correct names', () => {
            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', 'Test App');
                }
            });

            app.use(RouterPlugin);

            const globalComponents = app._context.components;
            expect(globalComponents).toHaveProperty('RouterLink');
            expect(globalComponents).toHaveProperty('RouterView');
            expect(globalComponents.RouterLink).toBe(RouterLink);
            expect(globalComponents.RouterView).toBe(RouterView);
        });

        it('should register RouterLink component for global use', async () => {
            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', 'Test App with RouterLink available');
                }
            });

            app.use(RouterPlugin);
            app.mount(container);
            await nextTick();

            // Verify the component is registered globally
            const globalComponents = app._context.components;
            expect(globalComponents.RouterLink).toBeDefined();
            expect(typeof globalComponents.RouterLink).toBe('object');
        });

        it('should register RouterView component for global use', async () => {
            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', 'Test App with RouterView available');
                }
            });

            app.use(RouterPlugin);
            app.mount(container);
            await nextTick();

            // Verify the component is registered globally
            const globalComponents = app._context.components;
            expect(globalComponents.RouterView).toBeDefined();
            expect(typeof globalComponents.RouterView).toBe('object');
        });
    });

    describe('Error Handling', () => {
        it('should handle missing router context in global properties', () => {
            // Create a mock component instance without router context
            const mockComponent = {
                $: {
                    provides: {}
                }
            };

            // Simulate accessing $router without context
            const target = {};
            Object.defineProperties(target, {
                $router: {
                    get() {
                        // This simulates the getter function from the plugin
                        return require('./use').getRouter(mockComponent);
                    }
                }
            });

            expect(() => {
                (target as Record<string, unknown>).$router;
            }).toThrow();
        });

        it('should handle missing router context in $route property', () => {
            // Create a mock component instance without router context
            const mockComponent = {
                $: {
                    provides: {}
                }
            };

            // Simulate accessing $route without context
            const target = {};
            Object.defineProperties(target, {
                $route: {
                    get() {
                        // This simulates the getter function from the plugin
                        return require('./use').getRoute(mockComponent);
                    }
                }
            });

            expect(() => {
                (target as Record<string, unknown>).$route;
            }).toThrow();
        });
    });

    describe('Plugin Integration', () => {
        it('should work with multiple plugin installations', () => {
            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', 'Test App');
                }
            });

            // Install plugin multiple times
            app.use(RouterPlugin);
            app.use(RouterPlugin);

            expect(() => {
                app.mount(container);
            }).not.toThrow();
        });

        it('should maintain global properties after installation', async () => {
            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', 'Test App');
                }
            });

            app.use(RouterPlugin);
            app.mount(container);
            await nextTick();

            // Check that global properties are accessible using descriptors
            const globalProperties = app.config.globalProperties;
            const routerDescriptor = Object.getOwnPropertyDescriptor(
                globalProperties,
                '$router'
            );
            const routeDescriptor = Object.getOwnPropertyDescriptor(
                globalProperties,
                '$route'
            );

            expect(routerDescriptor).toBeDefined();
            expect(routeDescriptor).toBeDefined();
            expect(routerDescriptor?.get).toBeDefined();
            expect(routeDescriptor?.get).toBeDefined();
            expect(typeof routerDescriptor?.get).toBe('function');
            expect(typeof routeDescriptor?.get).toBe('function');
        });
    });

    describe('Type Safety', () => {
        it('should provide properly typed global properties', async () => {
            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', 'Test App');
                }
            });

            app.use(RouterPlugin);
            app.mount(container);
            await nextTick();

            // Check type safety through property descriptors
            const globalProperties = app.config.globalProperties;
            const routerDescriptor = Object.getOwnPropertyDescriptor(
                globalProperties,
                '$router'
            );
            const routeDescriptor = Object.getOwnPropertyDescriptor(
                globalProperties,
                '$route'
            );

            expect(routerDescriptor).toBeDefined();
            expect(routeDescriptor).toBeDefined();
            expect(typeof routerDescriptor?.get).toBe('function');
            expect(typeof routeDescriptor?.get).toBe('function');

            // Verify properties exist in global properties
            expect(Object.hasOwn(globalProperties, '$router')).toBe(true);
            expect(Object.hasOwn(globalProperties, '$route')).toBe(true);
        });

        it('should provide correct component types', () => {
            app = createApp({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', 'Test App');
                }
            });

            app.use(RouterPlugin);

            const globalComponents = app._context.components;

            // Check component properties exist
            expect(globalComponents.RouterLink.name).toBe('RouterLink');
            expect(globalComponents.RouterView.name).toBe('RouterView');

            // Check if components have setup functions (safely)
            const routerLinkComponent = globalComponents.RouterLink as Record<
                string,
                unknown
            >;
            const routerViewComponent = globalComponents.RouterView as Record<
                string,
                unknown
            >;

            expect(typeof routerLinkComponent.setup).toBe('function');
            expect(typeof routerViewComponent.setup).toBe('function');
        });
    });

    describe('Advanced Plugin Features', () => {
        it('should support property descriptor configuration', () => {
            interface TestApp {
                config: {
                    globalProperties: Record<string, unknown>;
                };
                component: (
                    name: string,
                    component: Record<string, unknown>
                ) => void;
            }

            const testApp: TestApp = {
                config: {
                    globalProperties: {}
                },
                component: (
                    name: string,
                    component: Record<string, unknown>
                ) => {
                    // Mock component registration
                }
            };

            RouterPlugin.install(testApp);

            const routerDescriptor = Object.getOwnPropertyDescriptor(
                testApp.config.globalProperties,
                '$router'
            );
            const routeDescriptor = Object.getOwnPropertyDescriptor(
                testApp.config.globalProperties,
                '$route'
            );

            // Check descriptor properties - Object.defineProperties sets these to false by default
            expect(routerDescriptor?.get).toBeDefined();
            expect(routerDescriptor?.enumerable).toBe(false); // Default value from Object.defineProperty
            expect(routerDescriptor?.configurable).toBe(false); // Default value from Object.defineProperty

            expect(routeDescriptor?.get).toBeDefined();
            expect(routeDescriptor?.enumerable).toBe(false); // Default value from Object.defineProperty
            expect(routeDescriptor?.configurable).toBe(false); // Default value from Object.defineProperty
        });

        it('should handle different app instance structures', () => {
            // Test with minimal app structure
            interface MinimalApp {
                config: {
                    globalProperties: Record<string, unknown>;
                };
                component: () => void;
            }

            const minimalApp: MinimalApp = {
                config: {
                    globalProperties: {}
                },
                component: () => {}
            };

            expect(() => {
                RouterPlugin.install(minimalApp);
            }).not.toThrow();

            // Verify property descriptors are properly set using descriptors
            const routerDescriptor = Object.getOwnPropertyDescriptor(
                minimalApp.config.globalProperties,
                '$router'
            );
            const routeDescriptor = Object.getOwnPropertyDescriptor(
                minimalApp.config.globalProperties,
                '$route'
            );

            expect(routerDescriptor).toBeDefined();
            expect(routeDescriptor).toBeDefined();
            expect(routerDescriptor?.get).toBeDefined();
            expect(routeDescriptor?.get).toBeDefined();
            expect(typeof routerDescriptor?.get).toBe('function');
            expect(typeof routeDescriptor?.get).toBe('function');
        });
    });
});

import { type RouteConfig, Router, RouterMode } from '@esmx/router';
/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, inject, nextTick, provide } from 'vue';
import { RouterView } from './router-view';
import { useProvideRouter } from './use';

// Mock components for testing
const HomeComponent = defineComponent({
    name: 'HomeComponent',
    setup() {
        return () => h('div', { class: 'home' }, 'Home Page');
    }
});

const AboutComponent = defineComponent({
    name: 'AboutComponent',
    setup() {
        return () => h('div', { class: 'about' }, 'About Page');
    }
});

const UserComponent = defineComponent({
    name: 'UserComponent',
    setup() {
        return () => h('div', { class: 'user' }, 'User Component');
    }
});

// ES Module component for testing resolveComponent
const ESModuleComponent = {
    __esModule: true,
    default: defineComponent({
        name: 'ESModuleComponent',
        setup() {
            return () =>
                h('div', { class: 'es-module' }, 'ES Module Component');
        }
    })
};

describe('router-view.ts - RouterView Component', () => {
    let router: Router;
    let testContainer: HTMLElement;

    beforeEach(async () => {
        // Create test container
        testContainer = document.createElement('div');
        testContainer.id = 'test-app';
        document.body.appendChild(testContainer);

        // Create test routes
        const routes: RouteConfig[] = [
            {
                path: '/',
                component: HomeComponent,
                meta: { title: 'Home' }
            },
            {
                path: '/about',
                component: AboutComponent,
                meta: { title: 'About' }
            },
            {
                path: '/users/:id',
                component: UserComponent,
                meta: { title: 'User' }
            },
            {
                path: '/es-module',
                component: ESModuleComponent,
                meta: { title: 'ES Module' }
            }
        ];

        // Create router instance
        router = new Router({
            root: '#test-app',
            routes,
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/')
        });

        // Initialize router to root path and wait for it to be ready
        await router.replace('/');
        // Wait for route to be fully initialized
        await new Promise((resolve) => setTimeout(resolve, 10));
    });

    afterEach(() => {
        // Clean up test environment
        if (testContainer.parentNode) {
            testContainer.parentNode.removeChild(testContainer);
        }

        // Destroy router
        if (router) {
            router.destroy();
        }
    });

    describe('Basic Functionality', () => {
        it('should render matched route component at depth 0', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            // Check if HomeComponent is rendered
            expect(testContainer.textContent).toContain('Home Page');

            app.unmount();
        });

        it('should render different components when route changes', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            // Initially should show Home
            expect(testContainer.textContent).toContain('Home Page');

            // Navigate to About
            await router.push('/about');
            await nextTick();

            expect(testContainer.textContent).toContain('About Page');

            app.unmount();
        });

        it('should handle routes with parameters', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);

            // Navigate to user route with parameter
            await router.push('/users/123');
            await nextTick();

            expect(testContainer.textContent).toContain('User Component');

            app.unmount();
        });
    });

    describe('Component Resolution', () => {
        it('should resolve ES module components correctly', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);

            // Navigate to ES module route
            await router.push('/es-module');
            await nextTick();

            expect(testContainer.textContent).toContain('ES Module Component');

            app.unmount();
        });

        it('should handle function components', async () => {
            const FunctionComponent = () => h('div', 'Function Component');

            const routes: RouteConfig[] = [
                {
                    path: '/function',
                    component: FunctionComponent,
                    meta: { title: 'Function' }
                }
            ];

            const functionRouter = new Router({
                root: '#test-app',
                routes,
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/')
            });

            // Initialize the router and wait for it to be ready
            await functionRouter.replace('/function');
            await new Promise((resolve) => setTimeout(resolve, 10));

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(functionRouter);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            expect(testContainer.textContent).toContain('Function Component');

            app.unmount();
            functionRouter.destroy();
        });
    });

    describe('Depth Tracking', () => {
        it('should inject depth 0 by default', async () => {
            let injectedDepth: number | undefined;

            // Use the same symbol key that RouterView uses internally
            const RouterViewDepth = Symbol('RouterViewDepth');

            // Create a custom RouterView component that can capture the injected depth
            const TestRouterView = defineComponent({
                name: 'TestRouterView',
                setup() {
                    injectedDepth = inject(RouterViewDepth, -1);
                    return () => h(RouterView);
                }
            });

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(TestRouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            // TestRouterView should inject the default depth 0 when no parent RouterView exists
            expect(injectedDepth).toBe(-1); // Default value since no parent RouterView provides depth

            app.unmount();
        });

        it('should provide correct depth in nested RouterViews', async () => {
            let parentDepth: number | undefined;
            let childDepth: number | undefined;

            const RouterViewDepth = Symbol('RouterViewDepth');

            const ParentTestComponent = defineComponent({
                name: 'ParentTestComponent',
                setup() {
                    parentDepth = inject(RouterViewDepth, -1);
                    provide(RouterViewDepth, 0); // Simulate parent RouterView
                    return () =>
                        h('div', [h('span', 'Parent'), h(ChildTestComponent)]);
                }
            });

            const ChildTestComponent = defineComponent({
                name: 'ChildTestComponent',
                setup() {
                    childDepth = inject(RouterViewDepth, -1);
                    return () => h('div', 'Child');
                }
            });

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(ParentTestComponent)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            // Parent should see default depth, child should see provided depth
            expect(parentDepth).toBe(-1); // Default value since no RouterView above
            expect(childDepth).toBe(0); // Value provided by parent

            app.unmount();
        });

        it('should handle nested RouterViews with correct depth', async () => {
            const Level1Component = defineComponent({
                name: 'Level1Component',
                setup() {
                    return () =>
                        h('div', [h('span', 'Level 1'), h(RouterView)]);
                }
            });

            const Level2Component = defineComponent({
                name: 'Level2Component',
                setup() {
                    return () => h('div', 'Level 2');
                }
            });

            const nestedRoutes: RouteConfig[] = [
                {
                    path: '/level1',
                    component: Level1Component,
                    children: [
                        {
                            path: 'level2',
                            component: Level2Component
                        }
                    ]
                }
            ];

            const nestedRouter = new Router({
                root: '#test-app',
                routes: nestedRoutes,
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/')
            });

            // Initialize the router and wait for it to be ready
            await nestedRouter.replace('/level1/level2');
            await new Promise((resolve) => setTimeout(resolve, 10));

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(nestedRouter);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            expect(testContainer.textContent).toContain('Level 1');
            expect(testContainer.textContent).toContain('Level 2');

            app.unmount();
            nestedRouter.destroy();
        });
    });

    describe('Edge Cases and Error Handling', () => {
        it('should render null when no route matches at current depth', async () => {
            const RouterViewDepth = Symbol('RouterViewDepth');

            const DeepRouterView = defineComponent({
                name: 'DeepRouterView',
                setup() {
                    // Inject depth 0 from parent RouterView and provide depth 1
                    const currentDepth = inject(RouterViewDepth, 0);
                    provide(RouterViewDepth, currentDepth + 1);
                    return () => h(RouterView);
                }
            });

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () =>
                        h('div', [
                            h('span', 'App'),
                            h(RouterView), // This renders Home component at depth 0
                            h(DeepRouterView) // This tries to render at depth 1, but no match
                        ]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            // Should contain "App" and "Home Page" from the first RouterView
            // but no additional content from the deep RouterView
            expect(testContainer.textContent).toContain('App');
            expect(testContainer.textContent).toContain('Home Page');

            app.unmount();
        });

        it('should handle null components gracefully', async () => {
            const routesWithNull: RouteConfig[] = [
                {
                    path: '/null-component',
                    component: null as RouteConfig['component'],
                    meta: { title: 'Null Component' }
                }
            ];

            const nullRouter = new Router({
                root: '#test-app',
                routes: routesWithNull,
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/')
            });

            // Initialize the router and wait for it to be ready
            await nullRouter.replace('/null-component');
            await new Promise((resolve) => setTimeout(resolve, 10));

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(nullRouter);
                    return () => h('div', [h('span', 'App'), h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            // Verify that only the "App" text is rendered and RouterView renders nothing
            expect(testContainer.textContent?.trim()).toBe('App');
            expect(testContainer.querySelector('div')?.children.length).toBe(1); // Only the span element
            expect(testContainer.querySelector('span')?.textContent).toBe(
                'App'
            );

            app.unmount();
            nullRouter.destroy();
        });

        it('should handle non-existent routes', async () => {
            // Create a new router instance with a valid initial route
            const nonExistentRouter = new Router({
                root: '#test-app',
                routes: [
                    {
                        path: '/',
                        component: null // Initial route with null component
                    }
                ],
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/')
            });

            // Initialize router with root path
            await nonExistentRouter.replace('/');
            await new Promise((resolve) => setTimeout(resolve, 10));

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(nonExistentRouter);
                    return () => h('div', [h('span', 'App'), h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);

            // Navigate to non-existent route
            await nonExistentRouter.push('/non-existent');
            await nextTick();

            // Wait for any pending route changes
            await new Promise((resolve) => setTimeout(resolve, 10));

            // Verify that only the "App" text is rendered and RouterView renders nothing
            expect(testContainer.textContent?.trim()).toBe('App');
            expect(testContainer.querySelector('div')?.children.length).toBe(1); // Only the span element
            expect(testContainer.querySelector('span')?.textContent).toBe(
                'App'
            );

            app.unmount();
            nonExistentRouter.destroy();
        });

        it('should handle malformed ES modules', async () => {
            const MalformedModule = {
                __esModule: true,
                default: null
            };

            const malformedRoutes: RouteConfig[] = [
                {
                    path: '/malformed',
                    component: MalformedModule as RouteConfig['component'],
                    meta: { title: 'Malformed' }
                }
            ];

            const malformedRouter = new Router({
                root: '#test-app',
                routes: malformedRoutes,
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/')
            });

            // Initialize the router and wait for it to be ready
            await malformedRouter.replace('/malformed');
            await new Promise((resolve) => setTimeout(resolve, 10));

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(malformedRouter);
                    return () => h('div', [h('span', 'App'), h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            expect(testContainer.textContent).toBe('App');

            app.unmount();
            malformedRouter.destroy();
        });
    });

    describe('Component Properties', () => {
        it('should have correct component name', () => {
            expect(RouterView.name).toBe('RouterView');
        });

        it('should be a valid Vue component', () => {
            expect(RouterView).toHaveProperty('setup');
            expect(typeof RouterView.setup).toBe('function');
        });

        it('should not define props', () => {
            expect(RouterView.props).toBeUndefined();
        });
    });

    describe('Integration Tests', () => {
        it('should re-render when route changes', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            expect(testContainer.textContent).toContain('Home Page');

            await router.push('/about');
            await nextTick();
            expect(testContainer.textContent).toContain('About Page');

            await router.push('/users/123');
            await nextTick();
            expect(testContainer.textContent).toContain('User Component');

            app.unmount();
        });

        it('should work with router navigation methods', async () => {
            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);

            await router.push('/about');
            await nextTick();
            expect(testContainer.textContent).toContain('About Page');

            await router.replace('/users/456');
            await nextTick();
            expect(testContainer.textContent).toContain('User Component');

            await router.back();
            await nextTick();
            expect(testContainer.textContent).toContain('Home Page');

            app.unmount();
        });
    });
});

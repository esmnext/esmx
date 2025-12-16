import { type RouteConfig, Router, RouterMode } from '@esmx/router';
/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createApp, defineComponent, h, inject, nextTick, provide } from 'vue';
import { RouterView } from './router-view';
import { useProvideRouter } from './use';

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
        testContainer = document.createElement('div');
        testContainer.id = 'test-app';
        document.body.appendChild(testContainer);

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

        router = new Router({
            root: '#test-app',
            routes,
            mode: RouterMode.memory,
            base: new URL('http://localhost:8000/')
        });

        await router.replace('/');
        await new Promise((resolve) => setTimeout(resolve, 10));
    });

    afterEach(() => {
        if (testContainer.parentNode) {
            testContainer.parentNode.removeChild(testContainer);
        }

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

            expect(testContainer.textContent).toContain('Home Page');

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
                base: new URL('http://localhost:8000/')
            });

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

            const RouterViewDepth = Symbol('RouterViewDepth');

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

            expect(injectedDepth).toBe(-1);

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
                    provide(RouterViewDepth, 0);
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

            expect(parentDepth).toBe(-1);
            expect(childDepth).toBe(0);

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
                base: new URL('http://localhost:8000/')
            });

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
                            h(RouterView),
                            h(DeepRouterView)
                        ]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

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
                base: new URL('http://localhost:8000/')
            });

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

            expect(testContainer.textContent?.trim()).toBe('App');
            expect(testContainer.querySelector('div')?.children.length).toBe(1);
            expect(testContainer.querySelector('span')?.textContent).toBe(
                'App'
            );

            app.unmount();
            nullRouter.destroy();
        });

        it('should handle non-existent routes', async () => {
            const nonExistentRouter = new Router({
                root: '#test-app',
                routes: [
                    {
                        path: '/',
                        component: null
                    }
                ],
                mode: RouterMode.memory,
                base: new URL('http://localhost:8000/')
            });

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

            await nonExistentRouter.push('/non-existent');
            await nextTick();

            await new Promise((resolve) => setTimeout(resolve, 10));

            expect(testContainer.textContent?.trim()).toBe('App');
            expect(testContainer.querySelector('div')?.children.length).toBe(1);
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
                base: new URL('http://localhost:8000/')
            });

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

    describe('compilePath as Key', () => {
        it('should use compilePath as key for component rendering', async () => {
            let mountCount = 0;
            const TrackedComponent = defineComponent({
                name: 'TrackedComponent',
                setup() {
                    mountCount++;
                    return () =>
                        h(
                            'div',
                            { class: 'tracked' },
                            `Mounted ${mountCount} times`
                        );
                }
            });

            const routes: RouteConfig[] = [
                {
                    path: '/route1',
                    component: TrackedComponent
                },
                {
                    path: '/route2',
                    component: TrackedComponent
                }
            ];

            const testRouter = new Router({
                root: '#test-app',
                routes,
                mode: RouterMode.memory,
                base: new URL('http://localhost:8000/')
            });

            await testRouter.replace('/route1');
            await new Promise((resolve) => setTimeout(resolve, 10));

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(testRouter);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            expect(mountCount).toBe(1);
            expect(testContainer.textContent).toContain('Mounted 1 times');

            await testRouter.push('/route2');
            await nextTick();

            expect(mountCount).toBe(2);
            expect(testContainer.textContent).toContain('Mounted 2 times');

            await testRouter.push('/route1');
            await nextTick();

            expect(mountCount).toBe(3);
            expect(testContainer.textContent).toContain('Mounted 3 times');

            app.unmount();
            testRouter.destroy();
        });

        it('should force re-render when compilePath changes for same route', async () => {
            let mountCount = 0;
            const TrackedComponent = defineComponent({
                name: 'TrackedComponent',
                setup() {
                    mountCount++;
                    return () =>
                        h('div', { class: 'tracked' }, `Mount #${mountCount}`);
                }
            });

            const routes: RouteConfig[] = [
                {
                    path: '/test',
                    component: TrackedComponent
                }
            ];

            const testRouter = new Router({
                root: '#test-app',
                routes,
                mode: RouterMode.memory,
                base: new URL('http://localhost:8000/')
            });

            await testRouter.replace('/test');
            await new Promise((resolve) => setTimeout(resolve, 10));

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(testRouter);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            expect(mountCount).toBe(1);
            expect(testContainer.textContent).toContain('Mount #1');

            const newRoutes: RouteConfig[] = [
                {
                    path: '/test',
                    component: TrackedComponent,
                    meta: { updated: true }
                }
            ];

            const newRouter = new Router({
                root: '#test-app',
                routes: newRoutes,
                mode: RouterMode.memory,
                base: new URL('http://localhost:8000/')
            });

            await newRouter.replace('/test');
            await new Promise((resolve) => setTimeout(resolve, 10));

            app.unmount();

            const NewTestApp = defineComponent({
                setup() {
                    useProvideRouter(newRouter);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const newApp = createApp(NewTestApp);
            newApp.mount(testContainer);
            await nextTick();

            expect(mountCount).toBe(2);
            expect(testContainer.textContent).toContain('Mount #2');

            newApp.unmount();
            newRouter.destroy();
        });

        it('should handle same component with same compilePath without unnecessary re-renders', async () => {
            let mountCount = 0;
            const TrackedComponent = defineComponent({
                name: 'TrackedComponent',
                setup() {
                    mountCount++;
                    return () => h('div', { class: 'tracked' }, `Component`);
                }
            });

            const routes: RouteConfig[] = [
                {
                    path: '/test',
                    component: TrackedComponent
                }
            ];

            const testRouter = new Router({
                root: '#test-app',
                routes,
                mode: RouterMode.memory,
                base: new URL('http://localhost:8000/')
            });

            await testRouter.replace('/test');
            await new Promise((resolve) => setTimeout(resolve, 10));

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(testRouter);
                    return () => h('div', [h(RouterView)]);
                }
            });

            const app = createApp(TestApp);
            app.mount(testContainer);
            await nextTick();

            expect(mountCount).toBe(1);

            await testRouter.push('/');
            await nextTick();
            await testRouter.push('/test');
            await nextTick();

            expect(mountCount).toBe(1);

            app.unmount();
            testRouter.destroy();
        });

        it('should work with nested routes and compilePath keys', async () => {
            let parentMountCount = 0;
            let childMountCount = 0;

            const ParentComponent = defineComponent({
                name: 'ParentComponent',
                setup() {
                    parentMountCount++;
                    return () =>
                        h('div', [
                            h('h1', `Parent Mount #${parentMountCount}`),
                            h(RouterView)
                        ]);
                }
            });

            const ChildComponent = defineComponent({
                name: 'ChildComponent',
                setup() {
                    childMountCount++;
                    return () =>
                        h(
                            'div',
                            { class: 'child' },
                            `Child Mount #${childMountCount}`
                        );
                }
            });

            const nestedRoutes: RouteConfig[] = [
                {
                    path: '/parent',
                    component: ParentComponent,
                    children: [
                        {
                            path: 'child',
                            component: ChildComponent
                        }
                    ]
                }
            ];

            const nestedRouter = new Router({
                root: '#test-app',
                routes: nestedRoutes,
                mode: RouterMode.memory,
                base: new URL('http://localhost:8000/')
            });

            await nestedRouter.replace('/parent/child');
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

            expect(parentMountCount).toBe(1);
            expect(childMountCount).toBe(1);

            expect(testContainer.textContent).toContain('Parent Mount #1');
            expect(testContainer.textContent).toContain('Child Mount #1');

            app.unmount();
            nestedRouter.destroy();
        });
    });
});

import { type Route, Router, RouterMode } from '@esmx/router';
/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
    createApp,
    defineComponent,
    getCurrentInstance,
    h,
    nextTick
} from 'vue';
import { RouterView } from './router-view';
import {
    getRouterViewDepth,
    useProvideRouter,
    useRoute,
    useRouter,
    useRouterViewDepth
} from './use';

describe('Router Vue Integration', () => {
    let app: ReturnType<typeof createApp>;
    let router: Router;
    let mountPoint: HTMLElement;

    beforeEach(async () => {
        // Create a real Router instance
        router = new Router({
            mode: RouterMode.memory,
            routes: [
                { path: '/initial', component: {} },
                { path: '/new-route', component: {} },
                { path: '/user/:id', component: {} },
                { path: '/new-path', component: {} }
            ],
            base: new URL('http://localhost:8000/')
        });

        // Ensure navigation to initial route is complete
        await router.replace('/initial');

        // Create mount point
        mountPoint = document.createElement('div');
        mountPoint.id = 'app';
        document.body.appendChild(mountPoint);
    });

    afterEach(() => {
        if (app) {
            app.unmount();
        }
        document.body.removeChild(mountPoint);

        // Clean up router
        router.destroy();
    });

    describe('Router and Route Access', () => {
        it('should provide router and route access', async () => {
            let routerResult: Router | undefined;
            let routeResult: Route | undefined;

            const TestApp = {
                setup() {
                    useProvideRouter(router);
                    routerResult = useRouter();
                    routeResult = useRoute();
                    return () => h('div', 'Test App');
                }
            };

            app = createApp(TestApp);
            app.mount('#app');

            // Check retrieved objects
            expect(routerResult).toEqual(router);
            expect(routeResult).toBeDefined();
            expect(routeResult?.path).toBe('/initial');
        });
    });

    describe('Route Reactivity', () => {
        it('should update route properties when route changes', async () => {
            let routeRef: Route | undefined;

            const TestApp = {
                setup() {
                    useProvideRouter(router);
                    routeRef = useRoute();
                    return () => h('div', routeRef?.path);
                }
            };

            app = createApp(TestApp);
            app.mount('#app');

            // Initial state
            expect(routeRef?.path).toBe('/initial');

            // Save reference to check identity
            const initialRouteRef = routeRef;

            // Navigate to new route
            await router.replace('/new-route');
            await nextTick();

            // Check that reference is preserved but properties are updated
            expect(routeRef).toBe(initialRouteRef);
            expect(routeRef?.path).toBe('/new-route');
        });

        it('should update route params when route changes', async () => {
            let routeRef: Route | undefined;

            const TestApp = {
                setup() {
                    useProvideRouter(router);
                    routeRef = useRoute();
                    return () =>
                        h('div', [
                            h('span', routeRef?.path),
                            h('span', routeRef?.params?.id || 'no-id')
                        ]);
                }
            };

            app = createApp(TestApp);
            app.mount('#app');

            // Navigate to route with params
            await router.replace('/user/123');
            await nextTick();

            // Check if params are updated
            expect(routeRef?.path).toBe('/user/123');
            expect(routeRef?.params?.id).toBe('123');
        });

        it('should automatically update view when route changes', async () => {
            // Track render count
            const renderCount = { value: 0 };
            let routeRef: Route | undefined;

            const TestApp = {
                setup() {
                    useProvideRouter(router);
                    routeRef = useRoute();
                    return () => {
                        renderCount.value++;
                        return h('div', routeRef?.path);
                    };
                }
            };

            app = createApp(TestApp);
            app.mount('#app');

            // Initial render
            const initialRenderCount = renderCount.value;
            expect(routeRef?.path).toBe('/initial');

            // Navigate to new route
            await router.replace('/new-route');
            await nextTick();

            // Check if render count increased, confirming view update
            expect(renderCount.value).toBeGreaterThan(initialRenderCount);
            expect(routeRef?.path).toBe('/new-route');

            // Navigate to another route
            const previousRenderCount = renderCount.value;
            await router.replace('/new-path');
            await nextTick();

            // Check if render count increased again
            expect(renderCount.value).toBeGreaterThan(previousRenderCount);
            expect(routeRef?.path).toBe('/new-path');
        });
    });

    describe('Nested Components', () => {
        it('should provide route context to child components', async () => {
            let parentRoute: Route | undefined;
            let childRoute: Route | undefined;

            const ChildComponent = {
                setup() {
                    childRoute = useRoute();
                    return () => h('div', 'Child: ' + childRoute?.path);
                }
            };

            const ParentComponent = {
                setup() {
                    parentRoute = useRoute();
                    return () =>
                        h('div', [
                            h('span', 'Parent: ' + parentRoute?.path),
                            h(ChildComponent)
                        ]);
                }
            };

            const TestApp = {
                setup() {
                    useProvideRouter(router);
                    return () => h(ParentComponent);
                }
            };

            app = createApp(TestApp);
            app.mount('#app');

            expect(parentRoute).toBeDefined();
            expect(childRoute).toBeDefined();
            expect(parentRoute?.path).toBe('/initial');
            expect(childRoute?.path).toBe('/initial');

            // Navigate to new path
            await router.replace('/new-path');
            await nextTick();

            // Both parent and child components should see updates
            expect(parentRoute?.path).toBe('/new-path');
            expect(childRoute?.path).toBe('/new-path');
        });
    });

    describe('RouterView Depth', () => {
        it('should get depth in single RouterView', async () => {
            let observedDepth: number | undefined;

            const LeafProbe = defineComponent({
                setup() {
                    const p = getCurrentInstance()!.proxy as any;
                    observedDepth = getRouterViewDepth(p);
                    return () => h('div');
                }
            });

            const Level1 = defineComponent({
                setup() {
                    return () => h('div', [h(LeafProbe)]);
                }
            });

            router = new Router({
                mode: RouterMode.memory,
                routes: [{ path: '/level1', component: Level1 }],
                base: new URL('http://localhost:8000/')
            });

            await router.replace('/level1');

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(RouterView)]);
                }
            });

            app = createApp(TestApp);
            app.mount('#app');
            await nextTick();

            expect(observedDepth).toBe(1);
        });

        it('should get depth in nested RouterView', async () => {
            let observedDepth: number | undefined;

            const LeafProbe = defineComponent({
                setup() {
                    const p = getCurrentInstance()!.proxy as any;
                    observedDepth = getRouterViewDepth(p);
                    return () => h('div');
                }
            });

            const Level1 = defineComponent({
                setup() {
                    return () => h('div', [h(RouterView)]);
                }
            });

            const Leaf = defineComponent({
                setup() {
                    return () => h('div', [h(LeafProbe)]);
                }
            });

            router = new Router({
                mode: RouterMode.memory,
                routes: [
                    {
                        path: '/level1',
                        component: Level1,
                        children: [{ path: 'leaf', component: Leaf }]
                    }
                ],
                base: new URL('http://localhost:8000/')
            });

            await router.replace('/level1/leaf');

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(RouterView)]);
                }
            });

            app = createApp(TestApp);
            app.mount('#app');
            await nextTick();

            expect(observedDepth).toBe(2);
        });

        it('should get depth in double-nested RouterViews', async () => {
            let observedDepth: number | undefined;

            const LeafProbe = defineComponent({
                setup() {
                    const p = getCurrentInstance()!.proxy as any;
                    observedDepth = getRouterViewDepth(p);
                    return () => h('div');
                }
            });

            const Level1 = defineComponent({
                setup() {
                    return () => h('div', [h(RouterView)]);
                }
            });

            const Level2 = defineComponent({
                setup() {
                    return () => h('div', [h(RouterView)]);
                }
            });

            const Leaf = defineComponent({
                setup() {
                    return () => h('div', [h(LeafProbe)]);
                }
            });

            router = new Router({
                mode: RouterMode.memory,
                routes: [
                    {
                        path: '/level1',
                        component: Level1,
                        children: [
                            {
                                path: 'level2',
                                component: Level2,
                                children: [{ path: 'leaf', component: Leaf }]
                            }
                        ]
                    }
                ],
                base: new URL('http://localhost:8000/')
            });

            await router.replace('/level1/level2/leaf');

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(RouterView)]);
                }
            });

            app = createApp(TestApp);
            app.mount('#app');
            await nextTick();

            expect(observedDepth).toBe(3);
        });

        it('should throw when no RouterView ancestor exists', async () => {
            let callDepth: (() => void) | undefined;

            const Probe = defineComponent({
                setup() {
                    const p = getCurrentInstance()!.proxy as any;
                    callDepth = () => getRouterViewDepth(p);
                    return () => h('div');
                }
            });

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h(Probe);
                }
            });

            app = createApp(TestApp);
            app.mount('#app');
            await nextTick();

            expect(() => callDepth!()).toThrow(
                new Error(
                    '[@esmx/router-vue] RouterView depth not found. Please ensure a RouterView exists in ancestor components.'
                )
            );
        });

        it('should return 0 for useRouterViewDepth without RouterView', async () => {
            let observed = -1;

            const Probe = defineComponent({
                setup() {
                    observed = useRouterViewDepth();
                    return () => h('div');
                }
            });

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h(Probe);
                }
            });

            app = createApp(TestApp);
            app.mount('#app');
            await nextTick();

            expect(observed).toBe(0);
        });

        it('should reflect depth via useRouterViewDepth at each level', async () => {
            let level1Depth = -1;
            let level2Depth = -1;

            const Level2 = defineComponent({
                setup() {
                    level2Depth = useRouterViewDepth();
                    return () => h('div');
                }
            });

            const Level1 = defineComponent({
                setup() {
                    level1Depth = useRouterViewDepth();
                    return () => h('div', [h(RouterView)]);
                }
            });

            router = new Router({
                mode: RouterMode.memory,
                routes: [
                    {
                        path: '/level1',
                        component: Level1,
                        children: [{ path: 'level2', component: Level2 }]
                    }
                ],
                base: new URL('http://localhost:8000/')
            });

            await router.replace('/level1/level2');

            const TestApp = defineComponent({
                setup() {
                    useProvideRouter(router);
                    return () => h('div', [h(RouterView)]);
                }
            });

            app = createApp(TestApp);
            app.mount('#app');
            await nextTick();

            expect(level1Depth).toBe(1);
            expect(level2Depth).toBe(2);
        });
    });
});

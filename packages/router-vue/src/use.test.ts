import { type Route, Router, RouterMode } from '@esmx/router';
/**
 * @vitest-environment happy-dom
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createApp, h } from 'vue';
import { useProvideRouter, useRoute, useRouter } from './use';

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
            base: new URL('http://localhost:3000/')
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
});

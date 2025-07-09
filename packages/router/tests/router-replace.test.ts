import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Router } from '../src/router';
import { RouteType, RouterMode } from '../src/types';

describe('Router Replace Tests', () => {
    let router: Router;

    beforeEach(async () => {
        router = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                { path: '/', component: () => 'Home' },
                { path: '/user/:id', component: () => 'User' },
                { path: '/about', component: () => 'About' },
                {
                    path: '/async',
                    asyncComponent: () =>
                        new Promise((resolve) =>
                            setTimeout(() => resolve('AsyncComponent'), 10)
                        )
                }
            ]
        });

        await router.replace('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('Basic replace navigation', () => {
        test('should successfully replace current route', async () => {
            await router.push('/about');
            const route = await router.replace('/user/123');

            expect(route.path).toBe('/user/123');
            expect(route.params.id).toBe('123');
            expect(route.type).toBe(RouteType.replace);
            expect(route.handle).not.toBe(null);
            expect(router.route.path).toBe('/user/123');
        });

        test('should handle query parameters in replace', async () => {
            const route = await router.replace(
                '/user/123?tab=profile&active=true'
            );

            expect(route.params.id).toBe('123');
            expect(route.query.tab).toBe('profile');
            expect(route.query.active).toBe('true');
        });

        test('should handle async component loading', async () => {
            const route = await router.replace('/async');

            expect(route.path).toBe('/async');
            expect(route.handle).not.toBe(null);
        });
    });

    describe('Error handling', () => {
        test('should throw error for async component loading failure', async () => {
            const errorRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: () => 'Home' },
                    {
                        path: '/error',
                        asyncComponent: () =>
                            Promise.reject(new Error('Loading failed'))
                    }
                ]
            });

            await errorRouter.replace('/');
            await expect(errorRouter.replace('/error')).rejects.toThrow();

            errorRouter.destroy();
        });

        test('should throw error when guard prevents navigation', async () => {
            const guardRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: () => 'Home' },
                    {
                        path: '/protected',
                        component: () => 'Protected',
                        beforeEnter: () => false
                    }
                ]
            });

            await guardRouter.replace('/');
            await expect(guardRouter.replace('/protected')).rejects.toThrow();

            guardRouter.destroy();
        });
    });

    describe('History management', () => {
        test('should not create new history entry', async () => {
            await router.push('/about');
            await router.replace('/user/123');

            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/');
        });

        test('should replace current entry in history', async () => {
            await router.push('/about');
            await router.push('/user/456');
            await router.replace('/user/789');

            const backRoute = await router.back();
            expect(backRoute?.path).toBe('/about');
        });
    });

    describe('Edge cases', () => {
        test('should handle replace to current route', async () => {
            await router.push('/about');
            const route = await router.replace('/about');

            expect(route.path).toBe('/about');
            expect(route.handle).not.toBe(null);
        });

        test('should handle empty parameter', async () => {
            const route = await router.replace('');
            expect(route).toBeDefined();
            expect(typeof route.path).toBe('string');
        });
    });
});

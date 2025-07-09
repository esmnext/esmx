import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Router } from '../src/router';
import { RouteType, RouterMode } from '../src/types';

describe('Router Push Tests', () => {
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

    describe('Basic push navigation', () => {
        test('should successfully push to new route', async () => {
            const route = await router.push('/user/123');

            expect(route.path).toBe('/user/123');
            expect(route.params.id).toBe('123');
            expect(route.type).toBe(RouteType.push);
            expect(route.handle).not.toBe(null);
            expect(router.route.path).toBe('/user/123');
        });

        test('should handle query parameters in push', async () => {
            const route = await router.push(
                '/user/123?tab=profile&active=true'
            );

            expect(route.params.id).toBe('123');
            expect(route.query.tab).toBe('profile');
            expect(route.query.active).toBe('true');
        });

        test('should handle async component loading', async () => {
            const route = await router.push('/async');

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
            await expect(errorRouter.push('/error')).rejects.toThrow();

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
            await expect(guardRouter.push('/protected')).rejects.toThrow();

            guardRouter.destroy();
        });
    });

    describe('Concurrent navigation', () => {
        test('should handle concurrent push operations', async () => {
            const promises = [
                router.push('/user/1').catch((err) => err),
                router.push('/user/2').catch((err) => err)
            ];

            const [result1, result2] = await Promise.all(promises);

            const successResults = [result1, result2].filter(
                (r) => !(r instanceof Error)
            );
            const errorResults = [result1, result2].filter(
                (r) => r instanceof Error
            );

            expect(successResults).toHaveLength(1);
            expect(errorResults).toHaveLength(1);
        });
    });

    describe('Edge cases', () => {
        test('should handle push to current route', async () => {
            await router.push('/about');
            const route = await router.push('/about');

            expect(route.path).toBe('/about');
            expect(route.handle).not.toBe(null);
        });

        test('should handle empty parameter', async () => {
            const route = await router.push('');
            expect(route).toBeDefined();
            expect(typeof route.path).toBe('string');
        });
    });
});

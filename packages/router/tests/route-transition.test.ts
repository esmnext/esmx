import { afterEach, beforeEach, describe, expect, it, test } from 'vitest';
import type { Route } from '../src/route';
import { Router } from '../src/router';
import { RouteType, RouterMode } from '../src/types';

describe('Route Transition Tests', () => {
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
                    asyncComponent: () => Promise.resolve('Async')
                }
            ]
        });

        await router.replace('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('Basic transitions', () => {
        test('should successfully transition to new route', async () => {
            const route = await router.push('/user/123');

            expect(route.path).toBe('/user/123');
            expect(route.params.id).toBe('123');
            expect(route.handle).not.toBe(null);
        });

        test('should handle async component loading', async () => {
            const route = await router.push('/async');

            expect(route.path).toBe('/async');
            expect(route.handle).not.toBe(null);
        });
    });

    describe('Error handling', () => {
        test('should handle non-existent routes', async () => {
            const route = await router.push('/non-existent');
            expect(route.matched).toHaveLength(0);
            expect(route.config).toBe(null);
        });

        test('should handle component loading errors', async () => {
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
    });

    describe('Concurrent navigation', () => {
        test('should handle concurrent navigation attempts', async () => {
            const promises = Array.from({ length: 5 }, (_, i) =>
                router.push(`/user/${i + 1}`).catch((err) => err)
            );

            const results = await Promise.all(promises);

            const successResults = results.filter((r) => !(r instanceof Error));
            const abortedResults = results.filter((r) => r instanceof Error);

            expect(successResults).toHaveLength(1);
            expect(abortedResults).toHaveLength(4);

            const successResult = successResults[0] as Route;
            expect(router.route.path).toBe(successResult.path);
            expect(router.route.params.id).toBe(successResult.params.id);
        });
    });

    describe('Route guards', () => {
        let guardRouter: Router;
        let guardLog: string[];

        beforeEach(async () => {
            guardLog = [];

            guardRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    { path: '/', component: () => 'Home' },
                    {
                        path: '/protected',
                        component: () => 'Protected',
                        beforeEnter: () => {
                            guardLog.push('beforeEnter-protected');
                            return false;
                        }
                    },
                    {
                        path: '/allowed',
                        component: () => 'Allowed',
                        beforeEnter: () => {
                            guardLog.push('beforeEnter-allowed');
                        }
                    }
                ]
            });

            await guardRouter.replace('/');
        });

        afterEach(() => {
            guardRouter.destroy();
        });

        test('should block navigation when guard returns false', async () => {
            await expect(guardRouter.push('/protected')).rejects.toThrow();
            expect(guardLog).toContain('beforeEnter-protected');
            expect(guardRouter.route.path).toBe('/');
        });

        test('should allow navigation when guard returns true', async () => {
            const route = await guardRouter.push('/allowed');

            expect(guardLog).toContain('beforeEnter-allowed');
            expect(route.path).toBe('/allowed');
            expect(guardRouter.route.path).toBe('/allowed');
        });
    });

    describe('Navigation types', () => {
        test('should correctly set route type for push navigation', async () => {
            const route = await router.push('/user/123');
            expect(route.type).toBe(RouteType.push);
        });

        test('should correctly set route type for replace navigation', async () => {
            const route = await router.replace('/user/123');
            expect(route.type).toBe(RouteType.replace);
        });
    });

    describe('Route parameters and query', () => {
        test('should correctly extract route parameters', async () => {
            const route = await router.push('/user/456');

            expect(route.params.id).toBe('456');
            expect(route.path).toBe('/user/456');
        });

        test('should handle query parameters', async () => {
            const route = await router.push(
                '/user/123?tab=profile&active=true'
            );

            expect(route.params.id).toBe('123');
            expect(route.query.tab).toBe('profile');
            expect(route.query.active).toBe('true');
        });
    });
});

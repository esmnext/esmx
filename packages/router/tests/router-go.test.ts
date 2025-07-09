import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { Router } from '../src/router';
import { RouterMode } from '../src/types';

describe('Router Go Tests', () => {
    let router: Router;

    beforeEach(async () => {
        router = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                { path: '/', component: () => 'Home' },
                { path: '/user/:id', component: () => 'User' },
                { path: '/about', component: () => 'About' }
            ]
        });

        await router.replace('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('Basic go navigation', () => {
        test('should go back successfully', async () => {
            await router.push('/about');
            await router.push('/user/123');

            const route = await router.go(-1);
            expect(route?.path).toBe('/about');
            expect(router.route.path).toBe('/about');
        });

        test('should go forward successfully', async () => {
            await router.push('/about');
            await router.push('/user/123');
            await router.back();

            const route = await router.go(1);
            expect(route?.path).toBe('/user/123');
            expect(router.route.path).toBe('/user/123');
        });

        test('should handle go to specific position', async () => {
            await router.push('/about');
            await router.push('/user/123');
            await router.push('/user/456');

            const route = await router.go(-2);
            expect(route?.path).toBe('/about');
        });
    });

    describe('Error handling', () => {
        test('should handle go when history is empty', async () => {
            const route = await router.go(-1);
            expect(route).toBe(null);

            const route2 = await router.go(1);
            expect(route2).toBe(null);
        });

        test('should handle invalid delta values', async () => {
            const route = await router.go(0);
            expect(route).toBe(null); // go(0) should return null as no navigation occurs

            const route2 = await router.go(-10);
            expect(route2).toBe(null);
        });
    });

    describe('History boundaries', () => {
        test('should return null when going beyond history', async () => {
            const route = await router.go(-10);
            expect(route).toBe(null);

            const route2 = await router.go(10);
            expect(route2).toBe(null);
        });

        test('should handle boundary conditions gracefully', async () => {
            await router.push('/about');

            const route = await router.go(-2);
            expect(route).toBe(null);
            expect(router.route.path).toBe('/about');
        });
    });
});

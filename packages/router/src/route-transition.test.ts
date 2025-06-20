import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Router } from './router';
import { RouterMode } from './types';

describe('Route-Level Navigation Guards', () => {
    let router: Router;
    let executionLog: string[];

    beforeEach(async () => {
        executionLog = [];

        router = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/',
                    component: () => 'Home'
                },
                {
                    path: '/login',
                    component: () => 'Login'
                },
                {
                    path: '/protected',
                    component: () => 'Protected',
                    beforeEnter: async (to, from) => {
                        executionLog.push('beforeEnter-protected');
                        if (to.query.token !== 'valid') {
                            return '/login';
                        }
                    }
                },
                {
                    path: '/blocked',
                    component: () => 'Blocked',
                    beforeEnter: async (to, from) => {
                        executionLog.push('beforeEnter-blocked');
                        // Always block access.
                        return false as const;
                    }
                },
                {
                    path: '/user/:id',
                    component: () => 'User',
                    beforeEnter: async (to, from) => {
                        executionLog.push(`beforeEnter-user-${to.params.id}`);
                        // Explicitly return void.
                        return;
                    },
                    beforeUpdate: async (to, from) => {
                        executionLog.push(
                            `beforeUpdate-user-${from?.params.id}-to-${to.params.id}`
                        );
                        // Test update guard on parameter change.
                        if (to.params.id === 'forbidden') {
                            return false;
                        }
                        // Explicitly return void.
                        return;
                    },
                    beforeLeave: async (to, from) => {
                        executionLog.push(
                            `beforeLeave-user-${from?.params.id}`
                        );
                        // Test leave guard.
                        if (from?.query.prevent === 'true') {
                            return false;
                        }
                        // Explicitly return void.
                        return;
                    }
                },
                {
                    path: '/settings',
                    component: () => 'Settings',
                    beforeLeave: async (to, from) => {
                        executionLog.push('beforeLeave-settings');
                        // Prevent infinite redirection loop in test case
                        if (to.path === '/confirm-leave') {
                            return;
                        }
                        if (from?.query.unsaved === 'true') {
                            return '/confirm-leave';
                        }
                        // Explicitly return void.
                        return;
                    }
                },
                {
                    path: '/confirm-leave',
                    component: () => 'ConfirmLeave'
                }
            ]
        });

        await router.replace('/');
    });

    afterEach(() => {
        router.destroy();
    });

    describe('beforeEnter guard', () => {
        test('should allow navigation through routes without beforeEnter', async () => {
            const route = await router.push('/login');

            expect(route.path).toBe('/login');
            expect(router.route.path).toBe('/login');
        });

        test('should execute beforeEnter guard and allow navigation', async () => {
            const route = await router.push('/protected?token=valid');

            expect(route.path).toBe('/protected');
            expect(route.query.token).toBe('valid');
            expect(router.route.path).toBe('/protected');
            expect(executionLog).toEqual(['beforeEnter-protected']);
        });

        test('should redirect when beforeEnter returns a redirect path', async () => {
            const route = await router.push('/protected?token=invalid');

            expect(route.path).toBe('/login');
            expect(router.route.path).toBe('/login');
            expect(executionLog).toEqual(['beforeEnter-protected']);
        });

        test('should abort navigation when beforeEnter returns false', async () => {
            const initialPath = router.route.path;
            const route = await router.push('/blocked');

            expect(router.route.path).toBe(initialPath);
            expect(route.status).toBe('aborted');
            expect(executionLog).toEqual(['beforeEnter-blocked']);
        });
    });

    describe('beforeUpdate guard', () => {
        test('should execute beforeUpdate when parameters change on the same route', async () => {
            await router.push('/user/123');
            expect(executionLog).toEqual(['beforeEnter-user-123']);

            executionLog.length = 0;

            const route = await router.push('/user/456');

            expect(route.path).toBe('/user/456');
            expect(route.params.id).toBe('456');
            expect(router.route.path).toBe('/user/456');
            expect(executionLog).toEqual(['beforeUpdate-user-123-to-456']);
            expect(executionLog).not.toContain('beforeEnter-user-456');
        });

        test('should abort navigation when beforeUpdate returns false', async () => {
            await router.push('/user/123');
            expect(router.route.params.id).toBe('123');

            executionLog.length = 0;

            const route = await router.push('/user/forbidden');

            expect(router.route.params.id).toBe('123');
            expect(route.status).toBe('aborted');
            expect(executionLog).toEqual([
                'beforeUpdate-user-123-to-forbidden'
            ]);
        });

        test('should execute beforeUpdate when query parameters change', async () => {
            await router.push('/user/123');

            executionLog.length = 0;

            const route = await router.push('/user/123?tab=profile');

            expect(route.params.id).toBe('123');
            expect(route.query.tab).toBe('profile');
            expect(executionLog).toEqual(['beforeUpdate-user-123-to-123']);
        });

        test('should not execute beforeUpdate when switching to a different route', async () => {
            await router.push('/user/123');

            executionLog.length = 0;

            // Switch to a different route.
            await router.push('/settings');

            // Switching to a different route will execute the beforeLeave guard.
            expect(executionLog).not.toContain('beforeUpdate');
            expect(executionLog).toEqual(['beforeLeave-user-123']);
        });
    });

    describe('beforeLeave guard', () => {
        test('should execute beforeLeave guard when leaving a route', async () => {
            await router.push('/user/123');

            executionLog.length = 0;

            // Leave the user page.
            await router.push('/settings');

            expect(executionLog).toEqual(['beforeLeave-user-123']);
        });

        test('should abort navigation when beforeLeave returns false', async () => {
            await router.push('/user/123?prevent=true');

            executionLog.length = 0;

            const route = await router.push('/settings');

            expect(router.route.path).toBe('/user/123');
            expect(route.status).toBe('aborted');
            expect(executionLog).toEqual(['beforeLeave-user-123']);
        });

        test('should redirect when beforeLeave returns a redirect path', async () => {
            await router.push('/settings?unsaved=true');

            executionLog.length = 0;

            const route = await router.push('/user/123');

            expect(route.path).toBe('/confirm-leave');
            expect(router.route.path).toBe('/confirm-leave');
            // Redirect scenario: beforeLeave-settings is executed first, and the new navigation to /confirm-leave is triggered.
            expect(executionLog).toEqual([
                'beforeLeave-settings',
                'beforeLeave-user-123'
            ]);
        });

        test('should not execute beforeLeave when updating parameters on the same route', async () => {
            await router.push('/user/123');

            executionLog.length = 0;

            await router.push('/user/456');

            expect(executionLog).toEqual(['beforeUpdate-user-123-to-456']);
            expect(executionLog).not.toContain('beforeLeave');
        });
    });

    describe('Guard execution order and comprehensive scenarios', () => {
        test('should execute all relevant guards in the correct order', async () => {
            router.beforeEach(async (to, from) => {
                executionLog.push(`global-beforeEach-${to.path}`);
            });

            await router.push('/user/123');
            expect(executionLog).toEqual([
                'global-beforeEach-/user/123',
                'beforeEnter-user-123'
            ]);

            executionLog.length = 0;

            await router.push('/user/456');

            expect(executionLog).toEqual([
                'global-beforeEach-/user/456',
                'beforeUpdate-user-123-to-456'
            ]);
        });

        test('Guard error handling', async () => {
            const consoleErrorSpy = vi
                .spyOn(console, 'error')
                .mockImplementation(() => {});

            router = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    {
                        path: '/',
                        component: () => 'Home'
                    },
                    {
                        path: '/error',
                        component: () => 'Error',
                        beforeEnter: async () => {
                            throw new Error('Guard error');
                        }
                    }
                ]
            });

            await router.replace('/');

            const route = await router.push('/error');
            expect(route.status).toBe('error');
            expect(consoleErrorSpy).toHaveBeenCalled();

            consoleErrorSpy.mockRestore();
        });

        test('Complex nested scenario: switching from a guarded route to another guarded route', async () => {
            // Navigate to the user page.
            await router.push('/user/123');

            executionLog.length = 0;

            // Navigate to the protected page.
            const route = await router.push('/protected?token=valid');

            expect(route.path).toBe('/protected');
            expect(executionLog).toEqual([
                'beforeLeave-user-123',
                'beforeEnter-protected'
            ]);
        });
    });

    describe('Initial navigation scenario', () => {
        test('should execute guards according to Vue Router behavior on initial navigation', async () => {
            const newRouter = new Router({
                mode: RouterMode.memory,
                base: new URL('http://localhost:3000/'),
                routes: [
                    {
                        path: '/user/:id',
                        component: () => 'User',
                        beforeEnter: async (to, from) => {
                            executionLog.push(
                                `init-beforeEnter-user-${to.params.id}-from-${from === null ? 'null' : from.path}`
                            );
                            // Explicitly return void.
                            return;
                        },
                        beforeUpdate: async (to, from) => {
                            executionLog.push(
                                `init-beforeUpdate-user-${from?.params.id || 'null'}-to-${to.params.id}`
                            );
                            // Explicitly return void.
                            return;
                        },
                        beforeLeave: async (to, from) => {
                            executionLog.push(
                                `init-beforeLeave-user-${from?.params.id || 'null'}`
                            );
                            // Explicitly return void.
                            return;
                        }
                    }
                ]
            });

            executionLog.length = 0;

            const route = await newRouter.replace('/user/123');

            expect(route.path).toBe('/user/123');
            expect(route.params.id).toBe('123');

            expect(executionLog).toEqual([
                'init-beforeEnter-user-123-from-null'
            ]);

            // Cleanup.
            newRouter.destroy();
        });
    });
});

describe('Nested route guard behavior tests', () => {
    let router: Router;
    let executionLog: string[];

    beforeEach(async () => {
        executionLog = [];

        router = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/home',
                    component: () => 'Home'
                },
                {
                    path: '/user',
                    component: () => 'UserLayout',
                    beforeEnter: (to, from) => {
                        executionLog.push('parent-beforeEnter');
                    },
                    beforeLeave: (to, from) => {
                        executionLog.push('parent-beforeLeave');
                    },
                    beforeUpdate: (to, from) => {
                        executionLog.push('parent-beforeUpdate');
                    },
                    children: [
                        {
                            path: ':id',
                            component: () => 'UserDetail',
                            beforeEnter: (to, from) => {
                                executionLog.push('child-beforeEnter');
                            },
                            beforeLeave: (to, from) => {
                                executionLog.push('child-beforeLeave');
                            },
                            beforeUpdate: (to, from) => {
                                executionLog.push('child-beforeUpdate');
                            },
                            children: [
                                {
                                    path: 'profile',
                                    component: () => 'UserProfile',
                                    beforeEnter: (to, from) => {
                                        executionLog.push(
                                            'grandchild-beforeEnter'
                                        );
                                    },
                                    beforeLeave: (to, from) => {
                                        executionLog.push(
                                            'grandchild-beforeLeave'
                                        );
                                    }
                                }
                            ]
                        },
                        {
                            path: ':id/settings',
                            component: () => 'UserSettings',
                            beforeEnter: (to, from) => {
                                executionLog.push('settings-beforeEnter');
                            },
                            beforeLeave: (to, from) => {
                                executionLog.push('settings-beforeLeave');
                            }
                        }
                    ]
                },
                {
                    path: '/admin',
                    component: () => 'AdminLayout',
                    beforeEnter: (to, from) => {
                        executionLog.push('admin-beforeEnter');
                    },
                    beforeLeave: (to, from) => {
                        executionLog.push('admin-beforeLeave');
                    },
                    children: [
                        {
                            path: 'users',
                            component: () => 'AdminUsers',
                            beforeEnter: (to, from) => {
                                executionLog.push('admin-users-beforeEnter');
                            },
                            beforeLeave: (to, from) => {
                                executionLog.push('admin-users-beforeLeave');
                            }
                        }
                    ]
                }
            ]
        });

        await router.replace('/home');
    });

    afterEach(() => {
        router.destroy();
    });

    test('should execute beforeEnter from parent to child when navigating from root to a nested route', async () => {
        executionLog = []; // Clear log.

        // Navigate to a deeply nested route.
        await router.push('/user/123/profile');

        expect(executionLog).toEqual([
            'parent-beforeEnter',
            'child-beforeEnter',
            'grandchild-beforeEnter'
        ]);
    });

    test('should execute beforeLeave from child to parent when leaving a nested route', async () => {
        await router.push('/user/123/profile');
        executionLog = []; // Clear log.

        // Leave to a completely different route.
        await router.push('/home');

        expect(executionLog).toEqual([
            'grandchild-beforeLeave',
            'child-beforeLeave',
            'parent-beforeLeave'
        ]);
    });

    test('should not execute parent guards when switching between child routes of the same parent', async () => {
        // Navigate to the first child route.
        await router.push('/user/123/profile');
        executionLog = []; // Clear log.

        // Switch between child routes.
        await router.push('/user/123/settings');

        // '/user/123/settings' matches /user + :id/settings (2 levels).
        // This is not the same route combination, so there will be changes in route levels.
        expect(executionLog).toEqual([
            'grandchild-beforeLeave',
            'child-beforeLeave',
            'settings-beforeEnter'
        ]);
    });

    test('should only execute beforeEnter for the new route when navigating from parent to child', async () => {
        await router.push('/user');
        executionLog = []; // Clear log.

        // Navigate to a child route.
        await router.push('/user/123');

        expect(executionLog).toEqual(['child-beforeEnter']);
    });

    test('should execute beforeUpdate for all matched routes when parameters change in a nested route', async () => {
        // Navigate to a nested route.
        await router.push('/user/123');
        executionLog = []; // Clear log.

        // Parameters change but route configuration is the same.
        await router.push('/user/456');

        expect(executionLog).toEqual([
            'parent-beforeUpdate',
            'child-beforeUpdate'
        ]);
    });

    test('Complex nested route switch: from one deep route to another', async () => {
        // Navigate to the first deep route.
        await router.push('/user/123/profile');
        executionLog = []; // Clear log.

        await router.push('/admin/users');

        // Should first execute beforeLeave for the leaving routes (child to parent),
        // then execute beforeEnter for the entering routes (parent to child).
        expect(executionLog).toEqual([
            'grandchild-beforeLeave',
            'child-beforeLeave',
            'parent-beforeLeave',
            'admin-beforeEnter',
            'admin-users-beforeEnter'
        ]);
    });

    test('Navigating from a child route to another deeper child route under the same parent', async () => {
        // Navigate to a child route.
        await router.push('/user/123');
        executionLog = []; // Clear log.

        // Navigate to a deeper child route under the same parent.
        await router.push('/user/456/profile');

        // '/user/123' matches /user + :id (2 levels).
        // '/user/456/profile' matches /user + :id + profile (3 levels).
        expect(executionLog).toEqual(['grandchild-beforeEnter']);
    });

    test('Correct behavior for initial navigation to a nested route', async () => {
        const newRouter = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/user',
                    component: () => 'UserLayout',
                    beforeEnter: (to, from) => {
                        executionLog.push(
                            `parent-beforeEnter-from-${from?.path || 'null'}`
                        );
                    },
                    beforeLeave: (to, from) => {
                        executionLog.push('parent-beforeLeave');
                    },
                    children: [
                        {
                            path: ':id',
                            component: () => 'UserDetail',
                            beforeEnter: (to, from) => {
                                executionLog.push(
                                    `child-beforeEnter-from-${from?.path || 'null'}`
                                );
                            },
                            beforeLeave: (to, from) => {
                                executionLog.push('child-beforeLeave');
                            }
                        }
                    ]
                }
            ]
        });

        executionLog = []; // Clear log.

        await newRouter.replace('/user/123');

        expect(executionLog).toEqual([
            'parent-beforeEnter-from-null',
            'child-beforeEnter-from-null'
        ]);

        newRouter.destroy();
    });

    test('Hash change scenario: should trigger beforeUpdate when only the hash changes', async () => {
        // Navigate to a route with parameters.
        await router.push('/user/123');
        executionLog = []; // Clear log.

        await router.push('/user/123#section1');

        // A hash change should trigger beforeUpdate because the fullPath has changed.
        expect(executionLog).toEqual([
            'parent-beforeUpdate',
            'child-beforeUpdate'
        ]);
    });

    test('Hash change scenario: from with hash to without hash should also trigger beforeUpdate', async () => {
        // Navigate to a route with a hash.
        await router.push('/user/123#section1');
        executionLog = []; // Clear log.

        // Remove the hash.
        await router.push('/user/123');

        // Removing the hash should also trigger beforeUpdate.
        expect(executionLog).toEqual([
            'parent-beforeUpdate',
            'child-beforeUpdate'
        ]);
    });

    test('Hash change scenario: hash change combined with parameter change', async () => {
        // Navigate to a route with a hash.
        await router.push('/user/123#section1');
        executionLog = []; // Clear log.

        // Change both parameter and hash.
        await router.push('/user/456#section2');

        // Changing both parameter and hash should trigger beforeUpdate.
        expect(executionLog).toEqual([
            'parent-beforeUpdate',
            'child-beforeUpdate'
        ]);
    });
});

describe('Guard chain interruption scenarios', () => {
    let interruptRouter: Router;
    let interruptLog: string[];

    beforeEach(async () => {
        interruptLog = [];

        interruptRouter = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/home',
                    component: () => 'Home'
                },
                {
                    path: '/parent',
                    component: () => 'Parent',
                    beforeEnter: (to, from) => {
                        interruptLog.push('parent-beforeEnter');
                    },
                    beforeLeave: (to, from) => {
                        interruptLog.push('parent-beforeLeave');
                        // Parent guard interrupts.
                        if (to.path.includes('interrupt-parent')) {
                            return false;
                        }
                    },
                    beforeUpdate: (to, from) => {
                        interruptLog.push('parent-beforeUpdate');
                    },
                    children: [
                        {
                            path: 'child',
                            component: () => 'Child',
                            beforeEnter: (to, from) => {
                                interruptLog.push('child-beforeEnter');
                                // Child beforeEnter interrupts.
                                if (to.query.blockEnter === 'true') {
                                    return false;
                                }
                            },
                            beforeLeave: (to, from) => {
                                interruptLog.push('child-beforeLeave');
                            },
                            beforeUpdate: (to, from) => {
                                interruptLog.push('child-beforeUpdate');
                                // Child beforeUpdate interrupts.
                                if (to.query.blockUpdate === 'true') {
                                    return false;
                                }
                            }
                        },
                        {
                            path: 'sibling',
                            component: () => 'Sibling',
                            beforeEnter: (to, from) => {
                                interruptLog.push('sibling-beforeEnter');
                            },
                            beforeLeave: (to, from) => {
                                interruptLog.push('sibling-beforeLeave');
                            }
                        }
                    ]
                },
                {
                    path: '/interrupt-parent',
                    component: () => 'InterruptTarget'
                },
                {
                    path: '/multi-level',
                    component: () => 'Level1',
                    beforeEnter: (to, from) => {
                        interruptLog.push('level1-beforeEnter');
                    },
                    beforeLeave: (to, from) => {
                        interruptLog.push('level1-beforeLeave');
                    },
                    children: [
                        {
                            path: 'level2',
                            component: () => 'Level2',
                            beforeEnter: (to, from) => {
                                interruptLog.push('level2-beforeEnter');
                                if (to.query.interrupt === 'true') {
                                    return false;
                                }
                            },
                            beforeLeave: (to, from) => {
                                interruptLog.push('level2-beforeLeave');
                            },
                            children: [
                                {
                                    path: 'level3',
                                    component: () => 'Level3',
                                    beforeEnter: (to, from) => {
                                        interruptLog.push('level3-beforeEnter');
                                    },
                                    beforeLeave: (to, from) => {
                                        interruptLog.push('level3-beforeLeave');
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        });

        await interruptRouter.replace('/home');
    });

    afterEach(() => {
        interruptRouter.destroy();
    });

    test('beforeLeave interruption should prevent subsequent guards from executing', async () => {
        // Navigate to the nested route.
        await interruptRouter.push('/parent/child');
        interruptLog = []; // Clear log.

        const result = await interruptRouter.push('/interrupt-parent');

        expect(result.status).toBe('aborted');
        expect(interruptRouter.route.path).toBe('/parent/child');

        expect(interruptLog).toEqual([
            'child-beforeLeave',
            'parent-beforeLeave'
            // No beforeEnter for the target route because it was interrupted by the parent's beforeLeave.
        ]);
    });

    test('beforeEnter interruption should prevent subsequent sibling and child guards from executing', async () => {
        await interruptRouter.push('/parent');
        interruptLog = []; // Clear log.

        const result = await interruptRouter.push(
            '/parent/child?blockEnter=true'
        );

        expect(result.status).toBe('aborted');
        expect(interruptRouter.route.path).toBe('/parent');

        // beforeEnter executes from parent to child, interrupted at the child.
        expect(interruptLog).toEqual([
            'child-beforeEnter'
            // Child's beforeEnter interrupts, no further guards execute.
        ]);
    });

    test('beforeUpdate interruption should prevent subsequent sibling guards from executing', async () => {
        // Navigate to the nested route.
        await interruptRouter.push('/parent/child');
        interruptLog = []; // Clear log.

        const result = await interruptRouter.push(
            '/parent/child?blockUpdate=true'
        );

        expect(result.status).toBe('aborted');
        expect(interruptRouter.route.fullPath).toBe('/parent/child');

        // beforeUpdate executes from parent to child, interrupted at the child, but parent has already executed.
        expect(interruptLog).toEqual([
            'parent-beforeUpdate',
            'child-beforeUpdate'
            // Child's beforeUpdate interrupts, no further guards execute.
        ]);
    });

    test('Interruption in a middle layer of a multi-level nesting should prevent deeper guards from executing', async () => {
        await interruptRouter.push('/home');
        interruptLog = []; // Clear log.

        const result = await interruptRouter.push(
            '/multi-level/level2/level3?interrupt=true'
        );

        expect(result.status).toBe('aborted');
        expect(interruptRouter.route.path).toBe('/home');

        // beforeEnter executes from parent to child, second level interrupts, third level does not execute.
        expect(interruptLog).toEqual([
            'level1-beforeEnter',
            'level2-beforeEnter'
            // level2 interrupts, level3-beforeEnter should not execute.
        ]);
    });

    test('Guard chain should execute completely under normal conditions', async () => {
        await interruptRouter.push('/home');
        interruptLog = []; // Clear log.

        // Normal navigation to a three-level nested route.
        const result = await interruptRouter.push('/multi-level/level2/level3');

        expect(result.status).toBe('success');
        expect(interruptRouter.route.path).toBe('/multi-level/level2/level3');

        expect(interruptLog).toEqual([
            'level1-beforeEnter',
            'level2-beforeEnter',
            'level3-beforeEnter'
        ]);
    });

    test('Normal guard execution order when leaving a nested route', async () => {
        await interruptRouter.push('/multi-level/level2/level3');
        interruptLog = []; // Clear log.

        // Leave to the home page.
        const result = await interruptRouter.push('/home');

        expect(result.status).toBe('success');
        expect(interruptRouter.route.path).toBe('/home');

        expect(interruptLog).toEqual([
            'level3-beforeLeave',
            'level2-beforeLeave',
            'level1-beforeLeave'
        ]);
    });

    test('Guard execution and interruption when switching between nested routes', async () => {
        // Navigate to a child route.
        await interruptRouter.push('/parent/child');
        interruptLog = []; // Clear log.

        // Switch to a sibling route at the same level.
        const result = await interruptRouter.push('/parent/sibling');

        expect(result.status).toBe('success');
        expect(interruptRouter.route.path).toBe('/parent/sibling');

        expect(interruptLog).toEqual([
            'child-beforeLeave',
            'sibling-beforeEnter'
        ]);
    });
});

describe('Concurrent navigation scenarios', () => {
    let concurrentRouter: Router;
    let concurrentLog: string[];

    beforeEach(async () => {
        concurrentLog = [];

        concurrentRouter = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/home',
                    component: () => 'Home'
                },
                {
                    path: '/slow',
                    component: () => 'Slow',
                    beforeEnter: async (to, from) => {
                        concurrentLog.push('slow-beforeEnter-start');
                        await new Promise((resolve) => setTimeout(resolve, 50));
                        concurrentLog.push('slow-beforeEnter-end');
                    }
                },
                {
                    path: '/fast',
                    component: () => 'Fast',
                    beforeEnter: (to, from) => {
                        concurrentLog.push('fast-beforeEnter');
                    }
                },
                {
                    path: '/user/:id',
                    component: () => 'User',
                    beforeEnter: async (to, from) => {
                        concurrentLog.push(
                            `user-beforeEnter-${to.params.id}-start`
                        );
                        // Async operation.
                        await new Promise((resolve) => setTimeout(resolve, 30));
                        concurrentLog.push(
                            `user-beforeEnter-${to.params.id}-end`
                        );
                    },
                    beforeLeave: async (to, from) => {
                        concurrentLog.push(
                            `user-beforeLeave-${from?.params.id}-start`
                        );
                        await new Promise((resolve) => setTimeout(resolve, 20));
                        concurrentLog.push(
                            `user-beforeLeave-${from?.params.id}-end`
                        );
                    }
                },
                {
                    path: '/blocking',
                    component: () => 'Blocking',
                    beforeEnter: async (to, from) => {
                        concurrentLog.push('blocking-beforeEnter-start');
                        await new Promise((resolve) =>
                            setTimeout(resolve, 100)
                        );
                        concurrentLog.push('blocking-beforeEnter-end');
                        // Block navigation.
                        return false;
                    }
                },
                {
                    path: '/redirect-source',
                    component: () => 'RedirectSource',
                    beforeEnter: async (to, from) => {
                        concurrentLog.push('redirect-source-beforeEnter-start');
                        await new Promise((resolve) => setTimeout(resolve, 40));
                        concurrentLog.push('redirect-source-beforeEnter-end');
                        return '/redirect-target';
                    }
                },
                {
                    path: '/redirect-target',
                    component: () => 'RedirectTarget',
                    beforeEnter: (to, from) => {
                        concurrentLog.push('redirect-target-beforeEnter');
                    }
                }
            ]
        });

        await concurrentRouter.replace('/home');
    });

    afterEach(() => {
        concurrentRouter.destroy();
    });

    test('Rapid consecutive navigations should cancel the previous one', async () => {
        concurrentLog = []; // Clear log.

        // Trigger two navigations in quick succession.
        const slowPromise = concurrentRouter.push('/slow');
        const fastPromise = concurrentRouter.push('/fast');

        // Wait for both navigations to complete.
        const [slowResult, fastResult] = await Promise.all([
            slowPromise,
            fastPromise
        ]);

        expect(slowResult.status).toBe('aborted');
        expect(fastResult.status).toBe('success');
        expect(concurrentRouter.route.path).toBe('/fast');

        expect(concurrentLog).toContain('fast-beforeEnter');
        // Due to timing issues, we only verify the final state is correct.
    });

    test('A new navigation started during an async guard should cancel the current guard', async () => {
        concurrentLog = []; // Clear log.

        // Start a slow navigation.
        const slowPromise = concurrentRouter.push('/user/123');

        // Wait a short time to ensure the first navigation has started.
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Start a new navigation while the first one's guard is running.
        const fastPromise = concurrentRouter.push('/fast');

        const [slowResult, fastResult] = await Promise.all([
            slowPromise,
            fastPromise
        ]);

        expect(slowResult.status).toBe('aborted');
        expect(fastResult.status).toBe('success');
        expect(concurrentRouter.route.path).toBe('/fast');

        expect(concurrentLog).toContain('user-beforeEnter-123-start');
        expect(concurrentLog).toContain('fast-beforeEnter');
    });

    test('With three concurrent navigations, the last one should win', async () => {
        concurrentLog = []; // Clear log.

        // Trigger three navigations in quick succession.
        const promise1 = concurrentRouter.push('/user/1');
        const promise2 = concurrentRouter.push('/user/2');
        const promise3 = concurrentRouter.push('/user/3');

        const [result1, result2, result3] = await Promise.all([
            promise1,
            promise2,
            promise3
        ]);

        expect(result1.status).toBe('aborted');
        expect(result2.status).toBe('aborted');
        expect(result3.status).toBe('success');
        expect(concurrentRouter.route.path).toBe('/user/3');
        expect(concurrentRouter.route.params.id).toBe('3');
    });

    test('A blocking navigation is cancelled by a concurrent navigation', async () => {
        concurrentLog = []; // Clear log.

        // Start a navigation that will be blocked.
        const blockingPromise = concurrentRouter.push('/blocking');

        // Wait for the blocking navigation to start executing.
        await new Promise((resolve) => setTimeout(resolve, 20));

        // Start another navigation.
        const fastPromise = concurrentRouter.push('/fast');

        const [blockingResult, fastResult] = await Promise.all([
            blockingPromise,
            fastPromise
        ]);

        expect(blockingResult.status).toBe('aborted');
        expect(fastResult.status).toBe('success');
        expect(concurrentRouter.route.path).toBe('/fast');

        expect(concurrentLog).toContain('blocking-beforeEnter-start');
        // Due to the async guard, 'end' might be seen before the task cancellation check.
    });

    test('A redirecting navigation is cancelled by a concurrent navigation', async () => {
        concurrentLog = []; // Clear log.

        // Start a redirecting navigation.
        const redirectPromise = concurrentRouter.push('/redirect-source');

        // Wait for the redirect to start.
        await new Promise((resolve) => setTimeout(resolve, 10));

        // Start another navigation.
        const fastPromise = concurrentRouter.push('/fast');

        const [redirectResult, fastResult] = await Promise.all([
            redirectPromise,
            fastPromise
        ]);

        expect(redirectResult.status).toBe('aborted');
        expect(fastResult.status).toBe('success');
        expect(concurrentRouter.route.path).toBe('/fast');

        expect(concurrentLog).toContain('redirect-source-beforeEnter-start');
        expect(concurrentLog).not.toContain('redirect-target-beforeEnter');
    });

    test('Concurrent navigation with complex nested routes', async () => {
        // Add a nested route configuration.
        const nestedRouter = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/home',
                    component: () => 'Home'
                },
                {
                    path: '/parent',
                    component: () => 'Parent',
                    beforeEnter: async (to, from) => {
                        concurrentLog.push('parent-beforeEnter-start');
                        await new Promise((resolve) => setTimeout(resolve, 30));
                        concurrentLog.push('parent-beforeEnter-end');
                    },
                    children: [
                        {
                            path: 'child/:id',
                            component: () => 'Child',
                            beforeEnter: async (to, from) => {
                                concurrentLog.push(
                                    `child-beforeEnter-${to.params.id}-start`
                                );
                                await new Promise((resolve) =>
                                    setTimeout(resolve, 20)
                                );
                                concurrentLog.push(
                                    `child-beforeEnter-${to.params.id}-end`
                                );
                            }
                        }
                    ]
                }
            ]
        });

        await nestedRouter.replace('/home');
        concurrentLog = []; // Clear log.

        // Trigger consecutive navigations to a nested route.
        const promise1 = nestedRouter.push('/parent/child/1');
        const promise2 = nestedRouter.push('/parent/child/2');

        const [result1, result2] = await Promise.all([promise1, promise2]);

        expect(result1.status).toBe('aborted');
        expect(result2.status).toBe('success');
        expect(nestedRouter.route.path).toBe('/parent/child/2');

        expect(concurrentLog).toContain('parent-beforeEnter-start');

        nestedRouter.destroy();
    });

    test('Concurrent navigations should not affect route state consistency', async () => {
        concurrentLog = []; // Clear log.

        // Trigger multiple concurrent navigations to the same target pattern.
        const promises = Array.from({ length: 5 }, (_, i) =>
            concurrentRouter.push(`/user/${i + 1}`)
        );

        const results = await Promise.all(promises);

        const successResults = results.filter((r) => r.status === 'success');
        const abortedResults = results.filter((r) => r.status === 'aborted');

        expect(successResults).toHaveLength(1);
        expect(abortedResults).toHaveLength(4);

        const successResult = successResults[0];
        expect(concurrentRouter.route.path).toBe(successResult.path);
        expect(concurrentRouter.route.params.id).toBe(successResult.params.id);
    });

    test('Leaving a route with an async guard to another route with an async guard', async () => {
        await concurrentRouter.push('/user/initial');
        concurrentLog = []; // Clear log.

        // Start a navigation to a different route configuration to trigger beforeLeave.
        const promise1 = concurrentRouter.push('/slow');

        // Start a second navigation while the first one is running.
        await new Promise((resolve) => setTimeout(resolve, 5));
        const promise2 = concurrentRouter.push('/fast');

        const [result1, result2] = await Promise.all([promise1, promise2]);

        expect(concurrentRouter.route.path).toBe('/fast');

        // Due to timing, the first navigation might succeed or be aborted. We mainly verify the final state is correct.
        if (result1.status === 'aborted') {
            expect(result2.status).toBe('success');
        } else {
            expect(concurrentRouter.route.path).toBe('/fast');
        }

        expect(concurrentLog).toContain('user-beforeLeave-initial-start');
    });
});

describe('Validation tests against official Vue Router behavior', () => {
    let officialRouter: Router;
    let officialLog: string[];

    beforeEach(async () => {
        officialLog = [];

        officialRouter = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/home',
                    component: () => 'Home'
                },
                {
                    path: '/users/:id',
                    component: () => 'UserDetail',
                    beforeEnter: (to, from) => {
                        officialLog.push(
                            `beforeEnter-triggered-for-${to.params.id}`
                        );
                    }
                },
                {
                    path: '/posts/:id',
                    component: () => 'PostDetail',
                    beforeEnter: (to, from) => {
                        officialLog.push(
                            `posts-beforeEnter-triggered-for-${to.params.id}`
                        );
                    }
                }
            ]
        });

        await officialRouter.replace('/home');
    });

    afterEach(() => {
        officialRouter.destroy();
    });

    test('beforeEnter only triggers when entering a different route, not on parameter change', async () => {
        officialLog = []; // Clear log.

        await officialRouter.push('/users/1');
        expect(officialLog).toEqual(['beforeEnter-triggered-for-1']);

        officialLog = []; // Clear log.

        await officialRouter.push('/users/2');
        expect(officialLog).toEqual([]);

        officialLog = []; // Clear log.

        // Navigate to a different route - should trigger the new route's beforeEnter.
        await officialRouter.push('/posts/123');
        expect(officialLog).toEqual(['posts-beforeEnter-triggered-for-123']);

        officialLog = []; // Clear log.

        // Return to the previous route - should trigger beforeEnter again.
        await officialRouter.push('/users/3');
        expect(officialLog).toEqual(['beforeEnter-triggered-for-3']);
    });

    test('beforeEnter does not trigger on query parameter change', async () => {
        await officialRouter.push('/users/1');
        officialLog = []; // Clear log.

        // Query parameter change - should not trigger beforeEnter.
        await officialRouter.push('/users/1?tab=profile');
        expect(officialLog).toEqual([]);

        // Another query parameter change - should not trigger beforeEnter.
        await officialRouter.push('/users/1?tab=settings');
        expect(officialLog).toEqual([]);
    });

    test('beforeEnter does not trigger on hash change', async () => {
        await officialRouter.push('/users/1');
        officialLog = []; // Clear log.

        // Hash change - should not trigger beforeEnter.
        await officialRouter.push('/users/1#profile');
        expect(officialLog).toEqual([]);

        // Another hash change - should not trigger beforeEnter.
        await officialRouter.push('/users/1#settings');
        expect(officialLog).toEqual([]);
    });

    test('beforeEnter behavior for parent routes in nested routing', async () => {
        const nestedRouter = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/dashboard',
                    component: () => 'Dashboard',
                    beforeEnter: (to, from) => {
                        officialLog.push('dashboard-beforeEnter');
                    },
                    children: [
                        {
                            path: 'profile',
                            component: () => 'Profile'
                        },
                        {
                            path: 'settings',
                            component: () => 'Settings'
                        }
                    ]
                },
                {
                    path: '/home',
                    component: () => 'Home'
                }
            ]
        });

        await nestedRouter.replace('/home');
        officialLog = []; // Clear log.

        await nestedRouter.push('/dashboard/profile');
        expect(officialLog).toEqual(['dashboard-beforeEnter']);

        officialLog = []; // Clear log.

        // Switching between child routes of the same parent - should not trigger parent's beforeEnter.
        await nestedRouter.push('/dashboard/settings');
        expect(officialLog).toEqual([]);

        officialLog = []; // Clear log.

        // Leave and re-enter - should trigger parent's beforeEnter again.
        await nestedRouter.push('/home');
        await nestedRouter.push('/dashboard/profile');
        expect(officialLog).toEqual(['dashboard-beforeEnter']);

        nestedRouter.destroy();
    });
});

describe('Validation of official Vue Router navigation resolution flow', () => {
    let flowRouter: Router;
    let flowLog: string[];
    let stepCounter: number;

    beforeEach(async () => {
        flowLog = [];
        stepCounter = 0;

        const logStep = (description: string) => {
            stepCounter++;
            flowLog.push(`${stepCounter}. ${description}`);
        };

        flowRouter = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/from',
                    component: () => 'FromComponent',
                    beforeLeave: (to, from) => {
                        logStep('beforeRouteLeave in deactivated component');
                    }
                },
                {
                    path: '/to/:id',
                    component: () => 'ToComponent',
                    beforeEnter: (to, from) => {
                        logStep('beforeEnter in route config');
                    },
                    beforeUpdate: (to, from) => {
                        logStep('beforeRouteUpdate in reused component');
                    }
                }
            ]
        });

        // Register global guards.
        flowRouter.beforeEach((to, from) => {
            logStep('global beforeEach');
        });

        flowRouter.afterEach((to, from) => {
            logStep('global afterEach');
        });

        await flowRouter.replace('/from');
        flowLog = []; // Clear log from initial navigation.
        stepCounter = 0;
    });

    afterEach(() => {
        flowRouter.destroy();
    });

    test('Full flow order when navigating to a new route', async () => {
        // Navigate from /from to /to/123 (completely different routes).
        await flowRouter.push('/to/123');

        // According to Vue Router official docs, the execution order should be:
        // 10. Call global afterEach hooks.

        expect(flowLog).toEqual([
            '1. beforeRouteLeave in deactivated component',
            '2. global beforeEach',
            '3. beforeEnter in route config',
            '4. global afterEach'
        ]);
    });

    test('Flow order on parameter change within the same route', async () => {
        await flowRouter.push('/to/123');
        flowLog = []; // Clear log.
        stepCounter = 0;

        // Then, change parameter within the same route.
        await flowRouter.push('/to/456');

        expect(flowLog).toEqual([
            '1. global beforeEach',
            '2. beforeRouteUpdate in reused component',
            '3. global afterEach'
        ]);
    });

    test('Flow order in complex nested routes', async () => {
        const complexRouter = new Router({
            mode: RouterMode.memory,
            base: new URL('http://localhost:3000/'),
            routes: [
                {
                    path: '/app',
                    component: () => 'App',
                    beforeLeave: (to, from) => {
                        flowLog.push(`${++stepCounter}. App beforeLeave`);
                    },
                    beforeEnter: (to, from) => {
                        flowLog.push(`${++stepCounter}. App beforeEnter`);
                    },
                    children: [
                        {
                            path: 'dashboard',
                            component: () => 'Dashboard',
                            beforeLeave: (to, from) => {
                                flowLog.push(
                                    `${++stepCounter}. Dashboard beforeLeave`
                                );
                            },
                            beforeEnter: (to, from) => {
                                flowLog.push(
                                    `${++stepCounter}. Dashboard beforeEnter`
                                );
                            }
                        },
                        {
                            path: 'profile/:id',
                            component: () => 'Profile',
                            beforeLeave: (to, from) => {
                                flowLog.push(
                                    `${++stepCounter}. Profile beforeLeave`
                                );
                            },
                            beforeEnter: (to, from) => {
                                flowLog.push(
                                    `${++stepCounter}. Profile beforeEnter`
                                );
                            }
                        }
                    ]
                },
                {
                    path: '/home',
                    component: () => 'Home',
                    beforeEnter: (to, from) => {
                        flowLog.push(`${++stepCounter}. Home beforeEnter`);
                    }
                }
            ]
        });

        complexRouter.beforeEach((to, from) => {
            flowLog.push(`${++stepCounter}. global beforeEach`);
        });

        complexRouter.afterEach((to, from) => {
            flowLog.push(`${++stepCounter}. global afterEach`);
        });

        await complexRouter.replace('/home');
        flowLog = []; // Clear log.
        stepCounter = 0;

        // Navigate from /home to nested route /app/dashboard.
        await complexRouter.push('/app/dashboard');

        expect(flowLog).toEqual([
            '1. global beforeEach',
            '2. App beforeEnter',
            '3. Dashboard beforeEnter',
            '4. global afterEach'
        ]);

        flowLog = []; // Clear log.
        stepCounter = 0;

        // Navigate from /app/dashboard to /app/profile/123.
        await complexRouter.push('/app/profile/123');

        // Dashboard leaves, Profile enters, App remains.
        expect(flowLog).toEqual([
            '1. Dashboard beforeLeave',
            '2. global beforeEach',
            '3. Profile beforeEnter',
            '4. global afterEach'
        ]);

        flowLog = []; // Clear log.
        stepCounter = 0;

        // Navigate from /app/profile/123 to /home (completely leave nested structure).
        await complexRouter.push('/home');

        expect(flowLog).toEqual([
            '1. Profile beforeLeave',
            '2. App beforeLeave',
            '3. global beforeEach',
            '4. Home beforeEnter',
            '5. global afterEach'
        ]);

        complexRouter.destroy();
    });
});

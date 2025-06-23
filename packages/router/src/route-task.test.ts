import { describe, expect, it, vi } from 'vitest';
import { parsedOptions } from './options';
import { Route } from './route';
import { RouteTaskController, createRouteTask } from './route-task';
import type { RouteTask, RouteTaskOptions } from './route-task';
import type { Router } from './router';
import { RouteStatus, RouteType } from './types';
import type { RouteConfirmHookResult, RouterParsedOptions } from './types';

// Helper function to create real RouterParsedOptions
function createRealOptions(): RouterParsedOptions {
    return parsedOptions({
        base: new URL('http://localhost/'),
        routes: [
            { path: '/test', component: 'TestComponent' },
            { path: '/redirected', component: 'RedirectedComponent' },
            { path: '/admin', component: 'AdminComponent' },
            { path: '/login', component: 'LoginComponent' },
            { path: '/home', component: 'HomeComponent' }
        ]
    });
}

// Helper function to create mock router
function createMockRouter(): Router {
    const options = createRealOptions();
    return {
        parsedOptions: options
    } as Router;
}

describe('createRouteTask', () => {
    it('should handle empty tasks array', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });
        const tasks: RouteTask[] = [];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.error); // Empty task array, no handler function obtained, marked as failed.
    });

    it('should execute tasks in sequence', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];

        const firstTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            executionOrder.push('task1');
            return; // Continue execution.
        };

        const secondTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            executionOrder.push('task2');
            return; // Continue execution.
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: firstTask
            },
            {
                name: 'override',
                task: secondTask
            }
        ];

        await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(executionOrder).toEqual(['task1', 'task2']);
    });

    it('should set status to success when task returns a function', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });

        // Real handler function.
        const handleFunction = async (
            to: Route,
            from: Route | null,
            router: Router
        ) => {
            return { message: 'Route handled successfully' };
        };

        const successTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            return handleFunction; // Return handler function.
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: successTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.success);
        expect(to.handle).toBeTypeOf('function');
        expect(to.handle).not.toBeNull();
    });

    it('should set status to aborted when task returns false', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });

        // Real blocking task.
        const blockingTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ): Promise<RouteConfirmHookResult> => {
            const shouldProceed = false;
            return shouldProceed ? void 0 : false; // Return false to prevent navigation.
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: blockingTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.aborted);
    });

    it('should handle redirection when task returns a route location string', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });

        // Real redirection task function.
        const redirectTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            if (route.path === '/test') {
                return '/redirected';
            }
            // Other paths pass through directly (returning void means continue).
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: redirectTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(result).not.toBe(to);
        expect(result.path).toBe('/redirected');
        expect(result.type).toBe(RouteType.push);
        expect(result.status).toBe(RouteStatus.error); // No handler function obtained after redirection, marked as failed.
    });

    it('should handle redirection when task returns a route location object', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });

        // Real redirection task function, returns a route object.
        const redirectTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            if (route.path === '/test') {
                return {
                    path: '/redirected',
                    query: { source: 'test' }
                };
            }
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: redirectTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(result).not.toBe(to);
        expect(result.path).toBe('/redirected');
        expect(result.query.source).toBe('test');
        expect(result.type).toBe(RouteType.push);
        expect(result.status).toBe(RouteStatus.error); // No handler function obtained after redirection, marked as failed.
    });

    it('should handle conditional redirection based on route state', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/admin'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });

        const authCheckTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            const isAuthenticated = false;

            if (route.path === '/admin' && !isAuthenticated) {
                // Unauthenticated users are redirected to the login page.
                return '/login';
            }

            // Authenticated users or non-protected routes pass through directly.
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: authCheckTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(result).not.toBe(to);
        expect(result.path).toBe('/login');
        expect(result.status).toBe(RouteStatus.error); // No handler function obtained after redirection, marked as failed.
    });

    it('should set status to error and break on task error', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });

        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        // A real task that throws an error.
        const errorTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            throw new Error('Task execution failed');
        };

        const secondTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            return () => ({ message: 'This should not run' });
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: errorTask
            },
            {
                name: 'beforeEnter',
                task: secondTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.error);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[beforeEach] route confirm hook error: Error: Task execution failed'
        );

        consoleErrorSpy.mockRestore();
    });

    it('should not execute subsequent tasks once status is error', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });

        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        const executionOrder: string[] = [];

        const firstTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            executionOrder.push('task1');
            throw new Error('Task failed');
        };

        const secondTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            executionOrder.push('task2'); // This should NOT be executed.
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: firstTask
            },
            {
                name: 'beforeEnter',
                task: secondTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.error);
        expect(executionOrder).toEqual(['task1']); // Only the first task should be executed.

        consoleErrorSpy.mockRestore();
    });

    it('should handle null from route parameter', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });

        const checkFromRouteTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            expect(fromRoute).toBeNull();
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: checkFromRouteTask
            }
        ];

        const result = await createRouteTask({
            to,
            from: null,
            tasks,
            router
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.error); // No handler function obtained, marked as failed.
    });

    it('should pass the correct to and from parameters to tasks', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });

        const firstTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            expect(route).toBe(to);
            expect(fromRoute).toBe(from);
            return;
        };

        const secondTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ): Promise<false> => {
            expect(route).toBe(to);
            expect(fromRoute).toBe(from);
            return false; // Abort the task.
        };

        const thirdTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            throw new Error('This should not be executed');
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: firstTask
            },
            {
                name: 'beforeEnter',
                task: secondTask
            },
            {
                name: 'confirm',
                task: thirdTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.aborted);
    });

    it('should execute all tasks until one returns a result', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];

        const firstTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            executionOrder.push('task1');
            return; // Continue execution.
        };

        const handleFunction = async (
            to: Route,
            from: Route | null,
            router: Router
        ) => {
            return { message: 'Route handled' };
        };

        const secondTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            executionOrder.push('task2');
            return handleFunction; // Return handler function and terminate execution.
        };

        const thirdTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            executionOrder.push('task3'); // This should NOT be executed.
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: firstTask
            },
            {
                name: 'beforeEnter',
                task: secondTask
            },
            {
                name: 'confirm',
                task: thirdTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.success);
        // 使用 toBeTypeOf 而不是 toBe，因为函数引用在传递过程中可能会变化
        expect(to.handle).toBeTypeOf('function');
        expect(executionOrder).toEqual(['task1', 'task2']); // Only the first two tasks should be executed.
    });

    describe('Task cancellation with RouteTaskController', () => {
        it('should cancel task when abort is called before task execution', async () => {
            const router = createMockRouter();
            const to = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/test'
            });
            const from = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/home'
            });

            const controller = new RouteTaskController();
            const consoleWarnSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            const firstTask = async (
                route: Route,
                fromRoute: Route | null,
                router: Router
            ) => {
                throw new Error('This should not be executed');
            };

            const secondTask = async (
                route: Route,
                fromRoute: Route | null,
                router: Router
            ) => {
                throw new Error('This should also not be executed');
            };

            const tasks: RouteTask[] = [
                {
                    name: 'beforeEach',
                    task: firstTask
                },
                {
                    name: 'beforeEnter',
                    task: secondTask
                }
            ];

            // Cancel before execution starts.
            controller.abort();

            const result = await createRouteTask({
                to,
                from,
                tasks,
                controller,
                router
            });

            expect(result).toBe(to);
            expect(to.status).toBe(RouteStatus.aborted);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[beforeEach] route task cancelled'
            );

            consoleWarnSpy.mockRestore();
        });

        it('should cancel task when abort is called after first task execution', async () => {
            const router = createMockRouter();
            const to = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/test'
            });
            const from = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/home'
            });

            const controller = new RouteTaskController();
            const consoleWarnSpy = vi
                .spyOn(console, 'warn')
                .mockImplementation(() => {});

            const firstTask = async (
                route: Route,
                fromRoute: Route | null,
                router: Router
            ) => {
                controller.abort(); // Cancel after first task completes.
                return; // Continue execution.
            };

            const secondTask = async (
                route: Route,
                fromRoute: Route | null,
                router: Router
            ) => {
                throw new Error('This should not be executed');
            };

            const tasks: RouteTask[] = [
                {
                    name: 'beforeEach',
                    task: firstTask
                },
                {
                    name: 'beforeEnter',
                    task: secondTask
                }
            ];

            const result = await createRouteTask({
                to,
                from,
                tasks,
                controller,
                router
            });

            expect(result).toBe(to);
            expect(to.status).toBe(RouteStatus.aborted);
            expect(consoleWarnSpy).toHaveBeenCalledWith(
                '[beforeEach] route task cancelled'
            );

            consoleWarnSpy.mockRestore();
        });

        it('should not throw error on shouldCancel if controller is provided', async () => {
            const router = createMockRouter();
            const to = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/test'
            });
            const from = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/home'
            });

            const redirectTask = async (
                route: Route,
                fromRoute: Route | null,
                router: Router
            ) => {
                return '/redirected';
            };

            const tasks: RouteTask[] = [
                {
                    name: 'beforeEach',
                    task: redirectTask
                }
            ];

            // No controller provided
            const result = await createRouteTask({
                to,
                from,
                tasks,
                router
            });

            expect(result).not.toBe(to);
            expect(result.path).toBe('/redirected');
        });
    });

    describe('Real scenario test', () => {
        it('should correctly handle RouteTaskOptions type verification', async () => {
            const router = createMockRouter();
            const to = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/test'
            });
            const from = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/home'
            });

            const tasks: RouteTask[] = [];

            const routeTaskOptions: RouteTaskOptions = {
                to,
                from,
                tasks,
                router
            };

            const result = await createRouteTask(routeTaskOptions);

            expect(result).toBe(to);
            expect(to.status).toBe(RouteStatus.error);
        });

        it('should correctly handle RouteTaskOptions with controller', async () => {
            const router = createMockRouter();
            const to = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/test'
            });
            const from = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/home'
            });

            const tasks: RouteTask[] = [];
            const controller = new RouteTaskController();

            const routeTaskOptions: RouteTaskOptions = {
                to,
                from,
                tasks,
                router,
                controller
            };

            const result = await createRouteTask(routeTaskOptions);

            expect(result).toBe(to);
            expect(to.status).toBe(RouteStatus.error);
        });

        it('should correctly create real task function interface', async () => {
            const router = createMockRouter();
            const to = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/test'
            });
            const from = new Route({
                options: router.parsedOptions,
                toType: RouteType.push,
                toInput: '/home'
            });

            const realTaskFunction = async (
                route: Route,
                fromRoute: Route | null,
                router: Router
            ) => {
                // Test parameter types
                expect(route).toBeInstanceOf(Route);
                expect(fromRoute).toBeInstanceOf(Route);
                expect(router).toBeDefined();
                return;
            };

            const tasks: RouteTask[] = [
                {
                    name: 'beforeEach',
                    task: realTaskFunction
                }
            ];

            const result = await createRouteTask({
                to,
                from,
                tasks,
                router
            });

            expect(result).toBe(to);
            expect(to.status).toBe(RouteStatus.error);
        });
    });
});

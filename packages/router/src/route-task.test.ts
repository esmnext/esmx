import { describe, expect, it, vi } from 'vitest';
import {
    RouteNavigationAbortedError,
    RouteTaskCancelledError,
    RouteTaskExecutionError
} from './error';
import { parsedOptions } from './options';
import { Route } from './route';
import { RouteTaskController, createRouteTask } from './route-task';
import type { RouteTask, RouteTaskOptions } from './route-task';
import type { Router } from './router';
import { RouteType } from './types';
import type { RouteConfirmHookResult, RouterParsedOptions } from './types';

// Helper function to create real RouterParsedOptions
function createRealOptions(): RouterParsedOptions {
    return parsedOptions({
        base: new URL('http://localhost/'),
        routes: [
            { path: '/test', component: 'TestComponent' },
            { path: '/about', component: 'AboutComponent' },
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
    it('should return original route when task array is empty', async () => {
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
            // Return handler function
            return async () => ({ success: true });
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

        const result = await createRouteTask({
            to,
            from,
            tasks,
            router
        });

        expect(executionOrder).toEqual(['task1', 'task2']);
        expect(result).toBe(to);
        expect(to.handle).toBeTypeOf('function');
    });

    it('should set handle when task returns a function', async () => {
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
        expect(to.handle).toBeTypeOf('function');
        expect(to.handle).not.toBeNull();
    });

    it('should throw RouteNavigationAbortedError when task returns false', async () => {
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

        await expect(
            createRouteTask({
                to,
                from,
                tasks,
                router
            })
        ).rejects.toThrow(RouteNavigationAbortedError);
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

        // Should return a new Route object for the redirected path
        expect(result).toBeInstanceOf(Route);
        expect(result.path).toBe('/redirected');
    });

    it('should throw RouteTaskExecutionError when task throws an error', async () => {
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

        // A real task that throws an error.
        const errorTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            throw new Error('Task execution failed');
        };

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: errorTask
            }
        ];

        await expect(
            createRouteTask({
                to,
                from,
                tasks,
                router
            })
        ).rejects.toThrow(RouteTaskExecutionError);
    });

    it('should handle non-Error exceptions and convert them to Error instances', async () => {
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

        // Task that throws a string instead of Error
        const stringErrorTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            throw 'String error message'; // eslint-disable-line prefer-promise-reject-errors
        };

        // Task that throws a number
        const numberErrorTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            throw 404; // eslint-disable-line prefer-promise-reject-errors
        };

        // Task that throws an object
        const objectErrorTask = async (
            route: Route,
            fromRoute: Route | null,
            router: Router
        ) => {
            throw { code: 'CUSTOM_ERROR', message: 'Custom error object' }; // eslint-disable-line prefer-promise-reject-errors
        };

        // Test string error
        const stringTasks: RouteTask[] = [
            { name: 'stringError', task: stringErrorTask }
        ];
        try {
            await createRouteTask({ to, from, tasks: stringTasks, router });
        } catch (error) {
            expect(error).toBeInstanceOf(RouteTaskExecutionError);
            expect(
                (error as RouteTaskExecutionError).originalError
            ).toBeInstanceOf(Error);
            expect(
                (error as RouteTaskExecutionError).originalError.message
            ).toBe('String error message');
        }

        // Test number error
        const numberTasks: RouteTask[] = [
            { name: 'numberError', task: numberErrorTask }
        ];
        try {
            await createRouteTask({ to, from, tasks: numberTasks, router });
        } catch (error) {
            expect(error).toBeInstanceOf(RouteTaskExecutionError);
            expect(
                (error as RouteTaskExecutionError).originalError
            ).toBeInstanceOf(Error);
            expect(
                (error as RouteTaskExecutionError).originalError.message
            ).toBe('404');
        }

        // Test object error
        const objectTasks: RouteTask[] = [
            { name: 'objectError', task: objectErrorTask }
        ];
        try {
            await createRouteTask({ to, from, tasks: objectTasks, router });
        } catch (error) {
            expect(error).toBeInstanceOf(RouteTaskExecutionError);
            expect(
                (error as RouteTaskExecutionError).originalError
            ).toBeInstanceOf(Error);
            expect(
                (error as RouteTaskExecutionError).originalError.message
            ).toBe('[object Object]');
        }
    });

    it('should not execute subsequent tasks once an error is thrown', async () => {
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

        await expect(
            createRouteTask({
                to,
                from,
                tasks,
                router
            })
        ).rejects.toThrow(RouteTaskExecutionError);

        expect(executionOrder).toEqual(['task1']); // Only the first task should be executed.
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
            return async () => ({ success: true }); // Return handler
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
        expect(to.handle).toBeTypeOf('function');
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

        // Task returning false should throw RouteNavigationAbortedError
        await expect(
            createRouteTask({
                to,
                from,
                tasks,
                router
            })
        ).rejects.toThrow(RouteNavigationAbortedError);
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
        // After removing RouteStatus, we check for successful handle instead of success status
        expect(to.handle).toBeTypeOf('function');
        expect(to.handle).not.toBe(null);
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

            await expect(
                createRouteTask({
                    to,
                    from,
                    tasks,
                    controller,
                    router
                })
            ).rejects.toThrow(RouteTaskCancelledError);
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

            await expect(
                createRouteTask({
                    to,
                    from,
                    tasks,
                    controller,
                    router
                })
            ).rejects.toThrow(RouteTaskCancelledError);
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

            const handleTask = async (
                route: Route,
                fromRoute: Route | null,
                router: Router
            ) => {
                return async () => ({ success: true }); // Return handle function instead of redirecting
            };

            const tasks: RouteTask[] = [
                {
                    name: 'beforeEach',
                    task: handleTask
                }
            ];

            // No controller provided
            const result = await createRouteTask({
                to,
                from,
                tasks,
                router
            });

            expect(result).toBe(to);
            expect(result?.handle).toBeTypeOf('function');
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
                return async () => ({ success: true }); // Return handler
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
            expect(to.handle).toBeTypeOf('function');
        });
    });
});

describe('RouteTaskController', () => {
    it('should handle task cancellation', async () => {
        const router = createMockRouter();
        const to = new Route({
            options: router.parsedOptions,
            toType: RouteType.push,
            toInput: '/test'
        });
        const controller = new RouteTaskController();

        controller.abort();

        const tasks: RouteTask[] = [
            {
                name: 'beforeEach',
                task: async () => async () => ({ success: true })
            }
        ];

        await expect(
            createRouteTask({
                to,
                from: null,
                tasks,
                router,
                controller
            })
        ).rejects.toThrow(RouteTaskCancelledError);
    });
});

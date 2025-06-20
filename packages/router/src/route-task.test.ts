import { describe, expect, it, vi } from 'vitest';
import { parsedOptions } from './options';
import { Route } from './route';
import {
    RouteTaskController,
    RouteTaskType,
    createRouteTask
} from './route-task';
import type { RouteTask, RouteTaskOptions } from './route-task';
import { RouteStatus, RouteType } from './types';
import type { RouterParsedOptions } from './types';

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

describe('createRouteTask', () => {
    it('should handle empty tasks array', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });
        const tasks: RouteTask[] = [];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.error); // Empty task array, no handler function obtained, marked as failed.
    });

    it('should execute tasks in sequence', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task1');
            return; // Continue execution.
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task2');
            return; // Continue execution.
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.override,
                task: secondTask
            }
        ];

        await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(executionOrder).toEqual(['task1', 'task2']);
    });

    it('should set status to success when task returns a function', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        // Real handler function.
        const handleFunction = async () => {
            return { message: 'Route handled successfully' };
        };

        const successTask = async () => {
            return handleFunction; // Return handler function.
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: successTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.success);
        expect(to.handle).toBeTypeOf('function');
        expect(to.handle).not.toBeNull();
    });

    it('should set status to aborted when task returns false', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        // Real blocking task.
        const blockingTask = async (route: Route, fromRoute: Route | null) => {
            const shouldProceed = false;
            return shouldProceed ? void 0 : false; // Return false to prevent navigation.
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: blockingTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.aborted);
    });

    it('should handle redirection when task returns a route location string', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        // Real redirection task function.
        const redirectTask = async (route: Route, fromRoute: Route | null) => {
            if (route.path === '/test') {
                return '/redirected';
            }
            // Other paths pass through directly (returning void means continue).
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: redirectTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).not.toBe(to);
        expect(result.path).toBe('/redirected');
        expect(result.type).toBe(RouteType.push);
        expect(result.status).toBe(RouteStatus.error); // No handler function obtained after redirection, marked as failed.
    });

    it('should handle redirection when task returns a route location object', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        // Real redirection task function, returns a route object.
        const redirectTask = async (route: Route, fromRoute: Route | null) => {
            if (route.path === '/test') {
                return {
                    path: '/redirected',
                    query: { source: 'test' }
                };
            }
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: redirectTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).not.toBe(to);
        expect(result.path).toBe('/redirected');
        expect(result.query.source).toBe('test');
        expect(result.type).toBe(RouteType.push);
        expect(result.status).toBe(RouteStatus.error); // No handler function obtained after redirection, marked as failed.
    });

    it('should handle conditional redirection based on route state', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/admin'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const authCheckTask = async (route: Route, fromRoute: Route | null) => {
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
                name: RouteTaskType.beforeEach,
                task: authCheckTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).not.toBe(to);
        expect(result.path).toBe('/login');
        expect(result.status).toBe(RouteStatus.error); // No handler function obtained after redirection, marked as failed.
    });

    it('should set status to error and break on task error', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        // A real task that throws an error.
        const errorTask = async (route: Route, fromRoute: Route | null) => {
            throw new Error('Task failed');
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: errorTask
            },
            {
                name: RouteTaskType.override,
                task: secondTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.error);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '[beforeEach] route confirm hook error: Error: Task failed'
        );

        consoleErrorSpy.mockRestore();
    });

    it('should continue processing when task returns undefined', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('first');
            return undefined; // Explicitly return undefined.
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('second');
            return; // Implicitly return undefined.
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.override,
                task: secondTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(executionOrder).toEqual(['first', 'second']);
    });

    it('should continue processing when task returns null', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('first');
            return; // Return void instead of null.
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('second');
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.override,
                task: secondTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(executionOrder).toEqual(['first', 'second']);
    });

    it('should handle from route being null', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = null;

        let receivedFromRoute: Route | null | undefined;

        const checkFromRouteTask = async (
            route: Route,
            fromRoute: Route | null
        ) => {
            receivedFromRoute = fromRoute;
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: checkFromRouteTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(receivedFromRoute).toBeNull();
    });

    it('should break on first task that returns false', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('first');
            return; // Continue.
        };

        const secondTask = async (
            route: Route,
            fromRoute: Route | null
        ): Promise<false> => {
            executionOrder.push('second');
            return false; // Block.
        };

        const thirdTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('third');
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.override,
                task: secondTask
            },
            {
                name: RouteTaskType.beforeEnter,
                task: thirdTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.aborted);
        expect(executionOrder).toEqual(['first', 'second']); // The third task was not executed.
    });

    it('should break on first task that returns a function', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('first');
            return; // Continue.
        };

        const handleFunction = async (
            route: Route,
            fromRoute: Route | null
        ) => {
            return { success: true };
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('second');
            return handleFunction; // Return handler function, should set success status and stop.
        };

        const thirdTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('third');
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.override,
                task: secondTask
            },
            {
                name: RouteTaskType.beforeEnter,
                task: thirdTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.success);
        expect(to.handle).toBeTypeOf('function');
        expect(to.handle).not.toBeNull();
        expect(executionOrder).toEqual(['first', 'second']); // The third task was not executed.
    });
});

describe('Task cancellation with RouteTaskController', () => {
    it('should cancel task when abort is called after first task execution', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];
        const controller = new RouteTaskController();

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task1');
            // Abort the task after the first task executes.
            controller.abort();
            return;
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task2');
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.override,
                task: secondTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options,
            controller
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.aborted);
        expect(executionOrder).toEqual(['task1']); // The second task should not be executed.
    });

    it('should cancel task when abort is called before task execution', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];
        const controller = new RouteTaskController();

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task1');
            return;
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task2');
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.override,
                task: secondTask
            }
        ];

        // Abort before the task executes.
        controller.abort();

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options,
            controller
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.aborted);
        expect(executionOrder).toEqual([]); // No tasks should be executed.
    });

    it('should continue execution when task is not aborted', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];
        const controller = new RouteTaskController();

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task1');
            return;
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task2');
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.override,
                task: secondTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options,
            controller
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.error); // Task completed but no handler function returned, marked as failed.
        expect(executionOrder).toEqual(['task1', 'task2']); // Both tasks should be executed.
    });

    it('should work normally without controller parameter', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task1');
            return;
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task2');
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.override,
                task: secondTask
            }
        ];

        // Do not provide a controller parameter.
        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.error); // Task completed but no handler function returned, marked as failed.
        expect(executionOrder).toEqual(['task1', 'task2']); // All tasks should execute normally.
    });

    it('should pass controller to redirection', async () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });

        const controller = new RouteTaskController();

        const redirectTask = async (route: Route, fromRoute: Route | null) => {
            if (route.path === '/test') {
                return '/redirected';
            }
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: redirectTask
            }
        ];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options,
            controller
        });

        expect(result).not.toBe(to);
        expect(result.path).toBe('/redirected');
        expect(result.status).toBe(RouteStatus.error); // No handler function obtained after redirection, marked as failed.
    });
});

describe('RouteTaskOptions interface', () => {
    it('should create valid RouteTaskOptions object', () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });
        const tasks: RouteTask[] = [];

        const routeTaskOptions: RouteTaskOptions = {
            to,
            from,
            tasks,
            options
        };

        expect(routeTaskOptions.to).toBe(to);
        expect(routeTaskOptions.from).toBe(from);
        expect(routeTaskOptions.tasks).toBe(tasks);
        expect(routeTaskOptions.options).toBe(options);
    });

    it('should create valid RouteTaskOptions object with controller', () => {
        const options = createRealOptions();
        const to = new Route({
            options,
            toType: RouteType.push,
            toInput: '/test'
        });
        const from = new Route({
            options,
            toType: RouteType.push,
            toInput: '/home'
        });
        const tasks: RouteTask[] = [];
        const controller = new RouteTaskController();

        const routeTaskOptions: RouteTaskOptions = {
            to,
            from,
            tasks,
            options,
            controller
        };

        expect(routeTaskOptions.to).toBe(to);
        expect(routeTaskOptions.from).toBe(from);
        expect(routeTaskOptions.tasks).toBe(tasks);
        expect(routeTaskOptions.options).toBe(options);
        expect(routeTaskOptions.controller).toBe(controller);
    });
});

describe('RouteTask interface', () => {
    it('should create valid RouteTask object', () => {
        // Real task function.
        const realTaskFunction = async (
            route: Route,
            fromRoute: Route | null
        ) => {
            // Some real logic.
            if (route.path === '/special') {
                return '/redirect';
            }
            return;
        };

        const routeTask: RouteTask = {
            name: RouteTaskType.beforeEach,
            task: realTaskFunction
        };

        expect(routeTask.name).toBe(RouteTaskType.beforeEach);
        expect(routeTask.task).toBe(realTaskFunction);
        expect(typeof routeTask.task).toBe('function');
    });
});

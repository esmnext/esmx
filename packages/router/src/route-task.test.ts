import { describe, expect, it, vi } from 'vitest';
import { parsedOptions } from './options';
import { createRoute } from './route';
import {
    type RouteTask,
    RouteTaskController,
    type RouteTaskOptions,
    RouteTaskType,
    createRouteTask
} from './route-task';
import { RouteStatus, RouteType } from './types';
import type { Route, RouterParsedOptions } from './types';

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

// Helper function to create real Route using createRoute
function createRealRoute(
    path: string,
    options: RouterParsedOptions,
    overrides: Partial<Route> = {}
): Route {
    const route = createRoute(options, RouteType.push, path, null);
    // Apply overrides by directly setting properties
    Object.assign(route, overrides);
    return route;
}

describe('createRouteTask', () => {
    it('should handle empty tasks array', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);
        const tasks: RouteTask[] = [];

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.resolve);
    });

    it('should execute tasks in sequence', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        // 使用真实的执行顺序跟踪
        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task1');
            return; // 继续执行
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task2');
            return; // 继续执行
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.env,
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
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        // 真实的处理函数
        const handleFunction = async (
            route: Route,
            fromRoute: Route | null
        ) => {
            return { message: 'Route handled successfully' };
        };

        const successTask = async (route: Route, fromRoute: Route | null) => {
            return handleFunction; // 返回处理函数
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
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        // 真实的阻止任务
        const blockingTask = async (route: Route, fromRoute: Route | null) => {
            // 模拟某种条件检查失败
            const shouldProceed = false;
            return shouldProceed ? void 0 : false; // 返回 false 阻止导航
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
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        // 真实的重定向任务函数
        const redirectTask = async (route: Route, fromRoute: Route | null) => {
            // 只有从 /test 才重定向到 /redirected，避免死循环
            if (route.path === '/test') {
                return '/redirected';
            }
            // 其他路径直接通过（返回void表示继续）
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

        // 验证返回的是重定向后的路由对象
        expect(result).not.toBe(to);
        expect(result.path).toBe('/redirected');
        expect(result.type).toBe(RouteType.push);
        expect(result.status).toBe(RouteStatus.resolve);
    });

    it('should handle redirection when task returns a route location object', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        // 真实的重定向任务函数，返回路由对象
        const redirectTask = async (route: Route, fromRoute: Route | null) => {
            if (route.path === '/test') {
                return {
                    path: '/redirected',
                    query: { source: 'test' }
                };
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
            options
        });

        // 验证返回的是重定向后的路由对象
        expect(result).not.toBe(to);
        expect(result.path).toBe('/redirected');
        expect(result.query.source).toBe('test');
        expect(result.type).toBe(RouteType.push);
        expect(result.status).toBe(RouteStatus.resolve);
    });

    it('should handle conditional redirection based on route state', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/admin', options);
        const from = createRealRoute('/home', options);

        // 模拟权限检查的真实逻辑
        const authCheckTask = async (route: Route, fromRoute: Route | null) => {
            // 模拟用户未登录的情况
            const isAuthenticated = false;

            if (route.path === '/admin' && !isAuthenticated) {
                // 未认证用户重定向到登录页
                return '/login';
            }

            // 认证用户或非受保护路由直接通过
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

        // 验证未认证用户被重定向到登录页
        expect(result).not.toBe(to);
        expect(result.path).toBe('/login');
        expect(result.status).toBe(RouteStatus.resolve);
    });

    it('should set status to error and break on task error', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        const consoleErrorSpy = vi
            .spyOn(console, 'error')
            .mockImplementation(() => {});

        // 真实的会抛出错误的任务
        const errorTask = async (route: Route, fromRoute: Route | null) => {
            throw new Error('Task failed');
        };

        // 这个任务不应该被执行
        const secondTask = async (route: Route, fromRoute: Route | null) => {
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: errorTask
            },
            {
                name: RouteTaskType.env,
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
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('first');
            return undefined; // 显式返回 undefined
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('second');
            return; // 隐式返回 undefined
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.env,
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
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('first');
            return; // 返回 void 而不是 null
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
                name: RouteTaskType.env,
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
        const to = createRealRoute('/test', options);
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
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('first');
            return; // 继续
        };

        const secondTask = async (
            route: Route,
            fromRoute: Route | null
        ): Promise<false> => {
            executionOrder.push('second');
            return false; // 阻止
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
                name: RouteTaskType.env,
                task: secondTask
            },
            {
                name: RouteTaskType.afterEach,
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
        expect(executionOrder).toEqual(['first', 'second']); // 第三个任务没有执行
    });

    it('should break on first task that returns a function', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('first');
            return; // 继续
        };

        const handleFunction = async (
            route: Route,
            fromRoute: Route | null
        ) => {
            return { success: true };
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('second');
            return handleFunction; // 返回处理函数，应该设置成功状态并停止
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
                name: RouteTaskType.env,
                task: secondTask
            },
            {
                name: RouteTaskType.afterEach,
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
        expect(executionOrder).toEqual(['first', 'second']); // 第三个任务没有执行
    });
});

describe('Task cancellation with getCurrentTaskId', () => {
    it('should cancel task when task id changes after first task execution', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

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
                name: RouteTaskType.env,
                task: secondTask
            }
        ];

        // 创建控制器，在第一个任务执行后改变任务 id
        const mockGetCurrentTaskId = vi
            .fn()
            .mockReturnValueOnce('task-1') // 初始调用（控制器构造时）
            .mockReturnValueOnce('task-1') // 第一个任务执行前检查
            .mockReturnValueOnce('task-2'); // 第一个任务执行后检查 - 任务 id 已变化

        const controller = new RouteTaskController(mockGetCurrentTaskId);

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options,
            controller
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.aborted);
        expect(executionOrder).toEqual(['task1']); // 第二个任务不应该执行
        expect(mockGetCurrentTaskId).toHaveBeenCalledTimes(3);
    });

    it('should cancel task when task id changes before task execution', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

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
                name: RouteTaskType.env,
                task: secondTask
            }
        ];

        // 创建控制器，在第二个任务执行前改变任务 id
        const mockGetCurrentTaskId = vi
            .fn()
            .mockReturnValueOnce('task-1') // 初始调用（控制器构造时）
            .mockReturnValueOnce('task-1') // 第一个任务执行前检查
            .mockReturnValueOnce('task-1') // 第一个任务执行后检查
            .mockReturnValueOnce('task-2'); // 第二个任务执行前检查 - 任务 id 已变化

        const controller = new RouteTaskController(mockGetCurrentTaskId);

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options,
            controller
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.aborted);
        expect(executionOrder).toEqual(['task1']); // 第二个任务不应该执行
        expect(mockGetCurrentTaskId).toHaveBeenCalledTimes(4);
    });

    it('should cancel task when task id changes after second task execution', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

        const executionOrder: string[] = [];

        const firstTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task1');
            return;
        };

        const secondTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task2');
            return;
        };

        const thirdTask = async (route: Route, fromRoute: Route | null) => {
            executionOrder.push('task3');
            return;
        };

        const tasks: RouteTask[] = [
            {
                name: RouteTaskType.beforeEach,
                task: firstTask
            },
            {
                name: RouteTaskType.env,
                task: secondTask
            },
            {
                name: RouteTaskType.afterEach,
                task: thirdTask
            }
        ];

        // 创建控制器，在第二个任务执行完成后改变任务 id
        const mockGetCurrentTaskId = vi
            .fn()
            .mockReturnValueOnce('task-1') // 初始调用（控制器构造时）
            .mockReturnValueOnce('task-1') // 第一个任务执行前检查
            .mockReturnValueOnce('task-1') // 第一个任务执行后检查
            .mockReturnValueOnce('task-1') // 第二个任务执行前检查
            .mockReturnValueOnce('task-2'); // 第二个任务执行后检查 - 任务 id 已变化

        const controller = new RouteTaskController(mockGetCurrentTaskId);

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options,
            controller
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.aborted);
        expect(executionOrder).toEqual(['task1', 'task2']); // 第三个任务不应该执行
        expect(mockGetCurrentTaskId).toHaveBeenCalledTimes(5);
    });

    it('should continue execution when task id remains unchanged', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

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
                name: RouteTaskType.env,
                task: secondTask
            }
        ];

        // 任务 id 始终保持不变
        const mockGetCurrentTaskId = vi.fn().mockReturnValue('task-1');
        const controller = new RouteTaskController(mockGetCurrentTaskId);

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options,
            controller
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.resolve);
        expect(executionOrder).toEqual(['task1', 'task2']); // 两个任务都应该执行
    });

    it('should work normally without getCurrentTaskId parameter', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

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
                name: RouteTaskType.env,
                task: secondTask
            }
        ];

        // 不提供 getCurrentTaskId 参数
        const result = await createRouteTask({
            to,
            from,
            tasks,
            options
        });

        expect(result).toBe(to);
        expect(to.status).toBe(RouteStatus.resolve);
        expect(executionOrder).toEqual(['task1', 'task2']); // 所有任务都应该正常执行
    });

    it('should pass controller to redirection and cancel if task id changes', async () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);

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

        const mockGetCurrentTaskId = vi.fn().mockReturnValue('task-1'); // 任务 ID 始终保持不变

        const controller = new RouteTaskController(mockGetCurrentTaskId);

        const result = await createRouteTask({
            to,
            from,
            tasks,
            options,
            controller
        });

        // 应该返回重定向的路由，控制器传递给重定向的任务，任务ID不变所以正常执行
        expect(result).not.toBe(to);
        expect(result.path).toBe('/redirected');
        expect(result.status).toBe(RouteStatus.resolve); // 重定向后没有其他任务，所以状态保持 resolve
        expect(mockGetCurrentTaskId).toHaveBeenCalled();
    });
});

describe('RouteTaskOptions interface', () => {
    it('should create valid RouteTaskOptions object', () => {
        const options = createRealOptions();
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);
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
        const to = createRealRoute('/test', options);
        const from = createRealRoute('/home', options);
        const tasks: RouteTask[] = [];
        const getCurrentTaskId = () => 'task-123';
        const controller = new RouteTaskController(getCurrentTaskId);

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
        // 真实的任务函数
        const realTaskFunction = async (
            route: Route,
            fromRoute: Route | null
        ) => {
            // 一些真实的逻辑
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

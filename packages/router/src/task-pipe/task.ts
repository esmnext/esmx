import type { Awaitable } from '../types';
import { warn } from '../utils';

/**
 * 创建可操作的任务队列
 */

type func = (...args: any) => any;

/**
 * 任务状态
 */
export enum TaskStatus {
    INITIAL = 'initial',
    RUNNING = 'running',
    FINISHED = 'finished',
    ERROR = 'error',
    ABORTED = 'aborted'
}

export class Tasks<T extends func = func> {
    protected handlers: T[] = [];

    public add(handler: T | T[]) {
        const params: T[] = handler instanceof Array ? handler : [handler];
        this.handlers.push(...params);
    }

    public reset() {
        this.handlers = [];
    }

    get list() {
        return this.handlers;
    }

    get length() {
        return this.handlers.length;
    }

    status: TaskStatus = TaskStatus.INITIAL;

    public async run({
        cb,
        final
    }: {
        cb?: (res: Awaited<ReturnType<T>>) => Awaitable<void>;
        final?: () => Awaitable<void>;
    } = {}) {
        if (this.status !== 'initial') {
            if (process.env.NODE_ENV !== 'production') {
                warn(`task start failed in status ${this.status}`);
            }
            return;
        }

        this.status = TaskStatus.RUNNING;

        for await (const handler of this.list) {
            if ((this.status as TaskStatus) === TaskStatus.ABORTED) {
                return;
            }
            if (typeof handler === 'function') {
                try {
                    const res = await handler();
                    cb && (await cb(res));
                } catch (error) {
                    // if (process.env.NODE_ENV !== 'production') {
                    warn('task error:', error);
                    // }
                    this.status = TaskStatus.ERROR;
                }
            } else {
                // if (process.env.NODE_ENV !== 'production') {
                warn('task is not a function', handler);
                // }
            }
        }
        if ((this.status as TaskStatus) !== TaskStatus.RUNNING) return;
        final && (await final());
        this.status = TaskStatus.FINISHED;
    }

    public abort() {
        if (
            process.env.NODE_ENV !== 'production' &&
            this.status === TaskStatus.RUNNING
        ) {
            warn('abort task when task is running');
        }
        this.status = TaskStatus.ABORTED;
    }
}

export function createTasks<T extends func = func>() {
    return new Tasks<T>();
}

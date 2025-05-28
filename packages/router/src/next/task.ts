const isDev = process.env.NODE_ENV !== 'production';
const warn = (...message: any[]) => {
    if (!isDev) return;
    console.warn('[Task Warning]', ...message);
};

export type TaskStatus =
    | 'initial'
    | 'running'
    | 'finished'
    | 'error'
    | 'aborted';

export class Tasks<T extends Function> {
    constructor(
        /**
         * 任务处理函数列表。任务处理函数返回 false 则中止任务
         */
        protected handlers: T[] = []
    ) {}

    public status: TaskStatus = 'initial';

    public abort() {
        if (this.status === 'running') {
            warn('abort task when task is running');
        }
        this.status = 'aborted';
    }

    public async run() {
        if (this.status !== 'initial') {
            warn(`task start failed in status ${this.status}`);
            return;
        }
        this.status = 'running';
        for (const handler of this.handlers) {
            if ((this.status as TaskStatus) !== 'running') {
                return;
            }
            if (typeof handler !== 'function') {
                warn(`task handler is not a function`, handler);
                continue;
            }
            try {
                if ((await handler()) === false) {
                    return this.abort();
                }
            } catch (e) {
                this.status = 'error';
                warn(`task error`, e);
                return;
            }
        }
        if (this.status !== 'running') return;
        this.status = 'finished';
    }
}

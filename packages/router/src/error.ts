import type { Route } from './route';

export class RouteError extends Error {
    public readonly code: string;
    public readonly to: Route;
    public readonly from: Route | null;

    constructor(
        message: string,
        code: string,
        to: Route,
        from: Route | null = null
    ) {
        super(message);
        this.name = 'RouteError';
        this.code = code;
        this.to = to;
        this.from = from;
    }
}

export class RouteTaskCancelledError extends RouteError {
    public readonly taskName: string;

    constructor(taskName: string, to: Route, from: Route | null = null) {
        super(
            `Route task "${taskName}" was cancelled`,
            'ROUTE_TASK_CANCELLED',
            to,
            from
        );
        this.name = 'RouteTaskCancelledError';
        this.taskName = taskName;
    }
}

export class RouteTaskExecutionError extends RouteError {
    public readonly taskName: string;
    public readonly originalError: Error;

    constructor(
        taskName: string,
        to: Route,
        from: Route | null = null,
        originalError?: unknown
    ) {
        const error =
            originalError instanceof Error
                ? originalError
                : new Error(String(originalError));
        const message = `Route task "${taskName}" failed${error.message ? `: ${error.message}` : ''}`;
        super(message, 'ROUTE_TASK_EXECUTION_ERROR', to, from);
        this.name = 'RouteTaskExecutionError';
        this.taskName = taskName;
        this.originalError = error;
    }
}

export class RouteNavigationAbortedError extends RouteError {
    public readonly taskName: string;

    constructor(taskName: string, to: Route, from: Route | null = null) {
        super(
            `Navigation was aborted by task "${taskName}"`,
            'ROUTE_NAVIGATION_ABORTED',
            to,
            from
        );
        this.name = 'RouteNavigationAbortedError';
        this.taskName = taskName;
    }
}

export class RouteSelfRedirectionError extends RouteError {
    constructor(fullPath: string, to: Route, from: Route | null = null) {
        super(
            `Detected a self-redirection to "${fullPath}". Aborting navigation.`,
            'ROUTE_SELF_REDIRECTION',
            to,
            from
        );
        this.name = 'RouteSelfRedirectionError';
    }
}

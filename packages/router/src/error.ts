import type { Route } from './route';

export class RouteError extends Error {
    public readonly code: string;
    public readonly route?: Route;

    constructor(message: string, code: string, route?: Route) {
        super(message);
        this.name = 'RouteError';
        this.code = code;
        this.route = route;
    }
}

export class RouteTaskCancelledError extends RouteError {
    public readonly taskName: string;

    constructor(taskName: string, route?: Route) {
        super(
            `Route task "${taskName}" was cancelled`,
            'ROUTE_TASK_CANCELLED',
            route
        );
        this.name = 'RouteTaskCancelledError';
        this.taskName = taskName;
    }
}

export class RouteTaskExecutionError extends RouteError {
    public readonly taskName: string;
    public readonly originalError?: Error;

    constructor(taskName: string, originalError?: Error, route?: Route) {
        const message = `Route task "${taskName}" failed${originalError ? `: ${originalError.message}` : ''}`;
        super(message, 'ROUTE_TASK_EXECUTION_ERROR', route);
        this.name = 'RouteTaskExecutionError';
        this.taskName = taskName;
        this.originalError = originalError;
    }
}

export class RouteNavigationAbortedError extends RouteError {
    public readonly taskName: string;

    constructor(taskName: string, route?: Route) {
        super(
            `Navigation was aborted by task "${taskName}"`,
            'ROUTE_NAVIGATION_ABORTED',
            route
        );
        this.name = 'RouteNavigationAbortedError';
        this.taskName = taskName;
    }
}

export class RouteSelfRedirectionError extends RouteError {
    constructor(fullPath: string, route?: Route) {
        super(
            `Detected a self-redirection to "${fullPath}". Aborting navigation.`,
            'ROUTE_SELF_REDIRECTION',
            route
        );
        this.name = 'RouteSelfRedirectionError';
    }
}

export class RouteNoHandlerFoundError extends RouteError {
    constructor(fullPath: string, route?: Route) {
        super(
            `No handle function found for route "${fullPath}"`,
            'ROUTE_NO_HANDLER_FOUND',
            route
        );
        this.name = 'RouteNoHandlerFoundError';
    }
}

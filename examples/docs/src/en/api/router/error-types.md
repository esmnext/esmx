---
titleSuffix: "Error Types API Reference"
description: "Detailed API reference for @esmx/router error types, including RouteError, task cancellation, execution errors, navigation abort, and self-redirection errors."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, RouteError, API, error handling, navigation error, route error, task cancellation"
---

# Error Types

## Introduction

`@esmx/router` provides a hierarchy of error classes for different routing failure scenarios. All route errors extend the base `RouteError` class, making it easy to catch and handle specific error types.

## Type Definitions

### RouteError

- **Type Definition**:
```ts
class RouteError extends Error {
    public readonly code: string;
    public readonly to: Route;
    public readonly from: Route | null;

    constructor(
        message: string,
        code: string,
        to: Route,
        from: Route | null
    );
}
```

Base class for all route-related errors.

**Properties**:
- `name`: `'RouteError'`
- `code`: Error code string identifying the error type
- `to`: The target Route object when the error occurred
- `from`: The source Route object (may be `null` for initial navigation)
- `message`: Human-readable error description

```ts
import { RouteError } from '@esmx/router';

try {
    await router.push('/target');
} catch (error) {
    if (error instanceof RouteError) {
        console.log('Route error:', error.code);
        console.log('Target:', error.to.path);
        console.log('From:', error.from?.path);
    }
}
```

### RouteTaskCancelledError

- **Type Definition**:
```ts
class RouteTaskCancelledError extends RouteError {
    public readonly taskName: string;

    constructor(
        taskName: string,
        to: Route,
        from: Route | null
    );
}
```

Thrown when a route task is cancelled, typically because a new navigation was triggered before the current one completed.

**Properties**:
- `name`: `'RouteTaskCancelledError'`
- `code`: `'ROUTE_TASK_CANCELLED'`
- `taskName`: Name of the cancelled task

```ts
import { RouteTaskCancelledError } from '@esmx/router';

try {
    await router.push('/slow-page');
} catch (error) {
    if (error instanceof RouteTaskCancelledError) {
        console.log(`Task "${error.taskName}" was cancelled`);
        // This is normal — another navigation replaced this one
    }
}
```

### RouteTaskExecutionError

- **Type Definition**:
```ts
class RouteTaskExecutionError extends RouteError {
    public readonly taskName: string;
    public readonly originalError: Error;

    constructor(
        taskName: string,
        to: Route,
        from: Route | null,
        originalError?: unknown
    );
}
```

Thrown when a route task (such as a guard or handle hook) throws an error during execution.

**Properties**:
- `name`: `'RouteTaskExecutionError'`
- `code`: `'ROUTE_TASK_EXECUTION_ERROR'`
- `taskName`: Name of the failed task
- `originalError`: The original error that caused the failure

```ts
import { RouteTaskExecutionError } from '@esmx/router';

try {
    await router.push('/page');
} catch (error) {
    if (error instanceof RouteTaskExecutionError) {
        console.error(
            `Task "${error.taskName}" failed:`,
            error.originalError.message
        );
    }
}
```

### RouteNavigationAbortedError

- **Type Definition**:
```ts
class RouteNavigationAbortedError extends RouteError {
    public readonly taskName: string;

    constructor(
        taskName: string,
        to: Route,
        from: Route | null
    );
}
```

Thrown when navigation is explicitly aborted by a guard returning `false`.

**Properties**:
- `name`: `'RouteNavigationAbortedError'`
- `code`: `'ROUTE_NAVIGATION_ABORTED'`
- `taskName`: Name of the guard that aborted navigation

```ts
import { RouteNavigationAbortedError } from '@esmx/router';

router.beforeEach((to) => {
    if (to.meta.restricted) {
        return false; // This will cause RouteNavigationAbortedError
    }
});

try {
    await router.push('/restricted');
} catch (error) {
    if (error instanceof RouteNavigationAbortedError) {
        console.log(`Navigation aborted by: ${error.taskName}`);
    }
}
```

### RouteSelfRedirectionError

- **Type Definition**:
```ts
class RouteSelfRedirectionError extends RouteError {
    constructor(
        fullPath: string,
        to: Route,
        from: Route | null
    );
}
```

Thrown when a redirect would cause an infinite loop by redirecting to the same path.

**Properties**:
- `name`: `'RouteSelfRedirectionError'`
- `code`: `'ROUTE_SELF_REDIRECTION'`

```ts
import { RouteSelfRedirectionError } from '@esmx/router';

// This configuration would cause a self-redirection error:
// { path: '/loop', redirect: '/loop' }

try {
    await router.push('/loop');
} catch (error) {
    if (error instanceof RouteSelfRedirectionError) {
        console.error('Redirect loop detected:', error.message);
    }
}
```

## Error Hierarchy

All error classes inherit from `RouteError`, which inherits from the standard `Error` class:

```
Error
└── RouteError
    ├── RouteTaskCancelledError
    ├── RouteTaskExecutionError
    ├── RouteNavigationAbortedError
    └── RouteSelfRedirectionError
```

## Error Handling Patterns

### Catch All Route Errors

```ts
import { RouteError } from '@esmx/router';

try {
    await router.push('/target');
} catch (error) {
    if (error instanceof RouteError) {
        switch (error.code) {
            case 'ROUTE_TASK_CANCELLED':
                // Navigation was replaced — usually safe to ignore
                break;
            case 'ROUTE_NAVIGATION_ABORTED':
                // Guard rejected navigation
                showNotification('Navigation blocked');
                break;
            case 'ROUTE_TASK_EXECUTION_ERROR':
                // A guard or handler threw an error
                reportError(error);
                break;
            case 'ROUTE_SELF_REDIRECTION':
                // Redirect loop detected
                console.error('Configuration error:', error.message);
                break;
        }
    }
}
```

### Ignore Cancellation Errors

Cancellation errors are common during rapid navigation (e.g., user clicking multiple links quickly). They are generally safe to ignore:

```ts
import { RouteTaskCancelledError } from '@esmx/router';

try {
    await router.push('/target');
} catch (error) {
    if (error instanceof RouteTaskCancelledError) {
        return; // Safe to ignore
    }
    throw error; // Re-throw unexpected errors
}
```

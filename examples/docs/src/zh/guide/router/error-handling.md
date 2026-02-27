---
titleSuffix: "Error Handling"
description: "Learn how to handle navigation errors in @esmx/router — error types, catching errors from push/replace, and best practices for guard error handling."
head:
  - - "meta"
    - name: "keywords"
      content: "route errors, navigation errors, RouteError, RouteTaskCancelledError, RouteNavigationAbortedError, RouteSelfRedirectionError, error handling"
---

# Error Handling

Navigation in `@esmx/router` can fail for several reasons — a guard blocks the transition, an async component fails to load, or a newer navigation supersedes the current one. The router provides a structured error hierarchy so you can handle each case appropriately.

## Error Types

All route errors extend the `RouteError` base class. Each error type has a specific `code` that identifies the failure reason.

### RouteError (Base Class)

The base class for all routing errors. Every route error has these properties:

```ts
class RouteError extends Error {
  readonly code: string;     // Error code identifier
  readonly to: Route;        // The target route of the failed navigation
  readonly from: Route | null; // The route we were navigating from
}
```

| Property | Type | Description |
|----------|------|-------------|
| `message` | `string` | Human-readable error description |
| `code` | `string` | Machine-readable error code |
| `to` | `Route` | Target route that was being navigated to |
| `from` | `Route \| null` | Route that was being navigated from (`null` on initial navigation) |

### RouteTaskCancelledError {#task-cancelled}

**Code:** `ROUTE_TASK_CANCELLED`

Thrown when a navigation is cancelled because a **newer navigation** started before the current one completed. This is normal and expected in applications where users click quickly:

```ts
// User clicks rapidly:
router.push('/page-1'); // → RouteTaskCancelledError (superseded)
router.push('/page-2'); // → RouteTaskCancelledError (superseded)
router.push('/page-3'); // → completes successfully
```

This error has an additional property:

| Property | Type | Description |
|----------|------|-------------|
| `taskName` | `string` | Name of the guard/task that was running when cancelled |

In most cases, you can safely ignore this error — it simply means the user changed their mind:

```ts
try {
  await router.push('/slow-page');
} catch (error) {
  if (error instanceof RouteTaskCancelledError) {
    // Normal — user navigated somewhere else. Do nothing.
    return;
  }
  throw error;
}
```

### RouteTaskExecutionError {#task-execution}

**Code:** `ROUTE_TASK_EXECUTION_ERROR`

Thrown when a guard or async component **throws an error** during execution:

```ts
// A guard that throws
router.beforeEach(async (to) => {
  const user = await fetchUser(); // network error!
});

// An async component that fails to load
{
  path: '/dashboard',
  asyncComponent: () => import('./Dashboard') // module not found!
}
```

This error wraps the original error and provides access to it:

| Property | Type | Description |
|----------|------|-------------|
| `taskName` | `string` | Name of the guard/task that threw |
| `originalError` | `Error` | The original error that was thrown |

```ts
try {
  await router.push('/dashboard');
} catch (error) {
  if (error instanceof RouteTaskExecutionError) {
    console.error('Guard/component failed:', error.originalError.message);
    console.error('Failed during:', error.taskName);
  }
}
```

### RouteNavigationAbortedError {#navigation-aborted}

**Code:** `ROUTE_NAVIGATION_ABORTED`

Thrown when a navigation guard explicitly **returns `false`** to block the navigation:

```ts
{
  path: '/editor',
  beforeLeave: (to, from, router) => {
    if (hasUnsavedChanges()) {
      const confirmed = confirm('Discard changes?');
      if (!confirmed) return false; // ← triggers RouteNavigationAbortedError
    }
  }
}
```

| Property | Type | Description |
|----------|------|-------------|
| `taskName` | `string` | Name of the guard that aborted navigation |

```ts
try {
  await router.push('/other-page');
} catch (error) {
  if (error instanceof RouteNavigationAbortedError) {
    console.log('Navigation was blocked by:', error.taskName);
    // User chose not to navigate — stay on current page
  }
}
```

### RouteSelfRedirectionError {#self-redirection}

**Code:** `ROUTE_SELF_REDIRECTION`

Thrown when a guard causes an **infinite redirect loop** — redirecting to the same route that's already being navigated to:

```ts
// This would cause an infinite loop without protection:
router.beforeEach((to) => {
  // Always redirects to /login, even when already going to /login!
  if (!isLoggedIn()) return '/login';
});

// The router detects this and throws RouteSelfRedirectionError
```

The fix is to check the target route before redirecting:

```ts
router.beforeEach((to) => {
  if (!isLoggedIn() && to.path !== '/login') {
    return '/login';
  }
});
```

## Catching Errors

### From `router.push` / `router.replace`

Every navigation method returns a `Promise` that rejects on error:

```ts
try {
  await router.push('/protected-page');
} catch (error) {
  if (error instanceof RouteNavigationAbortedError) {
    // Guard returned false — navigation blocked
    showNotification('You need permission to access this page');
  } else if (error instanceof RouteTaskCancelledError) {
    // Another navigation started — ignore silently
  } else if (error instanceof RouteTaskExecutionError) {
    // A guard or async component threw
    showError(`Navigation failed: ${error.originalError.message}`);
  } else if (error instanceof RouteSelfRedirectionError) {
    // Redirect loop detected
    console.error('Redirect loop:', error.message);
  }
}
```

### Type-Checking Errors

You can check errors by `instanceof` or by their `code` property:

```ts
// Using instanceof (recommended)
if (error instanceof RouteTaskCancelledError) { /* ... */ }

// Using error code
if (error instanceof RouteError && error.code === 'ROUTE_TASK_CANCELLED') { /* ... */ }
```

| Error Class | Code |
|-------------|------|
| `RouteTaskCancelledError` | `ROUTE_TASK_CANCELLED` |
| `RouteTaskExecutionError` | `ROUTE_TASK_EXECUTION_ERROR` |
| `RouteNavigationAbortedError` | `ROUTE_NAVIGATION_ABORTED` |
| `RouteSelfRedirectionError` | `ROUTE_SELF_REDIRECTION` |

## Best Practices

### 1. Always Handle Errors from Navigation

Don't fire-and-forget navigation calls in production. Unhandled promise rejections from failed navigations can crash your app:

```ts
// ❌ Bad — unhandled rejection if guard blocks navigation
router.push('/admin');

// ✅ Good — handle the error
router.push('/admin').catch((error) => {
  if (error instanceof RouteNavigationAbortedError) {
    // Expected — guard blocked access
  } else {
    console.error('Unexpected navigation error:', error);
  }
});
```

### 2. Ignore Cancellation Errors

`RouteTaskCancelledError` is almost always harmless. Create a helper to filter it out:

```ts
async function safeNavigate(to: string) {
  try {
    return await router.push(to);
  } catch (error) {
    if (error instanceof RouteTaskCancelledError) {
      return null; // silently ignore
    }
    throw error;
  }
}
```

### 3. Guard Error Recovery

When a guard throws unexpectedly, catch it and redirect to an error page rather than leaving the user stuck:

```ts
router.beforeEach(async (to) => {
  try {
    await validateAccess(to);
  } catch (error) {
    console.error('Access validation failed:', error);
    return { path: '/error', statusCode: 500 };
  }
});
```

### 4. Prevent Self-Redirection in Guards

Always check the target route before redirecting to avoid infinite loops:

```ts
// ❌ Bad — infinite loop when user navigates to /login
router.beforeEach((to) => {
  if (!isLoggedIn()) return '/login';
});

// ✅ Good — skip redirect when already heading to /login
router.beforeEach((to) => {
  if (!isLoggedIn() && to.path !== '/login') {
    return '/login';
  }
});
```

### 5. Wrap Async Component Loading

If your async components can fail (network issues, deployment changes), handle the error gracefully:

```ts
{
  path: '/dashboard',
  asyncComponent: async () => {
    try {
      return await import('./Dashboard.vue');
    } catch (error) {
      console.error('Failed to load Dashboard:', error);
      // Return a fallback component instead of crashing
      return import('./ErrorPage.vue');
    }
  }
}
```

## Complete Example

```ts
import {
  Router,
  RouterMode,
  RouteError,
  RouteTaskCancelledError,
  RouteTaskExecutionError,
  RouteNavigationAbortedError,
  RouteSelfRedirectionError
} from '@esmx/router';

const router = new Router({
  mode: RouterMode.history,
  routes: [
    { path: '/', component: Home },
    {
      path: '/admin',
      component: Admin,
      meta: { requiresAuth: true },
      beforeEnter: async (to) => {
        const user = await fetchUser();
        if (!user) return '/login';
        if (!user.isAdmin) return false;
      }
    },
    {
      path: '/reports',
      asyncComponent: () => import('./Reports.vue')
    },
    { path: '/login', component: Login }
  ]
});

// Global error-aware navigation helper
async function navigate(to: string): Promise<void> {
  try {
    await router.push(to);
  } catch (error) {
    if (error instanceof RouteTaskCancelledError) {
      // Superseded by newer navigation — ignore
      return;
    }

    if (error instanceof RouteNavigationAbortedError) {
      showToast('Access denied');
      return;
    }

    if (error instanceof RouteTaskExecutionError) {
      showToast(`Navigation failed: ${error.originalError.message}`);
      // Try to navigate to an error page
      await router.replace('/error').catch(() => {});
      return;
    }

    if (error instanceof RouteSelfRedirectionError) {
      console.warn('Redirect loop detected:', error.message);
      return;
    }

    // Unexpected error — rethrow
    throw error;
  }
}
```

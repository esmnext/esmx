---
titleSuffix: "Navigation Guards API Reference"
description: "Detailed API reference for @esmx/router navigation guards, including guard types, lifecycle hooks, guard execution order, and usage examples."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, navigation guards, API, route hooks, beforeEach, afterEach, beforeEnter, route lifecycle"
---

# Navigation Guards

## Introduction

Navigation guards in `@esmx/router` provide hooks into the route transition process, allowing you to control navigation, perform checks, redirect users, or execute side effects at different stages of a route change.

## Type Definitions

### RouteConfirmHook

- **Type Definition**:
```ts
type RouteConfirmHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<RouteConfirmHookResult>;
```

A confirmation guard that can approve, reject, or redirect navigation. Used by `beforeEach()` and `beforeEnter`.

### RouteConfirmHookResult

- **Type Definition**:
```ts
type RouteConfirmHookResult =
    | void
    | false
    | RouteLocationInput
    | RouteHandleHook;
```

Return values for confirmation guards:
- `void` or `undefined`: Allow navigation to proceed
- `false`: Cancel the navigation
- `RouteLocationInput`: Redirect to a different location
- `RouteHandleHook`: Provide a custom handle function for the route

### RouteNotifyHook

- **Type Definition**:
```ts
type RouteNotifyHook = (
    to: Route,
    from: Route | null,
    router: Router
) => void;
```

A notification hook called after navigation completes. Cannot cancel or redirect navigation. Used by `afterEach()`.

### RouteVerifyHook

- **Type Definition**:
```ts
type RouteVerifyHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<boolean>;
```

A verification hook that returns a boolean. Used in layer keep-alive logic.

### RouteHandleHook

- **Type Definition**:
```ts
type RouteHandleHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<RouteHandleResult>;
```

A handle hook for custom route handling logic. Can only be called once per navigation.

### RouteHandleResult

- **Type Definition**:
```ts
type RouteHandleResult = unknown | null | void;
```

Return type of handle hooks. The result is accessible via `route.handleResult`.

## Global Guards

### router.beforeEach()

- **Parameters**:
  - `guard: RouteConfirmHook` — Guard function
- **Returns**: `() => void` — Unregister function

Registers a global guard called before every navigation. Guards are called in registration order. If any guard cancels or redirects, subsequent guards are skipped.

```ts
// Authentication guard
const unregister = router.beforeEach((to, from, router) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        return '/login';
    }
});

// Permission guard
router.beforeEach((to, from, router) => {
    if (to.meta.role && !hasRole(to.meta.role)) {
        return false; // Cancel navigation
    }
});
```

### router.afterEach()

- **Parameters**:
  - `guard: RouteNotifyHook` — Hook function
- **Returns**: `() => void` — Unregister function

Registers a global hook called after every navigation completes. After-each hooks cannot affect navigation — they are purely for side effects like analytics, title updates, or logging.

```ts
router.afterEach((to, from, router) => {
    // Update page title
    document.title = to.meta.title || 'My App';

    // Track page view
    analytics.pageView(to.path);
});
```

## Per-Route Guards

### beforeEnter

- **Type**: `RouteConfirmHook`

Guard called before entering a specific route. Defined in the route configuration.

```ts
const routes = [
    {
        path: '/admin',
        component: AdminPanel,
        beforeEnter: (to, from, router) => {
            if (!isAdmin()) {
                return '/unauthorized';
            }
        }
    }
];
```

### beforeUpdate

- **Type**: `RouteConfirmHook`

Guard called when the route is reused but parameters change (e.g., navigating from `/user/1` to `/user/2`).

```ts
{
    path: '/user/:id',
    component: UserDetail,
    beforeUpdate: (to, from, router) => {
        // Called when :id changes
        console.log('User changed from', from?.params.id, 'to', to.params.id);
    }
}
```

### beforeLeave

- **Type**: `RouteConfirmHook`

Guard called before leaving a specific route. Useful for preventing navigation when there are unsaved changes.

```ts
{
    path: '/editor',
    component: Editor,
    beforeLeave: (to, from, router) => {
        if (hasUnsavedChanges()) {
            const confirmed = window.confirm('You have unsaved changes. Leave?');
            if (!confirmed) return false;
        }
    }
}
```

## Guard Execution Order

When a navigation occurs, guards are executed in the following order:

1. **beforeLeave** guards on the route being left
2. **Global beforeEach** guards (in registration order)
3. **beforeUpdate** guards on reused routes
4. **beforeEnter** guards on the target route configuration
5. Navigation is executed
6. **Global afterEach** hooks (in registration order)

```ts
// Example showing execution order
const router = new Router({
    routes: [
        {
            path: '/a',
            component: A,
            beforeLeave: () => console.log('1. beforeLeave /a'),
            beforeEnter: () => console.log('4. beforeEnter /a')
        },
        {
            path: '/b',
            component: B,
            beforeEnter: () => console.log('4. beforeEnter /b')
        }
    ]
});

router.beforeEach(() => console.log('2-3. global beforeEach'));
router.afterEach(() => console.log('6. global afterEach'));

// Navigate from /a to /b:
// 1. beforeLeave /a
// 2-3. global beforeEach
// 4. beforeEnter /b
// (navigation executes)
// 6. global afterEach
```

## Guard Cleanup

All guard registration methods return an unregister function. Call it to remove the guard:

```ts
const unregister = router.beforeEach((to) => {
    // Guard logic
});

// Later, remove the guard
unregister();
```

This is especially important in component-based frameworks where guards registered in component lifecycle hooks should be cleaned up when the component unmounts.

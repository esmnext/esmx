---
titleSuffix: "Navigation Guards API Reference"
description: "Complete guide to @esmx/router navigation guards — global guards, per-route guards, and the full navigation pipeline that controls route transitions."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx navigation guards, route guards, beforeEach, afterEach, beforeEnter, beforeLeave, route transition pipeline"
---

# Navigation Guards

Navigation guards are hooks that intercept route transitions. They can redirect, cancel, or allow navigation. Guards execute in a strict pipeline order, giving you fine-grained control over every route change.

## Guard Types

### RouteConfirmHook {#routeconfirmhook}

Guards that can modify navigation flow.

```ts
type RouteConfirmHook = (
  to: Route,
  from: Route | null,
  router: Router
) => Awaitable<RouteConfirmHookResult>;
```

#### Return Values

| Return | Effect |
|--------|--------|
| `void` / `undefined` | Continue to next guard |
| `false` | Cancel navigation |
| `string` | Redirect to that path |
| `RouteLocationInput` | Redirect to that location |
| `RouteHandleHook` | Execute as the final handler |

### RouteNotifyHook {#routenotifyhook}

Post-navigation hooks. Cannot modify navigation — for side effects only.

```ts
type RouteNotifyHook = (
  to: Route,
  from: Route | null,
  router: Router
) => void;
```

## Global Guards

### beforeEach {#beforeeach}

Registered on the router instance. Runs before every navigation. Returns a function that removes the registered guard.

```ts
// Authentication guard
const remove = router.beforeEach((to, from, router) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return '/login';
  }
});

// Remove the guard later
remove();
```

### afterEach {#aftereach}

Runs after every completed navigation. Cannot affect navigation.

```ts
router.afterEach((to, from) => {
  document.title = to.meta.title || 'My App';
  analytics.pageView(to.path);
});
```

## Per-Route Guards

Defined directly on [`RouteConfig`](./route-config).

### beforeEnter {#beforeenter}

Called when entering a route **from a different route**. Not called if the user is already on this route (use `beforeUpdate` for same-route param changes).

```ts
{
  path: '/admin',
  beforeEnter: (to, from, router) => {
    if (!hasRole('admin')) {
      return { path: '/403', statusCode: 403 };
    }
  }
}
```

### beforeUpdate {#beforeupdate}

Called when the **same route** is reused but parameters change. For example, navigating from `/user/1` to `/user/2`.

```ts
{
  path: '/user/:id',
  beforeUpdate: (to, from, router) => {
    console.log(`User changed: ${from?.params.id} → ${to.params.id}`);
  }
}
```

### beforeLeave {#beforeleave}

Called before leaving a route. Return `false` to prevent navigation.

```ts
{
  path: '/editor',
  beforeLeave: (to, from, router) => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm('Discard changes?');
      if (!confirmed) return false;
    }
  }
}
```

## Navigation Pipeline

Every navigation goes through a strict sequence of guards. The exact pipeline depends on the navigation type.

### Standard Navigation (push / replace) {#standard-navigation}

```
1. fallback        → Handle unmatched routes (404)
2. override        → Route override (hybrid app bridges)
3. asyncComponent  → Load lazy components
4. beforeLeave     → Per-route: leaving current route
5. beforeEnter     → Per-route: entering new route
6. beforeUpdate    → Per-route: same route, different params
7. beforeEach      → Global: all registered beforeEach guards
8. confirm         → Execute navigation (update history + mount app)
   └─ afterEach    → Global: post-navigation hooks
```

### Window Navigation (pushWindow / replaceWindow) {#window-navigation}

```
1. fallback
2. override
3. beforeEach
4. confirm → Delegates to fallback handler
```

### Layer Navigation (pushLayer) {#layer-navigation}

```
1. fallback
2. override
3. beforeEach
4. confirm → Creates layer router
```

### Restart App (restartApp) {#restart-navigation}

```
1. fallback
2. beforeLeave
3. beforeEach
4. beforeUpdate
5. beforeEnter
6. asyncComponent
7. confirm → Force re-mount micro-app
```

## Pipeline Behavior

### Short-circuiting {#short-circuiting}

Any guard returning a non-void result **stops the pipeline**. The remaining guards are skipped.

```ts
router.beforeEach((to) => {
  if (to.path === '/forbidden') {
    return false; // Pipeline stops here
  }
  // Return void → continue to next guard
});
```

### Redirect Chains {#redirect-chains}

When a guard returns a redirect, the entire pipeline **restarts** for the new target:

```ts
router.beforeEach((to) => {
  if (to.path === '/old') return '/new';
  // Navigating to /old → pipeline restarts for /new
});
```

### Async Guards {#async-guards}

All guards support `async`/`Promise`. The pipeline awaits each guard before proceeding.

```ts
router.beforeEach(async (to) => {
  const user = await fetchCurrentUser();
  if (!user && to.meta.requiresAuth) {
    return '/login';
  }
});
```

### Task Cancellation {#task-cancellation}

If a new navigation starts while guards are still running, the previous navigation is **automatically cancelled** via the internal `RouteTaskController`. A `RouteTaskCancelledError` is thrown for the cancelled navigation.

```ts
// User clicks rapidly:
router.push('/page-1'); // Started, then cancelled
router.push('/page-2'); // Started, then cancelled
router.push('/page-3'); // This one completes
```

## Complete Example

```ts
const router = new Router({
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/dashboard',
      meta: { requiresAuth: true },
      beforeEnter: async (to) => {
        const perms = await fetchPermissions();
        if (!perms.canViewDashboard) return '/unauthorized';
      },
      children: [
        { path: '', component: DashboardHome },
        {
          path: 'settings',
          component: Settings,
          beforeLeave: () => {
            if (hasUnsavedChanges()) return false;
          }
        }
      ]
    },
    {
      path: '/user/:id',
      component: UserProfile,
      beforeUpdate: (to, from) => {
        // Runs when navigating /user/1 → /user/2
        store.loadUser(to.params.id);
      }
    }
  ]
});

// Global guards
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return '/login';
  }
});

router.afterEach((to) => {
  document.title = `${to.meta.title || 'App'} | My Site`;
});
```

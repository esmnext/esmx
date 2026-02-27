---
titleSuffix: "Route Config API Reference"
description: "Complete API reference for @esmx/router RouteConfig — defining routes with paths, components, children, redirects, guards, and micro-app bindings."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx route config, route definition, nested routes, dynamic routes, route redirect, async component, micro-app routing"
---

# RouteConfig

`RouteConfig` defines how URLs map to components or micro-apps. It supports static and dynamic paths, nested routes, redirects, async components, per-route guards, and micro-app bindings.

## Type Definition

- **Type Definition**:
```ts
interface RouteConfig {
  path: string;
  component?: unknown;
  children?: RouteConfig[];
  redirect?: RouteLocationInput | RouteConfirmHook;
  meta?: RouteMeta;
  app?: string | RouterMicroAppCallback;
  asyncComponent?: () => Promise<unknown>;
  beforeEnter?: RouteConfirmHook;
  beforeUpdate?: RouteConfirmHook;
  beforeLeave?: RouteConfirmHook;
  layer?: boolean;
  override?: RouteConfirmHook;
}
```

## Properties

### path

- **Type**: `string`

**Required.** URL-encoded path pattern. Supports static segments and dynamic parameters via [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) syntax.

```ts
// Static path
{ path: '/about' }

// Dynamic parameter
{ path: '/user/:id' }

// Optional parameter
{ path: '/post/:id?' }

// Wildcard (catch-all)
{ path: '/files/:path*' }

// Multiple parameters
{ path: '/blog/:year/:month/:slug' }
```

#### Parameter Types

- `/user/:id` — e.g. `/user/42` → `{ id: '42' }`
- `/post/:id?` — e.g. `/post` → `{ id: '' }`
- `/files/:path*` — e.g. `/files/a/b/c` → `{ path: ['a', 'b', 'c'] }`
- `/:lang/docs/:page` — e.g. `/en/docs/intro` → `{ lang: 'en', page: 'intro' }`

### component

- **Type**: `unknown`

The component to render when this route is matched. The type depends on the framework being used (React component, Vue component, etc.).

```ts
{ path: '/home', component: HomePage }
```

### children

- **Type**: `RouteConfig[]`

Nested child routes. Child paths are resolved relative to the parent.

```ts
{
  path: '/user/:id',
  component: UserLayout,
  children: [
    { path: '', component: UserProfile },       // /user/:id
    { path: 'posts', component: UserPosts },     // /user/:id/posts
    { path: 'settings', component: UserSettings } // /user/:id/settings
  ]
}
```

### redirect

- **Type**: `RouteLocationInput | RouteConfirmHook`

Redirect to another route when this route is matched. Can be a static target (string or object) or a function for conditional redirects.

```ts
// Static redirect
{ path: '/old-page', redirect: '/new-page' }

// Object redirect with query
{ path: '/old-page', redirect: { path: '/new-page', query: { ref: 'redirect' } } }

// Conditional redirect
{
  path: '/dashboard',
  redirect: (to, from, router) => {
    if (!isAuthenticated()) return '/login';
    // Return void to continue to the route normally
  }
}
```

### meta

- **Type**: `RouteMeta`

Custom metadata attached to the route. Accessible via `route.meta` in guards and components. Type: `Record<string | symbol, unknown>`.

```ts
{
  path: '/admin',
  component: AdminPanel,
  meta: {
    requiresAuth: true,
    roles: ['admin'],
    title: 'Admin Panel'
  }
}
```

### app

- **Type**: `string | RouterMicroAppCallback`

Binds this route (and its children) to a [micro-app](./micro-app). When a `string` is provided, it looks up the app in [`RouterOptions.apps`](./router#apps). When a function is provided, it is used directly as the factory.

```ts
// String key (looked up in router.options.apps)
{
  path: '/react',
  app: 'reactApp',
  children: [
    { path: '', component: ReactHome },
    { path: 'about', component: ReactAbout }
  ]
}

// Inline factory function
{
  path: '/vue',
  app: (router) => ({
    mount: (el) => { /* ... */ },
    unmount: () => { /* ... */ }
  })
}
```

### asyncComponent

- **Type**: `() => Promise<unknown>`

Lazy-load a component. The component is fetched only when the route is first matched. Once loaded, it replaces the `component` property.

```ts
{
  path: '/heavy-page',
  asyncComponent: () => import('./pages/HeavyPage')
}
```

### beforeEnter

- **Type**: `RouteConfirmHook`

Guard called before entering this route. Only fires when the route is being entered from a different route (not when the route is reused with different params).

```ts
{
  path: '/admin',
  beforeEnter: (to, from, router) => {
    if (!hasAdminRole()) return '/unauthorized';
  }
}
```

### beforeUpdate

- **Type**: `RouteConfirmHook`

Guard called when the route is reused but params change. For example, navigating from `/user/1` to `/user/2`. Only fires when the same route config is matched but with different parameters.

```ts
{
  path: '/user/:id',
  beforeUpdate: (to, from, router) => {
    console.log(`User changed: ${from?.params.id} → ${to.params.id}`);
  }
}
```

### beforeLeave

- **Type**: `RouteConfirmHook`

Guard called before leaving this route. Return `false` to prevent navigation. Useful for preventing navigation when there are unsaved changes.

```ts
{
  path: '/editor',
  beforeLeave: (to, from, router) => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm('Discard changes?');
      if (!confirmed) return false; // Cancel navigation
    }
  }
}
```

### layer

- **Type**: `boolean`

Mark this route as layer-only (`true`) or non-layer-only (`false`). Layer routes are only matched when using [`pushLayer()`](./router#pushlayer) navigation.

```ts
// Only matches in pushLayer() context
{
  path: '/preview/:id',
  component: PreviewModal,
  layer: true
}
```

### override

- **Type**: `RouteConfirmHook`

Route override function for hybrid app development. Allows intercepting navigation to handle it externally (e.g., native app bridges). **Not executed** during initial route loading.

```ts
{
  path: '/native-feature',
  override: (to, from) => {
    if (isInNativeApp()) {
      return () => JSBridge.openNative(to.path);
    }
    // Return void to use default routing
  }
}
```

## Full Example

```ts
const routes: RouteConfig[] = [
  {
    path: '/',
    app: 'dashboard',
    children: [
      { path: '', component: DashboardHome }
    ]
  },
  {
    path: '/react',
    app: 'react',
    children: [
      { path: '', component: ReactHome },
      { path: 'about', component: ReactAbout }
    ]
  },
  {
    path: '/admin',
    app: 'admin',
    meta: { requiresAuth: true },
    beforeEnter: (to) => {
      if (!isAdmin()) return '/login';
    },
    children: [
      { path: '', component: AdminDashboard },
      { path: 'users/:id', component: AdminUserDetail },
      {
        path: 'settings',
        component: AdminSettings,
        beforeLeave: () => {
          if (hasUnsavedChanges()) return false;
        }
      }
    ]
  },
  {
    path: '/preview/:id',
    component: PreviewModal,
    layer: true
  },
  {
    path: '/docs',
    asyncComponent: () => import('./pages/DocsPage')
  }
];
```

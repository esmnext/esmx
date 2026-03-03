---
titleSuffix: "Route Configuration API Reference"
description: "Detailed API reference for @esmx/router route configuration, including route definition, dynamic segments, nested routes, redirects, and route matching."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Route Config, API, dynamic routes, nested routes, redirect, route matching, wildcard"
---

# Route Configuration

## Introduction

Route configuration defines the mapping between URL paths and components in `@esmx/router`. It supports dynamic segments, nested routes, redirects, lazy loading, and per-route navigation guards.

## Type Definitions

### RouteConfig

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

#### path

- **Type**: `string`
- **Required**: `true`

URL path pattern for the route. Supports dynamic segments and wildcards:

```ts
// Static path
{ path: '/about' }

// Dynamic segment
{ path: '/user/:id' }

// Multiple dynamic segments
{ path: '/post/:year/:month/:slug' }

// Wildcard (catch-all)
{ path: '/files/*' }

// Optional segment
{ path: '/user/:id?' }
```

#### component

- **Type**: `unknown`

The component to render when the route matches. The type depends on the framework being used.

```ts
import Home from './Home.vue';

{ path: '/', component: Home }
```

#### asyncComponent

- **Type**: `() => Promise<unknown>`

Lazy-loaded component function. The component is loaded on-demand when the route is first matched.

```ts
{
    path: '/dashboard',
    asyncComponent: () => import('./Dashboard.vue')
}
```

#### children

- **Type**: `RouteConfig[]`

Nested child route configurations. Child paths are relative to the parent path.

```ts
{
    path: '/user',
    component: UserLayout,
    children: [
        { path: '', component: UserList },
        { path: ':id', component: UserDetail },
        { path: ':id/edit', component: UserEdit }
    ]
}
```

#### redirect

- **Type**: `RouteLocationInput | RouteConfirmHook`

Redirect target for this route. Can be a static location or a dynamic function.

```ts
// Static redirect
{ path: '/old', redirect: '/new' }

// Dynamic redirect
{
    path: '/user',
    redirect: (to, from, router) => {
        return '/user/' + getDefaultUserId();
    }
}
```

#### meta

- **Type**: `RouteMeta` (`Record<string | symbol, unknown>`)

Custom metadata attached to the route. Accessible via `route.meta` in guards and components.

```ts
{
    path: '/admin',
    component: Admin,
    meta: {
        requiresAuth: true,
        title: 'Admin Panel',
        permissions: ['admin']
    }
}
```

#### app

- **Type**: `string | RouterMicroAppCallback`

Micro-app identifier or factory function. Used in multi-application routing to select which app handles the route.

```ts
// String reference to named app
{ path: '/app1/*', app: 'app1' }

// Factory function
{
    path: '/embedded/*',
    app: (router) => ({
        mount(el) { /* mount app */ },
        unmount() { /* cleanup */ }
    })
}
```

#### beforeEnter

- **Type**: `RouteConfirmHook`

Per-route navigation guard called before entering the route. See [Navigation Guards](./navigation-guards.md).

```ts
{
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, router) => {
        if (!isAdmin()) return '/login';
    }
}
```

#### beforeUpdate

- **Type**: `RouteConfirmHook`

Per-route guard called when the route is reused with different parameters.

#### beforeLeave

- **Type**: `RouteConfirmHook`

Per-route guard called before leaving this route.

#### layer

- **Type**: `boolean`

When `true`, this route only matches in layer mode. When `false`, this route is excluded from layer matching.

```ts
// Only available as a layer
{ path: '/dialog/select', component: SelectDialog, layer: true }

// Never available as a layer
{ path: '/main', component: MainPage, layer: false }
```

#### override

- **Type**: `RouteConfirmHook`

Route override function for hybrid app development. Returns a handle function to override default routing, or `void` for default behavior. Not executed during initial route loading.

```ts
{
    path: '/native-page',
    override: (to, from) => {
        if (isInApp()) {
            return () => JSBridge.openNative();
        }
    }
}
```

### RouteParsedConfig

- **Type Definition**:
```ts
interface RouteParsedConfig extends RouteConfig {
    compilePath: string;
    children: RouteParsedConfig[];
    match: MatchFunction;
    compile: (params?: Record<string, string>) => string;
}
```

Internal parsed form of route configuration, used by the router after processing. Extends `RouteConfig` with:
- `compilePath`: Compiled path pattern
- `children`: Parsed child configurations
- `match`: Path matching function from `path-to-regexp`
- `compile`: Path compilation function for generating URLs from parameters

### RouteMatchResult

- **Type Definition**:
```ts
interface RouteMatchResult {
    readonly matches: readonly RouteParsedConfig[];
    readonly params: Record<string, string | string[]>;
}
```

Result of route matching:
- `matches`: Array of matched route configurations from parent to child
- `params`: Extracted dynamic parameters

### RouteMatcher

- **Type Definition**:
```ts
type RouteMatcher = (
    to: URL,
    base: URL,
    cb?: (item: RouteParsedConfig) => boolean
) => RouteMatchResult;
```

Route matching function type. Takes a target URL, base URL, and optional filter callback to determine which routes to match against.

## Dynamic Segments

Dynamic segments use the `:param` syntax and match any path segment:

```ts
const routes = [
    // Matches /user/1, /user/abc, etc.
    { path: '/user/:id', component: User },

    // Multiple segments
    { path: '/post/:year/:month/:day', component: Post },

    // Wildcard catch-all
    { path: '/docs/*', component: DocsPage }
];
```

Parameters are available in `route.params`:

```ts
// URL: /user/42
route.params.id // '42'

// URL: /post/2024/01/15
route.params.year  // '2024'
route.params.month // '01'
route.params.day   // '15'
```

## Complete Example

```ts
import { Router } from '@esmx/router';

const router = new Router({
    routes: [
        {
            path: '/',
            component: Layout,
            children: [
                { path: '', component: Home },
                {
                    path: 'user/:id',
                    component: UserDetail,
                    meta: { requiresAuth: true },
                    beforeEnter: (to) => {
                        if (!isLoggedIn()) return '/login';
                    }
                },
                {
                    path: 'settings',
                    asyncComponent: () => import('./Settings.vue'),
                    beforeLeave: (to, from) => {
                        if (hasUnsavedChanges()) return false;
                    }
                }
            ]
        },
        { path: '/login', component: Login },
        { path: '/old-page', redirect: '/new-page' }
    ]
});
```

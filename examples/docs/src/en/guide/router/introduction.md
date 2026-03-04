---
titleSuffix: "Introduction to @esmx/router"
description: "A comprehensive introduction to @esmx/router — a framework-agnostic router for micro-frontend applications with SSR support, navigation guards, layer routing, and micro-app orchestration."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router, micro-frontend router, SSR router, framework-agnostic router, navigation guards, layer routing, micro-app routing"
---

# Introduction

`@esmx/router` is a framework-agnostic router built for modern micro-frontend applications. Unlike traditional routers that bind to a single framework, `@esmx/router` works with React, Vue 2, Vue 3, vanilla JavaScript, or any combination of them — all within the same application.

## Why @esmx/router?

Modern web applications face challenges that traditional routers were not designed to solve:

- **Multiple frameworks in one app**: A large organization may have teams using React, Vue 2, and Vue 3. They need one router that governs navigation across all of them.
- **Server-side rendering (SSR) that works everywhere**: The same route configuration should produce server-rendered HTML and then hydrate seamlessly on the client — regardless of which framework renders each route.
- **Overlaying content without destroying state**: Modal dialogs, drawers, and slide-in panels need their own isolated routing context while the parent page continues running behind them.
- **Gradual migration**: Moving from one framework to another should happen route by route, not all at once.

`@esmx/router` was built from the ground up to address all of these.

## Core Features

### Framework-Agnostic

The router does not import React, Vue, or any other framework. Instead, routes declare a **micro-app** — a set of callbacks (`mount`, `unmount`, `renderToString`) that know how to manage a specific framework's component tree. This means different routes can render using entirely different frameworks:

```ts
const router = new Router({
  routes: [
    { path: '/', app: 'react-app', component: HomePage },
    { path: '/dashboard', app: 'vue3-app', component: Dashboard }
  ],
  apps: {
    'react-app': () => ({ mount(el, comp) { /* ReactDOM */ }, unmount(el) { /* cleanup */ } }),
    'vue3-app': () => ({ mount(el, comp) { /* createApp */ }, unmount(el) { /* cleanup */ } })
  }
});
```

When the user navigates from `/` to `/dashboard`, the router unmounts the React app, mounts the Vue 3 app, and renders the correct component — all without a full page reload.

### Two Routing Modes

- `RouterMode.history`: Uses the browser's History API (`pushState`, `popstate`) for standard web applications
- `RouterMode.memory`: Keeps state entirely in memory with no URL changes, for SSR, layer routing, and testing

### Server-Side Rendering (SSR)

The router has first-class SSR support. The same route configuration works on both server and client. On the server, use `RouterMode.memory` and pass `req`/`res` objects:

```ts
const router = new Router({
  mode: RouterMode.memory,
  base: new URL(req.url, `http://${req.headers.host}`),
  req, res,
  routes: [/* same routes as client */]
});
const html = await router.renderToString();
```

### Rich Route Configuration

Routes support dynamic parameters, nested children, lazy loading, per-route guards, redirects, micro-app binding, and more:

```ts
const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: 'users/:id', asyncComponent: () => import('./UserProfile') },
      { path: 'admin', app: 'admin-app', component: AdminPanel,
        beforeEnter: (to, from, router) => { if (!isAdmin()) return '/login'; }
      }
    ]
  }
];
```

### Full Navigation Guard Pipeline

Guards intercept navigation at every stage — from leaving the current route to entering the new one. The pipeline executes in this order:

1. **`fallback`** — Handle unmatched routes
2. **`override`** — Route-level override (hybrid app scenarios)
3. **`beforeLeave`** — Guard on the route being left
4. **`beforeEach`** — Global guard
5. **`beforeUpdate`** — Guard when same route changes params
6. **`beforeEnter`** — Guard on the route being entered
7. **`asyncComponent`** — Lazy load the target component
8. **`confirm`** — Final confirmation, DOM updates, micro-app mount/unmount
9. **`afterEach`** — Post-navigation notification

Guards can return `void` (allow), `false` (cancel), a string/object (redirect), or a function (custom logic).

### Layer Routing

Layers are isolated routing contexts rendered on top of the main page — modals, drawers, and slide-in panels with their own navigation:

```ts
const result = await router.createLayer({
  routes: [
    { path: '/', component: ModalContent },
    { path: '/step-2', component: ModalStep2 }
  ]
});
// result.data contains data passed to closeLayer()
```

Inside a layer, navigation (`push`, `replace`, `back`) does not affect the parent page's route.

### RouterLink

A framework-agnostic utility for building navigation links. `router.resolveLink()` returns attributes, active state, and event handlers that any framework can use:

```ts
const link = router.resolveLink({ to: '/about', activeClass: 'nav-active' });
// link.attributes — { href, class }
// link.isActive — true/false
// link.navigate — click handler
```

Framework-specific wrappers (like `@esmx/router-vue`) build their own `<RouterLink>` components on top of this.

### Scroll Behavior

The router automatically manages scroll positions:
- **`push`/`replace`** — scrolls to top (unless `keepScrollPosition: true`)
- **`back`/`forward`/`go`** — restores the saved scroll position
- Scroll positions are saved per URL in `history.state`

### Error Handling

Four error types provide structured error handling for navigation failures:
- `RouteTaskCancelledError` — Navigation superseded by a newer one
- `RouteTaskExecutionError` — A guard or async component threw an error
- `RouteNavigationAbortedError` — A guard returned `false`
- `RouteSelfRedirectionError` — Infinite redirect loop detected

## Comparison with Other Routers

| Feature | @esmx/router | Vue Router | React Router |
|---------|-------------|------------|-------------|
| Framework-agnostic | ✅ | Vue only | React only |
| Multi-framework apps | ✅ | ❌ | ❌ |
| SSR support | ✅ Built-in | ✅ | ✅ |
| Navigation guards | ✅ Full pipeline | ✅ | Limited |
| Layer routing (modals) | ✅ Built-in | ❌ | ❌ |
| Micro-app lifecycle | ✅ | ❌ | ❌ |
| Memory mode | ✅ | ✅ | ✅ |
| Scroll management | ✅ Automatic | ✅ Manual | ❌ |
| TypeScript | ✅ Full types | ✅ | ✅ |

## What's Next?

- **[Getting Started](./getting-started)** — Step-by-step setup with Vue 2, Vue 3, or React
- **[Dynamic Route Matching](/api/router/dynamic-matching)** — Route parameters, query strings, catch-all routes
- **[Nested Routes](/api/router/nested-routes)** — Layouts and child routes
- **[Programmatic Navigation](/api/router/programmatic-navigation)** — All navigation methods in detail
- **[Navigation Guards](/api/router/navigation-guards)** — Intercept and control navigation
- **[Scroll Behavior](/api/router/scroll-behavior)** — Automatic scroll management
- **[Layer Routing](/api/router/layer)** — Modals and drawers with isolated routing
- **[Micro-App](/api/router/micro-app)** — Multi-framework app orchestration
- **[Error Handling](/api/router/error-types)** — Structured error types

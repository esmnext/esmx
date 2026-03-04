---
titleSuffix: "Vue 3 Integration — @esmx/router"
description: "Complete guide to integrating @esmx/router with Vue 3 — plugin setup, composables, SSR, RouterView, RouterLink, and full working examples."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router Vue 3, Vue 3 SSR router, createApp router, createSSRApp, useProvideRouter, useRouter, useRoute, RouterView, RouterLink, Vue 3 micro-frontend"
---

# Vue 3 Integration

This guide covers everything you need to integrate `@esmx/router` with Vue 3. By the end, you'll have a fully working Vue 3 app with routing and server-side rendering (SSR).

## Installation

Install the core router and the Vue integration package:

```bash
npm install @esmx/router @esmx/router-vue
```

`@esmx/router` is the framework-agnostic router core. `@esmx/router-vue` provides Vue-specific bindings — a plugin, composables, and components.

## Key Concepts

The Vue 3 integration relies on three pieces:

1. **RouterPlugin** — Registers `RouterView` and `RouterLink` as global components
2. **useProvideRouter()** — Provides the router instance to the component tree via `provide`/`inject`
3. **useRouter() / useRoute()** — Composition API composables for accessing the router and current route

## Step-by-Step Setup

### 1. Define Your Routes

Create a single source of truth for route definitions:

```ts title="src/routes.ts"
import type { RouteConfig } from '@esmx/router';

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('./layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('./pages/Home.vue') },
      { path: 'about', component: () => import('./pages/About.vue') },
      {
        path: 'users/:id',
        component: () => import('./pages/UserProfile.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
];
```

### 2. Create the App Factory

A shared factory that both the client and server entries use:

```ts title="src/create-app.ts"
import { h, createApp, createSSRApp } from 'vue';
import { Router } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import App from './App.vue';

export function createVueApp(router: Router, ssr = false) {
  const create = ssr ? createSSRApp : createApp;

  const app = create({
    setup() {
      useProvideRouter(router);
      return () => h(App);
    }
  });

  app.use(RouterPlugin);

  return { app, router };
}
```

Key points:

- **`useProvideRouter(router)`** must be called inside `setup()` of the root component. It makes the router available to all descendants via `useRouter()` and `useRoute()`.
- **`RouterPlugin`** registers `RouterView` and `RouterLink` as global components, and sets up `$router` and `$route` on `globalProperties`.
- Use `createSSRApp` for server-side rendering and `createApp` for client-side only.

### 3. Client Entry

The client entry creates the router in `history` mode and mounts the app:

```ts title="src/entry.client.ts"
import { Router, RouterMode } from '@esmx/router';
import { createVueApp } from './create-app';
import { routes } from './routes';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes
});

const { app } = createVueApp(router);
app.mount('#app');
```

`RouterMode.history` uses the browser's History API (`pushState`, `popstate`) for clean URLs.

### 4. Server Entry (SSR)

The server entry creates the router in `memory` mode and renders HTML:

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';
import { renderToString } from '@vue/server-renderer';
import { Router, RouterMode } from '@esmx/router';
import { createVueApp } from './create-app';
import { routes } from './routes';

export default async (rc: RenderContext) => {
  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url, 'http://localhost'),
    routes
  });

  await router.replace(rc.params.url);

  const { app } = createVueApp(router, true);
  const html = await renderToString(app);

  rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${rc.preload()}
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>`;
};
```

`RouterMode.memory` keeps the routing state in memory — no browser API calls, perfect for Node.js environments.

### 5. Node Entry

The Node entry configures the dev server and build tooling:

```ts title="src/entry.node.ts"
import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then((m) =>
      m.createRspackVue3App(esmx)
    );
  },

  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const rc = await esmx.render({
          params: { url: req.url }
        });
        res.end(rc.html);
      });
    });

    server.listen(3000, () => {
      console.log('Server started: http://localhost:3000');
    });
  }
} satisfies EsmxOptions;
```

`createRspackVue3App` from `@esmx/rspack-vue` sets up Rspack with Vue 3 SFC support, HMR, and SSR bundling.

## Using the Router in Components

### RouterView and RouterLink

`RouterView` renders the matched component for the current route. `RouterLink` creates navigation links with active state management:

```vue title="src/App.vue"
<template>
  <div>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/users/42">User 42</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>
```

`RouterLink` automatically applies the `router-link-active` class when the current route matches the link's `to` path. Customize it with the `activeClass` prop:

```vue
<RouterLink to="/about" activeClass="nav-active">About</RouterLink>
```

### useRouter and useRoute

Access the router and current route inside `<script setup>`:

```vue title="src/pages/UserProfile.vue"
<template>
  <div>
    <h1>User {{ route.params.id }}</h1>
    <p>Current path: {{ route.path }}</p>
    <p>Query: {{ JSON.stringify(route.query) }}</p>
    <p>Meta: {{ JSON.stringify(route.meta) }}</p>

    <button @click="goHome">Go Home</button>
    <button @click="goToNextUser">Next User</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from '@esmx/router-vue';
import { watch } from 'vue';

const router = useRouter();
const route = useRoute();

function goHome() {
  router.push('/');
}

function goToNextUser() {
  const currentId = Number(route.params.id);
  router.push(`/users/${currentId + 1}`);
}

// Watch for route changes
watch(() => route.path, (newPath, oldPath) => {
  console.log(`Route changed from ${oldPath} to ${newPath}`);
});
</script>
```

### Navigation Methods

The router provides several navigation methods:

```vue
<script setup lang="ts">
import { useRouter } from '@esmx/router-vue';

const router = useRouter();

// Push a new entry onto the history stack
router.push('/about');

// Replace the current entry (no new history entry)
router.replace('/about');

// Go back
router.back();

// Go forward
router.forward();

// Go to a specific history offset
router.go(-2);
</script>
```

### Accessing Route Information

The `route` object provides full information about the current route:

```vue
<script setup lang="ts">
import { useRoute } from '@esmx/router-vue';

const route = useRoute();

// Current path
route.path        // '/users/42'

// Route parameters
route.params       // { id: '42' }

// Query string parameters
route.query        // { tab: 'profile' } for /users/42?tab=profile

// Route meta data
route.meta         // { requiresAuth: true }

// Full URL object
route.url          // URL instance

// Matched route configs (parent → child)
route.matched      // RouteConfig[]
</script>
```

## Project File Structure

A typical Vue 3 + SSR project with `@esmx/router`:

```
src/
├── entry.node.ts      # Node.js server setup, dev/build config
├── entry.server.ts    # SSR rendering logic
├── entry.client.ts    # Client-side hydration/mounting
├── create-app.ts      # Shared app factory (used by both server & client)
├── routes.ts          # Route definitions
├── App.vue            # Root component (RouterView + navigation)
├── layouts/
│   └── MainLayout.vue # Layout with nested RouterView
└── pages/
    ├── Home.vue
    ├── About.vue
    └── UserProfile.vue
```

## What's Next?

- [Dynamic Route Matching](/api/router/dynamic-matching) — Route parameters and patterns
- [Nested Routes](/api/router/nested-routes) — Layouts with child routes
- [Programmatic Navigation](/api/router/programmatic-navigation) — All navigation methods
- [Navigation Guards](/api/router/navigation-guards) — Intercept and control navigation

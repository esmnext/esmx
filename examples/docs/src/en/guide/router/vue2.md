---
titleSuffix: "Vue 2 Integration — @esmx/router"
description: "Complete guide to integrating @esmx/router with Vue 2.7+ — plugin setup, Composition API and Options API usage, SSR, and full working examples."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router Vue 2, Vue 2.7 router, Vue.use router, Options API router, Composition API Vue 2, useProvideRouter, RouterView, RouterLink, Vue 2 SSR"
---

# Vue 2 Integration

This guide covers integrating `@esmx/router` with Vue 2.7+. Vue 2.7 introduced built-in Composition API support, which `@esmx/router-vue` relies on for its composables.

::: tip Vue 2.7+ Required
`@esmx/router-vue` requires Vue 2.7 or later. Earlier versions of Vue 2 do not support the Composition API and are not compatible.
:::

## Installation

Install the core router and the Vue integration package:

```bash
npm install @esmx/router @esmx/router-vue
```

The same `@esmx/router-vue` package works with both Vue 2.7+ and Vue 3. It detects the Vue version automatically.

## Differences from Vue 3

Before diving in, here are the key differences from the [Vue 3 integration](./vue3):

| Aspect | Vue 3 | Vue 2.7+ |
|--------|-------|----------|
| Plugin installation | `app.use(RouterPlugin)` | `Vue.use(RouterPlugin)` |
| App creation | `createApp()` / `createSSRApp()` | `new Vue()` |
| Mounting | `app.mount('#app')` | `new Vue().$mount('#app')` |
| SSR renderer | `@vue/server-renderer` | `vue-server-renderer` |
| Options API access | Works via `$router` / `$route` | Works via `$router` / `$route` |
| Composition API | `useRouter()` / `useRoute()` | `useRouter()` / `useRoute()` |

The route definitions, composables, and components (`RouterView`, `RouterLink`) are identical.

## Step-by-Step Setup

### 1. Define Your Routes

Same as Vue 3 — routes are framework-agnostic:

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

The main difference from Vue 3 is using `new Vue()` instead of `createApp()`:

```ts title="src/create-app.ts"
import Vue from 'vue';
import { Router } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import App from './App.vue';

// Install the plugin globally (Vue 2 style)
Vue.use(RouterPlugin);

export function createVueApp(router: Router) {
  const app = new Vue({
    setup() {
      useProvideRouter(router);
      return () => (Vue as any).h(App);
    }
  });

  return { app, router };
}
```

Key differences from Vue 3:

- **`Vue.use(RouterPlugin)`** is called on the Vue constructor, not on an app instance.
- **`new Vue()`** replaces `createApp()` / `createSSRApp()`.
- **`useProvideRouter(router)`** works the same — it must be called inside `setup()`.

### 3. Client Entry

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
app.$mount('#app');
```

Note: Vue 2 uses `$mount()` instead of `mount()`.

### 4. Server Entry (SSR)

Vue 2 uses `vue-server-renderer` instead of `@vue/server-renderer`:

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';
import { createRenderer } from 'vue-server-renderer';
import { Router, RouterMode } from '@esmx/router';
import { createVueApp } from './create-app';
import { routes } from './routes';

const renderer = createRenderer();

export default async (rc: RenderContext) => {
  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url, 'http://localhost'),
    routes
  });

  await router.replace(rc.params.url);

  const { app } = createVueApp(router);
  const html = await renderer.renderToString(app);

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

### 5. Node Entry

Use `createRspackVue2App` instead of `createRspackVue3App`:

```ts title="src/entry.node.ts"
import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-vue').then((m) =>
      m.createRspackVue2App(esmx)
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

## Using the Router in Components

### Composition API (Recommended)

Vue 2.7+ supports `<script setup>` with the Composition API. The composables are identical to Vue 3:

```vue title="src/pages/UserProfile.vue"
<template>
  <div>
    <h1>User {{ route.params.id }}</h1>
    <p>Current path: {{ route.path }}</p>

    <button @click="goHome">Go Home</button>
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

watch(() => route.path, (newPath) => {
  console.log('Route changed to:', newPath);
});
</script>
```

### Options API

The `RouterPlugin` makes `this.$router` and `this.$route` available in all components:

```vue title="src/pages/About.vue"
<template>
  <div>
    <h1>About</h1>
    <p>Current path: {{ $route.path }}</p>
    <button @click="navigateHome">Go Home</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  mounted() {
    console.log('Current route:', this.$route.path);
    console.log('Route params:', this.$route.params);
  },
  methods: {
    navigateHome() {
      this.$router.push('/');
    }
  }
});
</script>
```

### RouterView and RouterLink

These work exactly the same as in Vue 3:

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

`RouterLink` supports the same props in both Vue 2 and Vue 3:

- `to` — Target route (string or object)
- `type` — Navigation type (`'push'`, `'replace'`, `'pushWindow'`, etc.)
- `activeClass` — CSS class when route matches
- `exact` — Match mode (`'include'`, `'exact'`, `'route'`)
- `tag` — HTML tag to render (default: `'a'`)

## Project File Structure

```
src/
├── entry.node.ts      # Node.js server setup, dev/build config
├── entry.server.ts    # SSR rendering logic
├── entry.client.ts    # Client-side hydration/mounting
├── create-app.ts      # Shared app factory
├── routes.ts          # Route definitions
├── App.vue            # Root component
├── layouts/
│   └── MainLayout.vue
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

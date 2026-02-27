---
titleSuffix: "Getting Started with @esmx/router"
description: "Step-by-step guide to installing and configuring @esmx/router — from basic setup to full SSR integration with Vue 3, Vue 2, and React."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router setup, router installation, Vue 3 router, Vue 2 router, React router, SSR router, micro-frontend router getting started"
---

# Getting Started

This guide walks you through setting up `@esmx/router` from scratch. By the end, you'll have a working router with routes, navigation, and framework integration.

## Installation

Install the core router package:

```bash
npm install @esmx/router
```

If you're using Vue (2.7+ or 3), install the Vue integration as well:

```bash
npm install @esmx/router-vue
```

## Basic Setup

At its simplest, `@esmx/router` needs a list of routes and a mode:

```ts
import { Router, RouterMode } from '@esmx/router';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage },
    { path: '/contact', component: ContactPage }
  ]
});

// Navigate programmatically
await router.push('/about');

// Access current route
console.log(router.route.path);   // '/about'
console.log(router.route.query);  // {}
```

That's it for the basics. The router matches URLs to components, handles browser history, and provides the current route state.

## Setup with Vue 3

Vue 3 integration uses `@esmx/router-vue` which provides a plugin, composables, and components that work seamlessly with Vue's reactivity system.

### 1. Define Your Routes

```ts
// routes.ts
import type { RouteConfig } from '@esmx/router';

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: 'about', component: About },
      { path: 'users/:id', component: UserProfile }
    ]
  }
];
```

### 2. Create the App

```ts
// create-app.ts
import { createApp } from 'vue';
import { Router, RouterMode } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import App from './App.vue';
import { routes } from './routes';

export function createVueApp(router: Router) {
  const app = createApp({
    setup() {
      // Provide router to all child components
      useProvideRouter(router);
      return () => h(App);
    }
  });

  // Register RouterView and RouterLink as global components
  app.use(RouterPlugin);

  return { app };
}
```

### 3. Client Entry

```ts
// entry.client.ts
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

### 4. Server Entry (SSR)

```ts
// entry.server.ts
import { Router, RouterMode } from '@esmx/router';
import { renderToString } from '@vue/server-renderer';
import { createVueApp } from './create-app';
import { routes } from './routes';

export default async function render(req, res) {
  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(req.url, `http://${req.headers.host}`),
    req,
    res,
    routes
  });

  // Initialize the route
  await router.push(req.url);

  const { app } = createVueApp(router);
  const html = await renderToString(app);

  res.end(`
    <!DOCTYPE html>
    <html>
      <body>
        <div id="app">${html}</div>
        <script src="/entry.client.js"></script>
      </body>
    </html>
  `);
}
```

### 5. Use in Components

```vue
<template>
  <div>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>

    <!-- Renders the matched route component -->
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from '@esmx/router-vue';

const router = useRouter();
const route = useRoute();

// Navigate programmatically
function goToUser(id: string) {
  router.push(`/users/${id}`);
}
</script>
```

## Setup with Vue 2

Vue 2.7+ is supported using the same `@esmx/router-vue` package. The main difference is how the plugin is installed:

```ts
import Vue from 'vue';
import { Router, RouterMode } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import { routes } from './routes';

// Install plugin globally (Vue 2 style)
Vue.use(RouterPlugin);

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes
});

new Vue({
  setup() {
    // Provide router to all descendants
    useProvideRouter(router);
  },
  render: (h) => h(App)
}).$mount('#app');
```

In Vue 2.7+ components, you can use the same Composition API composables (`useRouter`, `useRoute`) just like in Vue 3. The Options API also works — the plugin makes `this.$router` and `this.$route` available:

```ts
export default {
  mounted() {
    console.log(this.$route.path);
    this.$router.push('/about');
  }
};
```

## Setup with React

React doesn't have a dedicated integration package. Instead, register a micro-app directly on the router:

```tsx
// entry.client.tsx
import { Router, RouterMode } from '@esmx/router';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import { routes } from './routes';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes,
  apps: (router) => ({
    mount(el) {
      const root = createRoot(el);
      root.render(createElement(App, { router }));
      return root;
    },
    unmount(el, root) {
      root.unmount();
    },
    async renderToString() {
      // SSR rendering for React
      const { renderToString } = await import('react-dom/server');
      return renderToString(createElement(App, { router }));
    }
  })
});
```

Then pass the `router` object through props or React context to your components:

```tsx
function App({ router }: { router: Router }) {
  const [route, setRoute] = useState(router.route);

  useEffect(() => {
    return router.afterEach((to) => setRoute(to));
  }, [router]);

  const Component = route.config?.component;
  return Component ? <Component /> : null;
}
```

## Project File Structure

A typical Esmx project with routing follows this structure:

```
src/
├── entry.node.ts      # Node.js server setup, dev/build config
├── entry.server.ts    # SSR rendering logic
├── entry.client.ts    # Client-side hydration/mounting
├── create-app.ts      # Shared app factory (used by both server & client)
├── routes.ts          # Route definitions
├── App.vue            # Root component
└── pages/
    ├── Home.vue
    ├── About.vue
    └── UserProfile.vue
```

| File | Purpose |
|------|---------|
| `entry.node.ts` | Configures the Node.js server (HTTP listener, middleware, build hooks) |
| `entry.server.ts` | Handles SSR — creates router in memory mode, renders HTML |
| `entry.client.ts` | Handles client-side — creates router in history mode, mounts app |
| `create-app.ts` | Shared factory that creates the framework app with router |
| `routes.ts` | Single source of truth for route definitions |

## Full Working Example

Here's a complete example tying everything together with Vue 3 and SSR:

### routes.ts

```ts
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
        asyncComponent: () => import('./pages/UserProfile.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
];
```

### create-app.ts

```ts
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

### entry.client.ts

```ts
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

### entry.server.ts

```ts
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

### entry.node.ts

```ts
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

## What's Next?

Now that you have a working router, explore the rest of the guide:

- [Dynamic Route Matching](./dynamic-matching) — Learn about route parameters and patterns
- [Nested Routes](./nested-routes) — Build layouts with child routes
- [Programmatic Navigation](./programmatic-navigation) — Navigate with code
- [Navigation Guards](./navigation-guards) — Control access and intercept navigation

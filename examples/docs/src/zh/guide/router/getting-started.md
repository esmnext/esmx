---
titleSuffix: "Getting Started with @esmx/router"
description: "Step-by-step guide to installing and configuring @esmx/router — from basic setup to full SSR integration with Vue 3, Vue 2, and React."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router setup, router installation, Vue 3 router, Vue 2 router, React router, SSR router, micro-frontend router getting started"
---

# 快速开始

本指南将引导你从零开始设置 `@esmx/router`。完成后，你将拥有一个包含路由、导航和框架集成的可工作路由器。

## 安装

安装核心路由器包：

```bash
npm install @esmx/router
```

如果你使用 Vue（2.7+ 或 3），还需要安装 Vue 集成包：

```bash
npm install @esmx/router-vue
```

## 基本设置

最简单的 `@esmx/router` 只需要一个路由列表和一个模式：

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

await router.push('/about');

console.log(router.route.path);   // '/about'
console.log(router.route.query);  // {}
```

基本设置就是这些。路由器将 URL 匹配到组件，处理浏览器历史记录，并提供当前路由状态。

## 使用 Vue 3 设置

Vue 3 集成使用 `@esmx/router-vue`，它提供了与 Vue 响应式系统无缝协作的插件、组合式 API 和组件。

### 1. 定义路由

```ts title="src/routes.ts"
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

### 2. 创建应用

```ts title="src/create-app.ts"
import { createApp } from 'vue';
import { Router, RouterMode } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import App from './App.vue';
import { routes } from './routes';

export function createVueApp(router: Router) {
  const app = createApp({
    setup() {
      useProvideRouter(router);
      return () => h(App);
    }
  });

  app.use(RouterPlugin);

  return { app };
}
```

### 3. 客户端入口

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

### 4. 服务端入口（SSR）

```ts title="src/entry.server.ts"
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

### 5. 在组件中使用

```vue title="src/App.vue"
<template>
  <div>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from '@esmx/router-vue';

const router = useRouter();
const route = useRoute();

function goToUser(id: string) {
  router.push(`/users/${id}`);
}
</script>
```

## 使用 Vue 2 设置

Vue 2.7+ 使用相同的 `@esmx/router-vue` 包。主要区别在于插件的安装方式：

```ts
import Vue from 'vue';
import { Router, RouterMode } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import { routes } from './routes';

Vue.use(RouterPlugin);

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes
});

new Vue({
  setup() {
    useProvideRouter(router);
  },
  render: (h) => h(App)
}).$mount('#app');
```

在 Vue 2.7+ 组件中，你可以像 Vue 3 一样使用相同的组合式 API（`useRouter`、`useRoute`）。选项式 API 也同样适用——插件会使 `this.$router` 和 `this.$route` 可用：

```ts
export default {
  mounted() {
    console.log(this.$route.path);
    this.$router.push('/about');
  }
};
```

## 使用 React 设置

React 没有专门的集成包。相反，直接在路由器上注册微应用：

```tsx title="src/entry.client.tsx"
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
      const { renderToString } = await import('react-dom/server');
      return renderToString(createElement(App, { router }));
    }
  })
});
```

然后通过 props 或 React context 将 `router` 对象传递给你的组件：

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

## 项目文件结构

一个典型的带路由的 Esmx 项目遵循以下结构：

```
src/
├── entry.node.ts      # Node.js 服务器设置，开发/构建配置
├── entry.server.ts    # SSR 渲染逻辑
├── entry.client.ts    # 客户端水合/挂载
├── create-app.ts      # 共享的应用工厂（服务端和客户端共用）
├── routes.ts          # 路由定义
├── App.vue            # 根组件
└── pages/
    ├── Home.vue
    ├── About.vue
    └── UserProfile.vue
```

- `entry.node.ts`：配置 Node.js 服务器（HTTP 监听器、中间件、构建钩子）
- `entry.server.ts`：处理 SSR——在内存模式下创建路由器，渲染 HTML
- `entry.client.ts`：处理客户端——在 history 模式下创建路由器，挂载应用
- `create-app.ts`：共享的工厂函数，使用路由器创建框架应用
- `routes.ts`：路由定义的唯一数据源

## 完整工作示例

这是一个将所有内容整合在一起的完整示例，使用 Vue 3 和 SSR：

### routes.ts

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
        asyncComponent: () => import('./pages/UserProfile.vue'),
        meta: { requiresAuth: true }
      }
    ]
  }
];
```

### create-app.ts

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

### entry.client.ts

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

### entry.server.ts

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

### entry.node.ts

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

## 下一步

现在你已经有了一个可工作的路由器，继续探索指南的其余部分：

- [动态路由匹配](./dynamic-matching) — 了解路由参数和模式
- [嵌套路由](./nested-routes) — 使用子路由构建布局
- [编程式导航](./programmatic-navigation) — 使用代码进行导航
- [导航守卫](./navigation-guards) — 控制访问和拦截导航

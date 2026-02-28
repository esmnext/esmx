---
titleSuffix: "Vue 2 集成 — @esmx/router"
description: "完整的 @esmx/router 与 Vue 2.7+ 集成指南 — 插件配置、组合式 API 和选项式 API 用法、SSR 以及完整的工作示例。"
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router Vue 2, Vue 2.7 路由, Vue.use 路由, 选项式 API 路由, 组合式 API Vue 2, useProvideRouter, RouterView, RouterLink, Vue 2 SSR"
---

# Vue 2 集成

本指南涵盖了将 `@esmx/router` 与 Vue 2.7+ 集成的全部内容。Vue 2.7 引入了内置的组合式 API 支持，`@esmx/router-vue` 的组合式函数依赖此特性。

::: tip 需要 Vue 2.7+
`@esmx/router-vue` 需要 Vue 2.7 或更高版本。更早的 Vue 2 版本不支持组合式 API，因此不兼容。
:::

## 安装

安装核心路由包和 Vue 集成包：

```bash
npm install @esmx/router @esmx/router-vue
```

同一个 `@esmx/router-vue` 包同时适用于 Vue 2.7+ 和 Vue 3，它会自动检测 Vue 版本。

## 与 Vue 3 的差异

在开始之前，以下是与 [Vue 3 集成](./vue3)的主要差异：

| 方面 | Vue 3 | Vue 2.7+ |
|------|-------|----------|
| 插件安装 | `app.use(RouterPlugin)` | `Vue.use(RouterPlugin)` |
| 应用创建 | `createApp()` / `createSSRApp()` | `new Vue()` |
| 挂载 | `app.mount('#app')` | `new Vue().$mount('#app')` |
| SSR 渲染器 | `@vue/server-renderer` | `vue-server-renderer` |
| 选项式 API 访问 | 通过 `$router` / `$route` | 通过 `$router` / `$route` |
| 组合式 API | `useRouter()` / `useRoute()` | `useRouter()` / `useRoute()` |

路由定义、组合式函数和组件（`RouterView`、`RouterLink`）完全相同。

## 分步设置

### 1. 定义路由

与 Vue 3 相同 —— 路由是框架无关的：

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

### 2. 创建应用工厂

与 Vue 3 的主要区别在于使用 `new Vue()` 而不是 `createApp()`：

```ts title="src/create-app.ts"
import Vue from 'vue';
import { Router } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import App from './App.vue';

// 全局安装插件（Vue 2 方式）
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

与 Vue 3 的关键差异：

- **`Vue.use(RouterPlugin)`** 在 Vue 构造函数上调用，而不是在应用实例上。
- **`new Vue()`** 替代 `createApp()` / `createSSRApp()`。
- **`useProvideRouter(router)`** 用法相同 —— 必须在 `setup()` 中调用。

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
app.$mount('#app');
```

注意：Vue 2 使用 `$mount()` 而不是 `mount()`。

### 4. 服务端入口（SSR）

Vue 2 使用 `vue-server-renderer` 而不是 `@vue/server-renderer`：

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
<html lang="zh">
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

### 5. Node 入口

使用 `createRspackVue2App` 而不是 `createRspackVue3App`：

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

## 在组件中使用路由

### 组合式 API（推荐）

Vue 2.7+ 支持使用组合式 API 的 `<script setup>`。组合式函数与 Vue 3 完全相同：

```vue title="src/pages/UserProfile.vue"
<template>
  <div>
    <h1>用户 {{ route.params.id }}</h1>
    <p>当前路径：{{ route.path }}</p>

    <button @click="goHome">返回首页</button>
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
  console.log('路由变更为：', newPath);
});
</script>
```

### 选项式 API

`RouterPlugin` 使 `this.$router` 和 `this.$route` 在所有组件中可用：

```vue title="src/pages/About.vue"
<template>
  <div>
    <h1>关于</h1>
    <p>当前路径：{{ $route.path }}</p>
    <button @click="navigateHome">返回首页</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  mounted() {
    console.log('当前路由：', this.$route.path);
    console.log('路由参数：', this.$route.params);
  },
  methods: {
    navigateHome() {
      this.$router.push('/');
    }
  }
});
</script>
```

### RouterView 和 RouterLink

在 Vue 2 和 Vue 3 中用法完全相同：

```vue title="src/App.vue"
<template>
  <div>
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
      <RouterLink to="/users/42">用户 42</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>
```

`RouterLink` 在 Vue 2 和 Vue 3 中支持相同的属性：

- `to` — 目标路由（字符串或对象）
- `type` — 导航类型（`'push'`、`'replace'`、`'pushWindow'` 等）
- `activeClass` — 路由匹配时的 CSS 类名
- `exact` — 匹配模式（`'include'`、`'exact'`、`'route'`）
- `tag` — 渲染的 HTML 标签（默认：`'a'`）

## 项目文件结构

```
src/
├── entry.node.ts      # Node.js 服务器配置、开发/构建设置
├── entry.server.ts    # SSR 渲染逻辑
├── entry.client.ts    # 客户端水合/挂载
├── create-app.ts      # 共享的应用工厂
├── routes.ts          # 路由定义
├── App.vue            # 根组件
├── layouts/
│   └── MainLayout.vue
└── pages/
    ├── Home.vue
    ├── About.vue
    └── UserProfile.vue
```

## 下一步

- [动态路由匹配](./dynamic-matching) — 路由参数和模式
- [嵌套路由](./nested-routes) — 带子路由的布局
- [编程式导航](./programmatic-navigation) — 所有导航方法
- [导航守卫](./navigation-guards) — 拦截和控制导航

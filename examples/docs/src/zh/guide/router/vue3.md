---
titleSuffix: "Vue 3 集成 — @esmx/router"
description: "完整的 @esmx/router 与 Vue 3 集成指南 — 插件配置、组合式 API、SSR、RouterView、RouterLink 以及完整的工作示例。"
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router Vue 3, Vue 3 SSR 路由, createApp 路由, createSSRApp, useProvideRouter, useRouter, useRoute, RouterView, RouterLink, Vue 3 微前端"
---

# Vue 3 集成

本指南涵盖了将 `@esmx/router` 与 Vue 3 集成所需的全部内容。阅读完毕后，你将拥有一个带有路由和服务端渲染（SSR）的完整 Vue 3 应用。

## 安装

安装核心路由包和 Vue 集成包：

```bash
npm install @esmx/router @esmx/router-vue
```

`@esmx/router` 是框架无关的路由核心。`@esmx/router-vue` 提供 Vue 专属绑定 —— 插件、组合式函数和组件。

## 核心概念

Vue 3 集成依赖三个部分：

1. **RouterPlugin** — 将 `RouterView` 和 `RouterLink` 注册为全局组件
2. **useProvideRouter()** — 通过 `provide`/`inject` 将路由实例提供给组件树
3. **useRouter() / useRoute()** — 用于访问路由实例和当前路由的组合式 API

## 分步设置

### 1. 定义路由

创建路由定义的单一数据源：

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

客户端和服务端入口共用的工厂函数：

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

关键点：

- **`useProvideRouter(router)`** 必须在根组件的 `setup()` 中调用。它通过 `useRouter()` 和 `useRoute()` 将路由实例提供给所有后代组件。
- **`RouterPlugin`** 将 `RouterView` 和 `RouterLink` 注册为全局组件，并在 `globalProperties` 上设置 `$router` 和 `$route`。
- 服务端渲染使用 `createSSRApp`，仅客户端使用 `createApp`。

### 3. 客户端入口

客户端入口以 `history` 模式创建路由并挂载应用：

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

`RouterMode.history` 使用浏览器的 History API（`pushState`、`popstate`）实现简洁的 URL。

### 4. 服务端入口（SSR）

服务端入口以 `memory` 模式创建路由并渲染 HTML：

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

`RouterMode.memory` 将路由状态保存在内存中 —— 不调用浏览器 API，非常适合 Node.js 环境。

### 5. Node 入口

Node 入口配置开发服务器和构建工具：

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

`@esmx/rspack-vue` 中的 `createRspackVue3App` 配置了 Rspack，支持 Vue 3 SFC、HMR 和 SSR 打包。

## 在组件中使用路由

### RouterView 和 RouterLink

`RouterView` 渲染当前路由匹配的组件。`RouterLink` 创建带有激活状态管理的导航链接：

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

当当前路由匹配链接的 `to` 路径时，`RouterLink` 会自动应用 `router-link-active` 类名。通过 `activeClass` 属性自定义：

```vue
<RouterLink to="/about" activeClass="nav-active">关于</RouterLink>
```

### useRouter 和 useRoute

在 `<script setup>` 中访问路由实例和当前路由：

```vue title="src/pages/UserProfile.vue"
<template>
  <div>
    <h1>用户 {{ route.params.id }}</h1>
    <p>当前路径：{{ route.path }}</p>
    <p>查询参数：{{ JSON.stringify(route.query) }}</p>
    <p>元信息：{{ JSON.stringify(route.meta) }}</p>

    <button @click="goHome">返回首页</button>
    <button @click="goToNextUser">下一位用户</button>
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

// 监听路由变化
watch(() => route.path, (newPath, oldPath) => {
  console.log(`路由从 ${oldPath} 变更为 ${newPath}`);
});
</script>
```

### 导航方法

路由提供多种导航方法：

```vue
<script setup lang="ts">
import { useRouter } from '@esmx/router-vue';

const router = useRouter();

// 向历史栈压入新记录
router.push('/about');

// 替换当前记录（不产生新的历史记录）
router.replace('/about');

// 后退
router.back();

// 前进
router.forward();

// 跳转到指定的历史偏移量
router.go(-2);
</script>
```

### 访问路由信息

`route` 对象提供当前路由的完整信息：

```vue
<script setup lang="ts">
import { useRoute } from '@esmx/router-vue';

const route = useRoute();

// 当前路径
route.path        // '/users/42'

// 路由参数
route.params       // { id: '42' }

// 查询字符串参数
route.query        // { tab: 'profile' }（对应 /users/42?tab=profile）

// 路由元信息
route.meta         // { requiresAuth: true }

// 完整的 URL 对象
route.url          // URL 实例

// 匹配的路由配置（从父到子）
route.matched      // RouteConfig[]
</script>
```

## 项目文件结构

典型的 Vue 3 + SSR 项目结构（使用 `@esmx/router`）：

```
src/
├── entry.node.ts      # Node.js 服务器配置、开发/构建设置
├── entry.server.ts    # SSR 渲染逻辑
├── entry.client.ts    # 客户端水合/挂载
├── create-app.ts      # 共享的应用工厂（服务端和客户端共用）
├── routes.ts          # 路由定义
├── App.vue            # 根组件（RouterView + 导航）
├── layouts/
│   └── MainLayout.vue # 含嵌套 RouterView 的布局
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

---
titleSuffix: "React 集成 — @esmx/router"
description: "完整的 @esmx/router 与 React 集成指南 — 微应用模式、renderToString SSR、自定义 hooks、RouterLink 等效组件以及完整的工作示例。"
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router React, React SSR 路由, 微应用 React, createRoot 路由, renderToString, React context 路由, useRouter React, RouterLink React"
---

# React 集成

本指南涵盖了将 `@esmx/router` 与 React 集成的全部内容。与 Vue 不同，React 不需要单独的集成包 —— 路由内置的微应用系统直接处理挂载、卸载和服务端渲染。

## 安装

只需安装核心路由包：

```bash
npm install @esmx/router
```

不需要额外的集成包。React 通过路由的 `apps` 回调工作，该回调提供 `mount`、`unmount` 和 `renderToString` 生命周期钩子。

## 核心概念

React 集成使用**微应用模式**：

1. **`apps` 回调** — 告诉路由如何挂载、卸载和渲染你的 React 应用
2. **`mount(el)`** — 创建 React 根节点并将应用渲染到 DOM 元素中
3. **`unmount(el, root)`** — 卸载 React 根节点进行清理
4. **`renderToString()`** — 将应用服务端渲染为 HTML 字符串

路由将自身传递给 `apps` 回调，因此你的 React 组件可以通过 props 或 React context 访问它。

## 分步设置

### 1. 定义路由

路由是框架无关的 —— 与 Vue 相同：

```ts title="src/routes.ts"
import type { RouteConfig } from '@esmx/router';

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('./layouts/MainLayout'),
    children: [
      { path: '', component: () => import('./pages/Home') },
      { path: 'about', component: () => import('./pages/About') },
      {
        path: 'users/:id',
        component: () => import('./pages/UserProfile'),
        meta: { requiresAuth: true }
      }
    ]
  }
];
```

### 2. 创建路由上下文

设置 React context，使任何组件都能访问路由：

```tsx title="src/router-context.tsx"
import { createContext, useContext, useState, useEffect } from 'react';
import type { Router, Route } from '@esmx/router';

interface RouterContextValue {
  router: Router;
  route: Route;
}

const RouterContext = createContext<RouterContextValue | null>(null);

export function RouterProvider({
  router,
  children
}: {
  router: Router;
  children: React.ReactNode;
}) {
  const [route, setRoute] = useState(router.route);

  useEffect(() => {
    return router.afterEach((to) => {
      setRoute(to);
    });
  }, [router]);

  return (
    <RouterContext.Provider value={{ router, route }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter(): Router {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter 必须在 RouterProvider 内部使用');
  }
  return context.router;
}

export function useRoute(): Route {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRoute 必须在 RouterProvider 内部使用');
  }
  return context.route;
}
```

### 3. 创建根组件

构建渲染匹配路由组件的应用根组件：

```tsx title="src/App.tsx"
import { RouterProvider, useRoute } from './router-context';
import type { Router } from '@esmx/router';

function AppContent() {
  const route = useRoute();

  const Component = route.matched[0]?.component;
  return Component ? <Component /> : <div>未找到页面</div>;
}

export default function App({ router }: { router: Router }) {
  return (
    <RouterProvider router={router}>
      <AppContent />
    </RouterProvider>
  );
}
```

### 4. 创建 RouterLink 组件

使用 `router.resolveLink()` 构建导航链接组件：

```tsx title="src/components/RouterLink.tsx"
import type { ReactNode, MouseEvent } from 'react';
import { useRouter } from '../router-context';

interface RouterLinkProps {
  to: string;
  activeClass?: string;
  className?: string;
  children: ReactNode;
}

export function RouterLink({ to, activeClass, className, children }: RouterLinkProps) {
  const router = useRouter();
  const link = router.resolveLink({ to, activeClass });

  function handleClick(e: MouseEvent) {
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
    e.preventDefault();
    router.push(to);
  }

  return (
    <a
      href={link.attributes.href}
      className={[className, link.attributes.class].filter(Boolean).join(' ')}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
```

### 5. 客户端入口

客户端入口使用 `apps` 回调创建路由，并使用 `createRoot` 进行挂载：

```tsx title="src/entry.client.tsx"
import { Router, RouterMode } from '@esmx/router';
import { createRoot } from 'react-dom/client';
import { createElement } from 'react';
import App from './App';
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

`apps` 回调说明：

- **`mount(el)`** — 当路由需要渲染应用时调用。返回值（React 根节点）将传递给后续的 `unmount`。
- **`unmount(el, root)`** — 当应用需要销毁时调用。
- **`renderToString()`** — 在服务端进行 SSR 时调用。返回 HTML 字符串。

### 6. 服务端入口（SSR）

```tsx title="src/entry.server.tsx"
import type { RenderContext } from '@esmx/core';
import { Router, RouterMode } from '@esmx/router';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';
import { routes } from './routes';

export default async (rc: RenderContext) => {
  const router = new Router({
    mode: RouterMode.memory,
    base: new URL(rc.params.url, 'http://localhost'),
    routes,
    apps: (router) => ({
      mount(el) { /* 仅客户端 */ },
      unmount(el) { /* 仅客户端 */ },
      async renderToString() {
        return renderToString(createElement(App, { router }));
      }
    })
  });

  await router.replace(rc.params.url);

  const html = await router.renderToString();

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

### 7. Node 入口

使用 `@esmx/rspack-react` 中的 `createRspackReactApp` 进行 React 专属的构建工具配置：

```ts title="src/entry.node.ts"
import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
  async devApp(esmx) {
    return import('@esmx/rspack-react').then((m) =>
      m.createRspackReactApp(esmx)
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

`createRspackReactApp` 配置了 Rspack，支持 JSX/TSX、React Refresh HMR 和 SSR 打包。

## 在组件中使用路由

### 导航

使用 `useRouter` hook 进行编程式导航：

```tsx title="src/pages/UserProfile.tsx"
import { useRouter, useRoute } from '../router-context';

export default function UserProfile() {
  const router = useRouter();
  const route = useRoute();

  const userId = route.params.id;

  return (
    <div>
      <h1>用户 {userId}</h1>
      <p>当前路径：{route.path}</p>
      <p>查询参数：{JSON.stringify(route.query)}</p>

      <button onClick={() => router.push('/')}>
        返回首页
      </button>
      <button onClick={() => router.replace('/about')}>
        替换为关于页
      </button>
      <button onClick={() => router.back()}>
        后退
      </button>
    </div>
  );
}
```

### 使用 RouterLink

```tsx title="src/layouts/MainLayout.tsx"
import { RouterLink } from '../components/RouterLink';
import { useRoute } from '../router-context';

export default function MainLayout() {
  const route = useRoute();

  // 从匹配的路由渲染子组件
  const ChildComponent = route.matched[1]?.component;

  return (
    <div>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
        <RouterLink to="/users/42" activeClass="nav-active">
          用户 42
        </RouterLink>
      </nav>

      <main>
        {ChildComponent ? <ChildComponent /> : null}
      </main>
    </div>
  );
}
```

### 访问路由信息

```tsx
import { useRoute } from '../router-context';

function MyComponent() {
  const route = useRoute();

  // 当前路径
  route.path        // '/users/42'

  // 路由参数
  route.params       // { id: '42' }

  // 查询字符串参数
  route.query        // { tab: 'profile' }

  // 路由元信息
  route.meta         // { requiresAuth: true }

  // 匹配的路由配置（从父到子）
  route.matched      // RouteConfig[]
}
```

## 项目文件结构

典型的 React + SSR 项目结构（使用 `@esmx/router`）：

```
src/
├── entry.node.ts         # Node.js 服务器配置、开发/构建设置
├── entry.server.tsx      # SSR 渲染逻辑
├── entry.client.tsx      # 客户端挂载
├── router-context.tsx    # 路由的 React context（useRouter、useRoute）
├── routes.ts             # 路由定义
├── App.tsx               # 根组件
├── components/
│   └── RouterLink.tsx    # 导航链接组件
├── layouts/
│   └── MainLayout.tsx    # 带导航的布局
└── pages/
    ├── Home.tsx
    ├── About.tsx
    └── UserProfile.tsx
```

## 下一步

- [动态路由匹配](/api/router/dynamic-matching) — 路由参数和模式
- [嵌套路由](/api/router/nested-routes) — 带子路由的布局
- [编程式导航](/api/router/programmatic-navigation) — 所有导航方法
- [导航守卫](/api/router/navigation-guards) — 拦截和控制导航

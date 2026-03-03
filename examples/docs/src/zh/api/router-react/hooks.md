---
titleSuffix: "@esmx/router-react — Hooks 与上下文"
description: "@esmx/router 的自定义 React hooks — useRouter、useRoute 和 RouterProvider 上下文实现。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-react, useRouter, useRoute, React hooks, context, useSyncExternalStore"
---

# Hooks 与上下文

## 简介

由于 React 没有专用的 `@esmx/router` 集成包，你需要使用标准 React 模式实现自己的 hooks 和上下文提供者。本页文档记录了 `useRouter()`、`useRoute()` 和 `RouterProvider` 的推荐实现。

## RouterProvider

- **Props**：
  - `router: Router` — 要提供的路由实例
  - `children: React.ReactNode` — 子组件
- **返回值**：`JSX.Element`

上下文提供者组件，使路由实例可通过 `useRouter()` 和 `useRoute()` 供所有后代组件使用。

```tsx
import { createContext } from 'react';
import type { Router } from '@esmx/router';

const RouterContext = createContext<Router | null>(null);

export function RouterProvider({
    router,
    children
}: {
    router: Router;
    children: React.ReactNode;
}) {
    return (
        <RouterContext.Provider value={router}>
            {children}
        </RouterContext.Provider>
    );
}
```

## useRouter()

- **返回值**：`Router`
- **异常**：`Error` — 如果在 `RouterProvider` 外部调用

通过 React context 获取路由实例。等同于 `@esmx/router-vue` 中的 `useRouter()`。

```tsx
import { useContext } from 'react';
import type { Router } from '@esmx/router';

export function useRouter(): Router {
    const router = useContext(RouterContext);
    if (!router) {
        throw new Error('useRouter 必须在 RouterProvider 内部使用');
    }
    return router;
}
```

### 用法

```tsx
function NavigationButtons() {
    const router = useRouter();

    return (
        <div>
            <button onClick={() => router.push('/home')}>首页</button>
            <button onClick={() => router.back()}>返回</button>
        </div>
    );
}
```

## useRoute()

- **返回值**：`Route`
- **异常**：`Error` — 如果在 `RouterProvider` 外部调用

获取当前的响应式路由对象。使用 `useSyncExternalStore` 实现最佳 React 集成 —— 路由变化时组件自动重新渲染。等同于 `@esmx/router-vue` 中的 `useRoute()`。

```tsx
import { useSyncExternalStore } from 'react';
import type { Route } from '@esmx/router';

export function useRoute(): Route {
    const router = useRouter();

    return useSyncExternalStore(
        (callback) => router.afterEach(callback),
        () => router.route,
        () => router.route
    );
}
```

### 用法

```tsx
function CurrentPath() {
    const route = useRoute();

    return (
        <div>
            <p>路径：{route.path}</p>
            <p>参数：{JSON.stringify(route.params)}</p>
            <p>查询：{JSON.stringify(route.query)}</p>
        </div>
    );
}
```

## 完整实现

组合所有 hooks 和提供者的完整参考实现：

```tsx
import { createContext, useContext, useSyncExternalStore } from 'react';
import type { Router, Route } from '@esmx/router';

// Context
const RouterContext = createContext<Router | null>(null);

// Provider
export function RouterProvider({
    router,
    children
}: {
    router: Router;
    children: React.ReactNode;
}) {
    return (
        <RouterContext.Provider value={router}>
            {children}
        </RouterContext.Provider>
    );
}

// Hooks
export function useRouter(): Router {
    const router = useContext(RouterContext);
    if (!router) {
        throw new Error('useRouter 必须在 RouterProvider 内部使用');
    }
    return router;
}

export function useRoute(): Route {
    const router = useRouter();

    return useSyncExternalStore(
        (callback) => router.afterEach(callback),
        () => router.route,
        () => router.route
    );
}
```

---
titleSuffix: "@esmx/router-react — 微应用集成"
description: "React 微应用与 @esmx/router 的集成 — 生命周期钩子、挂载/卸载和 renderToString 用于 SSR。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-react, 微应用, React, mount, unmount, renderToString, 生命周期"
---

# 微应用集成

## 简介

React 与 `@esmx/router` 的集成通过 `@esmx/router-react` 包实现。该包提供了 React 专用的 hooks 和组件，同时你也可以使用路由内置的**微应用模式**通过 `apps` 回调进行底层集成。

`@esmx/router-react` 提供 `useRouter()`、`useRoute()`、`RouterLink`、`RouterView` 等 API，让你能够快速集成路由功能。如果需要完全自定义实现，也可以通过 `RouterOptions` 中的 `apps` 回调使用标准的 React 模式构建自己的 hooks 和组件。

## 安装

```bash
npm install @esmx/router @esmx/router-react
```

## 类型定义

### RouterMicroAppOptions

- **类型定义**：
```ts
interface RouterMicroAppOptions {
    mount: (el: HTMLElement) => void;
    unmount: () => void;
    renderToString?: () => Awaitable<string>;
}
```

由 `apps` 回调返回的配置对象，定义了挂载、卸载和 SSR React 应用的生命周期钩子。

### RouterMicroAppCallback

- **类型定义**：
```ts
type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;
```

接收 `Router` 实例并返回微应用生命周期钩子的函数。路由实例可通过 props 或 context 传递给 React 组件。

### RouterMicroApp

- **类型定义**：
```ts
type RouterMicroApp =
    | Record<string, RouterMicroAppCallback | undefined>
    | RouterMicroAppCallback;
```

`RouterOptions` 中 `apps` 选项接受的类型。可以是单个回调函数，也可以是多个命名微应用回调的记录，用于多应用路由。

## 生命周期钩子

| 钩子 | 描述 |
|------|------|
| `mount(el)` | 创建 React 根节点并将应用渲染到 DOM 元素中 |
| `unmount()` | 卸载 React 根节点进行清理 |
| `renderToString()` | 将应用 SSR 为 HTML 字符串。可选 —— 仅在需要 SSR 时使用 |

## 示例

```tsx
import { Router, RouterMode } from '@esmx/router';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { createElement } from 'react';
import App from './App';
import { routes } from './routes';

const router = new Router({
    root: '#app',
    mode: RouterMode.history,
    routes,
    apps: (router) => ({
        mount(el) {
            // SSR 水合使用 hydrateRoot，纯客户端使用 createRoot
            const root = el.innerHTML
                ? hydrateRoot(el, createElement(App, { router }))
                : createRoot(el);

            if (!el.innerHTML) {
                root.render(createElement(App, { router }));
            }

            // 保存 root 用于卸载
            (el as any).__reactRoot = root;
        },
        unmount() {
            const el = document.querySelector('#app') as any;
            el?.__reactRoot?.unmount();
        },
        async renderToString() {
            const { renderToString } = await import('react-dom/server');
            return renderToString(createElement(App, { router }));
        }
    })
});
```

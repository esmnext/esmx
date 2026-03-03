---
titleSuffix: "@esmx/router-react — SSR"
description: "使用 @esmx/router 和 React 进行服务端渲染 — 服务端入口、renderToString 和客户端水合。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-react, SSR, 服务端渲染, renderToString, 水合, React"
---

# SSR

## 简介

使用 `@esmx/router` 和 React 进行服务端渲染时，通过微应用 `apps` 回调中的 `renderToString()` 生命周期钩子实现。路由在服务端以 `memory` 模式运行，导航到请求的 URL，将应用渲染为 HTML，然后发送给客户端进行水合。

## 服务端入口

```tsx
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
            unmount() { /* 仅客户端 */ },
            async renderToString() {
                return renderToString(createElement(App, { router }));
            }
        })
    });

    await router.replace(rc.params.url);
    const html = await router.renderToString();

    // 收集路由数据用于客户端水合
    const routeData = router.route.data;

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
    ${routeData ? `<script>window.__ROUTE_DATA__ = ${JSON.stringify(routeData)}</script>` : ''}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>`;
};
```

## 客户端水合

```tsx
import { Router, RouterMode } from '@esmx/router';
import { hydrateRoot } from 'react-dom/client';
import { createElement } from 'react';
import App from './App';
import { routes } from './routes';

const router = new Router({
    root: '#app',
    mode: RouterMode.history,
    routes,
    data: (window as any).__ROUTE_DATA__,
    apps: (router) => ({
        mount(el) {
            hydrateRoot(el, createElement(App, { router }));
        },
        unmount() { /* 处理清理 */ },
        async renderToString() {
            const { renderToString } = await import('react-dom/server');
            return renderToString(createElement(App, { router }));
        }
    })
});
```

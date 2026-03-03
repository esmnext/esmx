---
titleSuffix: "@esmx/router-react — SSR"
description: "Server-side rendering with @esmx/router and React — server entry, renderToString, and client hydration."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-react, SSR, server-side rendering, renderToString, hydration, React"
---

# SSR

## Introduction

Server-side rendering with `@esmx/router` and React uses the `renderToString()` lifecycle hook in the micro-app's `apps` callback. The router operates in `memory` mode on the server, navigates to the requested URL, renders the app to HTML, and sends it to the client for hydration.

## Server Entry

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
            mount(el) { /* client only */ },
            unmount() { /* client only */ },
            async renderToString() {
                return renderToString(createElement(App, { router }));
            }
        })
    });

    await router.replace(rc.params.url);
    const html = await router.renderToString();

    // Collect route data for client hydration
    const routeData = router.route.data;

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
    ${routeData ? `<script>window.__ROUTE_DATA__ = ${JSON.stringify(routeData)}</script>` : ''}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>`;
};
```

## Client Hydration

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
        unmount() { /* handle cleanup */ },
        async renderToString() {
            const { renderToString } = await import('react-dom/server');
            return renderToString(createElement(App, { router }));
        }
    })
});
```

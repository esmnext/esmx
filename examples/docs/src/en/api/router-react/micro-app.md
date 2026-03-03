---
titleSuffix: "@esmx/router-react — Micro-App Integration"
description: "React micro-app integration with @esmx/router — lifecycle hooks, mount/unmount, and renderToString for SSR."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-react, micro-app, React, mount, unmount, renderToString, lifecycle"
---

# Micro-App Integration

## Introduction

React integration with `@esmx/router` uses the router's built-in **micro-app pattern** directly — no separate package is needed. Install `@esmx/router` only.

Unlike `@esmx/router-vue`, which provides a dedicated npm package with plugins, composables, and components, React integration works through the `apps` callback in `RouterOptions`. You build your own hooks and components using standard React patterns, with full control over implementation.

## Installation

```bash
npm install @esmx/router
```

No additional integration package is required.

## Type Definitions

### RouterMicroAppOptions

- **Type Definition**:
```ts
interface RouterMicroAppOptions {
    mount: (el: HTMLElement) => void;
    unmount: () => void;
    renderToString?: () => Awaitable<string>;
}
```

Configuration object returned by the `apps` callback, defining the lifecycle hooks for mounting, unmounting, and server-rendering the React application.

### RouterMicroAppCallback

- **Type Definition**:
```ts
type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;
```

A function that receives the `Router` instance and returns the micro-app lifecycle hooks. The router instance can be passed to React components via props or context.

### RouterMicroApp

- **Type Definition**:
```ts
type RouterMicroApp =
    | Record<string, RouterMicroAppCallback | undefined>
    | RouterMicroAppCallback;
```

The type accepted by the `apps` option in `RouterOptions`. Can be a single callback function or a record of named micro-app callbacks for multi-app routing.

## Lifecycle Hooks

| Hook | Description |
|------|-------------|
| `mount(el)` | Creates a React root and renders the app into the DOM element |
| `unmount()` | Unmounts the React root for cleanup |
| `renderToString()` | Server-side renders the app to an HTML string. Optional — only needed for SSR |

## Example

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
            // Use hydrateRoot for SSR hydration, createRoot for client-only
            const root = el.innerHTML
                ? hydrateRoot(el, createElement(App, { router }))
                : createRoot(el);

            if (!el.innerHTML) {
                root.render(createElement(App, { router }));
            }

            // Store root for unmount
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

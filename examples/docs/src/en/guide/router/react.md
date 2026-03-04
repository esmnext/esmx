---
titleSuffix: "React Integration — @esmx/router"
description: "Complete guide to integrating @esmx/router with React — micro-app pattern, SSR with renderToString, custom hooks, RouterLink equivalent, and full working examples."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router React, React SSR router, micro-app React, createRoot router, renderToString, React context router, useRouter React, RouterLink React"
---

# React Integration

This guide covers integrating `@esmx/router` with React. Unlike Vue, React does not need a separate integration package — the router's built-in micro-app system handles mounting, unmounting, and server-side rendering directly.

## Installation

Install only the core router package:

```bash
npm install @esmx/router
```

No additional integration package is needed. React works through the router's `apps` callback, which provides `mount`, `unmount`, and `renderToString` lifecycle hooks.

## Key Concepts

The React integration uses the **micro-app pattern**:

1. **`apps` callback** — Tells the router how to mount, unmount, and render your React app
2. **`mount(el)`** — Creates a React root and renders the app into a DOM element
3. **`unmount(el, root)`** — Unmounts the React root for cleanup
4. **`renderToString()`** — Server-side renders the app to an HTML string

The router passes itself to the `apps` callback, so your React components can access it via props or React context.

## Step-by-Step Setup

### 1. Define Your Routes

Routes are framework-agnostic — the same as Vue:

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

### 2. Create the Router Context

Set up a React context so any component can access the router:

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
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context.router;
}

export function useRoute(): Route {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRoute must be used within a RouterProvider');
  }
  return context.route;
}
```

### 3. Create the Root Component

Build the app root that renders matched route components:

```tsx title="src/App.tsx"
import { RouterProvider, useRoute } from './router-context';
import type { Router } from '@esmx/router';

function AppContent() {
  const route = useRoute();

  const Component = route.matched[0]?.component;
  return Component ? <Component /> : <div>Not Found</div>;
}

export default function App({ router }: { router: Router }) {
  return (
    <RouterProvider router={router}>
      <AppContent />
    </RouterProvider>
  );
}
```

### 4. Create a RouterLink Component

Use `router.resolveLink()` to build a navigation link component:

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

### 5. Client Entry

The client entry creates the router with the `apps` callback and uses `createRoot` for mounting:

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

The `apps` callback:

- **`mount(el)`** — Called when the router needs to render the app. Returns a value (the React root) that's passed to `unmount` later.
- **`unmount(el, root)`** — Called when the app should be torn down.
- **`renderToString()`** — Called on the server for SSR. Returns the HTML string.

### 6. Server Entry (SSR)

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
      mount(el) { /* client only */ },
      unmount(el) { /* client only */ },
      async renderToString() {
        return renderToString(createElement(App, { router }));
      }
    })
  });

  await router.replace(rc.params.url);

  const html = await router.renderToString();

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

### 7. Node Entry

Use `createRspackReactApp` from `@esmx/rspack-react` for React-specific build tooling:

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

`createRspackReactApp` configures Rspack with JSX/TSX support, React Refresh for HMR, and proper SSR bundling.

## Using the Router in Components

### Navigation

Use the `useRouter` hook to navigate programmatically:

```tsx title="src/pages/UserProfile.tsx"
import { useRouter, useRoute } from '../router-context';

export default function UserProfile() {
  const router = useRouter();
  const route = useRoute();

  const userId = route.params.id;

  return (
    <div>
      <h1>User {userId}</h1>
      <p>Current path: {route.path}</p>
      <p>Query: {JSON.stringify(route.query)}</p>

      <button onClick={() => router.push('/')}>
        Go Home
      </button>
      <button onClick={() => router.replace('/about')}>
        Replace with About
      </button>
      <button onClick={() => router.back()}>
        Go Back
      </button>
    </div>
  );
}
```

### Using RouterLink

```tsx title="src/layouts/MainLayout.tsx"
import { RouterLink } from '../components/RouterLink';
import { useRoute } from '../router-context';

export default function MainLayout() {
  const route = useRoute();

  // Render children from matched routes
  const ChildComponent = route.matched[1]?.component;

  return (
    <div>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/users/42" activeClass="nav-active">
          User 42
        </RouterLink>
      </nav>

      <main>
        {ChildComponent ? <ChildComponent /> : null}
      </main>
    </div>
  );
}
```

### Accessing Route Information

```tsx
import { useRoute } from '../router-context';

function MyComponent() {
  const route = useRoute();

  // Current path
  route.path        // '/users/42'

  // Route parameters
  route.params       // { id: '42' }

  // Query string parameters
  route.query        // { tab: 'profile' }

  // Route meta data
  route.meta         // { requiresAuth: true }

  // Matched route configs (parent → child)
  route.matched      // RouteConfig[]
}
```

## Project File Structure

A typical React + SSR project with `@esmx/router`:

```
src/
├── entry.node.ts         # Node.js server setup, dev/build config
├── entry.server.tsx      # SSR rendering logic
├── entry.client.tsx      # Client-side mounting
├── router-context.tsx    # React context for router (useRouter, useRoute)
├── routes.ts             # Route definitions
├── App.tsx               # Root component
├── components/
│   └── RouterLink.tsx    # Navigation link component
├── layouts/
│   └── MainLayout.tsx    # Layout with navigation
└── pages/
    ├── Home.tsx
    ├── About.tsx
    └── UserProfile.tsx
```

## What's Next?

- [Dynamic Route Matching](/api/router/dynamic-matching) — Route parameters and patterns
- [Nested Routes](/api/router/nested-routes) — Layouts with child routes
- [Programmatic Navigation](/api/router/programmatic-navigation) — All navigation methods
- [Navigation Guards](/api/router/navigation-guards) — Intercept and control navigation

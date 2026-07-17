---
titleSuffix: "@esmx/router-react — Hooks & Context"
description: "Custom React hooks for @esmx/router — useRouter, useRoute, and RouterProvider context implementation."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-react, useRouter, useRoute, React hooks, context, useSyncExternalStore"
---

# Hooks & Context

## Introduction

`@esmx/router-react` provides hooks and context components for React applications integrated with `@esmx/router`. This page documents the usage of `useRouter()`, `useRoute()`, and `RouterProvider`.

## RouterProvider

- **Props**:
  - `router: Router` — Router instance to provide
  - `children: React.ReactNode` — Child components
- **Returns**: `JSX.Element`

Context provider component that makes the router instance available to all descendant components via `useRouter()` and `useRoute()`.

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

- **Returns**: `Router`
- **Throws**: `Error` — If called outside a `RouterProvider`

Gets the router instance via React context. Equivalent to `useRouter()` in `@esmx/router-vue`.

```tsx
import { useContext } from 'react';
import type { Router } from '@esmx/router';

export function useRouter(): Router {
    const router = useContext(RouterContext);
    if (!router) {
        throw new Error('useRouter must be used within a RouterProvider');
    }
    return router;
}
```

### Usage

```tsx
function NavigationButtons() {
    const router = useRouter();

    return (
        <div>
            <button onClick={() => router.push('/home')}>Home</button>
            <button onClick={() => router.back()}>Back</button>
        </div>
    );
}
```

## useRoute()

- **Returns**: `Route`
- **Throws**: `Error` — If called outside a `RouterProvider`

Gets the current reactive route object. Uses `useSyncExternalStore` for optimal React integration — the component re-renders automatically when the route changes. Equivalent to `useRoute()` in `@esmx/router-vue`.

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

### Usage

```tsx
function CurrentPath() {
    const route = useRoute();

    return (
        <div>
            <p>Path: {route.path}</p>
            <p>Params: {JSON.stringify(route.params)}</p>
            <p>Query: {JSON.stringify(route.query)}</p>
        </div>
    );
}
```

## useLink()

- **Parameters**: `props: RouterLinkProps`
- **Returns**: `RouterLinkResolved`
- **Throws**: `Error` — If called outside a `RouterProvider`

Resolves navigation state for a target location, returning the resolved route, the computed `href`, active/exact-active state and a `navigate` handler. This is the headless primitive that powers [`RouterLink`](./components#routerlink); use it to build custom link components. Equivalent to `useLink()` in `@esmx/router-vue`.

```tsx
import { useLink } from '@esmx/router-react';

function CustomLink({ to, children }) {
    const link = useLink({ to, type: 'push', exact: 'include' });

    return (
        <a {...link.attributes} onClick={link.navigate}>
            {children}
        </a>
    );
}
```

## Implementation Notes

`@esmx/router-react` uses React Context to pass the router instance and current route state through the component tree:

- `RouterProvider` — Provides the router instance to descendant components via Context
- `useRouter()` — Gets the router instance from Context, used for navigation
- `useRoute()` — Gets the current route object from Context, triggers re-render when the route changes

The actual implementation is in the `@esmx/router-react` package source code and does not need to be implemented manually. The above hooks are included in the package; import and use them directly.

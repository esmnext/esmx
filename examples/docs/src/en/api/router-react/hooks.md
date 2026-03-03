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

Since React does not have a dedicated `@esmx/router` integration package, you implement your own hooks and context providers using standard React patterns. This page documents the recommended implementation for `useRouter()`, `useRoute()`, and `RouterProvider`.

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

## Full Implementation

Complete reference implementation combining all hooks and the provider:

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
        throw new Error('useRouter must be used within a RouterProvider');
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

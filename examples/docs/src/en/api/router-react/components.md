---
titleSuffix: "@esmx/router-react — Components"
description: "React components for @esmx/router — Link navigation component and RouterView for rendering matched routes."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-react, Link, RouterView, React components, navigation"
---

# Components

## Introduction

Since React does not have a dedicated `@esmx/router` integration package, you implement your own components using `router.resolveLink()` for navigation links and `route.matched` for route rendering. This page documents the recommended implementation patterns.

## Link

Navigation link component that renders an anchor element with proper navigation behavior and active state management. Equivalent to `RouterLink` in `@esmx/router-vue`.

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `string` | _required_ | Target route location |
| `type` | `RouterLinkType` | `'push'` | Navigation type |
| `exact` | `RouteMatchType` | `'include'` | Active state matching strategy |
| `activeClass` | `string` | — | Custom CSS class for active state |
| `className` | `string` | — | Additional CSS class |
| `children` | `ReactNode` | _required_ | Link content |

### Implementation

```tsx
import type { ReactNode, MouseEvent } from 'react';
import { useRouter, useRoute } from './router-context';

interface LinkProps {
    to: string;
    type?: 'push' | 'replace' | 'pushWindow' | 'replaceWindow' | 'pushLayer';
    exact?: 'route' | 'exact' | 'include';
    activeClass?: string;
    className?: string;
    children: ReactNode;
}

export function Link({
    to,
    type = 'push',
    exact,
    activeClass,
    className,
    children
}: LinkProps) {
    const router = useRouter();
    // Trigger re-render on route change for active state
    useRoute();

    const link = router.resolveLink({ to, type, exact, activeClass });

    function handleClick(e: MouseEvent) {
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
        if (link.isExternal) return;

        e.preventDefault();
        link.navigate(e.nativeEvent);
    }

    return (
        <a
            href={link.attributes.href}
            className={[className, link.attributes.class].filter(Boolean).join(' ')}
            target={link.attributes.target}
            rel={link.attributes.rel}
            onClick={handleClick}
        >
            {children}
        </a>
    );
}
```

### Usage

```tsx
<Link to="/">Home</Link>
<Link to="/about" activeClass="nav-active">About</Link>
<Link to="/docs" type="pushWindow">Documentation</Link>
<Link to="/dashboard" exact="exact">Dashboard</Link>
```

## RouterView

Renders the matched route component at the current nesting depth. Supports nested routing with automatic depth tracking via React context. Equivalent to `RouterView` in `@esmx/router-vue`.

### Implementation

```tsx
import { createContext, useContext } from 'react';
import { useRoute } from './router-context';

// Depth context for nested RouterView
const DepthContext = createContext(0);

export function useRouterViewDepth(): number {
    return useContext(DepthContext);
}

export function RouterView() {
    const route = useRoute();
    const depth = useContext(DepthContext);

    const matched = route.matched[depth];
    if (!matched) return null;

    const Component = matched.component as React.ComponentType;

    return (
        <DepthContext.Provider value={depth + 1}>
            <Component />
        </DepthContext.Provider>
    );
}
```

### Usage

```tsx
// Root layout
function App({ router }: { router: Router }) {
    return (
        <RouterProvider router={router}>
            <RouterView />
        </RouterProvider>
    );
}

// Parent layout — nested RouterView renders child routes
function MainLayout() {
    return (
        <div>
            <nav>
                <Link to="/">Home</Link>
                <Link to="/about">About</Link>
            </nav>
            <main>
                <RouterView />
            </main>
        </div>
    );
}
```

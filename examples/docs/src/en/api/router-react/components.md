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

`@esmx/router-react` provides navigation and route rendering components for React applications integrated with `@esmx/router`. This page documents the usage of `RouterLink` and `RouterView`.

## RouterLink

Navigation link component that renders an anchor element with proper navigation behavior and active state management. Equivalent to `RouterLink` in `@esmx/router-vue`.

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `RouteLocationInput` | _required_ | Target route location (string or object) |
| `type` | `RouterLinkType` | `'push'` | Navigation type |
| `replace` | `boolean` | — | _Deprecated_ — Use `type='replace'` |
| `exact` | `RouteMatchType` | `'include'` | Active state matching strategy |
| `activeClass` | `string` | — | Custom CSS class for active state |
| `event` | `string \| string[]` | `'click'` | Event(s) that trigger navigation |
| `tag` | `string` | `'a'` | HTML tag to render |
| `layerOptions` | `RouteLayerOptions` | — | Layer options when `type='pushLayer'` |
| `beforeNavigate` | `Function` | — | Hook called before navigation |
| `className` | `string` | — | Additional CSS class |
| `style` | `CSSProperties` | — | Inline styles |
| `children` | `ReactNode` | — | Link content |

### Usage

```tsx
import { RouterLink } from '@esmx/router-react';

// Basic usage
<RouterLink to="/about">About</RouterLink>

// Replace current history entry
<RouterLink to="/login" type="replace">Login</RouterLink>

// Open in new window
<RouterLink to="/external" type="pushWindow">External link</RouterLink>

// Custom tag and styles
<RouterLink to="/submit" tag="button" className="btn" style={{ color: 'red' }}>
    Submit
</RouterLink>

// Layer navigation
<RouterLink to="/dialog" type="pushLayer" layerOptions={{ keepAlive: 'include' }}>
    Open dialog
</RouterLink>
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
                <RouterLink to="/">Home</RouterLink>
                <RouterLink to="/about">About</RouterLink>
            </nav>
            <main>
                <RouterView />
            </main>
        </div>
    );
}
```

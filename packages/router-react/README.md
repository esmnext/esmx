<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/router-react</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/router-react">
      <img src="https://img.shields.io/npm/v/@esmx/router-react.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://esmx.dev/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/router-react.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/router-react">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/router-react" alt="size" />
    </a>
  </div>
  
  <p>React integration for <a href="https://github.com/esmnext/esmx/tree/master/packages/router">@esmx/router</a> - A powerful router with React 18+ support using modern hooks and context patterns.</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/router-react/README.zh-CN.md">中文</a>
  </p>
</div>

## 🚀 Features

✨ **React 18+ Support** - Built for React 18 and 19 with hooks and concurrent features  
🎯 **Hooks First** - Modern hook-based API with `useRouter`, `useRoute`, `useLink`  
🔗 **Seamless Integration** - Works with @esmx/router core  
🚀 **TypeScript Ready** - Full TypeScript support with excellent DX  
⚡ **High Performance** - Uses `useSyncExternalStore` for optimal re-renders  
🔄 **SSR Compatible** - Server-side rendering support out of the box  
📦 **Lightweight** - Minimal bundle size with zero dependencies (except peer deps)  
🔧 **Pure TypeScript** - No JSX required, uses React.createElement for maximum compatibility

## 📦 Installation

```bash
# npm
npm install @esmx/router @esmx/router-react

# pnpm
pnpm add @esmx/router @esmx/router-react

# yarn
yarn add @esmx/router @esmx/router-react
```

## 🚀 Quick Start

```tsx
import { Router, RouterMode } from '@esmx/router';
import { RouterProvider, RouterView, RouterLink } from '@esmx/router-react';

// Define your routes
const routes = [
  { path: '/', component: () => import('./views/Home') },
  { path: '/about', component: () => import('./views/About') },
  { path: '/users/:id', component: () => import('./views/UserProfile') }
];

// Create router instance
const router = new Router({ 
  routes,
  mode: RouterMode.history
});

// Wrap your app with RouterProvider
function App() {
  return (
    <RouterProvider router={router}>
      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/users/123">User Profile</RouterLink>
      </nav>
      
      <RouterView />
    </RouterProvider>
  );
}

export default App;
```

## 📚 API Reference

### Components

#### RouterProvider

Provides router context to the React component tree. Must wrap your application.

```tsx
import { Router } from '@esmx/router';
import { RouterProvider } from '@esmx/router-react';

const router = new Router({ routes });

function App() {
  return (
    <RouterProvider router={router}>
      {/* Your app components */}
    </RouterProvider>
  );
}
```

**Props:**

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `router` | `Router` | Yes | Router instance from @esmx/router |
| `children` | `ReactNode` | Yes | Child components |

#### RouterView

Renders the matched route component. Supports nested routing with automatic depth tracking.

```tsx
import { RouterView } from '@esmx/router-react';

function Layout() {
  return (
    <div>
      <header>My App</header>
      <RouterView />
      <footer>Footer</footer>
    </div>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `fallback` | `ReactNode \| ComponentType` | - | Fallback content when no route matches |

**Nested Routing Example:**

```tsx
// Routes configuration
const routes = [
  {
    path: '/users',
    component: UsersLayout,
    children: [
      { path: '', component: UsersList },
      { path: ':id', component: UserProfile }
    ]
  }
];

// UsersLayout.tsx - Contains nested RouterView
function UsersLayout() {
  return (
    <div>
      <h1>Users Section</h1>
      <RouterView /> {/* Renders UsersList or UserProfile */}
    </div>
  );
}
```

#### RouterLink

A component for creating navigation links with active state management.

```tsx
import { RouterLink } from '@esmx/router-react';

function Navigation() {
  return (
    <nav>
      {/* Basic link */}
      <RouterLink to="/home">Home</RouterLink>
      
      {/* With object location */}
      <RouterLink to={{ path: '/search', query: { q: 'react' } }}>
        Search
      </RouterLink>
      
      {/* Replace navigation */}
      <RouterLink to="/login" type="replace">Login</RouterLink>
      
      {/* Open in new window */}
      <RouterLink to="/docs" type="pushWindow">Docs ↗</RouterLink>
      
      {/* Custom active class */}
      <RouterLink 
        to="/dashboard" 
        activeClass="nav-active"
        exact="exact"
      >
        Dashboard
      </RouterLink>
      
      {/* Custom tag */}
      <RouterLink to="/submit" tag="button" className="btn">
        Submit
      </RouterLink>
    </nav>
  );
}
```

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `string \| RouteLocationInput` | - | Target route location |
| `type` | `RouterLinkType` | `'push'` | Navigation type |
| `exact` | `RouteMatchType` | `'include'` | Active matching mode |
| `activeClass` | `string` | - | CSS class for active state |
| `event` | `string \| string[]` | `'click'` | Events triggering navigation |
| `tag` | `string` | `'a'` | HTML tag to render |
| `layerOptions` | `RouterLayerOptions` | - | Layer navigation options |
| `beforeNavigate` | `function` | - | Callback before navigation |
| `children` | `ReactNode` | - | Link content |
| `className` | `string` | - | Additional CSS classes |
| `style` | `CSSProperties` | - | Inline styles |

**Navigation Types:**

- `'push'` - Add entry to history stack (default)
- `'replace'` - Replace current history entry
- `'pushWindow'` - Open in new window/tab
- `'replaceWindow'` - Replace current window location
- `'pushLayer'` - Open in layer (modal/dialog routing)

### Hooks

#### useRouter()

Get the router instance for programmatic navigation.

```tsx
import { useRouter } from '@esmx/router-react';

function NavigationControls() {
  const router = useRouter();

  const goHome = () => router.push('/');
  const goBack = () => router.back();
  const goForward = () => router.forward();

  const goToUser = (id: string) => {
    router.push({
      path: '/users/:id',
      params: { id }
    });
  };

  const replaceRoute = () => {
    router.replace('/login');
  };

  return (
    <div>
      <button onClick={goHome}>Home</button>
      <button onClick={goBack}>Back</button>
      <button onClick={goForward}>Forward</button>
      <button onClick={() => goToUser('123')}>User 123</button>
      <button onClick={replaceRoute}>Login (Replace)</button>
    </div>
  );
}
```

#### useRoute()

Get the current route information (reactive).

```tsx
import { useRoute } from '@esmx/router-react';
import { useEffect } from 'react';

function CurrentRoute() {
  const route = useRoute();

  useEffect(() => {
    console.log('Route changed:', route.path);
    document.title = route.meta?.title || 'My App';
  }, [route.path, route.meta?.title]);

  return (
    <div>
      <p>Path: {route.path}</p>
      <p>Params: {JSON.stringify(route.params)}</p>
      <p>Query: {JSON.stringify(route.query)}</p>
      <p>Hash: {route.hash}</p>
      <p>Meta: {JSON.stringify(route.meta)}</p>
    </div>
  );
}
```

#### useLink()

Create reactive link helpers for custom navigation components.

```tsx
import { useLink } from '@esmx/router-react';

interface CustomNavButtonProps {
  to: string;
  children: React.ReactNode;
}

function CustomNavButton({ to, children }: CustomNavButtonProps) {
  const link = useLink({ to, type: 'push', exact: 'include' });

  return (
    <button
      onClick={(e) => link.navigate(e)}
      className={`nav-button ${link.isActive ? 'active' : ''}`}
      aria-current={link.isExactActive ? 'page' : undefined}
    >
      {children}
      {link.isExternal && <span>↗</span>}
    </button>
  );
}
```

**Return Value (`RouterLinkResolved`):**

| Property | Type | Description |
|----------|------|-------------|
| `route` | `Route` | Resolved route object |
| `type` | `RouterLinkType` | Navigation type |
| `isActive` | `boolean` | Whether link matches current route |
| `isExactActive` | `boolean` | Whether link exactly matches current route |
| `isExternal` | `boolean` | Whether link points to external origin |
| `tag` | `string` | HTML tag to render |
| `attributes` | `RouterLinkAttributes` | HTML attributes (href, class, target, rel) |
| `navigate` | `(e: Event) => Promise<void>` | Navigation function |
| `createEventHandlers` | `function` | Generate event handlers |

#### useRouterViewDepth()

Get the current RouterView depth (for advanced nested routing scenarios).

```tsx
import { useRouterViewDepth } from '@esmx/router-react';

function DebugView() {
  const depth = useRouterViewDepth();
  
  return <div>Current depth: {depth}</div>;
}
```

### Context

#### RouterContext

Direct access to the router context (for advanced use cases).

```tsx
import { RouterContext } from '@esmx/router-react';
import { useContext } from 'react';

function CustomRouterConsumer() {
  const context = useContext(RouterContext);
  
  if (!context) {
    return <div>Not inside RouterProvider</div>;
  }
  
  const { router, route } = context;
  // Use router and route directly
}
```

## Advanced Usage

### Route Guards

```tsx
import { useRouter, useRoute } from '@esmx/router-react';
import { useEffect } from 'react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const route = useRoute();

  useEffect(() => {
    // Register beforeEach guard
    const unregister = router.beforeEach((to, from) => {
      if (to.meta?.requiresAuth && !isAuthenticated()) {
        return '/login';
      }
    });

    return () => unregister();
  }, [router]);

  return <>{children}</>;
}
```

### SSR Integration

```tsx
import { Router, RouterMode } from '@esmx/router';
import { RouterProvider, RouterView } from '@esmx/router-react';
import { renderToString } from 'react-dom/server';

async function renderApp(url: string) {
  const router = new Router({
    routes,
    mode: RouterMode.history,
    url // Pass the request URL
  });

  // Wait for route resolution
  await router.push(url);

  const html = renderToString(
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  );

  return html;
}
```

### Custom Link Component with Additional Features

```tsx
import { useLink } from '@esmx/router-react';
import { forwardRef, type AnchorHTMLAttributes } from 'react';

interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  icon?: React.ReactNode;
  badge?: number;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, icon, badge, children, className, ...props }, ref) => {
    const link = useLink({ to, exact: 'include' });

    return (
      <a
        ref={ref}
        href={link.attributes.href}
        onClick={(e) => {
          e.preventDefault();
          link.navigate(e);
        }}
        className={`nav-link ${link.isActive ? 'active' : ''} ${className || ''}`}
        aria-current={link.isExactActive ? 'page' : undefined}
        {...props}
      >
        {icon && <span className="nav-icon">{icon}</span>}
        <span className="nav-label">{children}</span>
        {badge !== undefined && badge > 0 && (
          <span className="nav-badge">{badge}</span>
        )}
      </a>
    );
  }
);

NavLink.displayName = 'NavLink';
```

## TypeScript Support

This package provides full TypeScript support. All types are exported and properly documented.

```tsx
import type {
  RouterContextValue,
  RouterProviderProps,
  RouterViewProps,
  RouterLinkComponentProps
} from '@esmx/router-react';

import type {
  Route,
  Router,
  RouterLinkProps,
  RouterLinkResolved,
  RouteLocationInput
} from '@esmx/router';
```

## Browser Support

- **Modern browsers** that support ES modules (`import`/`export`) and React 18+
- Chrome 64+, Firefox 67+, Safari 11.1+, Edge 79+

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## 📄 License

MIT © [Esmx Team](https://github.com/esmnext/esmx)

## Related Packages

- [@esmx/router](https://github.com/esmnext/esmx/tree/master/packages/router) - Core router package
- [@esmx/router-vue](https://github.com/esmnext/esmx/tree/master/packages/router-vue) - Vue integration
- [@esmx/core](https://github.com/esmnext/esmx/tree/master/packages/core) - Esmx core framework

---
titleSuffix: "RouterLink API Reference"
description: "Detailed API reference for @esmx/router link resolution, including RouterLinkProps, RouterLinkResolved, link attributes, and event handling for React and Vue."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, RouterLink, API, navigation link, active state, link resolution, React router, Vue router"
---

# RouterLink

## Introduction

The `@esmx/router` package provides a framework-agnostic link resolution system via `router.resolveLink()`. This method generates all necessary data for creating navigation links, including HTML attributes, active state detection, and event handlers.

## Type Definitions

### RouterLinkType

- **Type Definition**:
```ts
type RouterLinkType =
    | 'push'
    | 'replace'
    | 'pushWindow'
    | 'replaceWindow'
    | 'pushLayer';
```

Navigation types for links:
- `push`: Standard forward navigation (adds history entry)
- `replace`: Replaces current history entry
- `pushWindow`: Opens in a new browser window
- `replaceWindow`: Replaces current window location
- `pushLayer`: Opens as a layer overlay

### RouterLinkProps

- **Type Definition**:
```ts
interface RouterLinkProps {
    to: RouteLocationInput;
    type?: RouterLinkType;
    replace?: boolean;
    exact?: RouteMatchType;
    activeClass?: string;
    event?: string | string[];
    tag?: string;
    layerOptions?: RouteLayerOptions;
    beforeNavigate?: (event: Event, eventName: string) => void;
}
```

Link configuration properties:
- `to`: Target route location (string or RouteLocation object)
- `type`: Navigation type (default: `'push'`)
- `replace`: _Deprecated_ — Use `type='replace'` instead
- `exact`: Active state matching strategy (`'include'` | `'exact'` | `'route'`)
- `activeClass`: Custom CSS class for active state
- `event`: Event(s) that trigger navigation (default: `'click'`)
- `tag`: HTML tag to render (default: `'a'`)
- `layerOptions`: Layer configuration when `type='pushLayer'`
- `beforeNavigate`: Hook called before navigation; call `event.preventDefault()` to block navigation

### RouterLinkResolved

- **Type Definition**:
```ts
interface RouterLinkResolved {
    route: Route;
    type: RouterLinkType;
    isActive: boolean;
    isExactActive: boolean;
    isExternal: boolean;
    tag: string;
    attributes: RouterLinkAttributes;
    navigate: (e: Event) => Promise<void>;
    createEventHandlers: (
        format?: (eventType: string) => string
    ) => Record<string, (e: Event) => Promise<void>>;
}
```

Resolved link data:
- `route`: Resolved Route object for the target location
- `type`: Resolved navigation type
- `isActive`: Whether the link matches the current route (based on `exact` strategy)
- `isExactActive`: Whether the link exactly matches the current route path
- `isExternal`: Whether the link points to an external origin
- `tag`: HTML tag to render
- `attributes`: HTML attributes object (href, class, target, rel)
- `navigate`: Navigation handler function (respects modifier keys, prevents default appropriately)
- `createEventHandlers`: Factory for creating framework-specific event handlers

### RouterLinkAttributes

- **Type Definition**:
```ts
interface RouterLinkAttributes {
    href: string;
    class: string;
    target?: '_blank';
    rel?: string;
}
```

HTML attributes generated for the link element:
- `href`: Full href URL
- `class`: CSS classes including `router-link`, `router-link-active`, and `router-link-exact-active`
- `target`: Set to `'_blank'` for `pushWindow` type links
- `rel`: Set to `'noopener noreferrer'` for new window links, `'external nofollow'` for external links

## Methods

### router.resolveLink()

- **Parameters**:
  - `props: RouterLinkProps` — Link configuration
- **Returns**: `RouterLinkResolved`

Resolves link properties into complete link data. This is the primary method for building navigation links in any framework.

```ts
const linkData = router.resolveLink({
    to: '/user/123',
    type: 'push',
    exact: 'include',
    activeClass: 'nav-active'
});
```

## CSS Classes

Links automatically receive CSS classes based on the current route:

- `router-link`: Always applied to all router links
- `router-link-active`: Applied when the link matches the current route (based on `exact` strategy)
- `router-link-exact-active`: Applied when the link exactly matches the current route path

## Usage Examples

### Vue Usage

With `@esmx/router-vue`, use the `RouterLink` component:

```vue
<template>
  <nav>
    <RouterLink to="/home">Home</RouterLink>
    <RouterLink to="/about" active-class="nav-active">About</RouterLink>
    <RouterLink :to="{ path: '/user', query: { id: '1' } }">User</RouterLink>
    <RouterLink to="/settings" type="replace">Settings</RouterLink>
  </nav>
</template>
```

### React Manual Usage

In React, use `router.resolveLink()` to build link components:

```tsx
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
    const linkData = router.resolveLink({ to, type: 'push' });
    const handlers = linkData.createEventHandlers(
        (name) => `on${name.charAt(0).toUpperCase()}${name.slice(1)}`
    );

    return (
        <a {...linkData.attributes} {...handlers}>
            {children}
        </a>
    );
}
```

### Custom Event Handling

```ts
const linkData = router.resolveLink({
    to: '/dashboard',
    event: ['click', 'touchstart'],
    beforeNavigate: (event, eventName) => {
        // Track analytics before navigation
        analytics.track('nav_click', { target: '/dashboard' });
    }
});

// Generate event handlers with custom naming
const handlers = linkData.createEventHandlers((type) => `on${type}`);
```

### Layer Navigation Links

```ts
const layerLink = router.resolveLink({
    to: '/select-item',
    type: 'pushLayer',
    layerOptions: {
        autoPush: true,
        keepAlive: 'exact'
    }
});
```

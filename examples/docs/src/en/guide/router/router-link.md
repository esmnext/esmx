---
titleSuffix: "RouterLink API Reference"
description: "Complete guide to @esmx/router RouterLink system — framework-agnostic link resolution with active states, event handling, and navigation types."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router link, RouterLink, navigation link, active class, link resolution, SPA navigation"
---

# RouterLink

`@esmx/router` provides a framework-agnostic link resolution system via [`router.resolveLink()`](./router#resolvelink). It generates all the data needed to build link components in any framework — including HTML attributes, active states, CSS classes, and event handlers.

## RouterLinkProps

- **Type Definition**:
```ts
interface RouterLinkProps {
  to: RouteLocationInput;
  type?: RouterLinkType;
  exact?: RouteMatchType;
  activeClass?: string;
  event?: string | string[];
  tag?: string;
  layerOptions?: RouteLayerOptions;
  beforeNavigate?: (event: Event, eventName: string) => void;
}
```

### to

- **Type**: `RouteLocationInput`

**Required.** Target route. Can be a string path or a route location object.

```ts
router.resolveLink({ to: '/about' });
router.resolveLink({ to: { path: '/user', query: { id: '1' } } });
```

### type

- **Type**: `RouterLinkType`
- **Default**: `'push'`

Navigation type used when the link is clicked.

- `'push'`: Add to history stack (default)
- `'replace'`: Replace current history entry
- `'pushWindow'`: Open in new window/tab
- `'replaceWindow'`: Replace current window
- `'pushLayer'`: Open as a [layer/modal](./layer)

### exact

- **Type**: `RouteMatchType`
- **Default**: `'include'`

How to determine the active state of the link.

- `'include'`: Active when current path starts with link path
- `'exact'`: Active when current path exactly matches link path
- `'route'`: Active when same route config is matched

### activeClass

- **Type**: `string`
- **Default**: `'router-link-active'`

CSS class applied when the link is active.

### event

- **Type**: `string | string[]`
- **Default**: `'click'`

DOM event(s) that trigger navigation.

### tag

- **Type**: `string`
- **Default**: `'a'`

The HTML tag to render.

### layerOptions

- **Type**: `RouteLayerOptions`

Layer options passed when `type` is `'pushLayer'`. See [Layer](./layer#routelayeroptions).

### beforeNavigate

- **Type**: `(event: Event, eventName: string) => void`

Hook called before navigation. Call `event.preventDefault()` to cancel.

```ts
router.resolveLink({
  to: '/page',
  beforeNavigate: (event, eventName) => {
    if (!confirm('Navigate away?')) {
      event.preventDefault();
    }
  }
});
```

## RouterLinkResolved

The result of `resolveLink()`.

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

### route

The resolved [Route](./route) object for the target.

### isActive

`true` if the current route matches the link target (based on the `exact` setting).

### isExactActive

`true` if the current route path exactly matches the link target path.

### isExternal

`true` if the link points to a different origin (external URL).

### attributes

HTML attributes for the link element:

- **Type Definition**:
```ts
interface RouterLinkAttributes {
  href: string;
  class: string;
  target?: '_blank';
  rel?: string;
}
```

### navigate

- **Type**: `(e: Event) => Promise<void>`

Function to call for programmatic navigation. Intelligently handles modifier keys (Ctrl+click opens new tab, etc.).

### createEventHandlers

- **Type**: `(format?: (eventType: string) => string) => Record<string, (e: Event) => Promise<void>>`

Generate event handlers with framework-specific event name formatting.

```ts
// React (camelCase events)
const handlers = linkData.createEventHandlers(
  name => `on${name.charAt(0).toUpperCase() + name.slice(1)}`
);
// → { onClick: (e) => ... }

// Vue / vanilla (lowercase events)
const handlers = linkData.createEventHandlers();
// → { click: (e) => ... }
```

## CSS Classes

Links automatically receive CSS classes based on active state:

- `router-link`: Always applied
- `router-link-active`: Applied when `isActive` is `true`
- `router-link-exact-active`: Applied when `isExactActive` is `true`

## Framework Examples

### Vanilla JavaScript

```ts
function createLink(router: Router, to: string, text: string) {
  const { attributes, navigate } = router.resolveLink({ to });

  const a = document.createElement('a');
  a.href = attributes.href;
  a.className = attributes.class;
  a.textContent = text;
  a.addEventListener('click', navigate);

  return a;
}
```

### React

```tsx
function RouterLink({ to, children, type = 'push' }) {
  const linkData = router.resolveLink({ to, type });
  const handlers = linkData.createEventHandlers(
    name => `on${name.charAt(0).toUpperCase() + name.slice(1)}`
  );

  return (
    <a
      href={linkData.attributes.href}
      className={linkData.attributes.class}
      {...handlers}
    >
      {children}
    </a>
  );
}
```

### Vue 3

```vue
<template>
  <component :is="linkData.tag" v-bind="linkData.attributes" v-on="handlers">
    <slot />
  </component>
</template>

<script setup>
const props = defineProps(['to', 'type']);
const router = inject('router');
const linkData = router.resolveLink({ to: props.to, type: props.type });
const handlers = linkData.createEventHandlers();
</script>
```

## Smart Navigation

The `navigate` function intelligently handles browser events:

- **Ctrl+Click / Cmd+Click**: Opens in new tab (browser default)
- **Shift+Click**: Opens in new window (browser default)
- **Middle-click**: Opens in new tab (browser default)
- **Normal click**: SPA navigation via router

This matches the behavior users expect from standard `<a>` tags.

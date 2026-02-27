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

## RouterLinkProps {#routerlinkprops}

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

### to {#to}

```ts
to: RouteLocationInput;
```

**Required.** Target route. Can be a string path or a route location object.

#### Example

```ts
router.resolveLink({ to: '/about' });
router.resolveLink({ to: { path: '/user', query: { id: '1' } } });
```

### type {#type}

```ts
optional type: RouterLinkType;
```

Navigation type used when the link is clicked.

| Type | Description |
|------|-------------|
| `'push'` | Add to history stack (default) |
| `'replace'` | Replace current history entry |
| `'pushWindow'` | Open in new window/tab |
| `'replaceWindow'` | Replace current window |
| `'pushLayer'` | Open as a [layer/modal](./layer) |

#### Default Value

`'push'`

### exact {#exact}

```ts
optional exact: RouteMatchType;
```

How to determine the active state of the link.

| Value | Active when... |
|-------|---------------|
| `'include'` | Current path starts with link path |
| `'exact'` | Current path exactly matches link path |
| `'route'` | Same route config is matched |

#### Default Value

`'include'`

### activeClass {#activeclass}

```ts
optional activeClass: string;
```

CSS class applied when the link is active.

#### Default Value

`'router-link-active'`

### event {#event}

```ts
optional event: string | string[];
```

DOM event(s) that trigger navigation.

#### Default Value

`'click'`

### tag {#tag}

```ts
optional tag: string;
```

The HTML tag to render.

#### Default Value

`'a'`

### layerOptions {#layeroptions}

```ts
optional layerOptions: RouteLayerOptions;
```

Layer options passed when `type` is `'pushLayer'`. See [Layer](./layer#routelayeroptions).

### beforeNavigate {#beforenavigate}

```ts
optional beforeNavigate: (event: Event, eventName: string) => void;
```

Hook called before navigation. Call `event.preventDefault()` to cancel.

#### Example

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

## RouterLinkResolved {#routerlinkresolved}

The result of `resolveLink()`.

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

### route {#route}

The resolved [Route](./route) object for the target.

### isActive {#isactive}

`true` if the current route matches the link target (based on the `exact` setting).

### isExactActive {#isexactactive}

`true` if the current route path exactly matches the link target path.

### isExternal {#isexternal}

`true` if the link points to a different origin (external URL).

### attributes {#attributes}

HTML attributes for the link element:

```ts
interface RouterLinkAttributes {
  href: string;
  class: string;
  target?: '_blank';
  rel?: string;
}
```

### navigate {#navigate}

```ts
navigate: (e: Event) => Promise<void>;
```

Function to call for programmatic navigation. Intelligently handles modifier keys (Ctrl+click opens new tab, etc.).

### createEventHandlers {#createeventhandlers}

```ts
createEventHandlers: (
  format?: (eventType: string) => string
) => Record<string, (e: Event) => Promise<void>>;
```

Generate event handlers with framework-specific event name formatting.

#### Example

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

## CSS Classes {#css-classes}

Links automatically receive CSS classes based on active state:

| Class | Applied when |
|-------|-------------|
| `router-link` | Always |
| `router-link-active` | `isActive` is `true` |
| `router-link-exact-active` | `isExactActive` is `true` |

## Framework Examples

### Vanilla JavaScript {#vanilla}

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

### React {#react}

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

### Vue 3 {#vue3}

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

## Smart Navigation {#smart-navigation}

The `navigate` function intelligently handles browser events:

- **Ctrl+Click / Cmd+Click**: Opens in new tab (browser default)
- **Shift+Click**: Opens in new window (browser default)
- **Middle-click**: Opens in new tab (browser default)
- **Normal click**: SPA navigation via router

This matches the behavior users expect from standard `<a>` tags.

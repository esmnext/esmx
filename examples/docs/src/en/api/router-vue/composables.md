---
titleSuffix: "@esmx/router-vue — Composables"
description: "Composition API functions for @esmx/router-vue — useRouter, useRoute, useProvideRouter, useLink, and Options API helpers."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-vue, useRouter, useRoute, useProvideRouter, useLink, composables, Options API"
---

# Composables

## Introduction

`@esmx/router-vue` provides Composition API functions for accessing the router and current route within Vue components. These composables must be called inside `setup()` or other composition functions. For Options API usage, lower-level functions (`getRouter`, `getRoute`, `getRouterViewDepth`) are also available.

## useProvideRouter()

- **Parameters**:
  - `router: Router` — Router instance to provide
- **Returns**: `void`
- **Throws**: `Error` — If called outside `setup()`

Provides the router context to all descendant components. Must be called in a root or parent component's `setup()`. Sets up reactive proxies for both the router and the current route, ensuring that Vue components reactively update when the route changes.

```ts
import { defineComponent } from 'vue';
import { Router } from '@esmx/router';
import { useProvideRouter } from '@esmx/router-vue';

export default defineComponent({
    setup() {
        const router = new Router({ routes });
        useProvideRouter(router);
    }
});
```

## useRouter()

- **Returns**: `Router`
- **Throws**: `Error` — If called outside `setup()` or if router context is not found

Gets the router instance in a Vue component's Composition API. Must be called within `setup()`.

```vue
<script setup lang="ts">
import { useRouter } from '@esmx/router-vue';

const router = useRouter();

const navigateToHome = () => {
    router.push('/home');
};

const goBack = () => {
    router.back();
};
</script>
```

## useRoute()

- **Returns**: `Route`
- **Throws**: `Error` — If called outside `setup()` or if router context is not found

Gets the current reactive route object. Automatically updates when the route changes.

```vue
<template>
    <div>
        <h1>{{ route.meta?.title || 'Page' }}</h1>
        <p>Path: {{ route.path }}</p>
        <p>Params: {{ JSON.stringify(route.params) }}</p>
        <p>Query: {{ JSON.stringify(route.query) }}</p>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from '@esmx/router-vue';
import { watch } from 'vue';

const route = useRoute();

watch(() => route.path, (newPath) => {
    console.log('Route changed to:', newPath);
});
</script>
```

## useLink()

- **Parameters**:
  - `props: RouterLinkProps` — Link configuration
- **Returns**: `ComputedRef<RouterLinkResolved>`

Creates reactive link helpers for navigation elements. Returns a computed reference that updates when the route changes.

```vue
<template>
    <a
        v-bind="link.attributes"
        v-on="link.createEventHandlers()"
        :class="{ active: link.isActive }"
    >
        Home
    </a>
</template>

<script setup lang="ts">
import { useLink } from '@esmx/router-vue';

const link = useLink({
    to: '/home',
    type: 'push',
    exact: 'include'
}).value;
</script>
```

## useRouterViewDepth()

- **Returns**: `number`
- **Throws**: `Error` — If called outside `setup()`

Gets the current RouterView nesting depth. Returns `0` for root level, `1` for the first nested level, and so on.

```vue
<script setup lang="ts">
import { useRouterViewDepth } from '@esmx/router-vue';

const depth = useRouterViewDepth();
console.log('Current RouterView depth:', depth); // 0, 1, 2, etc.
</script>
```

## Lower-Level Functions

### getRouter()

- **Parameters**:
  - `instance: VueInstance` — Vue component instance
- **Returns**: `Router`
- **Throws**: `Error` — If router context is not found

Gets the router instance from a Vue component instance. Use this in Options API; use `useRouter()` in Composition API.

```ts
import { defineComponent } from 'vue';
import { getRouter } from '@esmx/router-vue';

export default defineComponent({
    mounted() {
        const router = getRouter(this);
        router.push('/dashboard');
    }
});
```

### getRoute()

- **Parameters**:
  - `instance: VueInstance` — Vue component instance
- **Returns**: `Route`
- **Throws**: `Error` — If router context is not found

Gets the current route from a Vue component instance. Use this in Options API; use `useRoute()` in Composition API.

```ts
import { defineComponent } from 'vue';
import { getRoute } from '@esmx/router-vue';

export default defineComponent({
    computed: {
        currentPath() {
            return getRoute(this).path;
        }
    }
});
```

### getRouterViewDepth()

- **Parameters**:
  - `instance: VueInstance` — Vue component instance
- **Returns**: `number`
- **Throws**: `Error` — If no RouterView ancestor is found

Gets the RouterView depth from a Vue component instance by traversing the parent chain. Use this in Options API; use `useRouterViewDepth()` in Composition API.

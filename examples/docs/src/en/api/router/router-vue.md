---
titleSuffix: "@esmx/router-vue API Reference"
description: "Detailed API reference for the @esmx/router-vue package, including Vue plugin, composables, components, and type augmentation for Vue 2 and Vue 3."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-vue, API, Vue plugin, RouterView, RouterLink, useRouter, useRoute, Vue composition API"
---

# @esmx/router-vue

## Introduction

`@esmx/router-vue` provides Vue integration for `@esmx/router`, offering a plugin, composables, and components for seamless routing in Vue 2.7+ and Vue 3 applications.

## Plugin

### RouterPlugin

- **Type Definition**:
```ts
const RouterPlugin: {
    install(app: unknown): void;
};
```

Vue plugin that registers `RouterLink` and `RouterView` as global components and sets up `$router` and `$route` properties on Vue instances.

**Vue 3 Installation**:
```ts
import { createApp } from 'vue';
import { Router } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';

const router = new Router({
    routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
    ]
});

const app = createApp({
    setup() {
        useProvideRouter(router);
    }
});

app.use(RouterPlugin);
app.mount('#app');
```

**Vue 2 Installation**:
```ts
import Vue from 'vue';
import { Router } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';

const router = new Router({
    routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
    ]
});

Vue.use(RouterPlugin);

new Vue({
    setup() {
        useProvideRouter(router);
    }
}).$mount('#app');
```

## Composables

### useProvideRouter()

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

### useRouter()

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

### useRoute()

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

### useLink()

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

### useRouterViewDepth()

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

## Components

### RouterView

- **Component Name**: `RouterView`

Renders the matched route component at the current depth. Supports nested routing with automatic depth tracking via Vue's provide/inject mechanism.

```vue
<template>
    <div id="app">
        <nav>
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/about">About</RouterLink>
        </nav>

        <!-- Route components render here -->
        <RouterView />
    </div>
</template>
```

**Nested Routing**:
```vue
<!-- Parent layout component -->
<template>
    <div class="layout">
        <aside>
            <RouterLink to="/user/profile">Profile</RouterLink>
            <RouterLink to="/user/settings">Settings</RouterLink>
        </aside>
        <main>
            <!-- Nested route components render here -->
            <RouterView />
        </main>
    </div>
</template>
```

### RouterLink

- **Component Name**: `RouterLink`

Navigation link component that renders an anchor element with proper navigation behavior and active state management.

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `RouteLocationInput` | _required_ | Target route location |
| `type` | `RouterLinkType` | `'push'` | Navigation type |
| `replace` | `boolean` | `false` | _Deprecated_ — Use `type="replace"` |
| `exact` | `RouteMatchType` | `'include'` | Active state matching strategy |
| `activeClass` | `string` | — | Custom CSS class for active state |
| `event` | `string \| string[]` | `'click'` | Event(s) triggering navigation |
| `tag` | `string` | `'a'` | HTML tag to render |
| `layerOptions` | `RouteLayerOptions` | — | Layer options for `type='pushLayer'` |
| `beforeNavigate` | `Function` | — | Hook before navigation |

```vue
<template>
    <nav>
        <!-- Basic navigation -->
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>

        <!-- With custom styling -->
        <RouterLink to="/dashboard" active-class="nav-active">
            Dashboard
        </RouterLink>

        <!-- Replace navigation -->
        <RouterLink to="/login" type="replace">Login</RouterLink>

        <!-- Exact matching with custom tag -->
        <RouterLink to="/contact" exact="exact" tag="button">
            Contact
        </RouterLink>

        <!-- Open in new window -->
        <RouterLink to="/docs" type="pushWindow">
            Documentation
        </RouterLink>
    </nav>
</template>
```

## Type Augmentation

### Vue 2

When using `@esmx/router-vue` with Vue 2.7+, the following properties are available on Vue component instances:

```ts
interface Vue {
    readonly $router: Router;
    readonly $route: Route;
}
```

### Vue 3

When using `@esmx/router-vue` with Vue 3, the following type augmentations are applied:

```ts
declare module 'vue' {
    interface ComponentCustomProperties {
        readonly $router: Router;
        readonly $route: Route;
    }

    interface GlobalComponents {
        RouterLink: typeof RouterLink;
        RouterView: typeof RouterView;
    }
}
```

This provides:
- `this.$router` and `this.$route` in Options API
- Type-safe global `RouterLink` and `RouterView` components in templates

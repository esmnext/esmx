<div align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/router-vue</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/router-vue">
      <img src="https://img.shields.io/npm/v/@esmx/router-vue.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://www.esmnext.com/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/router-vue.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/router-vue">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/router-vue" alt="size" />
    </a>
  </div>
  
  <p>Vue integration for <a href="https://github.com/esmnext/esmx/tree/master/packages/router">@esmx/router</a> - A universal router that works seamlessly with both Vue 2.7+ and Vue 3.</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/router-vue/README.zh-CN.md">中文</a>
  </p>
</div>



## Features

✨ **Universal Vue Support** - Works with both Vue 2.7+ and Vue 3  
🎯 **Composition API First** - Built for modern Vue development  
🔗 **Seamless Integration** - Drop-in replacement for Vue Router  
🚀 **TypeScript Ready** - Full TypeScript support with excellent DX  
⚡ **High Performance** - Optimized for production use  
🔄 **SSR Compatible** - Server-side rendering support  

## Installation

```bash
npm install @esmx/router @esmx/router-vue
```

## Quick Start

### Vue 3

```typescript
import { createApp, h } from 'vue';
import { Router, RouterMode } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import App from './App.vue';

const routes = [
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/about', component: () => import('./views/About.vue') }
];

const router = new Router({ 
  routes,
  mode: RouterMode.history
});

const app = createApp({
  setup() {
    useProvideRouter(router);
    return {};
  },
  render: () => h(App)
});

// Install the plugin
app.use(RouterPlugin);

app.mount('#app');
```

### Vue 2.7+

```typescript
import Vue from 'vue';
import { Router, RouterMode } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import App from './App.vue';

const routes = [
  { path: '/', component: () => import('./views/Home.vue') },
  { path: '/about', component: () => import('./views/About.vue') }
];

const router = new Router({ 
  routes,
  mode: RouterMode.history
});

// Install the plugin
Vue.use(RouterPlugin);

new Vue({
  setup() {
    useProvideRouter(router);
  },
  render: h => h(App)
}).$mount('#app');
```

## Basic Usage

### Template Usage

```vue
<template>
  <div id="app">
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/users/123">User Profile</RouterLink>
    </nav>
    
    <!-- Route components will be rendered here -->
    <RouterView />
  </div>
</template>
```

### Composition API

```vue
<script setup lang="ts">
import { useRouter, useRoute } from '@esmx/router-vue';
import { watch } from 'vue';

const router = useRouter();
const route = useRoute();

// Programmatic navigation
const goToAbout = () => {
  router.push('/about');
};

const goBack = () => {
  router.back();
};

// Watch route changes
watch(() => route.path, (newPath) => {
  // Handle route change logic here
});
</script>

<template>
  <div>
    <h1>{{ route.meta?.title || 'Page' }}</h1>
    <p>Current path: {{ route.path }}</p>
    <p>Route params: {{ JSON.stringify(route.params) }}</p>
    <p>Query params: {{ JSON.stringify(route.query) }}</p>
    
    <button @click="goToAbout">Go to About Page</button>
    <button @click="goBack">Go Back</button>
  </div>
</template>
```

### Options API

```vue
<script>
import { defineComponent } from 'vue';
import { getRouter, getRoute } from '@esmx/router-vue';

export default defineComponent({
  mounted() {
    const router = getRouter(this);
    const route = getRoute(this);
    
    // Access current route information
  },
  
  methods: {
    navigate() {
      const router = getRouter(this);
      router.push('/dashboard');
    }
  }
});
</script>
```

## API Reference

### Components

#### RouterLink

A component for creating navigation links.

**Props:**

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `string` \| `RouteLocationInput` | - | Target route location |
| `type` | `RouterLinkType` | `'push'` | Navigation type (`'push'` \| `'replace'` \| `'pushWindow'` \| `'replaceWindow'` \| `'pushLayer'`) |
| `exact` | `RouteMatchType` | `'include'` | Active state matching (`'include'` \| `'exact'` \| `'route'`) |
| `activeClass` | `string` | - | CSS class for active state |
| `event` | `string` \| `string[]` | `'click'` | Events that trigger navigation |
| `tag` | `string` | `'a'` | HTML tag to render |
| `layerOptions` | `RouterLayerOptions` | - | Layer navigation options (used with `type="pushLayer"`) |

**Usage:**

```vue
<template>
  <!-- Basic link -->
  <RouterLink to="/home">Home</RouterLink>
  
  <!-- Replace navigation -->
  <RouterLink to="/login" type="replace">Login</RouterLink>
  
  <!-- Custom styling -->
  <RouterLink 
    to="/dashboard" 
    active-class="nav-active"
    exact="exact"
  >
    Dashboard
  </RouterLink>
  
  <!-- Custom tag -->
  <RouterLink to="/submit" tag="button" class="btn">
    Submit
  </RouterLink>
</template>
```

#### RouterView

A component that renders the matched route component.

**Usage:**

```vue
<template>
  <div>
    <!-- Root level routes render here -->
    <RouterView />
    
    <!-- Nested routes will render in child RouterView components -->
    <!-- Each RouterView automatically handles the correct depth -->
  </div>
</template>
```

### Composition API

#### useRouter()

Get the router instance for navigation.

```typescript
function useRouter(): Router
```

**Usage:**

```vue
<script setup>
import { useRouter } from '@esmx/router-vue';

const router = useRouter();

const navigate = () => {
  router.push('/about');
};
</script>
```

#### useRoute()

Get the current route information (reactive).

```typescript
function useRoute(): Route
```

**Usage:**

```vue
<script setup>
import { useRoute } from '@esmx/router-vue';

const route = useRoute();

// Access route properties
// route.path     - Current path
// route.params   - Route parameters  
// route.query    - Query parameters
// route.meta     - Route metadata
</script>
```

#### useProvideRouter()

Provide router context to child components.

```typescript
function useProvideRouter(router: Router): void
```

**Usage:**

```typescript
import { Router, RouterMode } from '@esmx/router';
import { useProvideRouter } from '@esmx/router-vue';

const router = new Router({ 
  routes,
  mode: RouterMode.history
});

// In your app's setup function
setup() {
  useProvideRouter(router);
}
```

#### useLink()

Create reactive link helpers for custom navigation components.

```typescript
function useLink(props: RouterLinkProps): ComputedRef<RouterLinkResolved>
```

**Usage:**

```vue
<script setup>
import { useLink } from '@esmx/router-vue';

const link = useLink({
  to: '/home',
  type: 'push',
  exact: 'include'
}).value;
</script>

<template>
  <a 
    v-bind="link.attributes"
    v-on="link.getEventHandlers()"
    :class="{ active: link.isActive }"
  >
    Custom Link
  </a>
</template>
```

### Options API

#### getRouter()

Get router instance in Options API components.

```typescript
function getRouter(instance: VueInstance): Router
```

#### getRoute()

Get current route in Options API components.

```typescript
function getRoute(instance: VueInstance): Route
```

### Plugin

#### RouterPlugin

Vue plugin that registers RouterLink and RouterView components globally.

```typescript
const RouterPlugin = {
  install(app: App): void
}
```

**Usage:**

```typescript
// Vue 3
app.use(RouterPlugin);

// Vue 2
Vue.use(RouterPlugin);
```

## TypeScript Support

This package provides full TypeScript support for both Vue 2.7+ and Vue 3. For Options API usage, the package automatically augments Vue component instances with `$router` and `$route` properties, allowing you to access them directly in templates and component methods.

```typescript
// Options API type augmentation (automatic)
declare module 'vue/types/vue' {
  interface Vue {
    readonly $router: Router;
    readonly $route: Route;
  }
}
```

**Options API Usage:**

```vue
<template>
  <div>
    <!-- Direct access without 'this.' -->
    <p>Current path: {{ $route.path }}</p>
    <button @click="navigate">Navigate to About Page</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    navigate() {
      // TypeScript knows about $router and $route
      this.$router.push('/about');
      // Access current route: this.$route.path
    }
  }
});
</script>
```

## Advanced Usage

### Custom Link Component

```vue
<script setup lang="ts">
import { useLink } from '@esmx/router-vue';
import type { RouterLinkProps } from '@esmx/router';

interface Props extends RouterLinkProps {
  icon?: string;
  disabled?: boolean;
}

const props = defineProps<Props>();

const link = useLink(props).value;
</script>

<template>
  <button
    v-bind="link.attributes"
    v-on="link.getEventHandlers()"
    :class="{ 
      active: link.isActive,
      disabled: disabled 
    }"
    :disabled="disabled"
  >
    <i v-if="icon" :class="icon" />
    <slot />
  </button>
</template>
```

### Route Guards in Components

```vue
<script setup>
import { useRouter, useRoute } from '@esmx/router-vue';
import { onMounted, onBeforeUnmount } from 'vue';

const router = useRouter();
const route = useRoute();

onMounted(() => {
  // Add route guard
  const unregister = router.beforeEach((to, from) => {
    // Check if route requires authentication (isAuthenticated is your auth function)
    if (to.meta?.requiresAuth && !isAuthenticated()) {
      return '/login';
    }
  });
  
  // Cleanup on unmount
  onBeforeUnmount(unregister);
});
</script>
```

## Migration from Vue Router

### Key Differences

1. **Router Creation**: Use `new Router()` constructor from `@esmx/router`
2. **Context Provision**: Use `useProvideRouter()` instead of router installation
3. **Component Registration**: Use `RouterPlugin` for global components

### Migration Example

**Before (Vue Router):**

```typescript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes
});

app.use(router);
```

**After (@esmx/router-vue):**

```typescript
import { Router, RouterMode } from '@esmx/router';
import { RouterPlugin, useProvideRouter } from '@esmx/router-vue';
import { createApp, h } from 'vue';
import App from './App.vue';

const router = new Router({ 
  routes,
  mode: RouterMode.history
});

const app = createApp({
  setup() {
    useProvideRouter(router);
    return {};
  },
  render: () => h(App)
});

app.use(RouterPlugin);
```

## Browser Support

- **Modern browsers** that support ES modules (`import`/`export`) and dynamic imports (`import()`)

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## License

MIT © [Esmx Team](https://github.com/esmnext/esmx)

## Related Packages

- [@esmx/router](https://github.com/esmnext/esmx/tree/master/packages/router) - Core router package
- [@esmx/core](https://github.com/esmnext/esmx/tree/master/packages/core) - Esmx core framework 
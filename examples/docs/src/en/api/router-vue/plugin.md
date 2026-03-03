---
titleSuffix: "@esmx/router-vue — RouterPlugin"
description: "Vue plugin for @esmx/router integration. Registers RouterLink and RouterView globally, compatible with Vue 2.7+ and Vue 3."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-vue, RouterPlugin, Vue plugin, Vue 2, Vue 3, install"
---

# RouterPlugin

## Introduction

`@esmx/router-vue` provides Vue integration for `@esmx/router`, offering a plugin, composables, and components for seamless routing in Vue 2.7+ and Vue 3 applications. The `RouterPlugin` is the entry point for registering the router with your Vue application.

## Type Definition

```ts
const RouterPlugin: {
    install(app: unknown): void;
};
```

Vue plugin that registers `RouterLink` and `RouterView` as global components and sets up `$router` and `$route` properties on Vue instances.

## Installation

### Vue 3

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

### Vue 2

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

## Behavior

When installed, the plugin performs the following:

1. **Registers global components**: `RouterLink` and `RouterView` become available in all templates without explicit importing
2. **Sets up instance properties**: Configures `$router` and `$route` as reactive properties accessible via `this.$router` and `this.$route` in Options API
3. **Vue 2 compatibility**: Automatically detects the Vue version and applies the appropriate setup mechanism (prototype augmentation for Vue 2, `globalProperties` for Vue 3)

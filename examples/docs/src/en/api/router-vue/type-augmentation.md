---
titleSuffix: "@esmx/router-vue — Type Augmentation"
description: "TypeScript type augmentation for Vue 2 and Vue 3 when using @esmx/router-vue."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-vue, TypeScript, type augmentation, Vue 2, Vue 3, $router, $route"
---

# Type Augmentation

## Introduction

`@esmx/router-vue` automatically augments Vue's TypeScript types when imported, providing type-safe access to `$router` and `$route` in both Vue 2.7+ and Vue 3 components.

## Vue 2

When using `@esmx/router-vue` with Vue 2.7+, the following properties are available on Vue component instances:

```ts
interface Vue {
    readonly $router: Router;
    readonly $route: Route;
}
```

## Vue 3

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

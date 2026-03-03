---
titleSuffix: "@esmx/router-vue — 类型增强"
description: "使用 @esmx/router-vue 时 Vue 2 和 Vue 3 的 TypeScript 类型增强。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-vue, TypeScript, 类型增强, Vue 2, Vue 3, $router, $route"
---

# 类型增强

## 简介

`@esmx/router-vue` 在导入时自动增强 Vue 的 TypeScript 类型，为 Vue 2.7+ 和 Vue 3 组件提供类型安全的 `$router` 和 `$route` 访问。

## Vue 2

在 Vue 2.7+ 中使用 `@esmx/router-vue` 时，以下属性在 Vue 组件实例上可用：

```ts
interface Vue {
    readonly $router: Router;
    readonly $route: Route;
}
```

## Vue 3

在 Vue 3 中使用 `@esmx/router-vue` 时，应用以下类型增强：

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

提供：
- 选项式 API 中的 `this.$router` 和 `this.$route`
- 模板中类型安全的全局 `RouterLink` 和 `RouterView` 组件

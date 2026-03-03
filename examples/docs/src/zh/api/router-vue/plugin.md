---
titleSuffix: "@esmx/router-vue — RouterPlugin"
description: "用于 @esmx/router 集成的 Vue 插件。全局注册 RouterLink 和 RouterView，兼容 Vue 2.7+ 和 Vue 3。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-vue, RouterPlugin, Vue 插件, Vue 2, Vue 3, install"
---

# RouterPlugin

## 简介

`@esmx/router-vue` 为 `@esmx/router` 提供 Vue 集成，提供插件、组合式函数和组件，实现 Vue 2.7+ 和 Vue 3 应用中的无缝路由。`RouterPlugin` 是将路由注册到 Vue 应用的入口。

## 类型定义

```ts
const RouterPlugin: {
    install(app: unknown): void;
};
```

Vue 插件，全局注册 `RouterLink` 和 `RouterView` 组件，并在 Vue 实例上设置 `$router` 和 `$route` 属性。

## 安装

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

## 行为

安装后，插件执行以下操作：

1. **注册全局组件**：`RouterLink` 和 `RouterView` 在所有模板中可用，无需显式导入
2. **设置实例属性**：配置 `$router` 和 `$route` 为响应式属性，可通过选项式 API 中的 `this.$router` 和 `this.$route` 访问
3. **Vue 2 兼容**：自动检测 Vue 版本并应用相应的设置机制（Vue 2 使用原型增强，Vue 3 使用 `globalProperties`）

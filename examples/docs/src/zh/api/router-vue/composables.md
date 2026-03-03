---
titleSuffix: "@esmx/router-vue — 组合式函数"
description: "@esmx/router-vue 的组合式 API 函数 — useRouter、useRoute、useProvideRouter、useLink 及选项式 API 辅助函数。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-vue, useRouter, useRoute, useProvideRouter, useLink, 组合式函数, 选项式 API"
---

# 组合式函数

## 简介

`@esmx/router-vue` 提供组合式 API 函数，用于在 Vue 组件中访问路由器和当前路由。这些组合式函数必须在 `setup()` 或其他组合式函数内部调用。对于选项式 API 用法，还提供了低级函数（`getRouter`、`getRoute`、`getRouterViewDepth`）。

## useProvideRouter()

- **参数**：
  - `router: Router` — 要提供的路由器实例
- **返回值**：`void`
- **异常**：`Error` — 如果在 `setup()` 外部调用

向所有后代组件提供路由器上下文。必须在根组件或父组件的 `setup()` 中调用。为路由器和当前路由设置响应式代理，确保 Vue 组件在路由变化时自动更新。

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

- **返回值**：`Router`
- **异常**：`Error` — 如果在 `setup()` 外部调用或未找到路由器上下文

在 Vue 组件的组合式 API 中获取路由器实例。必须在 `setup()` 内部调用。

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

- **返回值**：`Route`
- **异常**：`Error` — 如果在 `setup()` 外部调用或未找到路由器上下文

获取当前的响应式路由对象。路由变化时自动更新。

```vue
<template>
    <div>
        <h1>{{ route.meta?.title || '页面' }}</h1>
        <p>路径：{{ route.path }}</p>
        <p>参数：{{ JSON.stringify(route.params) }}</p>
        <p>查询：{{ JSON.stringify(route.query) }}</p>
    </div>
</template>

<script setup lang="ts">
import { useRoute } from '@esmx/router-vue';
import { watch } from 'vue';

const route = useRoute();

watch(() => route.path, (newPath) => {
    console.log('路由变更为：', newPath);
});
</script>
```

## useLink()

- **参数**：
  - `props: RouterLinkProps` — 链接配置
- **返回值**：`ComputedRef<RouterLinkResolved>`

为导航元素创建响应式链接辅助工具。返回一个计算引用，在路由变化时更新。

```vue
<template>
    <a
        v-bind="link.attributes"
        v-on="link.createEventHandlers()"
        :class="{ active: link.isActive }"
    >
        首页
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

- **返回值**：`number`
- **异常**：`Error` — 如果在 `setup()` 外部调用

获取当前 RouterView 的嵌套深度。根级别返回 `0`，第一层嵌套返回 `1`，以此类推。

```vue
<script setup lang="ts">
import { useRouterViewDepth } from '@esmx/router-vue';

const depth = useRouterViewDepth();
console.log('当前 RouterView 深度：', depth); // 0, 1, 2, 等
</script>
```

## 低级函数

### getRouter()

- **参数**：
  - `instance: VueInstance` — Vue 组件实例
- **返回值**：`Router`
- **异常**：`Error` — 如果未找到路由器上下文

从 Vue 组件实例获取路由器实例。在选项式 API 中使用此方法，在组合式 API 中使用 `useRouter()`。

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

- **参数**：
  - `instance: VueInstance` — Vue 组件实例
- **返回值**：`Route`
- **异常**：`Error` — 如果未找到路由器上下文

从 Vue 组件实例获取当前路由。在选项式 API 中使用此方法，在组合式 API 中使用 `useRoute()`。

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

- **参数**：
  - `instance: VueInstance` — Vue 组件实例
- **返回值**：`number`
- **异常**：`Error` — 如果未找到 RouterView 祖先

通过遍历父级链从 Vue 组件实例获取 RouterView 深度。在选项式 API 中使用此方法，在组合式 API 中使用 `useRouterViewDepth()`。

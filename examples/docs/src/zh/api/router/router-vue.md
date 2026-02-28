---
titleSuffix: "@esmx/router-vue API 参考"
description: "详细介绍 @esmx/router-vue 包的 API，包括 Vue 插件、组合式函数、组件以及 Vue 2 和 Vue 3 的类型增强。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-vue, API, Vue 插件, RouterView, RouterLink, useRouter, useRoute, Vue 组合式 API"
---

# @esmx/router-vue

## 简介

`@esmx/router-vue` 为 `@esmx/router` 提供 Vue 集成，提供插件、组合式函数和组件，实现 Vue 2.7+ 和 Vue 3 应用中的无缝路由。

## 插件

### RouterPlugin

- **类型定义**：
```ts
const RouterPlugin: {
    install(app: unknown): void;
};
```

Vue 插件，全局注册 `RouterLink` 和 `RouterView` 组件，并在 Vue 实例上设置 `$router` 和 `$route` 属性。

**Vue 3 安装**：
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

**Vue 2 安装**：
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

## 组合式函数

### useProvideRouter()

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

### useRouter()

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

### useRoute()

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

### useLink()

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

### useRouterViewDepth()

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

## 组件

### RouterView

- **组件名称**：`RouterView`

在当前深度渲染匹配的路由组件。通过 Vue 的 provide/inject 机制支持嵌套路由和自动深度跟踪。

```vue
<template>
    <div id="app">
        <nav>
            <RouterLink to="/">首页</RouterLink>
            <RouterLink to="/about">关于</RouterLink>
        </nav>

        <!-- 路由组件在此渲染 -->
        <RouterView />
    </div>
</template>
```

**嵌套路由**：
```vue
<!-- 父级布局组件 -->
<template>
    <div class="layout">
        <aside>
            <RouterLink to="/user/profile">个人资料</RouterLink>
            <RouterLink to="/user/settings">设置</RouterLink>
        </aside>
        <main>
            <!-- 嵌套路由组件在此渲染 -->
            <RouterView />
        </main>
    </div>
</template>
```

### RouterLink

- **组件名称**：`RouterLink`

导航链接组件，渲染带有适当导航行为和活跃状态管理的锚元素。

**Props**：

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `to` | `RouteLocationInput` | _必填_ | 目标路由位置 |
| `type` | `RouterLinkType` | `'push'` | 导航类型 |
| `replace` | `boolean` | `false` | _已弃用_ — 使用 `type="replace"` |
| `exact` | `RouteMatchType` | `'include'` | 活跃状态匹配策略 |
| `activeClass` | `string` | — | 活跃状态的自定义 CSS 类 |
| `event` | `string \| string[]` | `'click'` | 触发导航的事件 |
| `tag` | `string` | `'a'` | 要渲染的 HTML 标签 |
| `layerOptions` | `RouteLayerOptions` | — | `type='pushLayer'` 时的图层选项 |
| `beforeNavigate` | `Function` | — | 导航前的钩子 |

```vue
<template>
    <nav>
        <!-- 基本导航 -->
        <RouterLink to="/home">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>

        <!-- 自定义样式 -->
        <RouterLink to="/dashboard" active-class="nav-active">
            仪表盘
        </RouterLink>

        <!-- 替换导航 -->
        <RouterLink to="/login" type="replace">登录</RouterLink>

        <!-- 精确匹配和自定义标签 -->
        <RouterLink to="/contact" exact="exact" tag="button">
            联系我们
        </RouterLink>

        <!-- 在新窗口打开 -->
        <RouterLink to="/docs" type="pushWindow">
            文档
        </RouterLink>
    </nav>
</template>
```

## 类型增强

### Vue 2

在 Vue 2.7+ 中使用 `@esmx/router-vue` 时，以下属性在 Vue 组件实例上可用：

```ts
interface Vue {
    readonly $router: Router;
    readonly $route: Route;
}
```

### Vue 3

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

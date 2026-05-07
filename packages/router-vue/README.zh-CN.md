<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/router-vue</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/router-vue">
      <img src="https://img.shields.io/npm/v/@esmx/router-vue.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://esmx.dev/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/router-vue.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/router-vue">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/router-vue" alt="size" />
    </a>
  </div>
  
  <p><a href="https://github.com/esmnext/esmx/tree/master/packages/router">@esmx/router</a> 的 Vue 集成包，同时适用于 Vue 2.7+ 和 Vue 3 的通用路由器。</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/router-vue/README.md">English</a> | 中文
  </p>
</div>



## 🚀 特性

✨ **通用 Vue 支持** - 同时支持 Vue 2.7+ 和 Vue 3  
🎯 **组合式 API 优先** - 为现代 Vue 开发而构建  
🔗 **无缝集成** - Vue Router 的替代方案  
🚀 **TypeScript 支持** - 完整的 TypeScript 类型支持，出色的开发体验  
⚡ **高性能** - 针对生产环境优化  
🔄 **SSR 兼容** - 支持 SSR  

## 📦 安装

```bash
# npm
npm install @esmx/router @esmx/router-vue

# pnpm
pnpm add @esmx/router @esmx/router-vue

# yarn
yarn add @esmx/router @esmx/router-vue
```

## 🚀 快速开始

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

// 安装插件
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

// 安装插件
Vue.use(RouterPlugin);

new Vue({
  setup() {
    useProvideRouter(router);
  },
  render: h => h(App)
}).$mount('#app');
```

## 基础用法

### 模板用法

```vue
<template>
  <div id="app">
    <nav>
      <RouterLink to="/">首页</RouterLink>
      <RouterLink to="/about">关于</RouterLink>
      <RouterLink to="/users/123">用户资料</RouterLink>
    </nav>
    
    <!-- 路由组件将在这里渲染 -->
    <RouterView />
  </div>
</template>
```

### 组合式 API

```vue
<script setup lang="ts">
import { useRouter, useRoute } from '@esmx/router-vue';
import { watch } from 'vue';

const router = useRouter();
const route = useRoute();

// 编程式导航
const goToAbout = () => {
  router.push('/about');
};

const goBack = () => {
  router.back();
};

// 监听路由变化
watch(() => route.path, (newPath) => {
  // 处理路由变化逻辑
});
</script>

<template>
  <div>
    <h1>{{ route.meta?.title || '页面' }}</h1>
    <p>当前路径: {{ route.path }}</p>
    <p>路由参数: {{ JSON.stringify(route.params) }}</p>
    <p>查询参数: {{ JSON.stringify(route.query) }}</p>
    
    <button @click="goToAbout">前往关于页</button>
    <button @click="goBack">返回</button>
  </div>
</template>
```

### 选项式 API

```vue
<script>
import { defineComponent } from 'vue';
import { getRouter, getRoute } from '@esmx/router-vue';

export default defineComponent({
  mounted() {
    const router = getRouter(this);
    const route = getRoute(this);
    
    // 访问当前路由信息
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

## 📚 API 参考

### 组件

#### RouterLink

用于创建导航链接的组件。

**属性:**

| 属性 | 类型 | 默认值 | 描述 |
|------|------|---------|-------------|
| `to` | `string` \| `RouteLocationInput` | - | 目标路由位置 |
| `type` | `RouterLinkType` | `'push'` | 导航类型 (`'push'` \| `'replace'` \| `'pushWindow'` \| `'replaceWindow'` \| `'pushLayer'`) |
| `exact` | `RouteMatchType` | `'include'` | 激活状态匹配方式 (`'include'` \| `'exact'` \| `'route'`) |
| `activeClass` | `string` | - | 激活状态的 CSS 类名 |
| `event` | `string` \| `string[]` | `'click'` | 触发导航的事件 |
| `tag` | `string` | `'a'` | 要渲染的 HTML 标签 |
| `layerOptions` | `RouterLayerOptions` | - | 弹层导航选项 (与 `type="pushLayer"` 一起使用) |

**用法:**

```vue
<template>
  <!-- 基础链接 -->
  <RouterLink to="/home">首页</RouterLink>
  
  <!-- 替换导航 -->
  <RouterLink to="/login" type="replace">登录</RouterLink>
  
  <!-- 自定义样式 -->
  <RouterLink 
    to="/dashboard" 
    active-class="nav-active"
    exact="exact"
  >
    仪表板
  </RouterLink>
  
  <!-- 自定义标签 -->
  <RouterLink to="/submit" tag="button" class="btn">
    提交
  </RouterLink>
</template>
```

#### RouterView

渲染匹配路由组件的组件。

**用法:**

```vue
<template>
  <div>
    <!-- 根级路由在这里渲染 -->
    <RouterView />
    
    <!-- 嵌套路由会在子 RouterView 组件中渲染 -->
    <!-- 每个 RouterView 会自动处理正确的深度 -->
  </div>
</template>
```

### 组合式 API

#### useRouter()

获取用于导航的路由器实例。

```typescript
function useRouter(): Router
```

**用法:**

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

获取当前路由信息（响应式）。

```typescript
function useRoute(): Route
```

**用法:**

```vue
<script setup>
import { useRoute } from '@esmx/router-vue';

const route = useRoute();

// 访问路由属性
// route.path     - 当前路径
// route.params   - 路由参数  
// route.query    - 查询参数
// route.meta     - 路由元数据
</script>
```

#### useProvideRouter()

为子组件提供路由上下文。

```typescript
function useProvideRouter(router: Router): void
```

**用法:**

```typescript
import { Router, RouterMode } from '@esmx/router';
import { useProvideRouter } from '@esmx/router-vue';

const router = new Router({ 
  routes,
  mode: RouterMode.history
});

// 在应用的 setup 函数中
setup() {
  useProvideRouter(router);
}
```

#### useLink()

为自定义导航组件创建响应式链接助手。

```typescript
function useLink(props: RouterLinkProps): ComputedRef<RouterLinkResolved>
```

**用法:**

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
    v-on="link.createEventHandlers()"
    :class="{ active: link.isActive }"
  >
    自定义链接
  </a>
</template>
```

### 选项式 API

#### getRouter()

在选项式 API 组件中获取路由器实例。

```typescript
function getRouter(instance: VueInstance): Router
```

#### getRoute()

在选项式 API 组件中获取当前路由。

```typescript
function getRoute(instance: VueInstance): Route
```

### 插件

#### RouterPlugin

全局注册 RouterLink 和 RouterView 组件的 Vue 插件。

```typescript
const RouterPlugin = {
  install(app: App): void
}
```

**用法:**

```typescript
// Vue 3
app.use(RouterPlugin);

// Vue 2
Vue.use(RouterPlugin);
```

## 📝 TypeScript 支持

此包为 Vue 2.7+ 和 Vue 3 提供完整的 TypeScript 支持。对于选项式 API 用法，包会自动为 Vue 组件实例增强 `$router` 和 `$route` 属性，允许您在模板和组件方法中直接访问它们。

```typescript
// 选项式 API 类型增强（自动）
declare module 'vue/types/vue' {
  interface Vue {
    readonly $router: Router;
    readonly $route: Route;
  }
}
```

**选项式 API 用法:**

```vue
<template>
  <div>
    <!-- 直接访问，无需 'this.' -->
    <p>当前路径: {{ $route.path }}</p>
    <button @click="navigate">跳转到关于页面</button>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  methods: {
    navigate() {
      // TypeScript 能够识别 $router 和 $route
      this.$router.push('/about');
      // 访问当前路由: this.$route.path
    }
  }
});
</script>
```

## 高级用法

### 自定义链接组件

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
    v-on="link.createEventHandlers()"
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

### 组件中的路由守卫

```vue
<script setup>
import { useRouter, useRoute } from '@esmx/router-vue';
import { onMounted, onBeforeUnmount } from 'vue';

const router = useRouter();
const route = useRoute();

onMounted(() => {
  // 添加路由守卫
  const unregister = router.beforeEach((to, from) => {
    // 检查路由是否需要认证（isAuthenticated 是你的认证函数）
    if (to.meta?.requiresAuth && !isAuthenticated()) {
      return '/login';
    }
  });
  
  // 组件卸载时清理
  onBeforeUnmount(unregister);
});
</script>
```

## 从 Vue Router 迁移

### 主要差异

1. **路由器创建**: 使用 `@esmx/router` 的 `new Router()` 构造函数
2. **上下文提供**: 使用 `useProvideRouter()` 而非路由器安装
3. **组件注册**: 使用 `RouterPlugin` 进行全局组件注册

### 迁移示例

**之前 (Vue Router):**

```typescript
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes
});

app.use(router);
```

**之后 (@esmx/router-vue):**

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

## 🌐 浏览器支持

- **现代浏览器**：支持 ES 模块 (`import`/`export`) 和动态导入 (`import()`) 的浏览器

## 🤝 贡献

我们欢迎贡献！请随时提交 issues 和 pull requests。

## 📄 许可证

MIT © [Esmx 团队](https://github.com/esmnext/esmx)

## 相关包

- [@esmx/router](https://github.com/esmnext/esmx/tree/master/packages/router) - 核心路由包
- [@esmx/core](https://github.com/esmnext/esmx/tree/master/packages/core) - Esmx 核心框架

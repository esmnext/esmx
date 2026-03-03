---
titleSuffix: "Nested Routes"
description: "Learn how to use nested routes in @esmx/router to build layouts with child components, understand RouterView depth, and structure complex UIs."
head:
  - - "meta"
    - name: "keywords"
      content: "nested routes, children routes, RouterView, layout routes, route nesting, Vue RouterView, router view depth"
---

# 嵌套路由

实际应用的 UI 通常由多层嵌套的组件组成。布局包裹页面内容，或者页面拥有自己的子页面，这些都是非常常见的情况。`@esmx/router` 使用嵌套路由配置和 `RouterView` 组件来自然地表达这种关系。

## 基本嵌套

考虑一个带有导航栏和内容区域的布局，不同页面在内容区域中渲染：

```
┌──────────────────────────────────┐
│  Navigation Bar                  │
├──────────────────────────────────┤
│                                  │
│  <RouterView />                  │
│  (renders Home, About, etc.)     │
│                                  │
└──────────────────────────────────┘
```

这通过路由配置中的 `children` 来表达：

```ts
import type { RouteConfig } from '@esmx/router';

const routes: RouteConfig[] = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },         // matches /
      { path: 'about', component: About },   // matches /about
      { path: 'contact', component: Contact } // matches /contact
    ]
  }
];
```

`Layout` 组件使用 `RouterView` 来渲染匹配到的子路由：

```vue title="src/Layout.vue"
<template>
  <div class="layout">
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/contact">Contact</RouterLink>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>
```

当用户导航到 `/about` 时，`Layout` 组件保持挂载，只有 `RouterView` 的内容从 `Home` 切换为 `About`。

:::tip
注意，**空路径**（`''`）的子路由充当默认子路由。它在父路由路径完全匹配时匹配——在这个例子中是 `/`。
:::

## matched 的工作原理

当 URL 与嵌套路由匹配时，`route.matched` 数组包含所有匹配的路由配置，按**从父级到子级**的顺序排列：

```ts
// 路由配置
{
  path: '/',          // matched[] 中的索引 0
  component: Layout,
  children: [
    {
      path: 'users/:id',   // matched[] 中的索引 1
      component: UserProfile
    }
  ]
}

// 当 URL 为 /users/42 时：
route.matched[0]  // → Layout 路由配置
route.matched[1]  // → UserProfile 路由配置
route.matched.length  // 2
```

每个 `RouterView` 组件使用它在组件树中的深度来从 `matched[]` 中选取正确的条目。根级 `RouterView` 渲染 `matched[0]`，嵌套的 `RouterView` 渲染 `matched[1]`，依此类推。

## RouterView 组件

`RouterView` 从 `@esmx/router-vue` 导入。它渲染路由树中当前深度的组件：

```ts
import { RouterView } from '@esmx/router-vue';
```

或通过插件全局注册：

```ts
import { RouterPlugin } from '@esmx/router-vue';
app.use(RouterPlugin); // 全局注册 RouterView 和 RouterLink
```

`RouterView` 自动跟踪其嵌套深度。你不需要传递任何 props——它根据自身在组件层级中的位置，知道应该渲染哪个匹配的路由配置。

## 多级嵌套

路由可以嵌套到任意深度。每一级嵌套对应组件树中的一个 `RouterView`：

```ts
const routes: RouteConfig[] = [
  {
    path: '/',
    component: AppLayout,           // 深度 0
    children: [
      {
        path: 'users',
        component: UsersLayout,      // 深度 1
        children: [
          { path: '', component: UserList },         // 深度 2
          {
            path: ':id',
            component: UserDetailLayout,              // 深度 2
            children: [
              { path: '', component: UserProfile },   // 深度 3
              { path: 'posts', component: UserPosts } // 深度 3
            ]
          }
        ]
      }
    ]
  }
];
```

`/users/42/posts` 的组件树如下所示：

```
AppLayout                      ← matched[0]，由深度 0 的 RouterView 渲染
└── UsersLayout                ← matched[1]，由深度 1 的 RouterView 渲染
    └── UserDetailLayout       ← matched[2]，由深度 2 的 RouterView 渲染
        └── UserPosts          ← matched[3]，由深度 3 的 RouterView 渲染
```

每个布局组件包含一个 `RouterView`，用于渲染下一级：

```vue title="src/UsersLayout.vue"
<template>
  <div class="users-layout">
    <h1>Users</h1>
    <RouterView />
  </div>
</template>
```

```vue title="src/UserDetailLayout.vue"
<template>
  <div class="user-detail">
    <UserSidebar />
    <RouterView />
  </div>
</template>
```

## RouterView 深度

每个 `RouterView` 内部维护一个深度计数器。根级 `RouterView` 的深度为 0，每个嵌套的 `RouterView` 将深度加 1。这个深度决定了渲染 `route.matched` 数组中的哪个条目。

你可以使用 `useRouterViewDepth()` 访问当前深度：

```vue
<script setup lang="ts">
import { useRouterViewDepth } from '@esmx/router-vue';

const depth = useRouterViewDepth();
console.log('Current RouterView depth:', depth); // 0, 1, 2, etc.
</script>
```

- 深度 `0`：渲染 `route.matched[0].component`（根布局）
- 深度 `1`：渲染 `route.matched[1].component`（分区布局）
- 深度 `2`：渲染 `route.matched[2].component`（页面组件）
- 深度 `3`：渲染 `route.matched[3].component`（子页面组件）

这一切都是自动处理的——你很少需要直接与深度交互。它主要暴露用于高级用例，如构建自定义 `RouterView` 实现。

## 完整示例

这是一个带有三级布局结构的完整示例：

### 路由配置

```ts title="src/routes.ts"
import type { RouteConfig } from '@esmx/router';

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: HomePage },
      { path: 'about', component: AboutPage },
      {
        path: 'users',
        component: UsersSection,
        children: [
          { path: '', component: UserList },
          {
            path: ':id',
            component: UserProfile,
            children: [
              { path: '', component: UserOverview },
              { path: 'settings', component: UserSettings }
            ]
          }
        ]
      }
    ]
  }
];
```

### 布局组件

```vue title="src/MainLayout.vue"
<template>
  <div class="app">
    <header>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/users">Users</RouterLink>
    </header>

    <RouterView />

    <footer>© 2024</footer>
  </div>
</template>
```

```vue title="src/UsersSection.vue"
<template>
  <div class="users-section">
    <aside>
      <h2>Users</h2>
      <UserNavigation />
    </aside>

    <div class="users-content">
      <RouterView />
    </div>
  </div>
</template>
```

```vue title="src/UserProfile.vue"
<template>
  <div class="user-profile">
    <h2>User {{ route.params.id }}</h2>
    <nav>
      <RouterLink :to="`/users/${route.params.id}`">Overview</RouterLink>
      <RouterLink :to="`/users/${route.params.id}/settings`">Settings</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '@esmx/router-vue';
const route = useRoute();
</script>
```

### 导航结果

| URL | 渲染的组件 |
|-----|-------------------|
| `/` | MainLayout → HomePage |
| `/about` | MainLayout → AboutPage |
| `/users` | MainLayout → UsersSection → UserList |
| `/users/42` | MainLayout → UsersSection → UserProfile → UserOverview |
| `/users/42/settings` | MainLayout → UsersSection → UserProfile → UserSettings |

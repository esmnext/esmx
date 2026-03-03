---
titleSuffix: "Route Config API Reference"
description: "Complete API reference for @esmx/router RouteConfig — defining routes with paths, components, children, redirects, guards, and micro-app bindings."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx route config, route definition, nested routes, dynamic routes, route redirect, async component, micro-app routing"
---

# RouteConfig

`RouteConfig` 定义 URL 如何映射到组件或微应用。它支持静态和动态路径、嵌套路由、重定向、异步组件、单路由守卫和微应用绑定。

## 类型定义

- **类型定义**：
```ts
interface RouteConfig {
  path: string;
  component?: unknown;
  children?: RouteConfig[];
  redirect?: RouteLocationInput | RouteConfirmHook;
  meta?: RouteMeta;
  app?: string | RouterMicroAppCallback;
  asyncComponent?: () => Promise<unknown>;
  beforeEnter?: RouteConfirmHook;
  beforeUpdate?: RouteConfirmHook;
  beforeLeave?: RouteConfirmHook;
  layer?: boolean;
  override?: RouteConfirmHook;
}
```

## 属性

### path

- **类型**：`string`

**必填。** URL 编码的路径模式。支持静态段和通过 [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) 语法的动态参数。

```ts
// 静态路径
{ path: '/about' }

// 动态参数
{ path: '/user/:id' }

// 可选参数
{ path: '/post/:id?' }

// 通配符（匹配所有）
{ path: '/files/:path*' }

// 多个参数
{ path: '/blog/:year/:month/:slug' }
```

#### 参数类型

- `/user/:id` — 例如 `/user/42` → `{ id: '42' }`
- `/post/:id?` — 例如 `/post` → `{ id: '' }`
- `/files/:path*` — 例如 `/files/a/b/c` → `{ path: ['a', 'b', 'c'] }`
- `/:lang/docs/:page` — 例如 `/en/docs/intro` → `{ lang: 'en', page: 'intro' }`

### component

- **类型**：`unknown`

当此路由匹配时要渲染的组件。类型取决于所使用的框架（React 组件、Vue 组件等）。

```ts
{ path: '/home', component: HomePage }
```

### children

- **类型**：`RouteConfig[]`

嵌套子路由。子路由路径相对于父级解析。

```ts
{
  path: '/user/:id',
  component: UserLayout,
  children: [
    { path: '', component: UserProfile },       // /user/:id
    { path: 'posts', component: UserPosts },     // /user/:id/posts
    { path: 'settings', component: UserSettings } // /user/:id/settings
  ]
}
```

### redirect

- **类型**：`RouteLocationInput | RouteConfirmHook`

当此路由匹配时重定向到另一个路由。可以是静态目标（字符串或对象）或用于条件重定向的函数。

```ts
// 静态重定向
{ path: '/old-page', redirect: '/new-page' }

// 带查询参数的对象重定向
{ path: '/old-page', redirect: { path: '/new-page', query: { ref: 'redirect' } } }

// 条件重定向
{
  path: '/dashboard',
  redirect: (to, from, router) => {
    if (!isAuthenticated()) return '/login';
    // 返回 void 以正常继续到该路由
  }
}
```

### meta

- **类型**：`RouteMeta`

附加到路由的自定义元数据。可通过守卫和组件中的 `route.meta` 访问。类型：`Record<string | symbol, unknown>`。

```ts
{
  path: '/admin',
  component: AdminPanel,
  meta: {
    requiresAuth: true,
    roles: ['admin'],
    title: 'Admin Panel'
  }
}
```

### app

- **类型**：`string | RouterMicroAppCallback`

将此路由（及其子路由）绑定到一个[微应用](./micro-app)。当提供 `string` 时，在 [`RouterOptions.apps`](./router#apps) 中查找应用。当提供函数时，直接用作工厂函数。

```ts
// 字符串键（在 router.options.apps 中查找）
{
  path: '/react',
  app: 'reactApp',
  children: [
    { path: '', component: ReactHome },
    { path: 'about', component: ReactAbout }
  ]
}

// 内联工厂函数
{
  path: '/vue',
  app: (router) => ({
    mount: (el) => { /* ... */ },
    unmount: () => { /* ... */ }
  })
}
```

### asyncComponent

- **类型**：`() => Promise<unknown>`

懒加载组件。组件仅在路由首次匹配时获取。加载完成后，它会替换 `component` 属性。

```ts
{
  path: '/heavy-page',
  asyncComponent: () => import('./pages/HeavyPage')
}
```

### beforeEnter

- **类型**：`RouteConfirmHook`

进入此路由前调用的守卫。仅在从不同路由进入时触发（当路由因参数不同而被复用时不触发）。

```ts
{
  path: '/admin',
  beforeEnter: (to, from, router) => {
    if (!hasAdminRole()) return '/unauthorized';
  }
}
```

### beforeUpdate

- **类型**：`RouteConfirmHook`

当路由被复用但参数发生变化时调用的守卫。例如，从 `/user/1` 导航到 `/user/2`。仅在相同路由配置匹配但参数不同时触发。

```ts
{
  path: '/user/:id',
  beforeUpdate: (to, from, router) => {
    console.log(`User changed: ${from?.params.id} → ${to.params.id}`);
  }
}
```

### beforeLeave

- **类型**：`RouteConfirmHook`

离开此路由前调用的守卫。返回 `false` 可阻止导航。适用于在有未保存更改时阻止导航。

```ts
{
  path: '/editor',
  beforeLeave: (to, from, router) => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm('Discard changes?');
      if (!confirmed) return false; // 取消导航
    }
  }
}
```

### layer

- **类型**：`boolean`

将此路由标记为仅分层（`true`）或非分层（`false`）。分层路由仅在使用 [`pushLayer()`](./router#pushlayer) 导航时匹配。

```ts
// 仅在 pushLayer() 上下文中匹配
{
  path: '/preview/:id',
  component: PreviewModal,
  layer: true
}
```

### override

- **类型**：`RouteConfirmHook`

用于混合应用开发的路由覆写函数。允许拦截导航以在外部处理（例如原生应用桥接）。**不在**初始路由加载期间执行。

```ts
{
  path: '/native-feature',
  override: (to, from) => {
    if (isInNativeApp()) {
      return () => JSBridge.openNative(to.path);
    }
    // 返回 void 以使用默认路由
  }
}
```

## 完整示例

```ts
const routes: RouteConfig[] = [
  {
    path: '/',
    app: 'dashboard',
    children: [
      { path: '', component: DashboardHome }
    ]
  },
  {
    path: '/react',
    app: 'react',
    children: [
      { path: '', component: ReactHome },
      { path: 'about', component: ReactAbout }
    ]
  },
  {
    path: '/admin',
    app: 'admin',
    meta: { requiresAuth: true },
    beforeEnter: (to) => {
      if (!isAdmin()) return '/login';
    },
    children: [
      { path: '', component: AdminDashboard },
      { path: 'users/:id', component: AdminUserDetail },
      {
        path: 'settings',
        component: AdminSettings,
        beforeLeave: () => {
          if (hasUnsavedChanges()) return false;
        }
      }
    ]
  },
  {
    path: '/preview/:id',
    component: PreviewModal,
    layer: true
  },
  {
    path: '/docs',
    asyncComponent: () => import('./pages/DocsPage')
  }
];
```

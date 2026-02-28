---
titleSuffix: "路由配置 API 参考"
description: "详细介绍 @esmx/router 路由配置的 API，包括路由定义、动态片段、嵌套路由、重定向和路由匹配。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 路由配置, API, 动态路由, 嵌套路由, 重定向, 路由匹配, 通配符"
---

# 路由配置

## 简介

路由配置定义了 `@esmx/router` 中 URL 路径与组件之间的映射关系。支持动态片段、嵌套路由、重定向、懒加载和路由级导航守卫。

## 类型定义

### RouteConfig

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

#### path

- **类型**：`string`
- **必填**：`true`

路由的 URL 路径模式。支持动态片段和通配符：

```ts
// 静态路径
{ path: '/about' }

// 动态片段
{ path: '/user/:id' }

// 多个动态片段
{ path: '/post/:year/:month/:slug' }

// 通配符（捕获所有）
{ path: '/files/*' }

// 可选片段
{ path: '/user/:id?' }
```

#### component

- **类型**：`unknown`

路由匹配时要渲染的组件。具体类型取决于使用的框架。

```ts
import Home from './Home.vue';

{ path: '/', component: Home }
```

#### asyncComponent

- **类型**：`() => Promise<unknown>`

懒加载组件函数。组件在路由首次匹配时按需加载。

```ts
{
    path: '/dashboard',
    asyncComponent: () => import('./Dashboard.vue')
}
```

#### children

- **类型**：`RouteConfig[]`

嵌套子路由配置。子路径相对于父路径。

```ts
{
    path: '/user',
    component: UserLayout,
    children: [
        { path: '', component: UserList },
        { path: ':id', component: UserDetail },
        { path: ':id/edit', component: UserEdit }
    ]
}
```

#### redirect

- **类型**：`RouteLocationInput | RouteConfirmHook`

此路由的重定向目标。可以是静态位置或动态函数。

```ts
// 静态重定向
{ path: '/old', redirect: '/new' }

// 动态重定向
{
    path: '/user',
    redirect: (to, from, router) => {
        return '/user/' + getDefaultUserId();
    }
}
```

#### meta

- **类型**：`RouteMeta`（`Record<string | symbol, unknown>`）

附加到路由的自定义元数据。可在守卫和组件中通过 `route.meta` 访问。

```ts
{
    path: '/admin',
    component: Admin,
    meta: {
        requiresAuth: true,
        title: '管理面板',
        permissions: ['admin']
    }
}
```

#### app

- **类型**：`string | RouterMicroAppCallback`

微应用标识符或工厂函数。在多应用路由中用于选择处理路由的应用。

```ts
// 引用命名应用的字符串
{ path: '/app1/*', app: 'app1' }

// 工厂函数
{
    path: '/embedded/*',
    app: (router) => ({
        mount(el) { /* 挂载应用 */ },
        unmount() { /* 清理 */ }
    })
}
```

#### beforeEnter

- **类型**：`RouteConfirmHook`

进入路由前调用的路由级导航守卫。详情请参阅[导航守卫](./navigation-guards.md)。

```ts
{
    path: '/admin',
    component: Admin,
    beforeEnter: (to, from, router) => {
        if (!isAdmin()) return '/login';
    }
}
```

#### beforeUpdate

- **类型**：`RouteConfirmHook`

当路由被复用但参数改变时调用的路由级守卫。

#### beforeLeave

- **类型**：`RouteConfirmHook`

离开此路由前调用的路由级守卫。

#### layer

- **类型**：`boolean`

为 `true` 时，此路由仅在图层模式下匹配。为 `false` 时，此路由不参与图层匹配。

```ts
// 仅作为图层可用
{ path: '/dialog/select', component: SelectDialog, layer: true }

// 永远不作为图层
{ path: '/main', component: MainPage, layer: false }
```

#### override

- **类型**：`RouteConfirmHook`

用于混合应用开发的路由覆盖函数。返回一个处理函数以覆盖默认路由行为，或返回 `void` 使用默认行为。在初始路由加载期间不执行。

```ts
{
    path: '/native-page',
    override: (to, from) => {
        if (isInApp()) {
            return () => JSBridge.openNative();
        }
    }
}
```

### RouteParsedConfig

- **类型定义**：
```ts
interface RouteParsedConfig extends RouteConfig {
    compilePath: string;
    children: RouteParsedConfig[];
    match: MatchFunction;
    compile: (params?: Record<string, string>) => string;
}
```

路由配置的内部解析形式，由路由器处理后使用。在 `RouteConfig` 基础上扩展：
- `compilePath`：编译后的路径模式
- `children`：解析后的子配置
- `match`：来自 `path-to-regexp` 的路径匹配函数
- `compile`：用于从参数生成 URL 的路径编译函数

### RouteMatchResult

- **类型定义**：
```ts
interface RouteMatchResult {
    readonly matches: readonly RouteParsedConfig[];
    readonly params: Record<string, string | string[]>;
}
```

路由匹配的结果：
- `matches`：从父到子匹配的路由配置数组
- `params`：提取的动态参数

### RouteMatcher

- **类型定义**：
```ts
type RouteMatcher = (
    to: URL,
    base: URL,
    cb?: (item: RouteParsedConfig) => boolean
) => RouteMatchResult;
```

路由匹配函数类型。接受目标 URL、基础 URL 和可选的过滤回调来决定匹配哪些路由。

## 动态片段

动态片段使用 `:param` 语法，匹配任意路径段：

```ts
const routes = [
    // 匹配 /user/1, /user/abc 等
    { path: '/user/:id', component: User },

    // 多个片段
    { path: '/post/:year/:month/:day', component: Post },

    // 通配符捕获所有
    { path: '/docs/*', component: DocsPage }
];
```

参数通过 `route.params` 访问：

```ts
// URL: /user/42
route.params.id // '42'

// URL: /post/2024/01/15
route.params.year  // '2024'
route.params.month // '01'
route.params.day   // '15'
```

## 完整示例

```ts
import { Router } from '@esmx/router';

const router = new Router({
    routes: [
        {
            path: '/',
            component: Layout,
            children: [
                { path: '', component: Home },
                {
                    path: 'user/:id',
                    component: UserDetail,
                    meta: { requiresAuth: true },
                    beforeEnter: (to) => {
                        if (!isLoggedIn()) return '/login';
                    }
                },
                {
                    path: 'settings',
                    asyncComponent: () => import('./Settings.vue'),
                    beforeLeave: (to, from) => {
                        if (hasUnsavedChanges()) return false;
                    }
                }
            ]
        },
        { path: '/login', component: Login },
        { path: '/old-page', redirect: '/new-page' }
    ]
});
```

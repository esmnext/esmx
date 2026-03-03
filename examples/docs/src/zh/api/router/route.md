---
titleSuffix: "Route 对象 API 参考"
description: "详细介绍 @esmx/router Route 类的 API，包括路由属性、路由类型、位置接口和路由状态管理。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Route, API, 路由对象, 路由参数, 路由查询, 路由匹配, 路由元信息"
---

# Route

## 简介

Route 类表示 `@esmx/router` 中已解析的路由对象。每次导航都会产生一个 Route 实例，包含匹配路径、参数、查询字符串和关联元数据的完整信息。

## 类型定义

### RouteType

- **类型定义**：
```ts
enum RouteType {
    push = 'push',
    replace = 'replace',
    restartApp = 'restartApp',
    go = 'go',
    forward = 'forward',
    back = 'back',
    unknown = 'unknown',
    pushWindow = 'pushWindow',
    replaceWindow = 'replaceWindow',
    pushLayer = 'pushLayer'
}
```

表示导航的触发方式：
- `push`：标准前进导航（添加历史记录）
- `replace`：替换当前历史记录
- `restartApp`：应用重启导航
- `go`：通过 `router.go()` 的编程式历史遍历
- `forward`：通过 `router.forward()` 的前进导航
- `back`：通过 `router.back()` 的后退导航
- `unknown`：由浏览器 popstate 事件触发的导航
- `pushWindow`：在新窗口中打开导航
- `replaceWindow`：替换当前窗口位置
- `pushLayer`：在图层中打开导航

### RouteLocation

- **类型定义**：
```ts
interface RouteLocation {
    path?: string;
    url?: string | URL;
    params?: Record<string, string>;
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[] | undefined>;
    hash?: string;
    state?: RouteState;
    keepScrollPosition?: boolean;
    statusCode?: number | null;
    layer?: RouteLayerOptions | null;
    confirm?: RouteConfirmHook | null;
}
```

用于编程式导航的路由位置对象：
- `path`：路由路径
- `url`：完整 URL 字符串或 URL 对象
- `params`：动态片段的路由参数
- `query`：查询字符串参数（单值）
- `queryArray`：查询字符串参数（重复键的数组值）
- `hash`：URL 哈希片段
- `state`：持久化到历史记录中的自定义状态数据
- `keepScrollPosition`：为 `true` 时，导航后保持当前滚动位置
- `statusCode`：服务端响应的 HTTP 状态码
- `layer`：图层配置选项
- `confirm`：自定义确认处理器，覆盖默认的路由过渡逻辑

### RouteLocationInput

- **类型定义**：
```ts
type RouteLocationInput = RouteLocation | string;
```

导航方法的输入类型。可以是简单的路径字符串或 `RouteLocation` 对象。

```ts
// 字符串简写
router.push('/user/123');

// 对象形式
router.push({
    path: '/user',
    query: { id: '123' },
    hash: '#profile'
});
```

## 实例属性

### type

- **类型**：`RouteType`
- **只读**：`true`

创建此路由的导航类型。

### path

- **类型**：`string`
- **只读**：`true`

相对于路由器基础路径的路径。对于匹配的路由，这是移除基础前缀后的路径。对于未匹配的路由，等同于完整路径名。

```ts
// 基础 URL 为 'https://example.com/app/'
// 导航到 '/app/user/123'
route.path // '/user/123'
```

### fullPath

- **类型**：`string`
- **只读**：`true`

包含查询字符串和哈希的完整路径。

```ts
route.fullPath // '/user/123?tab=profile#bio'
```

### url

- **类型**：`URL`
- **只读**：`true`

此路由的完整 URL 对象。

```ts
route.url.href     // 'https://example.com/app/user/123?tab=profile#bio'
route.url.pathname // '/app/user/123'
route.url.origin   // 'https://example.com'
```

### params

- **类型**：`Record<string, string>`
- **只读**：`true`

从路径中提取的动态路由参数。对于多匹配参数，包含第一个值。

```ts
// 路由配置：{ path: '/user/:id' }
// URL：'/user/123'
route.params // { id: '123' }
```

### paramsArray

- **类型**：`Record<string, string[]>`
- **只读**：`true`

数组形式的动态路由参数，适用于可匹配多个片段的参数。

### query

- **类型**：`Record<string, string | undefined>`
- **只读**：`true`

解析后的查询字符串参数。对于重复的键，包含第一个值。

```ts
// URL：'/search?q=vue&page=1'
route.query // { q: 'vue', page: '1' }
```

### queryArray

- **类型**：`Record<string, string[] | undefined>`
- **只读**：`true`

数组形式的查询字符串参数，适用于重复的查询键。

```ts
// URL：'/filter?tag=vue&tag=react'
route.queryArray // { tag: ['vue', 'react'] }
```

### hash

- **类型**：`string`
- **只读**：`true`

URL 哈希片段（包含 `#` 前缀）。

```ts
// URL：'/page#section-2'
route.hash // '#section-2'
```

### meta

- **类型**：`RouteMeta`
- **只读**：`true`

来自匹配路由配置的路由元数据。如果没有匹配路由则返回空对象。

```ts
// 路由配置：{ path: '/admin', meta: { requiresAuth: true } }
route.meta // { requiresAuth: true }
```

### matched

- **类型**：`readonly RouteParsedConfig[]`
- **只读**：`true`

从父到子匹配的路由配置数组。如果没有匹配路由则为空数组。

```ts
// 嵌套路由：/user/profile
route.matched // [userConfig, profileConfig]
route.matched.length // 2
```

### config

- **类型**：`RouteParsedConfig | null`
- **只读**：`true`

最后（最深层）匹配的路由配置。如果没有匹配路由则为 `null`。

```ts
if (route.config) {
    console.log('匹配的路由路径：', route.config.path);
}
```

### state

- **类型**：`RouteState`
- **只读**：`true`

与此路由关联的自定义状态数据，持久化在浏览器历史记录中。

```ts
// 携带状态导航
router.push({ path: '/checkout', state: { cartId: 'abc' } });

// 访问状态
route.state // { cartId: 'abc' }
```

### keepScrollPosition

- **类型**：`boolean`
- **只读**：`true`

导航是否应保持当前滚动位置而不是滚动到顶部。

### isPush

- **类型**：`boolean`
- **只读**：`true`

此路由是否由推入式导航创建（`push`、`pushWindow`、`pushLayer`）。

### statusCode

- **类型**：`number | null`
- **只读**：`true`

服务端渲染重定向的 HTTP 状态码。

### req

- **类型**：`IncomingMessage | null`
- **只读**：`true`

Node.js HTTP 请求对象（SSR 期间可用）。

### res

- **类型**：`ServerResponse | null`
- **只读**：`true`

Node.js HTTP 响应对象（SSR 期间可用）。

### context

- **类型**：`Record<string | symbol, any>`
- **只读**：`true`

来自路由器选项的共享上下文对象。

## 实例方法

### clone()

- **返回值**：`Route`

创建当前路由实例的副本，保留相同的配置和状态。

```ts
const routeCopy = route.clone();
```

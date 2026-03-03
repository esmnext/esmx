---
titleSuffix: "Route API Reference"
description: "Complete API reference for the @esmx/router Route object — represents a resolved route location with path, params, query, meta, and matched config."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx route, route object, route params, route query, route matching, route meta, SSR route"
---

# Route

Route 对象表示一个已解析的路由位置。它包含解析后的 URL 信息、匹配的路由配置、参数、查询字符串和元数据。Route 对象是不可变的——每次导航都会创建一个新的对象。

## 属性

### path

- **类型**：`string`
- **只读**：`true`

相对于路由器基础路径的解码后路径名。对于未匹配的路由，返回完整的 `url.pathname`。

```ts
// With base: http://localhost/app/
// URL: http://localhost/app/user/123
route.path // '/user/123'
```

### fullPath

- **类型**：`string`
- **只读**：`true`

包含搜索参数和哈希的完整路径：`path + search + hash`。

```ts
route.fullPath // '/user/123?tab=posts#section'
```

### url

- **类型**：`URL`
- **只读**：`true`

完整的已解析 URL 对象。

```ts
route.url.href     // 'http://localhost/user/123?tab=posts#section'
route.url.pathname // '/user/123'
route.url.origin   // 'http://localhost'
```

### pathname

- **类型**：`string`
- **只读**：`true`

`url.pathname` 的别名。原始 URL 路径名（未解码，未去除基础路径）。

```ts
route.pathname // '/app/user/123'
route.path     // '/user/123' (已去除基础路径并解码)
```

### href

- **类型**：`string`
- **只读**：`true`

`url.href` 的别名。完整的 URL 字符串。

```ts
route.href // 'http://localhost/user/123?tab=posts#section'
```

### params

- **类型**：`Record<string, string>`
- **只读**：`true`

从路径中提取的动态路由参数。对于重复参数，返回第一个匹配项。

```ts
// Route: /user/:id
// URL: /user/42
route.params.id // '42'

// Route: /blog/:year/:month/:slug
// URL: /blog/2026/02/hello
route.params.year  // '2026'
route.params.month // '02'
route.params.slug  // 'hello'
```

### paramsArray

- **类型**：`Record<string, string[]>`
- **只读**：`true`

与 `params` 相同，但始终返回数组。适用于重复参数。

### query

- **类型**：`Record<string, string | undefined>`
- **只读**：`true`

解析后的 URL 查询参数。对于重复的键，返回第一个值。

```ts
// URL: /search?q=hello&page=2
route.query.q    // 'hello'
route.query.page // '2'
```

### queryArray

- **类型**：`Record<string, string[] | undefined>`
- **只读**：`true`

与 `query` 相同，但始终返回数组。适用于重复的查询键。

```ts
// URL: /filter?tag=js&tag=ts
route.queryArray.tag // ['js', 'ts']
```

### hash

- **类型**：`string`
- **只读**：`true`

URL 哈希值（包含 `#` 前缀）。

```ts
// URL: /page#section
route.hash // '#section'
```

### meta

- **类型**：`RouteMeta`
- **只读**：`true`

来自匹配的[路由配置](./route-config#meta)的自定义元数据。如果没有路由匹配，返回 `{}`。

```ts
// Route config: { path: '/admin', meta: { requiresAuth: true } }
route.meta.requiresAuth // true
```

### matched

- **类型**：`readonly RouteParsedConfig[]`
- **只读**：`true`

所有匹配的路由配置数组，从父级到子级排列。如果没有路由匹配，返回空数组。

```ts
// URL: /user/123 matching /user/:id
route.matched.length  // 1（嵌套路由时可能更多）
route.matched[0].path // '/user/:id'
```

### config

- **类型**：`RouteParsedConfig | null`
- **只读**：`true`

最后一个（最深层）匹配的路由配置，如果没有路由匹配则为 `null`。

### type

- **类型**：`RouteType`
- **只读**：`true`

此路由是如何被导航到的。所有可能的值请参见 [`RouteType`](./types#routetype)。

- `RouteType.push`：由 `router.push()` 触发
- `RouteType.replace`：由 `router.replace()` 触发
- `RouteType.back`：由 `router.back()` 触发
- `RouteType.forward`：由 `router.forward()` 触发
- `RouteType.go`：由 `router.go(n)` 触发
- `RouteType.restartApp`：由 `router.restartApp()` 触发
- `RouteType.pushWindow`：由 `router.pushWindow()` 触发
- `RouteType.replaceWindow`：由 `router.replaceWindow()` 触发
- `RouteType.pushLayer`：由 `router.pushLayer()` 触发
- `RouteType.unknown`：由浏览器 popstate 事件触发

### state

- **类型**：`RouteState`
- **只读**：`true`

与此次导航关联的任意状态数据，通过 [`RouteLocation.state`](./types#routelocation) 传递。

```ts
await router.push({ path: '/page', state: { scrollY: 100 } });
// 下一个路由：
router.route.state.scrollY // 100
```

### statusCode

- **类型**：`number | null`
- **只读**：`true`

用于 SSR 响应的 HTTP 状态码。通过 [`RouteLocation.statusCode`](./types#routelocation) 设置。

```ts
// 在重定向路由中
{ path: '/old', redirect: { path: '/new', statusCode: 301 } }
```

### isPush

- **类型**：`boolean`
- **只读**：`true`

此次导航是否添加了新的历史条目（类型为 `'push'`、`'pushWindow'` 或 `'pushLayer'`）。

### keepScrollPosition

- **类型**：`boolean`
- **只读**：`true`

此次导航后是否应保持滚动位置。为 `true` 时，路由器不会滚动到顶部。

### layer

- **类型**：`RouteLayerOptions | null`
- **只读**：`true`

如果此路由是通过 [`pushLayer()`](./router#pushlayer) 导航到的，则为分层选项，否则为 `null`。

### confirm

- **类型**：`RouteConfirmHook | null`
- **只读**：`true`

通过 [`RouteLocation.confirm`](./types#routelocation) 传递的单次导航确认钩子。

### req

- **类型**：`IncomingMessage | null`
- **只读**：`true`

HTTP 请求对象（仅 SSR）。在浏览器中为 `null`。

### res

- **类型**：`ServerResponse | null`
- **只读**：`true`

HTTP 响应对象（仅 SSR）。在浏览器中为 `null`。

### context

- **类型**：`Record<string | symbol, unknown>`
- **只读**：`true`

Router 共享上下文对象。

## 方法

### clone()

- **返回值**：`Route`

创建此路由的副本，具有相同的配置和状态。

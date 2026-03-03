---
titleSuffix: "Router API Reference"
description: "Complete API reference for the @esmx/router Router class — the central controller for route management, navigation, micro-app orchestration, and layer routing in both browser and SSR environments."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router, SPA routing, micro-frontend router, SSR router, framework-agnostic router, navigation API, TypeScript router"
---

# Router

Router 实例用于管理路由匹配、导航、微应用生命周期、导航守卫和分层路由。可在浏览器和 Node.js（SSR）环境中工作。

## 构造函数

### new Router(options)

创建一个新的 Router 实例。

- **参数**：
  - `options: RouterOptions` - Router 配置对象

```ts
import { Router, RouterMode } from '@esmx/router';

const router = new Router({
  root: '#app',
  mode: RouterMode.history,
  routes: [
    { path: '/', component: HomePage },
    { path: '/about', component: AboutPage }
  ]
});
```

## RouterOptions

初始化 Router 实例的选项。

### root

- **类型**：`string | HTMLElement`
- **默认值**：`'#root'`

挂载微应用的 DOM 元素或 CSS 选择器。支持 ID、类名或属性选择器。

```ts
// 使用 ID 选择器
new Router({ root: '#app' });

// 使用类选择器
new Router({ root: '.app-container' });

// 使用属性选择器
new Router({ root: '[data-router-mount]' });

// 直接传入 DOM 元素
const element = document.getElementById('app');
new Router({ root: element });
```

### mode

- **类型**：`RouterMode`
- **默认值**：`RouterMode.history`

路由器使用的历史模式。

- `RouterMode.history`：使用浏览器 History API（`pushState`/`popState`）。适用于有服务器支持的生产应用
- `RouterMode.memory`：内存中的历史栈，不改变 URL。适用于 SSR、测试、分层路由

### routes

- **类型**：`RouteConfig[]`
- **默认值**：`[]`

应添加到路由器的初始路由列表。详见 [路由配置](./route-config)。

### base

- **类型**：`URL`

路由解析的基础 URL。在浏览器中可选（默认为 `window.location`），在服务端**必需**。

```ts
// 服务端渲染
const router = new Router({
  base: new URL(`http://localhost${req.url}`),
  mode: RouterMode.memory,
  req,
  res,
  routes,
  apps
});
```

### apps

- **类型**：`RouterMicroApp`

微应用工厂函数。将字符串键映射到创建微应用生命周期处理器的工厂函数。详见 [微应用](./micro-app)。

```ts
const router = new Router({
  apps: {
    react: (router) => ({
      mount: (el) => { /* 挂载 React 应用 */ },
      unmount: () => { /* 清理 */ },
      renderToString: async () => '<div>SSR HTML</div>'
    }),
    vue: (router) => createVueApp(router)
  }
});
```

### context

- **类型**：`Record<string | symbol, unknown>`
- **默认值**：`{}`

共享上下文对象，可通过 `router.context` 从所有路由访问。适用于依赖注入（服务、状态管理等）。

### data

- **类型**：`Record<string | symbol, unknown>`
- **默认值**：`{}`

共享数据对象，可通过 `router.data` 访问。与 `context` 类似，但用于可变的共享状态。

### req

- **类型**：`IncomingMessage | null`

Node.js HTTP 请求对象。用于服务端渲染期间访问请求头、URL 等。

### res

- **类型**：`ServerResponse | null`

Node.js HTTP 响应对象。用于服务端渲染期间设置状态码、响应头等。

### normalizeURL

- **类型**：`(to: URL, from: URL | null) => URL`

路由匹配前调用的 URL 规范化函数。适用于去除尾部斜杠、强制小写路径或其他 URL 转换。

```ts
new Router({
  normalizeURL: (to, from) => {
    // 去除尾部斜杠
    if (to.pathname.endsWith('/') && to.pathname !== '/') {
      to.pathname = to.pathname.slice(0, -1);
    }
    return to;
  }
});
```

### fallback

- **类型**：`RouteHandleHook`

当没有路由匹配目标 URL 时，或在 `pushWindow`/`replaceWindow` 导航类型时调用。用于处理 404 页面或外部导航。

```ts
new Router({
  fallback: (to, from, router) => {
    console.log('No route matched:', to.path);
    // 你可以重定向到 404 页面
  }
});
```

### nextTick

- **类型**：`() => Awaitable<void>`

自定义的 `nextTick` 实现，在路由过渡确认后调用。适用于框架特定的 DOM 更新时序（例如 Vue 的 `nextTick`）。

### rootStyle

- **类型**：`Partial<CSSStyleDeclaration> | false | null`

创建分层路由器时应用于根元素的 CSS 样式。设置为 `false` 或 `null` 以禁用自动样式。

### layer

- **类型**：`boolean`

内部属性。此路由器实例是否作为分层（覆盖层/模态框）路由器运行。由 [`createLayer()`](#createlayer) 自动设置。

### zIndex

- **类型**：`number`
- **默认值**：`1000`

分层覆盖层的基础 z-index 值。分层从此值自动递增。

### handleBackBoundary

- **类型**：`(router: Router) => void`

当在历史栈起始位置调用 `back()` 时触发（没有更多历史记录可回退）。适用于关闭应用或导航到父级上下文。

### handleLayerClose

- **类型**：`(router: Router, data?: any) => void`

内部属性。分层路由器关闭时调用。由 [`createLayer()`](#createlayer) 自动设置。

## 属性

### route

- **类型**：`Route`
- **只读**：`true`

当前活跃的 [Route](./route)。在首次导航之前访问会抛出错误。

```ts
console.log(router.route.path);    // '/about'
console.log(router.route.params);  // { id: '123' }
console.log(router.route.query);   // { page: '1' }
```

### options

- **类型**：`RouterOptions`
- **只读**：`true`

传递给 Router 构造函数的原始选项。

### parsedOptions

- **类型**：`RouterParsedOptions`
- **只读**：`true`

解析和编译后的选项，包括 `compiledRoutes`（带编译匹配器的路由配置）和 `matcher` 函数。

### isLayer

- **类型**：`boolean`
- **只读**：`true`

此路由器实例是否是通过 [`createLayer()`](#createlayer) 创建的分层（覆盖层/模态框）路由器。

### navigation

- **类型**：`Navigation`
- **只读**：`true`

管理历史栈的内部导航控制器（浏览器 History API 或 MemoryHistory）。

### microApp

- **类型**：`MicroApp`
- **只读**：`true`

处理微应用间挂载/卸载过渡的内部微应用生命周期管理器。

### mode

- **类型**：`RouterMode`
- **只读**：`true`

当前路由器模式（`'history'` 或 `'memory'`）。

### base

- **类型**：`URL`
- **只读**：`true`

用于路由解析的基础 URL。

### root

- **类型**：`HTMLElement`
- **只读**：`true`

挂载微应用的根 DOM 元素。

### context

- **类型**：`Record<string | symbol, unknown>`
- **只读**：`true`

通过 [`RouterOptions.context`](#context) 提供的共享上下文对象。

### data

- **类型**：`Record<string | symbol, unknown>`
- **只读**：`true`

通过 [`RouterOptions.data`](#data) 提供的共享数据对象。

### req

- **类型**：`IncomingMessage | null`
- **只读**：`true`

HTTP 请求对象（仅 SSR）。在浏览器中为 `null`。

### res

- **类型**：`ServerResponse | null`
- **只读**：`true`

HTTP 响应对象（仅 SSR）。在浏览器中为 `null`。

## 方法

### push()

- **参数**：
  - `to: RouteLocationInput` - 要导航到的路由位置
- **返回值**：`Promise<Route>`

通过在历史栈中推入一个条目来编程式导航到新 URL。在完整的[导航守卫管线](./navigation-guards)完成后，解析为目标 [Route](./route)。

```ts
// 字符串路径
await router.push('/user/123');

// 带查询和哈希的对象
await router.push({
  path: '/search',
  query: { q: 'hello' },
  hash: '#results'
});

// 带路由状态
await router.push({
  path: '/user/123',
  state: { fromDashboard: true }
});
```

### replace()

- **参数**：
  - `to: RouteLocationInput` - 要导航到的路由位置
- **返回值**：`Promise<Route>`

通过替换历史栈中的当前条目来编程式导航到新 URL。与 `push` 不同，这不会创建新的历史条目——按下后退按钮不会返回当前页面。

```ts
// 登录后替换（防止返回到登录页）
await router.replace('/dashboard');
```

### back()

- **返回值**：`Promise<Route | null>`

如果可能，通过调用 `navigation.back()` 在历史中后退一步。等同于 `router.go(-1)`。如果在历史栈起始位置，调用 [`handleBackBoundary`](#handlebackboundary)。如果导航未发生，返回 `null`。

### forward()

- **返回值**：`Promise<Route | null>`

如果可能，在历史中前进一步。等同于 `router.go(1)`。如果导航未发生，返回 `null`。

### go()

- **参数**：
  - `index: number` - 相对于当前页面在历史栈中的位置
- **返回值**：`Promise<Route | null>`

导航到历史栈中相对于当前页面的特定位置。`go(0)` 返回 `null`（无操作）。负值后退，正值前进。

```ts
await router.go(-2); // 后退 2 步
await router.go(1);  // 前进 1 步
```

### pushWindow()

- **参数**：
  - `to: RouteLocationInput` - 要导航到的路由位置
- **返回值**：`Promise<Route>`

导航到一个用于新窗口/标签页上下文的路由。触发 [`fallback`](#fallback) 处理器，而不是执行页面内导航。

### replaceWindow()

- **参数**：
  - `to: RouteLocationInput` - 要导航到的路由位置
- **返回值**：`Promise<Route>`

导航到一个用于替换当前窗口上下文的路由。触发 [`fallback`](#fallback) 处理器。

### restartApp()

- **参数**：
  - `to: RouteLocationInput` - 可选的路由位置（默认为当前路由）
- **返回值**：`Promise<Route>`

强制重启当前微应用。即使应用键未变化，也执行完整的卸载 → 挂载周期。如果未提供 `to`，则在当前路由重启。

```ts
// 在当前路由重启
await router.restartApp();

// 在不同路由重启
await router.restartApp('/dashboard');
```

### resolve()

- **参数**：
  - `to: RouteLocationInput` - 目标路由位置
  - `toType: RouteType` - 可选的路由类型
- **返回值**：`Route`

返回给定位置的 [Route](./route) 而不执行导航。适用于生成 URL、预检查匹配或获取路由元数据。

```ts
const route = router.resolve('/user/123');
console.log(route.url.href);     // 完整 URL
console.log(route.params);       // { id: '123' }
console.log(route.matched);      // 匹配的路由配置
```

### isRouteMatched()

- **参数**：
  - `toRoute: Route` - 要与当前路由比较的路由
  - `matchType: RouteMatchType` - 匹配策略（默认：`'include'`）
- **返回值**：`boolean`

检查路由是否与当前路由匹配。

匹配类型：
- `'route'`：相同的路由配置（相同的 `RouteConfig` 引用）
- `'exact'`：路径精确匹配
- `'include'`：当前路径以目标路径开头

```ts
const aboutRoute = router.resolve('/about');

router.isRouteMatched(aboutRoute, 'exact');   // 当在 /about 时为 true
router.isRouteMatched(aboutRoute, 'include'); // 当在 /about 或 /about/team 时为 true
```

### beforeEach()

- **参数**：
  - `guard: RouteConfirmHook` - 要添加的导航守卫
- **返回值**：`() => void`

添加一个在任何导航之前执行的导航守卫。返回一个移除已注册守卫的函数。

```ts
const removeGuard = router.beforeEach((to, from, router) => {
  if (!isAuthenticated && to.path !== '/login') {
    return '/login'; // 重定向
  }
  // 返回 void 继续，返回 false 取消
});

// 之后：移除守卫
removeGuard();
```

### afterEach()

- **参数**：
  - `guard: RouteNotifyHook` - 要添加的导航钩子
- **返回值**：`() => void`

添加一个在每次导航后执行的导航钩子。返回一个移除已注册钩子的函数。不能修改导航。

```ts
router.afterEach((to, from, router) => {
  document.title = to.meta.title || 'My App';
  analytics.trackPageView(to.path);
});
```

详见[导航守卫](./navigation-guards)了解守卫类型和导航管线的完整信息。

### resolveLink()

- **参数**：
  - `props: RouterLinkProps` - 链接配置
- **返回值**：`RouterLinkResolved`

将路由器链接配置解析为完整的链接数据，包括 HTML 属性、激活状态和事件处理器。用于构建框架特定的链接组件。

详见 [RouterLink](./router-link) 了解完整细节和框架示例。

### createLayer()

- **参数**：
  - `to: RouteLocationInput` - 要在分层中打开的路由位置
- **返回值**：`Promise<{ promise: Promise<RouteLayerResult>; router: Router }>`

创建一个具有自己导航栈的分层（覆盖层/模态框）路由器。返回分层路由器实例和一个在分层关闭时解析的 Promise。

返回一个包含以下内容的对象：
- `router` — 分层 Router 实例
- `promise` — 一个在分层关闭时解析的 `Promise<RouteLayerResult>`

详见[分层系统](./layer)了解完整信息。

### pushLayer()

- **参数**：
  - `to: RouteLocationInput` - 要在分层中打开的路由位置
- **返回值**：`Promise<RouteLayerResult>`

创建分层并等待其结果的简写方式。将 `createLayer()` 合并为单次调用。

```ts
const result = await router.pushLayer('/modal/confirm');

if (result.type === 'success') {
  console.log('User confirmed:', result.data);
} else if (result.type === 'close') {
  console.log('User dismissed');
}
```

### closeLayer()

- **参数**：
  - `data: any` - 可选的返回给父路由器的数据。提供时，分层结果类型为 `'success'`

关闭当前分层路由器。仅在 `router.isLayer` 为 `true` 时有效。

### renderToString()

- **参数**：
  - `throwError: boolean` - 如果为 `true`，抛出错误而不是记录日志（默认：`false`）
- **返回值**：`Promise<string | null>`

将当前微应用渲染为 HTML 字符串，用于服务端渲染。调用匹配的微应用的 `renderToString()` 方法。返回渲染的 HTML 字符串，如果没有挂载微应用则返回 `null`。

```ts
// 服务端渲染
await router.push(req.url);
const html = await router.renderToString();
```

### destroy()

销毁路由器实例，清理所有事件监听器、导航守卫、历史状态和微应用实例。当你不再需要路由器时调用此方法。

```ts
router.destroy();
```

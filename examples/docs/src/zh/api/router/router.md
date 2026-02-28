---
titleSuffix: "Router 类 API 参考"
description: "详细介绍 @esmx/router Router 类的 API，包括构造选项、实例属性、导航方法、守卫注册和生命周期管理。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Router, API, 导航, 路由守卫, SPA 路由, history 模式, memory 模式"
---

# Router

## 简介

Router 类是 `@esmx/router` 的核心，提供完整的客户端路由能力，包括导航、路由匹配、守卫管理和图层路由。

## 类型定义

### RouterMode

- **类型定义**：
```ts
enum RouterMode {
    history = 'history',
    memory = 'memory'
}
```

路由器运行模式：
- `history`：使用浏览器 History API 进行导航，适用于标准 Web 应用
- `memory`：使用内存历史记录，适用于 SSR、测试或图层路由场景

### RouterOptions

- **类型定义**：
```ts
interface RouterOptions {
    root?: string | HTMLElement;
    context?: Record<string | symbol, unknown>;
    data?: Record<string | symbol, unknown>;
    routes?: RouteConfig[];
    mode?: RouterMode;
    base?: URL;
    req?: IncomingMessage | null;
    res?: ServerResponse | null;
    apps?: RouterMicroApp;
    normalizeURL?: (to: URL, from: URL | null) => URL;
    fallback?: RouteHandleHook;
    nextTick?: () => Awaitable<void>;
    rootStyle?: Partial<CSSStyleDeclaration> | false | null;
    layer?: boolean;
    zIndex?: number;
    handleBackBoundary?: (router: Router) => void;
    handleLayerClose?: (router: Router, data?: any) => void;
}
```

路由器配置选项：
- `root`：应用挂载容器，可以是 CSS 选择器字符串或 HTMLElement，默认为 `'#root'`
- `context`：跨路由共享的上下文对象
- `data`：跨路由共享的数据对象
- `routes`：路由配置对象数组
- `mode`：路由模式，浏览器中默认为 `RouterMode.history`，服务端默认为 `RouterMode.memory`
- `base`：应用的基础 URL；浏览器中可选（使用 `location.origin`），服务端必需
- `req`：Node.js IncomingMessage，用于服务端路由
- `res`：Node.js ServerResponse，用于服务端路由
- `apps`：微应用配置，用于多应用路由
- `normalizeURL`：自定义 URL 规范化函数
- `fallback`：未匹配路由或外部导航的回退处理器
- `nextTick`：自定义 next-tick 函数，用于异步调度
- `rootStyle`：根元素的自定义样式，设置为 `false` 或 `null` 可禁用
- `layer`：此路由器实例是否为图层路由器
- `zIndex`：图层路由的基础 z-index（默认：`10000`）
- `handleBackBoundary`：当后退导航没有更多历史记录时调用的处理器
- `handleLayerClose`：当图层关闭时调用的处理器

## 实例属性

### route

- **类型**：`Route`
- **只读**：`true`
- **异常**：`Error` — 当没有活跃路由时

获取当前活跃的路由对象。

```ts
const currentRoute = router.route;
console.log(currentRoute.path);    // '/user/123'
console.log(currentRoute.params);  // { id: '123' }
```

### root

- **类型**：`string | HTMLElement`
- **只读**：`true`

获取配置的根元素或选择器。

### mode

- **类型**：`RouterMode`
- **只读**：`true`

获取当前路由模式（`'history'` 或 `'memory'`）。

### base

- **类型**：`URL`
- **只读**：`true`

获取路由器的基础 URL 对象。

### isLayer

- **类型**：`boolean`
- **只读**：`true`

此路由器实例是否作为图层运行。

### req

- **类型**：`IncomingMessage | null`
- **只读**：`true`

获取 Node.js 请求对象（仅服务端）。

### res

- **类型**：`ServerResponse | null`
- **只读**：`true`

获取 Node.js 响应对象（仅服务端）。

## 实例方法

### constructor()

- **参数**：
  - `options: RouterOptions` — 路由器配置选项
- **返回值**：`Router`

创建一个新的 Router 实例。

```ts
import { Router, RouterMode } from '@esmx/router';

const router = new Router({
    mode: RouterMode.history,
    routes: [
        { path: '/', component: Home },
        { path: '/about', component: About }
    ]
});
```

### push()

- **参数**：
  - `toInput: RouteLocationInput` — 目标路由位置
- **返回值**：`Promise<Route>`

导航到新路由，在历史栈中添加一条记录。

```ts
// 通过路径字符串导航
await router.push('/user/123');

// 通过路由位置对象导航
await router.push({
    path: '/user',
    query: { id: '123' }
});

// 携带状态导航
await router.push({
    path: '/dashboard',
    state: { fromLogin: true }
});
```

### replace()

- **参数**：
  - `toInput: RouteLocationInput` — 目标路由位置
- **返回值**：`Promise<Route>`

导航到新路由，替换当前历史记录。

```ts
await router.replace('/login');
```

### back()

- **返回值**：`Promise<Route | null>`

在历史记录中后退。如果没有历史记录则返回 `null`。当没有后退历史时，会调用 `handleBackBoundary`。

```ts
await router.back();
```

### forward()

- **返回值**：`Promise<Route | null>`

在历史记录中前进。如果没有前进历史记录则返回 `null`。

```ts
await router.forward();
```

### go()

- **参数**：
  - `index: number` — 步数（正数前进，负数后退）
- **返回值**：`Promise<Route | null>`

导航到历史记录中的指定位置。如果位置不存在则返回 `null`。`go(0)` 直接返回 `null`，不会刷新。

```ts
// 后退 2 步
await router.go(-2);

// 前进 1 步
await router.go(1);
```

### pushWindow()

- **参数**：
  - `toInput: RouteLocationInput` — 目标路由位置
- **返回值**：`Promise<Route>`

在新浏览器窗口中导航到路由。

```ts
await router.pushWindow('/external-page');
```

### replaceWindow()

- **参数**：
  - `toInput: RouteLocationInput` — 目标路由位置
- **返回值**：`Promise<Route>`

导航到路由，替换当前浏览器窗口位置。

```ts
await router.replaceWindow('/new-location');
```

### restartApp()

- **参数**：
  - `toInput?: RouteLocationInput` — 可选的目标路由，默认为当前路由
- **返回值**：`Promise<Route>`

通过重新初始化路由来重启微应用。

```ts
// 在当前路由重启应用
await router.restartApp();

// 在不同路由重启应用
await router.restartApp('/home');
```

### resolve()

- **参数**：
  - `toInput: RouteLocationInput` — 目标路由位置
  - `toType?: RouteType` — 可选的路由类型
- **返回值**：`Route`

解析路由位置但不执行实际导航。适用于生成 URL、预检查路由匹配和获取路由信息。

```ts
// 解析字符串路径
const route = router.resolve('/user/123');
console.log(route.url.href);

// 检查路由有效性
const testRoute = router.resolve('/some/path');
if (testRoute.matched.length > 0) {
    // 路由匹配成功
}
```

### isRouteMatched()

- **参数**：
  - `toRoute: Route` — 要比较的目标路由
  - `matchType?: RouteMatchType` — 匹配类型（默认：`'include'`）
- **返回值**：`boolean`

检查路由是否匹配当前路由。

```ts
const targetRoute = router.resolve('/user');

// 包含匹配（默认）
router.isRouteMatched(targetRoute, 'include');

// 精确路径匹配
router.isRouteMatched(targetRoute, 'exact');

// 路由配置匹配
router.isRouteMatched(targetRoute, 'route');
```

### resolveLink()

- **参数**：
  - `props: RouterLinkProps` — 链接配置属性
- **返回值**：`RouterLinkResolved`

解析路由器链接配置并返回完整的链接数据，包括属性、活跃状态和导航处理器。详情请参阅 [RouterLink API](./router-link.md)。

```ts
const linkData = router.resolveLink({
    to: '/user/123',
    type: 'push'
});

console.log(linkData.attributes.href);
console.log(linkData.isActive);
```

### beforeEach()

- **参数**：
  - `guard: RouteConfirmHook` — 导航守卫函数
- **返回值**：`() => void` — 取消注册函数

注册全局前置导航守卫。详情请参阅[导航守卫](./navigation-guards.md)。

```ts
const unregister = router.beforeEach((to, from, router) => {
    if (to.meta.requiresAuth && !isLoggedIn()) {
        return '/login';
    }
});

// 稍后移除守卫
unregister();
```

### afterEach()

- **参数**：
  - `guard: RouteNotifyHook` — 通知钩子函数
- **返回值**：`() => void` — 取消注册函数

注册全局后置导航钩子。与守卫不同，后置钩子不能取消或重定向导航。

```ts
const unregister = router.afterEach((to, from, router) => {
    document.title = to.meta.title || 'My App';
});
```

### createLayer()

- **参数**：
  - `toInput: RouteLocationInput` — 图层的目标路由位置
- **返回值**：`Promise<{ promise: Promise<RouteLayerResult>; router: Router }>`

创建图层路由实例。图层在覆盖层中提供隔离的导航。详情请参阅[图层路由](./layer.md)。

```ts
const { promise, router: layerRouter } = await router.createLayer('/dialog');

const result = await promise;
if (result.type === 'success') {
    console.log('图层返回的数据：', result.data);
}
```

### pushLayer()

- **参数**：
  - `toInput: RouteLocationInput` — 目标路由位置
- **返回值**：`Promise<RouteLayerResult>`

以图层方式导航到路由并返回图层结果。

```ts
const result = await router.pushLayer({
    path: '/select-user',
    layer: { autoPush: true }
});
```

### closeLayer()

- **参数**：
  - `data?: any` — 返回给父路由器的可选数据
- **返回值**：`void`

关闭当前图层路由器。仅在路由器为图层实例时有效。

```ts
// 不携带数据关闭
router.closeLayer();

// 携带返回数据关闭
router.closeLayer({ selectedUserId: 42 });
```

### destroy()

- **返回值**：`void`

销毁路由器实例，清理所有资源，包括导航监听器、过渡和微应用实例。

```ts
router.destroy();
```

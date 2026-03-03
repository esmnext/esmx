---
titleSuffix: "Router Types Reference"
description: "Complete TypeScript type reference for @esmx/router — all exported types, enums, and interfaces."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router types, TypeScript types, router enums, route interfaces, type definitions"
---

# 类型

`@esmx/router` 的完整 TypeScript 类型参考。

## 枚举

### RouterMode

- **类型定义**：
```ts
enum RouterMode {
  history = 'history',
  memory = 'memory'
}
```

- `history`：使用浏览器 History API，URL 变化在地址栏中可见
- `memory`：内存栈，无 URL 变化。用于 SSR、测试和[层](./layer)

### RouteType

路由过渡的发起方式。

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

## 工具类型

### Awaitable

- **类型定义**：
```ts
type Awaitable<T> = T | Promise<T>;
```

一个可以是同步值或 Promise 的值。

### RouteMeta

- **类型定义**：
```ts
type RouteMeta = Record<string | symbol, unknown>;
```

附加到路由配置的自定义元数据。通过 [`route.meta`](./route#meta) 访问。

### RouteState

- **类型定义**：
```ts
type RouteState = Record<string, unknown>;
```

与导航条目关联的状态数据。通过 [`route.state`](./route#state) 访问。

### RouteHandleResult

- **类型定义**：
```ts
type RouteHandleResult = unknown | null | void;
```

### RouteMatchType

- **类型定义**：
```ts
type RouteMatchType = 'route' | 'exact' | 'include';
```

- `'route'`：相同的路由配置引用
- `'exact'`：路径完全相同
- `'include'`：当前路径以目标路径开头

## 钩子类型

### RouteConfirmHook

可以修改导航流程的守卫钩子。

- **类型定义**：
```ts
type RouteConfirmHook = (
  to: Route,
  from: Route | null,
  router: Router
) => Awaitable<RouteConfirmHookResult>;
```

### RouteConfirmHookResult

- **类型定义**：
```ts
type RouteConfirmHookResult =
  | void              // Continue navigation
  | false             // Cancel navigation
  | RouteLocationInput // Redirect to another route
  | RouteHandleHook;   // Custom handler
```

### RouteHandleHook

- **类型定义**：
```ts
type RouteHandleHook = (
  to: Route,
  from: Route | null,
  router: Router
) => Awaitable<RouteHandleResult>;
```

### RouteVerifyHook

- **类型定义**：
```ts
type RouteVerifyHook = (
  to: Route,
  from: Route | null,
  router: Router
) => Awaitable<boolean>;
```

由 [`RouteLayerOptions.keepAlive`](./layer#keepalive) 使用，用于确定层是否应保持打开。

### RouteNotifyHook

导航后钩子。不能修改导航——仅用于副作用。

- **类型定义**：
```ts
type RouteNotifyHook = (
  to: Route,
  from: Route | null,
  router: Router
) => void;
```

## 路由位置类型

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

- `path`：URL 路径
- `url`：完整 URL（`path` 的替代方式）
- `params`：路由参数
- `query`：查询参数
- `queryArray`：查询参数（数组形式）
- `hash`：URL 哈希
- `state`：任意状态数据
- `keepScrollPosition`：导航后保持滚动位置
- `statusCode`：HTTP 状态码（SSR）
- `layer`：[层选项](./layer#routelayeroptions)
- `confirm`：每次导航的 confirm 钩子

### RouteLocationInput

- **类型定义**：
```ts
type RouteLocationInput = RouteLocation | string;
```

路由位置可以指定为字符串路径或 [`RouteLocation`](#routelocation) 对象。

## 路由配置类型

### RouteConfig

详情请参阅[路由配置](./route-config)。

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

### RouteParsedConfig

带有匹配器函数的编译后路由配置。扩展 `RouteConfig` 并包含内部匹配数据。

- **类型定义**：
```ts
interface RouteParsedConfig extends RouteConfig {
  compilePath: string;
  children: RouteParsedConfig[];
  match: MatchFunction;
  compile: (params?: Record<string, string>) => string;
}
```

### RouteMatchResult

- **类型定义**：
```ts
interface RouteMatchResult {
  readonly matches: readonly RouteParsedConfig[];
  readonly params: Record<string, string | string[]>;
}
```

### RouteMatcher

- **类型定义**：
```ts
type RouteMatcher = (
  to: URL,
  base: URL,
  cb?: (item: RouteParsedConfig) => boolean
) => RouteMatchResult;
```

内部用于路由匹配的函数。可选的 `cb` 回调可以过滤路由配置（例如排除仅限层的路由）。

### RouteOptions

创建 Route 对象的构造函数选项（主要供内部使用）。

- **类型定义**：
```ts
interface RouteOptions {
  options?: RouterParsedOptions;
  toType?: RouteType;
  toInput?: RouteLocationInput;
  from?: URL | null;
}
```

## 微应用类型

### RouterMicroAppOptions

- **类型定义**：
```ts
interface RouterMicroAppOptions {
  mount: (el: HTMLElement) => void;
  unmount: () => void;
  renderToString?: () => Awaitable<string>;
}
```

详情请参阅[微应用](./micro-app)。

### RouterMicroAppCallback

- **类型定义**：
```ts
type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;
```

### RouterMicroApp

- **类型定义**：
```ts
type RouterMicroApp =
  | Record<string, RouterMicroAppCallback | undefined>
  | RouterMicroAppCallback;
```

## Router 选项类型

### RouterOptions

详情请参阅 [Router](./router#routeroptions)。

### RouterParsedOptions

- **类型定义**：
```ts
interface RouterParsedOptions extends Readonly<Required<RouterOptions>> {
  readonly compiledRoutes: readonly RouteParsedConfig[];
  readonly matcher: RouteMatcher;
}
```

## 层类型

### RouteLayerOptions

详情请参阅[层](./layer#routelayeroptions)。

- **类型定义**：
```ts
interface RouteLayerOptions {
  zIndex?: number;
  keepAlive?: 'exact' | 'include' | RouteVerifyHook;
  autoPush?: boolean;
  push?: boolean;
  routerOptions?: RouterLayerOptions;
}
```

### RouteLayerResult

- **类型定义**：
```ts
type RouteLayerResult =
  | { type: 'close'; route: Route }
  | { type: 'push'; route: Route }
  | { type: 'success'; route: Route; data?: any };
```

- `close`：层被关闭
- `push`：层因用户导航到非层路由而关闭
- `success`：层通过 `closeLayer(data)` 携带数据关闭

### RouterLayerOptions

- **类型定义**：
```ts
type RouterLayerOptions = Omit<
  RouterOptions,
  'handleBackBoundary' | 'handleLayerClose' | 'layer'
>;
```

## RouterLink 类型

### RouterLinkType

- **类型定义**：
```ts
type RouterLinkType =
  | 'push'
  | 'replace'
  | 'pushWindow'
  | 'replaceWindow'
  | 'pushLayer';
```

### RouterLinkProps

详情请参阅 [RouterLink](./router-link#routerlinkprops)。

- **类型定义**：
```ts
interface RouterLinkProps {
  to: RouteLocationInput;
  type?: RouterLinkType;
  replace?: boolean; // @deprecated — use type='replace'
  exact?: RouteMatchType;
  activeClass?: string;
  event?: string | string[];
  tag?: string;
  layerOptions?: RouteLayerOptions;
  beforeNavigate?: (event: Event, eventName: string) => void;
}
```

### RouterLinkAttributes

- **类型定义**：
```ts
interface RouterLinkAttributes {
  href: string;
  class: string;
  target?: '_blank';
  rel?: string;
}
```

### RouterLinkResolved

详情请参阅 [RouterLink](./router-link#routerlinkresolved)。

- **类型定义**：
```ts
interface RouterLinkResolved {
  route: Route;
  type: RouterLinkType;
  isActive: boolean;
  isExactActive: boolean;
  isExternal: boolean;
  tag: string;
  attributes: RouterLinkAttributes;
  navigate: (e: Event) => Promise<void>;
  createEventHandlers: (
    format?: (eventType: string) => string
  ) => Record<string, (e: Event) => Promise<void>>;
}
```

## 错误类型

所有错误类型都继承自 `RouteError`。

### RouteError

- **类型定义**：
```ts
class RouteError extends Error {
  readonly code: string;
  readonly to: Route;
  readonly from: Route | null;
}
```

所有路由错误的基类。

### RouteNavigationAbortedError

- **类型定义**：
```ts
class RouteNavigationAbortedError extends RouteError {
  readonly taskName: string;
}
```

当导航被守卫返回 `false` 取消时抛出。错误代码：`'ROUTE_NAVIGATION_ABORTED'`。

### RouteSelfRedirectionError

- **类型定义**：
```ts
class RouteSelfRedirectionError extends RouteError {}
```

当检测到重定向循环（重定向到相同路由）时抛出。错误代码：`'ROUTE_SELF_REDIRECTION'`。

### RouteTaskCancelledError

- **类型定义**：
```ts
class RouteTaskCancelledError extends RouteError {
  readonly taskName: string;
}
```

当导航任务被更新的导航取消时抛出。错误代码：`'ROUTE_TASK_CANCELLED'`。

### RouteTaskExecutionError

- **类型定义**：
```ts
class RouteTaskExecutionError extends RouteError {
  readonly taskName: string;
  readonly originalError: Error;
}
```

当守卫在执行期间抛出错误时触发。错误代码：`'ROUTE_TASK_EXECUTION_ERROR'`。

## 已弃用类型

- `RouterInstance`：请使用 `Router` 代替
- `RouterRawLocation`：请使用 `RouteLocationInput` 代替
- `RouterLocation`：请使用 `RouteLocation` 代替
- `RouteRecord`：请使用 `Route` 代替

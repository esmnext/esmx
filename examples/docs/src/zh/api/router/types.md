---
titleSuffix: "类型参考"
description: "全面的 @esmx/router 和 @esmx/router-vue 类型参考，包括所有导出类型、枚举、接口和已弃用类型。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 路由类型, API, TypeScript, RouteMeta, RouteState, RouterMicroApp, 类型参考"
---

# 类型参考

## 简介

本页面提供 `@esmx/router` 和 `@esmx/router-vue` 导出的所有类型的完整列表。

## 核心枚举

### RouterMode

```ts
enum RouterMode {
    history = 'history',
    memory = 'memory'
}
```

路由器运行模式：
- `history`：使用浏览器 History API
- `memory`：使用内存历史栈

### RouteType

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

触发路由创建的导航类型。详情请参阅 [Route](./route.md#routetype)。

## 基础数据类型

### RouteMeta

```ts
type RouteMeta = Record<string | symbol, unknown>;
```

自定义路由元数据类型。用于向路由配置附加任意数据，可通过 `route.meta` 访问。

```ts
const routes = [
    {
        path: '/admin',
        meta: {
            requiresAuth: true,
            title: '管理面板',
            [Symbol('internal')]: 'data'
        }
    }
];
```

### RouteState

```ts
type RouteState = Record<string, unknown>;
```

路由状态类型。用于在浏览器历史状态中持久化自定义数据。

```ts
router.push({
    path: '/page',
    state: { scrollY: 100, formData: { name: 'John' } }
});
```

### RouteHandleResult

```ts
type RouteHandleResult = unknown | null | void;
```

路由处理钩子的返回类型。结果可通过 `route.handleResult` 访问。

### RouteMatchType

```ts
type RouteMatchType = 'route' | 'exact' | 'include';
```

路由匹配策略：
- `'route'`：路由级匹配 — 比较路由配置是否相同
- `'exact'`：精确匹配 — 比较路径是否完全相同
- `'include'`：包含匹配 — 检查当前路径是否包含目标路径

### Awaitable

```ts
type Awaitable<T> = T | Promise<T>;
```

工具类型，表示可以是同步值或 Promise 的值。

## 路由位置类型

### RouteLocation

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

用于导航的路由位置对象。详情请参阅 [Route](./route.md#routelocation)。

### RouteLocationInput

```ts
type RouteLocationInput = RouteLocation | string;
```

导航方法的输入类型。可以是字符串路径或 `RouteLocation` 对象。

## 路由配置类型

### RouteConfig

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

路由配置接口。详情请参阅[路由配置](./route-config.md)。

### RouteParsedConfig

```ts
interface RouteParsedConfig extends RouteConfig {
    compilePath: string;
    children: RouteParsedConfig[];
    match: MatchFunction;
    compile: (params?: Record<string, string>) => string;
}
```

内部解析的路由配置，包含编译后的匹配和编译函数。

### RouteMatchResult

```ts
interface RouteMatchResult {
    readonly matches: readonly RouteParsedConfig[];
    readonly params: Record<string, string | string[]>;
}
```

路由匹配操作的结果。

### RouteMatcher

```ts
type RouteMatcher = (
    to: URL,
    base: URL,
    cb?: (item: RouteParsedConfig) => boolean
) => RouteMatchResult;
```

路由匹配函数类型。

## 钩子类型

### RouteConfirmHook

```ts
type RouteConfirmHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<RouteConfirmHookResult>;
```

确认守卫，可以批准、取消或重定向导航。

### RouteConfirmHookResult

```ts
type RouteConfirmHookResult =
    | void
    | false
    | RouteLocationInput
    | RouteHandleHook;
```

确认钩子的返回类型。

### RouteNotifyHook

```ts
type RouteNotifyHook = (
    to: Route,
    from: Route | null,
    router: Router
) => void;
```

导航完成后调用的通知钩子。

### RouteVerifyHook

```ts
type RouteVerifyHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<boolean>;
```

返回布尔值结果的验证钩子。

### RouteHandleHook

```ts
type RouteHandleHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<RouteHandleResult>;
```

用于自定义路由处理逻辑的处理钩子。

## 路由器核心类型

### RouterOptions

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

路由器构造选项。详情请参阅 [Router](./router.md#routeroptions)。

### RouterParsedOptions

```ts
interface RouterParsedOptions extends Readonly<Required<RouterOptions>> {
    readonly compiledRoutes: readonly RouteParsedConfig[];
    readonly matcher: RouteMatcher;
}
```

完全解析的路由器选项，包含编译后的路由和匹配器。

## RouterLink 类型

### RouterLinkType

```ts
type RouterLinkType =
    | 'push'
    | 'replace'
    | 'pushWindow'
    | 'replaceWindow'
    | 'pushLayer';
```

链接的导航类型。

### RouterLinkProps

```ts
interface RouterLinkProps {
    to: RouteLocationInput;
    type?: RouterLinkType;
    replace?: boolean;
    exact?: RouteMatchType;
    activeClass?: string;
    event?: string | string[];
    tag?: string;
    layerOptions?: RouteLayerOptions;
    beforeNavigate?: (event: Event, eventName: string) => void;
}
```

链接配置属性。详情请参阅 [RouterLink](./router-link.md#routerlinkprops)。

### RouterLinkAttributes

```ts
interface RouterLinkAttributes {
    href: string;
    class: string;
    target?: '_blank';
    rel?: string;
}
```

为链接元素生成的 HTML 属性。

### RouterLinkResolved

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

解析后的链接数据。详情请参阅 [RouterLink](./router-link.md#routerlinkresolved)。

## 图层类型

### RouteLayerOptions

```ts
interface RouteLayerOptions {
    zIndex?: number;
    keepAlive?: 'exact' | 'include' | RouteVerifyHook;
    shouldClose?: RouteVerifyHook;
    autoPush?: boolean;
    push?: boolean;
    routerOptions?: RouterLayerOptions;
}
```

图层创建选项。详情请参阅[图层路由](./layer.md#routelayeroptions)。

### RouteLayerResult

```ts
type RouteLayerResult =
    | { type: 'close'; route: Route }
    | { type: 'push'; route: Route }
    | { type: 'success'; route: Route; data?: any };
```

图层结果联合类型。详情请参阅[图层路由](./layer.md#routelayerresult)。

### RouterLayerOptions

```ts
type RouterLayerOptions = Omit<
    RouterOptions,
    'handleBackBoundary' | 'handleLayerClose' | 'layer'
>;
```

图层创建的路由器选项，排除内部管理的处理字段。

## 微应用类型

### RouterMicroApp

```ts
type RouterMicroApp =
    | Record<string, RouterMicroAppCallback | undefined>
    | RouterMicroAppCallback;
```

微应用配置。可以是命名的应用工厂映射或单个工厂函数。

### RouterMicroAppCallback

```ts
type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;
```

从路由器创建微应用实例的工厂函数。

### RouterMicroAppOptions

```ts
interface RouterMicroAppOptions {
    mount: (el: HTMLElement) => void;
    unmount: () => void;
    renderToString?: () => Awaitable<string>;
}
```

微应用生命周期接口：
- `mount`：将应用挂载到 DOM 元素
- `unmount`：卸载并清理应用
- `renderToString`：可选的 SSR 渲染方法

## 路由选项

### RouteOptions

```ts
interface RouteOptions {
    options?: RouterParsedOptions;
    toType?: RouteType;
    toInput?: RouteLocationInput;
    from?: URL | null;
}
```

Route 类的构造选项（内部使用）。

## 已弃用类型

以下类型已弃用，将在未来版本中移除：

### RouterInstance

```ts
/** @deprecated 请直接使用 `Router` */
type RouterInstance = Router;
```

### RouterRawLocation

```ts
/** @deprecated 请直接使用 `RouteLocationInput` */
type RouterRawLocation = RouteLocationInput;
```

### RouterLocation

```ts
/** @deprecated 请直接使用 `RouteLocation` */
type RouterLocation = RouteLocation;
```

### RouteRecord

```ts
/** @deprecated 请直接使用 `Route` */
type RouteRecord = Route;
```

---
titleSuffix: "Types Reference"
description: "Comprehensive type reference for @esmx/router and @esmx/router-vue, including all exported types, enums, interfaces, and deprecated types."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router types, API, TypeScript, RouteMeta, RouteState, RouterMicroApp, type reference"
---

# Types Reference

## Introduction

This page provides a comprehensive listing of all types exported by `@esmx/router` and `@esmx/router-vue`.

## Core Enums

### RouterMode

```ts
enum RouterMode {
    history = 'history',
    memory = 'memory'
}
```

Router operation mode:
- `history`: Uses browser History API
- `memory`: Uses in-memory history stack

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

Navigation type that triggered the route creation. See [Route](./route.md#routetype) for details.

## Basic Data Types

### RouteMeta

```ts
type RouteMeta = Record<string | symbol, unknown>;
```

Custom route metadata type. Used to attach arbitrary data to route configurations that is accessible via `route.meta`.

```ts
const routes = [
    {
        path: '/admin',
        meta: {
            requiresAuth: true,
            title: 'Admin Panel',
            [Symbol('internal')]: 'data'
        }
    }
];
```

### RouteState

```ts
type RouteState = Record<string, unknown>;
```

Route state type. Used for persisting custom data in the browser's history state.

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

Return type of route handle hooks. The result is accessible via `route.handleResult`.

### RouteMatchType

```ts
type RouteMatchType = 'route' | 'exact' | 'include';
```

Route matching strategy:
- `'route'`: Route-level matching — compares whether route configurations are the same
- `'exact'`: Exact matching — compares whether paths are exactly the same
- `'include'`: Include matching — checks whether the current path contains the target path

### Awaitable

```ts
type Awaitable<T> = T | Promise<T>;
```

Utility type representing a value that can be either synchronous or a Promise.

## Route Location Types

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

Route location object for navigation. See [Route](./route.md#routelocation) for details.

### RouteLocationInput

```ts
type RouteLocationInput = RouteLocation | string;
```

Input type for navigation methods. Can be a string path or a `RouteLocation` object.

## Route Configuration Types

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

Route configuration interface. See [Route Configuration](./route-config.md) for details.

### RouteParsedConfig

```ts
interface RouteParsedConfig extends RouteConfig {
    compilePath: string;
    children: RouteParsedConfig[];
    match: MatchFunction;
    compile: (params?: Record<string, string>) => string;
}
```

Internal parsed route configuration with compiled matching and compilation functions.

### RouteMatchResult

```ts
interface RouteMatchResult {
    readonly matches: readonly RouteParsedConfig[];
    readonly params: Record<string, string | string[]>;
}
```

Result of route matching operations.

### RouteMatcher

```ts
type RouteMatcher = (
    to: URL,
    base: URL,
    cb?: (item: RouteParsedConfig) => boolean
) => RouteMatchResult;
```

Route matching function type.

## Hook Types

### RouteConfirmHook

```ts
type RouteConfirmHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<RouteConfirmHookResult>;
```

Confirmation guard that can approve, cancel, or redirect navigation.

### RouteConfirmHookResult

```ts
type RouteConfirmHookResult =
    | void
    | false
    | RouteLocationInput
    | RouteHandleHook;
```

Return type for confirmation hooks.

### RouteNotifyHook

```ts
type RouteNotifyHook = (
    to: Route,
    from: Route | null,
    router: Router
) => void;
```

Notification hook called after navigation completes.

### RouteVerifyHook

```ts
type RouteVerifyHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<boolean>;
```

Verification hook returning a boolean result.

### RouteHandleHook

```ts
type RouteHandleHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<RouteHandleResult>;
```

Handle hook for custom route handling logic.

## Router Core Types

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

Router constructor options. See [Router](./router.md#routeroptions) for details.

### RouterParsedOptions

```ts
interface RouterParsedOptions extends Readonly<Required<RouterOptions>> {
    readonly compiledRoutes: readonly RouteParsedConfig[];
    readonly matcher: RouteMatcher;
}
```

Fully parsed and resolved router options with compiled routes and matcher.

## RouterLink Types

### RouterLinkType

```ts
type RouterLinkType =
    | 'push'
    | 'replace'
    | 'pushWindow'
    | 'replaceWindow'
    | 'pushLayer';
```

Navigation types for links.

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

Link configuration properties. See [RouterLink](./router-link.md#routerlinkprops) for details.

### RouterLinkAttributes

```ts
interface RouterLinkAttributes {
    href: string;
    class: string;
    target?: '_blank';
    rel?: string;
}
```

HTML attributes generated for link elements.

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

Resolved link data. See [RouterLink](./router-link.md#routerlinkresolved) for details.

## Layer Types

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

Layer creation options. See [Layer Routing](./layer.md#routelayeroptions) for details.

### RouteLayerResult

```ts
type RouteLayerResult =
    | { type: 'close'; route: Route }
    | { type: 'push'; route: Route }
    | { type: 'success'; route: Route; data?: any };
```

Layer result discriminated union. See [Layer Routing](./layer.md#routelayerresult) for details.

### RouterLayerOptions

```ts
type RouterLayerOptions = Omit<
    RouterOptions,
    'handleBackBoundary' | 'handleLayerClose' | 'layer'
>;
```

Router options for layer creation, excluding internally managed handler fields.

## Micro-App Types

### RouterMicroApp

```ts
type RouterMicroApp =
    | Record<string, RouterMicroAppCallback | undefined>
    | RouterMicroAppCallback;
```

Micro-app configuration. Can be either a named map of app factories or a single factory function.

### RouterMicroAppCallback

```ts
type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;
```

Factory function that creates a micro-app instance from a router.

### RouterMicroAppOptions

```ts
interface RouterMicroAppOptions {
    mount: (el: HTMLElement) => void;
    unmount: () => void;
    renderToString?: () => Awaitable<string>;
}
```

Micro-app lifecycle interface:
- `mount`: Mount the app into a DOM element
- `unmount`: Unmount and clean up the app
- `renderToString`: Optional SSR render method

## Route Options

### RouteOptions

```ts
interface RouteOptions {
    options?: RouterParsedOptions;
    toType?: RouteType;
    toInput?: RouteLocationInput;
    from?: URL | null;
}
```

Constructor options for the Route class (internal use).

## Deprecated Types

The following types are deprecated and will be removed in a future version:

### RouterInstance

```ts
/** @deprecated Use `Router` directly instead */
type RouterInstance = Router;
```

### RouterRawLocation

```ts
/** @deprecated Use `RouteLocationInput` directly instead */
type RouterRawLocation = RouteLocationInput;
```

### RouterLocation

```ts
/** @deprecated Use `RouteLocation` directly instead */
type RouterLocation = RouteLocation;
```

### RouteRecord

```ts
/** @deprecated Use `Route` directly instead */
type RouteRecord = Route;
```

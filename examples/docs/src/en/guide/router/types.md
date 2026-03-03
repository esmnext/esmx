---
titleSuffix: "Router Types Reference"
description: "Complete TypeScript type reference for @esmx/router — all exported types, enums, and interfaces."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router types, TypeScript types, router enums, route interfaces, type definitions"
---

# Types

Complete TypeScript type reference for `@esmx/router`.

## Enums

### RouterMode

- **Type Definition**:
```ts
enum RouterMode {
  history = 'history',
  memory = 'memory'
}
```

- `history`: Uses browser History API, URL changes visible in address bar
- `memory`: In-memory stack, no URL changes. For SSR, testing, and [layers](./layer)

### RouteType

How a route transition was initiated.

- **Type Definition**:
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

## Utility Types

### Awaitable

- **Type Definition**:
```ts
type Awaitable<T> = T | Promise<T>;
```

A value that can be either synchronous or a Promise.

### RouteMeta

- **Type Definition**:
```ts
type RouteMeta = Record<string | symbol, unknown>;
```

Custom metadata attached to route configs. Accessible via [`route.meta`](./route#meta).

### RouteState

- **Type Definition**:
```ts
type RouteState = Record<string, unknown>;
```

State data associated with a navigation entry. Accessible via [`route.state`](./route#state).

### RouteHandleResult

- **Type Definition**:
```ts
type RouteHandleResult = unknown | null | void;
```

### RouteMatchType

- **Type Definition**:
```ts
type RouteMatchType = 'route' | 'exact' | 'include';
```

- `'route'`: Same route configuration reference
- `'exact'`: Paths are identical
- `'include'`: Current path starts with target path

## Hook Types

### RouteConfirmHook

Guard hook that can modify navigation flow.

- **Type Definition**:
```ts
type RouteConfirmHook = (
  to: Route,
  from: Route | null,
  router: Router
) => Awaitable<RouteConfirmHookResult>;
```

### RouteConfirmHookResult

- **Type Definition**:
```ts
type RouteConfirmHookResult =
  | void              // Continue navigation
  | false             // Cancel navigation
  | RouteLocationInput // Redirect to another route
  | RouteHandleHook;   // Custom handler
```

### RouteHandleHook

- **Type Definition**:
```ts
type RouteHandleHook = (
  to: Route,
  from: Route | null,
  router: Router
) => Awaitable<RouteHandleResult>;
```

### RouteVerifyHook

- **Type Definition**:
```ts
type RouteVerifyHook = (
  to: Route,
  from: Route | null,
  router: Router
) => Awaitable<boolean>;
```

Used by [`RouteLayerOptions.keepAlive`](./layer#keepalive) to determine if a layer should stay open.

### RouteNotifyHook

Post-navigation hook. Cannot modify navigation — for side effects only.

- **Type Definition**:
```ts
type RouteNotifyHook = (
  to: Route,
  from: Route | null,
  router: Router
) => void;
```

## Route Location Types

### RouteLocation

- **Type Definition**:
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

- `path`: URL path
- `url`: Full URL (alternative to `path`)
- `params`: Route parameters
- `query`: Query parameters
- `queryArray`: Query parameters (array form)
- `hash`: URL hash
- `state`: Arbitrary state data
- `keepScrollPosition`: Maintain scroll position after navigation
- `statusCode`: HTTP status code (SSR)
- `layer`: [Layer options](./layer#routelayeroptions)
- `confirm`: Per-navigation confirm hook

### RouteLocationInput

- **Type Definition**:
```ts
type RouteLocationInput = RouteLocation | string;
```

A route location can be specified as either a string path or a [`RouteLocation`](#routelocation) object.

## Route Config Types

### RouteConfig

See [Route Config](./route-config) for full details.

- **Type Definition**:
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

Compiled route config with matcher functions. Extends `RouteConfig` with internal matching data.

- **Type Definition**:
```ts
interface RouteParsedConfig extends RouteConfig {
  compilePath: string;
  children: RouteParsedConfig[];
  match: MatchFunction;
  compile: (params?: Record<string, string>) => string;
}
```

### RouteMatchResult

- **Type Definition**:
```ts
interface RouteMatchResult {
  readonly matches: readonly RouteParsedConfig[];
  readonly params: Record<string, string | string[]>;
}
```

### RouteMatcher

- **Type Definition**:
```ts
type RouteMatcher = (
  to: URL,
  base: URL,
  cb?: (item: RouteParsedConfig) => boolean
) => RouteMatchResult;
```

Function used internally for route matching. The optional `cb` callback can filter route configs (e.g., to exclude layer-only routes).

### RouteOptions

Constructor options for creating a Route object (primarily internal use).

- **Type Definition**:
```ts
interface RouteOptions {
  options?: RouterParsedOptions;
  toType?: RouteType;
  toInput?: RouteLocationInput;
  from?: URL | null;
}
```

## MicroApp Types

### RouterMicroAppOptions

- **Type Definition**:
```ts
interface RouterMicroAppOptions {
  mount: (el: HTMLElement) => void;
  unmount: () => void;
  renderToString?: () => Awaitable<string>;
}
```

See [MicroApp](./micro-app) for full details.

### RouterMicroAppCallback

- **Type Definition**:
```ts
type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;
```

### RouterMicroApp

- **Type Definition**:
```ts
type RouterMicroApp =
  | Record<string, RouterMicroAppCallback | undefined>
  | RouterMicroAppCallback;
```

## Router Options Types

### RouterOptions

See [Router](./router#routeroptions) for full details.

### RouterParsedOptions

- **Type Definition**:
```ts
interface RouterParsedOptions extends Readonly<Required<RouterOptions>> {
  readonly compiledRoutes: readonly RouteParsedConfig[];
  readonly matcher: RouteMatcher;
}
```

## Layer Types

### RouteLayerOptions

See [Layer](./layer#routelayeroptions) for full details.

- **Type Definition**:
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

- **Type Definition**:
```ts
type RouteLayerResult =
  | { type: 'close'; route: Route }
  | { type: 'push'; route: Route }
  | { type: 'success'; route: Route; data?: any };
```

- `close`: Layer was dismissed
- `push`: Layer closed because user navigated to a non-layer route
- `success`: Layer was closed with data via `closeLayer(data)`

### RouterLayerOptions

- **Type Definition**:
```ts
type RouterLayerOptions = Omit<
  RouterOptions,
  'handleBackBoundary' | 'handleLayerClose' | 'layer'
>;
```

## RouterLink Types

### RouterLinkType

- **Type Definition**:
```ts
type RouterLinkType =
  | 'push'
  | 'replace'
  | 'pushWindow'
  | 'replaceWindow'
  | 'pushLayer';
```

### RouterLinkProps

See [RouterLink](./router-link#routerlinkprops) for full details.

- **Type Definition**:
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

- **Type Definition**:
```ts
interface RouterLinkAttributes {
  href: string;
  class: string;
  target?: '_blank';
  rel?: string;
}
```

### RouterLinkResolved

See [RouterLink](./router-link#routerlinkresolved) for full details.

- **Type Definition**:
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

## Error Types

All error types extend `RouteError`.

### RouteError

- **Type Definition**:
```ts
class RouteError extends Error {
  readonly code: string;
  readonly to: Route;
  readonly from: Route | null;
}
```

Base error class for all routing errors.

### RouteNavigationAbortedError

- **Type Definition**:
```ts
class RouteNavigationAbortedError extends RouteError {
  readonly taskName: string;
}
```

Thrown when navigation is cancelled by a guard returning `false`. Error code: `'ROUTE_NAVIGATION_ABORTED'`.

### RouteSelfRedirectionError

- **Type Definition**:
```ts
class RouteSelfRedirectionError extends RouteError {}
```

Thrown when a redirect loop is detected (redirect to the same route). Error code: `'ROUTE_SELF_REDIRECTION'`.

### RouteTaskCancelledError

- **Type Definition**:
```ts
class RouteTaskCancelledError extends RouteError {
  readonly taskName: string;
}
```

Thrown when a navigation task is cancelled by a newer navigation. Error code: `'ROUTE_TASK_CANCELLED'`.

### RouteTaskExecutionError

- **Type Definition**:
```ts
class RouteTaskExecutionError extends RouteError {
  readonly taskName: string;
  readonly originalError: Error;
}
```

Thrown when a guard throws an error during execution. Error code: `'ROUTE_TASK_EXECUTION_ERROR'`.

## Deprecated Types

- `RouterInstance`: Use `Router` instead
- `RouterRawLocation`: Use `RouteLocationInput` instead
- `RouterLocation`: Use `RouteLocation` instead
- `RouteRecord`: Use `Route` instead

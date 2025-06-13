# Router API 设计

## 1. 核心导出

### 主类
```typescript
export { Router } from './router';
```

### 类型与枚举
```typescript
export {
    // 路由器相关
    RouterMode,
    type RouterOptions,
    type RouterParsedOptions,
    type RouterMicroApp,
    type RouterMicroAppCallback,
    type RouterMicroAppOptions,
    // 路由相关
    RouteStatus,
    RouteType,
    type Route,
    type RouteConfig,
    type RouteParsedConfig,
    type RouteLocation,
    type RouteLocationRaw,
    type RouteMatchResult,
    type RouteMatchType,
    type RouteMeta,
    type RouteMatcher,
    type RouteState,
    type RouteHandleResult,
    // 路由钩子
    type RouteConfirmHook,
    type RouteVerifyHook,
    type RouteHandleHook,
    type RouteNotifyHook,
    type RouteEnv,
    type RouteEnvOptions
} from './types';
```

## 2. Router 类

### 构造函数
```typescript
constructor(options: RouterOptions)
```

### 属性
```typescript
// 只读属性
readonly options: RouterOptions
readonly parsedOptions: RouterParsedOptions
readonly isLayer: boolean
readonly navigation: Navigation
readonly microApp: MicroApp

// 访问器属性
get route(): Route | null
get id(): string
```

### 导航方法
```typescript
push(to: RouteLocationRaw): Promise<Route>
replace(to: RouteLocationRaw): Promise<Route>
pushWindow(to?: RouteLocationRaw): Promise<Route>
replaceWindow(to?: RouteLocationRaw): Promise<Route>
restartApp(to?: RouteLocationRaw): Promise<Route>
back(): Promise<Route | null>
go(index: number): Promise<Route | null>
forward(): Promise<Route | null>
```

### 工具方法
```typescript
resolve(to: RouteLocationRaw): Route
isRouteMatched(targetRoute: Route, matchType: RouteMatchType): boolean
```

### 弹层方法
```typescript
createLayer(to: RouteLocationRaw, options?: RouterOptions): Promise<{
    promise: Promise<RouterLayerResult>;
    router: Router;
}>
pushLayer(to: RouteLocationRaw, layer?: Partial<RouterLayerOptions>, options?: RouterOptions): Promise<RouterLayerResult>
closeLayer(): void
```

### SSR 方法
```typescript
renderToString(throwError?: boolean): Promise<string | null>
```

### 守卫方法
```typescript
beforeEach(guard: RouteConfirmHook): () => void
afterEach(guard: RouteNotifyHook): () => void
```

### 生命周期方法
```typescript
destroy(): void
```

## 3. Route 类

### 属性
```typescript
// 状态属性
status: RouteStatus
statusCode: number | null
readonly state: RouteState
readonly keepScrollPosition: boolean

// 类型属性
readonly type: RouteType
readonly isPush: boolean

// SSR 属性
readonly req: IncomingMessage | null
readonly res: ServerResponse | null
readonly context: Record<string | symbol, any>

// URL 属性
readonly url: URL
readonly path: string
readonly fullPath: string

// 参数属性
readonly params: Record<string, string>
readonly query: Record<string, string | undefined>
readonly queryArray: Record<string, string[] | undefined>

// 路由属性
readonly meta: RouteMeta
readonly matched: readonly RouteParsedConfig[]
readonly config: RouteParsedConfig | null

// 处理器属性
get handle(): RouteHandleHook | null
set handle(val: RouteHandleHook | null)
get handleResult(): RouteHandleResult | null
set handleResult(val: RouteHandleResult | null)
```

### 方法
```typescript
setHandle(val: RouteHandleHook | null): void
mergeState(newState: Partial<RouteState>): void
setState(name: string, value: any): void
syncTo(targetRoute: Route): void
clone(): Route
```

## 4. 主要类型定义

### RouterOptions
```typescript
interface RouterOptions {
    id?: string;
    context?: Record<string | symbol, any>;
    routes?: RouteConfig[];
    mode?: RouterMode;
    base?: URL;
    env?: string;
    req?: IncomingMessage | null;
    res?: ServerResponse | null;
    apps?: RouterMicroApp;
    normalizeURL?: (to: URL, from: URL | null) => URL;
    location?: RouteHandleHook;
    rootStyle?: Partial<CSSStyleDeclaration> | false;
    layer?: RouterLayerOptions | null;
    onBackNoResponse?: RouteBackNoResponseHook;
}
```

### RouteConfig
```typescript
interface RouteConfig {
    path: string;
    component?: any;
    children?: RouteConfig[];
    redirect?: RouteLocationRaw | RouteConfirmHook;
    meta?: RouteMeta;
    env?: RouteEnv;
    app?: string | RouterMicroAppCallback;
    asyncComponent?: () => Promise<any>;
    beforeEnter?: RouteConfirmHook;
    beforeUpdate?: RouteConfirmHook;
    beforeLeave?: RouteConfirmHook;
}
```

### RouteLocation
```typescript
interface RouteLocation {
    path?: string;
    url?: string | URL;
    params?: Record<string, string>;
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[]>;
    hash?: string;
    state?: RouteState;
    keepScrollPosition?: boolean;
    statusCode?: number | null;
}
```

### RouterLayerOptions
```typescript
interface RouterLayerOptions {
    enable?: boolean;
    params?: Record<string, any>;
    shouldClose?: RouteVerifyHook;
    autoPush?: boolean;
    push?: boolean;
    destroyed?: (result: RouterLayerResult) => void;
}
```

### 钩子类型
```typescript
type RouteConfirmHook = (to: Route, from: Route | null) => Awaitable<RouteConfirmHookResult>;
type RouteVerifyHook = (to: Route, from: Route | null) => Awaitable<boolean>;
type RouteHandleHook = (to: Route, from: Route | null) => Awaitable<RouteHandleResult>;
type RouteNotifyHook = (to: Route, from: Route | null) => void;
type RouteBackNoResponseHook = (router: Router) => void;
```

## 5. 枚举定义

### RouterMode
```typescript
enum RouterMode {
    history = 'history',
    abstract = 'abstract'
}
```

### RouteType
```typescript
enum RouteType {
    push = 'push',
    replace = 'replace',
    restartApp = 'restartApp',
    go = 'go',
    forward = 'forward',
    back = 'back',
    none = 'none',
    pushWindow = 'pushWindow',
    replaceWindow = 'replaceWindow'
}
```

### RouteStatus
```typescript
enum RouteStatus {
    resolve = 'resolve',
    aborted = 'aborted',
    error = 'error',
    success = 'success'
}
``` 
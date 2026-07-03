---
titleSuffix: "@esmx/core HTTP 中间件 API"
description: "@esmx/core 中间件参考:Middleware 类型、createMiddleware、mergeMiddlewares 与 isImmutableFile——以正确的缓存策略服务模块静态资源。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 中间件, createMiddleware, mergeMiddlewares, isImmutableFile, 静态资源, 缓存控制, SSR 服务端"
---

# 中间件

`@esmx/core` 提供一组 connect 风格的中间件辅助函数,用于以正确的缓存头服务模块的静态资源(即构建产物 `dist/client`)。`esmx.middleware` 正是由它们组合而成,你也可以在自建 HTTP 服务器时直接组合使用。

## `Middleware`

```ts
type Middleware = (
    req: IncomingMessage,
    res: ServerResponse,
    next: Function
) => void;
```

connect 风格中间件:接收 Node 的请求、响应对象和 `next` 回调,要么处理该请求,要么调用 `next()` 交由后续处理。兼容 `http`、Express、Koa(经适配)及大多数 Node 服务器。

```ts
const loggerMiddleware: Middleware = (req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
};
```

## `createMiddleware(esmx)`

```ts
function createMiddleware(esmx: Esmx): Middleware;
```

创建为 Esmx 实例中每个模块服务静态资源的中间件。它会:

- 依据模块配置为每个模块构建静态文件处理器,
- 逐请求应用缓存控制,
- 对内容指纹(不可变)文件采用长期缓存。

```ts
import { Esmx, createMiddleware } from '@esmx/core';

const esmx = new Esmx();
const middleware = createMiddleware(esmx);

// 在任意 Node HTTP 服务器中使用
server.use(middleware);
```

## `mergeMiddlewares(middlewares)`

```ts
function mergeMiddlewares(middlewares: Middleware[]): Middleware;
```

将中间件数组组合为单个中间件,按顺序执行,直到某个处理该请求或链结束(调用外层 `next`)。适合把 `createMiddleware` 的产物与你自己的处理器组合起来。

```ts
import { mergeMiddlewares } from '@esmx/core';

const app = mergeMiddlewares([loggerMiddleware, createMiddleware(esmx)]);
```

## `isImmutableFile(filename)`

```ts
function isImmutableFile(filename: string): boolean;
```

当文件路径匹配 Esmx 的内容指纹(不可变)资源模式时返回 `true`——即可安全地以 `Cache-Control: public, max-age=31536000, immutable` 服务。`createMiddleware` 内部用它为每个资源决定缓存策略。

## 相关

- [Esmx](/zh/api/core/esmx) —— 其 `middleware` 由这些辅助函数组合而成的核心类
- [RenderContext](/zh/api/core/render-context) —— 渲染后的 HTML 如何引用这些资源

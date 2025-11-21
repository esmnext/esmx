---
titleSuffix: "App 应用核心接口"
description: "详细介绍 Esmx 框架的 App 接口，包括应用生命周期管理、静态资源处理和服务端渲染功能，帮助开发者理解和使用应用核心功能。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, App, 应用抽象, 生命周期, 静态资源, 服务端渲染, API"
---

# App

`App` 是 Esmx 框架的应用抽象，提供了统一的接口来管理应用的生命周期、静态资源和服务端渲染。

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
        }
      })
    );
  }
}
```

## 类型定义
### App

```ts
interface App {
  middleware: Middleware;
  render: (options?: RenderContextOptions) => Promise<RenderContext>;
  build?: () => Promise<boolean>;
  destroy?: () => Promise<boolean>;
}
```

#### middleware

- **类型**: `Middleware`

静态资源处理中间件。

开发环境：
- 处理源码的静态资源请求
- 支持实时编译和热更新
- 使用 no-cache 缓存策略

生产环境：
- 处理构建后的静态资源
- 支持不可变文件的长期缓存（.final.xxx）
- 优化的资源加载策略

```ts
server.use(esmx.middleware);
```

#### render

- **类型**: `(options?: RenderContextOptions) => Promise<RenderContext>`

服务端渲染函数。根据运行环境提供不同实现：
- 生产环境（start）：加载构建后的服务端入口文件（entry.server）执行渲染
- 开发环境（dev）：加载源码中的服务端入口文件执行渲染

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **类型**: `() => Promise<boolean>`

生产环境构建函数。用于资源打包和优化。构建成功返回 true，失败返回 false。

#### destroy

- **类型**: `() => Promise<boolean>`

资源清理函数。用于关闭服务器、断开连接等。清理成功返回 true，失败返回 false。

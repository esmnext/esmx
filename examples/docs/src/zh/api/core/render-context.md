---
titleSuffix: "Esmx 框架渲染上下文 API 参考"
description: "详细介绍 Esmx 框架的 RenderContext 核心类，包括渲染控制、资源管理、状态同步和路由控制等功能，帮助开发者实现高效的服务端渲染。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, RenderContext, SSR, 服务端渲染, 渲染上下文, 状态同步, 资源管理, Web 应用框架"
---

# RenderContext

RenderContext 是 Esmx 框架中的核心类，负责管理服务端渲染（SSR）的完整生命周期。它提供了一套完整的 API 来处理渲染上下文、资源管理、状态同步等关键任务：

- **渲染控制**：管理服务端渲染流程，支持多入口渲染、条件渲染等场景
- **资源管理**：智能收集和注入 JS、CSS 等静态资源，优化加载性能
- **状态同步**：处理服务端状态序列化，确保客户端正确激活（hydration）
- **路由控制**：支持服务端重定向、状态码设置等高级功能

## 类型定义

### ServerRenderHandle

服务端渲染处理函数的类型定义。

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void>;
```

服务端渲染处理函数是一个异步或同步函数，接收 RenderContext 实例作为参数，用于处理服务端渲染逻辑。

```ts title="entry.node.ts"
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

export const simple = async (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

渲染过程中收集的资源文件列表的类型定义。

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: JavaScript 文件列表
- **css**: 样式表文件列表
- **modulepreload**: 需要预加载的 ESM 模块列表
- **resources**: 其他资源文件列表（图片、字体等）

```ts
rc.files = {
  js: [
    '/assets/entry-client.js',
    '/assets/vendor.js'
  ],
  css: [
    '/assets/main.css',
    '/assets/vendor.css'
  ],
  modulepreload: [
    '/assets/Home.js',
    '/assets/About.js'
  ],
  resources: [
    '/assets/logo.png',
    '/assets/font.woff2'
  ]
};
```

### ImportmapMode

定义 importmap 的生成模式。

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: 将 importmap 内容直接内联到 HTML 中，适用于以下场景：
  - 需要减少 HTTP 请求数量
  - importmap 内容较小
  - 对首屏加载性能要求较高
- `js`: 将 importmap 内容生成为独立的 JS 文件，适用于以下场景：
  - importmap 内容较大
  - 需要利用浏览器缓存机制
  - 多个页面共享相同的 importmap

渲染上下文类，负责服务端渲染（SSR）过程中的资源管理和 HTML 生成。
## 实例选项

定义渲染上下文的配置选项。

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **类型**: `string`
- **默认值**: `''`

静态资源的基础路径。
- 所有静态资源（JS、CSS、图片等）都会基于此路径加载
- 支持运行时动态配置，无需重新构建
- 常用于多语言站点、微前端应用等场景

#### entryName

- **类型**: `string`
- **默认值**: `'default'`

服务端渲染入口函数名称。用于指定服务端渲染时使用的入口函数，当一个模块导出多个渲染函数时使用。

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
};

export const desktop = async (rc: RenderContext) => {
};
```

#### params

- **类型**: `Record<string, any>`
- **默认值**: `{}`

渲染参数。可以传递任意类型的参数给渲染函数，常用于传递请求信息（URL、query 参数等）。

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN',
    theme: 'dark'
  }
});
```

#### importmapMode

- **类型**: `'inline' | 'js'`
- **默认值**: `'inline'`

导入映射（Import Map）的生成模式：
- `inline`: 将 importmap 内容直接内联到 HTML 中
- `js`: 将 importmap 内容生成为独立的 JS 文件


## 实例属性

### esmx

- **类型**: `Esmx`
- **只读**: `true`

Esmx 实例引用。用于访问框架核心功能和配置信息。

### redirect

- **类型**: `string | null`
- **默认值**: `null`

重定向地址。设置后，服务端可以根据此值进行 HTTP 重定向，常用于登录验证、权限控制等场景。

```ts title="entry.node.ts"
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
};

export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
};
```

### status

- **类型**: `number | null`
- **默认值**: `null`

HTTP 响应状态码。可以设置任意有效的 HTTP 状态码，常用于错误处理、重定向等场景。

```ts title="entry.node.ts"
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    return;
  }
};

export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307;
    return;
  }
};
```

### html

- **类型**: `string`
- **默认值**: `''`

HTML 内容。用于设置和获取最终生成的 HTML 内容，在设置时自动处理基础路径占位符。

```ts title="entry.node.ts"
export default async (rc: RenderContext) => {
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Hello World</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

const rc = await esmx.render({
  base: '/app',
  params: { url: req.url }
});

```

### base

- **类型**: `string`
- **只读**: `true`
- **默认值**: `''`

静态资源的基础路径。所有静态资源（JS、CSS、图片等）都会基于此路径加载，支持运行时动态配置。

```ts
const rc = await esmx.render({
  base: '/esmx',
  params: { url: req.url }
});

const rc = await esmx.render({
  base: '/cn',
  params: { lang: 'zh-CN' }
});

const rc = await esmx.render({
  base: '/app1',
  params: { appId: 1 }
});
```

### entryName

- **类型**: `string`
- **只读**: `true`
- **默认值**: `'default'`

服务端渲染入口函数名称。用于从 entry.server.ts 中选择要使用的渲染函数。

```ts title="entry.node.ts"
export default async (rc: RenderContext) => {
};

export const mobile = async (rc: RenderContext) => {
};

export const desktop = async (rc: RenderContext) => {
};

const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **类型**: `Record<string, any>`
- **只读**: `true`
- **默认值**: `{}`

渲染参数。可以在服务端渲染过程中传递和访问参数，常用于传递请求信息、页面配置等。

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **类型**: `Set<ImportMeta>`

模块依赖收集集合。在组件渲染过程中自动追踪和记录模块依赖，只收集当前页面渲染时真正使用到的资源。

```ts
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  return '<div id="app">Hello World</div>';
};

const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **类型**: `RenderFiles`

资源文件列表：
- js: JavaScript 文件列表
- css: 样式表文件列表
- modulepreload: 需要预加载的 ESM 模块列表
- resources: 其他资源文件列表（图片、字体等）

```ts
await rc.commit();

rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### importmapMode

- **类型**: `'inline' | 'js'`
- **默认值**: `'inline'`

导入映射的生成模式：
- `inline`: 将 importmap 内容直接内联到 HTML 中
- `js`: 将 importmap 内容生成为独立的 JS 文件


## 实例方法

### serialize()

- **参数**: 
  - `input: any` - 需要序列化的数据
  - `options?: serialize.SerializeJSOptions` - 序列化选项
- **返回值**: `string`

将 JavaScript 对象序列化为字符串。用于在服务端渲染过程中序列化状态数据，确保数据可以安全地嵌入到 HTML 中。

```ts
const state = {
  user: { id: 1, name: 'Alice' },
  timestamp: new Date()
};

rc.html = `
  <script>
    window.__INITIAL_STATE__ = ${rc.serialize(state)};
  </script>
`;
```

### state()

- **参数**: 
  - `varName: string` - 变量名
  - `data: Record<string, any>` - 状态数据
- **返回值**: `string`

将状态数据序列化并注入到 HTML 中。使用安全的序列化方法处理数据，支持复杂的数据结构。

```ts
const userInfo = {
  id: 1,
  name: 'John',
  roles: ['admin']
};

rc.html = `
  <head>
    ${rc.state('__USER__', userInfo)}
  </head>
`;
```

### commit()

- **返回值**: `Promise<void>`

提交依赖收集并更新资源列表。从 importMetaSet 中收集所有使用到的模块，基于 manifest 文件解析每个模块的具体资源。

```ts
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

await rc.commit();
```

### preload()

- **返回值**: `string`

生成资源预加载标签。用于预加载 CSS 和 JavaScript 资源，支持优先级配置，自动处理基础路径。

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### css()

- **返回值**: `string`

生成 CSS 样式表标签。注入收集到的 CSS 文件，确保样式表按正确顺序加载。

```ts
rc.html = `
  <head>
    ${rc.css()}
  </head>
`;
```

### importmap()

- **返回值**: `string`

生成导入映射标签。根据 importmapMode 配置生成内联或外部导入映射。

```ts
rc.html = `
  <head>
    ${rc.importmap()}
  </head>
`;
```

### moduleEntry()

- **返回值**: `string`

生成客户端入口模块标签。注入客户端入口模块，必须在 importmap 之后执行。

```ts
rc.html = `
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
  </body>
`;
```

### modulePreload()

- **返回值**: `string`

生成模块预加载标签。预加载收集到的 ESM 模块，优化首屏加载性能。

```ts
rc.html = `
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
`;
```

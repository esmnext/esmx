---
titleSuffix: "框架核心类 API 参考"
description: "详细介绍 Esmx 框架的核心类 API，包括应用生命周期管理、静态资源处理和服务端渲染能力，帮助开发者深入理解框架的核心功能。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, API, 生命周期管理, 静态资源, 服务端渲染, Rspack, Web 应用框架"
---

# Esmx

## 简介

Esmx 是一个基于 Rspack 的高性能 Web 应用框架，提供了完整的应用生命周期管理、静态资源处理和服务端渲染能力。

## 类型定义

### BuildEnvironment

- **类型定义**:
```ts
type BuildEnvironment = 'client' | 'server'
```

应用程序运行时环境类型：
- `client`: 运行在浏览器环境，支持 DOM 操作和浏览器 API
- `server`: 运行在 Node.js 环境，支持文件系统和服务器端功能

### ImportMap

- **类型定义**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

ES 模块导入映射类型。

#### SpecifierMap

- **类型定义**:
```ts
type SpecifierMap = Record<string, string>
```

模块标识符映射类型，用于定义模块导入路径的映射关系。

#### ScopesMap

- **类型定义**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

作用域映射类型，用于定义特定作用域下的模块导入映射关系。

### COMMAND

- **类型定义**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

命令类型枚举：
- `dev`: 开发环境命令，启动开发服务器并支持热更新
- `build`: 构建命令，生成生产环境的构建产物
- `preview`: 预览命令，启动本地预览服务器
- `start`: 启动命令，运行生产环境服务器

## 实例选项

定义 Esmx 框架的核心配置选项。

```ts
interface EsmxOptions {
  root?: string
  isProd?: boolean
  basePathPlaceholder?: string | false
  modules?: ModuleConfig
  packs?: PackConfig
  devApp?: (esmx: Esmx) => Promise<App>
  server?: (esmx: Esmx) => Promise<void>
  postBuild?: (esmx: Esmx) => Promise<void>
}
```

#### root

- **类型**: `string`
- **默认值**: `process.cwd()`

项目根目录路径。可以是绝对路径或相对路径，相对路径基于当前工作目录解析。

#### isProd

- **类型**: `boolean`
- **默认值**: `process.env.NODE_ENV === 'production'`

环境标识。
- `true`: 生产环境
- `false`: 开发环境

#### basePathPlaceholder

- **类型**: `string | false`
- **默认值**: `'[[[___ESMX_DYNAMIC_BASE___]]]'`

基础路径占位符配置。用于运行时动态替换资源的基础路径。设置为 `false` 可以禁用此功能。

#### modules

- **类型**: `ModuleConfig`

模块配置选项。用于配置项目的模块解析规则，包括模块别名、外部依赖等配置。

#### packs

- **类型**: `PackConfig`

打包配置选项。用于将构建产物打包成标准的 npm .tgz 格式软件包。

#### devApp

- **类型**: `(esmx: Esmx) => Promise<App>`

开发环境应用创建函数。仅在开发环境中使用，用于创建开发服务器的应用实例。

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {}
      })
    )
  }
}
```

#### server

- **类型**: `(esmx: Esmx) => Promise<void>`

服务器启动配置函数。用于配置和启动 HTTP 服务器，在开发环境和生产环境中都可使用。

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000);
  }
}
```

#### postBuild

- **类型**: `(esmx: Esmx) => Promise<void>`

构建后置处理函数。在项目构建完成后执行，可用于：
- 执行额外的资源处理
- 部署操作
- 生成静态文件
- 发送构建通知

## 实例属性

### name

- **类型**: `string`
- **只读**: `true`

当前模块的名称，来源于模块配置。

### varName

- **类型**: `string`
- **只读**: `true`

基于模块名生成的合法 JavaScript 变量名。

### root

- **类型**: `string`
- **只读**: `true`

项目根目录的绝对路径。如果配置的 `root` 为相对路径，则基于当前工作目录解析。

### isProd

- **类型**: `boolean`
- **只读**: `true`

判断当前是否为生产环境。优先使用配置项中的 `isProd`，若未配置则根据 `process.env.NODE_ENV` 判断。

### basePath

- **类型**: `string`
- **只读**: `true`
- **抛出**: `NotReadyError` - 框架未初始化时

获取以斜杠开头和结尾的模块基础路径。返回格式为 `/${name}/`，其中 name 来自模块配置。

### basePathPlaceholder

- **类型**: `string`
- **只读**: `true`

获取用于运行时动态替换的基础路径占位符。可通过配置禁用。

### middleware

- **类型**: `Middleware`
- **只读**: `true`

获取静态资源处理中间件。根据环境提供不同实现：
- 开发环境：支持源码实时编译、热更新
- 生产环境：支持静态资源的长期缓存

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **类型**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **只读**: `true`

获取服务端渲染函数。根据环境提供不同实现：
- 开发环境：支持热更新和实时预览
- 生产环境：提供优化的渲染性能

```ts
const rc = await esmx.render({
  params: { url: req.url }
});

const rc = await esmx.render({
  base: '',
  importmapMode: 'inline',
  entryName: 'default',
  params: {
    url: req.url,
    state: { user: 'admin' }
  }
});
```

### COMMAND

- **类型**: `typeof COMMAND`
- **只读**: `true`

获取命令枚举类型定义。

### moduleConfig

- **类型**: `ParsedModuleConfig`
- **只读**: `true`
- **抛出**: `NotReadyError` - 框架未初始化时

获取当前模块的完整配置信息，包括模块解析规则、别名配置等。

### packConfig

- **类型**: `ParsedPackConfig`
- **只读**: `true`
- **抛出**: `NotReadyError` - 框架未初始化时

获取当前模块的打包相关配置，包括输出路径、package.json 处理等。

## 实例方法

### constructor()

- **参数**: 
  - `options?: EsmxOptions` - 框架配置选项
- **返回值**: `Esmx`

创建 Esmx 框架实例。

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **参数**: `command: COMMAND`
- **返回值**: `Promise<boolean>`
- **抛出**:
  - `Error`: 重复初始化时
  - `NotReadyError`: 访问未初始化实例时

初始化 Esmx 框架实例。执行以下核心初始化流程：

1. 解析项目配置（package.json、模块配置、打包配置等）
2. 创建应用实例（开发环境或生产环境）
3. 根据命令执行相应的生命周期方法

::: warning 注意
- 重复初始化时会抛出错误
- 访问未初始化的实例时会抛出 `NotReadyError`

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **返回值**: `Promise<boolean>`

销毁 Esmx 框架实例，执行资源清理和连接关闭等操作。主要用于：
- 关闭开发服务器
- 清理临时文件和缓存
- 释放系统资源

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **返回值**: `Promise<boolean>`

执行应用程序的构建流程，包括：
- 编译源代码
- 生成生产环境的构建产物
- 优化和压缩代码
- 生成资源清单

::: warning 注意
在框架实例未初始化时调用会抛出 `NotReadyError`
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    const render = await esmx.render({
      params: { url: '/' }
    });
    esmx.writeSync(
      esmx.resolvePath('dist/client', 'index.html'),
      render.html
    );
  }
}
```

### server()

- **返回值**: `Promise<void>`
- **抛出**: `NotReadyError` - 框架未初始化时

启动 HTTP 服务器和配置服务器实例。在以下生命周期中被调用：
- 开发环境（dev）：启动开发服务器，提供热更新
- 生产环境（start）：启动生产服务器，提供生产级性能

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });
  }
}
```

### postBuild()

- **返回值**: `Promise<boolean>`

执行构建后的处理逻辑，用于：
- 生成静态 HTML 文件
- 处理构建产物
- 执行部署任务
- 发送构建通知

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    const pages = ['/', '/about', '/404'];

    for (const url of pages) {
      const render = await esmx.render({
        params: { url }
      });

      await esmx.write(
        esmx.resolvePath('dist/client', url.substring(1), 'index.html'),
        render.html
      );
    }
  }
}
```

### resolvePath

解析项目路径，将相对路径转换为绝对路径。

- **参数**:
  - `projectPath: ProjectPath` - 项目路径类型
  - `...args: string[]` - 路径片段
- **返回值**: `string` - 解析后的绝对路径

- **示例**:
```ts
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

同步写入文件内容。

- **参数**:
  - `filepath`: `string` - 文件的绝对路径
  - `data`: `any` - 要写入的数据，可以是字符串、Buffer 或对象
- **返回值**: `boolean` - 写入是否成功

- **示例**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = esmx.writeSync(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

同步读取并解析 JSON 文件。

- **参数**:
  - `filename`: `string` - JSON 文件的绝对路径

- **返回值**: `any` - 解析后的 JSON 对象
- **异常**: 当文件不存在或 JSON 格式错误时抛出异常

- **示例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
}
```

### readJson()

异步读取并解析 JSON 文件。

- **参数**:
  - `filename`: `string` - JSON 文件的绝对路径

- **返回值**: `Promise<any>` - 解析后的 JSON 对象
- **异常**: 当文件不存在或 JSON 格式错误时抛出异常

- **示例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
}
```

### getManifestList()

获取构建清单列表。

- **参数**:
  - `target`: `BuildEnvironment` - 目标环境类型
    - `'client'`: 客户端环境
    - `'server'`: 服务端环境

- **返回值**: `Promise<readonly ManifestJson[]>` - 只读的构建清单列表
- **异常**: 在框架实例未初始化时抛出 `NotReadyError`

该方法用于获取指定目标环境的构建清单列表，包含以下功能：
1. **缓存管理**
   - 使用内部缓存机制避免重复加载
   - 返回不可变的清单列表

2. **环境适配**
   - 支持客户端和服务端两种环境
   - 根据目标环境返回对应的清单信息

3. **模块映射**
   - 包含模块导出信息
   - 记录资源依赖关系

- **示例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifests = await esmx.getManifestList('client');

  const appModule = manifests.find(m => m.name === 'my-app');
  if (appModule) {
    console.log('App exports:', appModule.exports);
    console.log('App chunks:', appModule.chunks);
  }
}
```

### getImportMap()

获取导入映射对象。

- **参数**:
  - `target`: `BuildEnvironment` - 目标环境类型
    - `'client'`: 生成浏览器环境的导入映射
    - `'server'`: 生成服务端环境的导入映射

- **返回值**: `Promise<Readonly<ImportMap>>` - 只读的导入映射对象
- **异常**: 在框架实例未初始化时抛出 `NotReadyError`

该方法用于生成 ES 模块导入映射（Import Map），具有以下特点：
1. **模块解析**
   - 基于构建清单生成模块映射
   - 支持客户端和服务端两种环境
   - 自动处理模块路径解析

2. **缓存优化**
   - 使用内部缓存机制
   - 返回不可变的映射对象

3. **路径处理**
   - 自动处理模块路径
   - 支持动态基础路径

- **示例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const importmap = await esmx.getImportMap('client');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script type="importmap">
        ${JSON.stringify(importmap)}
      </script>
    </head>
    <body>
    </body>
    </html>
  `;
}
```

### getImportMapClientInfo()

获取客户端导入映射信息。

- **参数**:
  - `mode`: `ImportmapMode` - 导入映射模式
    - `'inline'`: 内联模式，返回 HTML script 标签
    - `'js'`: JS 文件模式，返回带有文件路径的信息

- **返回值**: 
  - JS 文件模式:
    ```ts
    {
      src: string;
      filepath: string;
      code: string;
    }
    ```
  - 内联模式:
    ```ts
    {
      src: null;
      filepath: null;
      code: string;
    }
    ```

- **异常**: 在框架实例未初始化时抛出 `NotReadyError`

该方法用于生成客户端环境的导入映射代码，支持两种模式：
1. **内联模式 (inline)**
   - 将导入映射直接内联到 HTML 中
   - 减少额外的网络请求
   - 适合导入映射较小的场景

2. **JS 文件模式 (js)**
   - 生成独立的 JS 文件
   - 支持浏览器缓存
   - 适合导入映射较大的场景

核心功能：
- 自动处理动态基础路径
- 支持模块路径运行时替换
- 优化缓存策略
- 确保模块加载顺序

- **示例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const server = express();
  server.use(esmx.middleware);

  server.get('*', async (req, res) => {
    const result = await esmx.render({
      importmapMode: 'js',
      params: { url: req.url }
    });
    res.send(result.html);
  });

  server.get('/inline', async (req, res) => {
    const result = await esmx.render({
      importmapMode: 'inline',
      params: { url: req.url }
    });
    res.send(result.html);
  });
}
```

### getStaticImportPaths()

获取模块的静态导入路径列表。

- **参数**:
  - `target`: `BuildEnvironment` - 构建目标
    - `'client'`: 客户端环境
    - `'server'`: 服务端环境
  - `specifier`: `string` - 模块标识符

- **返回值**: `Promise<readonly string[] | null>` - 返回静态导入路径列表，如果未找到则返回 null
- **异常**: 在框架实例未初始化时抛出 `NotReadyError`

- **示例**:
```ts
const paths = await esmx.getStaticImportPaths(
  'client',
  `your-app-name/src/entry.client`
);
```

### generateSizeReport()

生成构建产物的大小分析报告。

- **返回值**: `{ text: string, json: object }`
  - `text`: 格式化的文本报告
  - `json`: 详细统计数据

- **异常**: `NotReadyError` - 框架未初始化时

```ts
const report = esmx.generateSizeReport();
console.log(report.text);
console.log(`总文件: ${report.json.totalFiles}, 总大小: ${report.json.totalSize} 字节`);
```

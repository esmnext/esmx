---
titleSuffix: Esmx 框架客户端渲染实现指南
description: 详细介绍 Esmx 框架的客户端渲染机制，包括静态构建、部署策略和最佳实践，帮助开发者在无服务器环境下实现高效的前端渲染。
head:
  - - meta
    - property: keywords
      content: Esmx, 客户端渲染, CSR, 静态构建, 前端渲染, 无服务器部署, 性能优化
---

# 客户端渲染

客户端渲染（Client-Side Rendering，CSR）是一种在浏览器端执行页面渲染技术方案。在 Esmx 中，当你的应用无法部署 Node.js 服务器实例时，可以选择在构建阶段生成静态的 `index.html` 文件，实现纯客户端渲染。

## 使用场景

以下场景推荐使用客户端渲染：

- **静态托管环境**：如 GitHub Pages、CDN 等不支持服务端渲染的托管服务
- **简单应用**：对首屏加载速度和 SEO 要求不高的小型应用
- **开发环境**：在开发阶段快速预览和调试应用

## 配置说明

### HTML 模板配置

在客户端渲染模式下，你需要配置一个通用的 HTML 模板。这个模板将作为应用的容器，包含必要的资源引用和挂载点。

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // 提交依赖收集
    await rc.commit();
    
    // 配置 HTML 模板
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // 预加载资源
    <title>Esmx</title>
    ${rc.css()}               // 注入样式
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // 导入映射
    ${rc.moduleEntry()}       // 入口模块
    ${rc.modulePreload()}     // 模块预加载
</body>
</html>
`;
};
```

### 静态 HTML 生成

要在生产环境中使用客户端渲染，需要在构建阶段生成静态的 HTML 文件。Esmx 提供了 `postBuild` 钩子函数来实现这一功能：

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // 生成静态 HTML 文件
        const rc = await esmx.render();
        // 写入 HTML 文件
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```

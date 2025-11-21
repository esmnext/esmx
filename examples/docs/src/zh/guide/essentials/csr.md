---
titleSuffix: "CSR 渲染与静态构建"
description: "Esmx 的客户端渲染机制与构建产物生成方式，适用于无法部署服务端的场景。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 客户端渲染, CSR, 静态构建, 前端渲染, 无服务器部署, 性能优化"
---

# 客户端渲染

客户端渲染（Client-Side Rendering，CSR）在浏览器端执行页面渲染。无法部署 Node.js 服务时，可在构建阶段生成静态 `index.html` 以实现纯客户端渲染。

## 使用场景

以下场景推荐使用客户端渲染：

- **静态托管环境**：如 GitHub Pages、CDN 等不支持服务端渲染的托管服务
- **简单应用**：对首屏加载速度和 SEO 要求不高的小型应用
- **开发环境**：在开发阶段快速预览和调试应用

## 配置说明

### HTML 模板配置

模板应包含资源注入与入口顺序：`preload`、`css` 在 `head`，`importmap`、`moduleEntry`、`modulePreload` 在 `body`。

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    await rc.commit();
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}
    <title>Esmx</title>
    ${rc.css()}
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
```

### 静态 HTML 生成

在构建阶段生成静态 HTML 文件，可通过 `postBuild` 钩子实现：

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        const rc = await esmx.render();
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```

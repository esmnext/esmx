---
titleSuffix: Esmx 框架客戶端渲染實作指南
description: 詳細介紹 Esmx 框架的客戶端渲染機制，包括靜態建置、部署策略和最佳實踐，幫助開發者在無伺服器環境下實現高效的前端渲染。
head:
  - - meta
    - property: keywords
      content: Esmx, 客戶端渲染, CSR, 靜態建置, 前端渲染, 無伺服器部署, 效能優化
---

# 客戶端渲染

客戶端渲染（Client-Side Rendering，CSR）是一種在瀏覽器端執行頁面渲染的技術方案。在 Esmx 中，當你的應用無法部署 Node.js 伺服器實例時，可以選擇在建置階段生成靜態的 `index.html` 文件，實現純客戶端渲染。

## 使用場景

以下場景推薦使用客戶端渲染：

- **靜態託管環境**：如 GitHub Pages、CDN 等不支援伺服器端渲染的託管服務
- **簡單應用**：對首屏載入速度和 SEO 要求不高的小型應用
- **開發環境**：在開發階段快速預覽和除錯應用

## 配置說明

### HTML 模板配置

在客戶端渲染模式下，你需要配置一個通用的 HTML 模板。這個模板將作為應用的容器，包含必要的資源引用和掛載點。

```ts title="src/entry.server.ts"
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    // 提交依賴收集
    await rc.commit();
    
    // 配置 HTML 模板
    rc.html = `
<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}           // 預載資源
    <title>Esmx</title>
    ${rc.css()}               // 注入樣式
</head>
<body>
    <div id="app"></div>
    ${rc.importmap()}         // 導入映射
    ${rc.moduleEntry()}       // 入口模組
    ${rc.modulePreload()}     // 模組預載
</body>
</html>
`;
};
```

### 靜態 HTML 生成

要在生產環境中使用客戶端渲染，需要在建置階段生成靜態的 HTML 文件。Esmx 提供了 `postBuild` 鉤子函數來實現這一功能：

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async postBuild(esmx) {
        // 生成靜態 HTML 文件
        const rc = await esmx.render();
        // 寫入 HTML 文件
        esmx.writeSync(
            esmx.resolvePath('dist/client', 'index.html'),
            rc.html
        );
    }
} satisfies EsmxOptions;
```
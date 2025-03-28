---
titleSuffix: Esmx 框架應用抽象介面
description: 詳細介紹 Esmx 框架的 App 介面，包括應用程式生命週期管理、靜態資源處理和伺服器端渲染功能，幫助開發者理解和使用應用核心功能。
head:
  - - meta
    - property: keywords
      content: Esmx, App, 應用抽象, 生命週期, 靜態資源, 伺服器端渲染, API
---

# App

`App` 是 Esmx 框架的應用抽象，提供了統一的介面來管理應用程式的生命週期、靜態資源和伺服器端渲染。

```ts title="entry.node.ts"
export default {
  // 開發環境配置
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(rc) {
          // 自訂 Rspack 配置
        }
      })
    );
  }
}
```

## 類型定義
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

- **類型**: `Middleware`

靜態資源處理中介軟體。

開發環境：
- 處理原始碼的靜態資源請求
- 支援即時編譯和熱更新
- 使用 no-cache 快取策略

生產環境：
- 處理建置後的靜態資源
- 支援不可變檔案的長期快取（.final.xxx）
- 最佳化的資源載入策略

```ts
server.use(esmx.middleware);
```

#### render

- **類型**: `(options?: RenderContextOptions) => Promise<RenderContext>`

伺服器端渲染函式。根據執行環境提供不同實作：
- 生產環境（start）：載入建置後的伺服器端入口檔案（entry.server）執行渲染
- 開發環境（dev）：載入原始碼中的伺服器端入口檔案執行渲染

```ts
const rc = await esmx.render({
  params: { url: '/page' }
});
res.end(rc.html);
```

#### build

- **類型**: `() => Promise<boolean>`

生產環境建置函式。用於資源打包和最佳化。建置成功返回 true，失敗返回 false。

#### destroy

- **類型**: `() => Promise<boolean>`

資源清理函式。用於關閉伺服器、斷開連線等。清理成功返回 true，失敗返回 false。
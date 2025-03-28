---
titleSuffix: Esmx 框架相容性指南
description: 詳細介紹 Esmx 框架的環境要求，包括 Node.js 版本要求和瀏覽器相容性說明，幫助開發者正確配置開發環境。
head:
  - - meta
    - property: keywords
      content: Esmx, Node.js, 瀏覽器相容性, TypeScript, es-module-shims, 環境配置
---

# 環境要求

本文檔介紹了使用本框架所需的環境要求，包括 Node.js 環境和瀏覽器相容性。

## Node.js 環境

框架要求 Node.js 版本 >= 22.6，主要用於支援 TypeScript 類型導入（透過 `--experimental-strip-types` 標誌），無需額外編譯步驟。

## 瀏覽器相容性

框架預設採用相容模式建置，以支援更廣泛的瀏覽器。但需要注意，要實現完整的瀏覽器相容支援，需要手動添加 [es-module-shims](https://github.com/guybedford/es-module-shims) 依賴。

### 相容模式（預設）
- 🌐 Chrome：>= 87 
- 🔷 Edge：>= 88 
- 🦊 Firefox：>= 78 
- 🧭 Safari：>= 14 

根據 [Can I Use](https://caniuse.com/?search=dynamic%20import) 的統計數據，相容模式下的瀏覽器覆蓋率達到 96.81%。

### 原生支援模式
- 🌐 Chrome：>= 89 
- 🔷 Edge：>= 89 
- 🦊 Firefox：>= 108 
- 🧭 Safari：>= 16.4 

原生支援模式具有以下優勢：
- 零執行時開銷，無需額外的模組載入器
- 瀏覽器原生解析，更快的執行速度
- 更好的程式碼分割和按需載入能力

根據 [Can I Use](https://caniuse.com/?search=importmap) 的統計數據，相容模式下的瀏覽器覆蓋率達到 93.5%。

### 啟用相容支援

::: warning 重要提示
雖然框架預設使用相容模式建置，但要實現對舊版瀏覽器的完整支援，您需要在專案中添加 [es-module-shims](https://github.com/guybedford/es-module-shims) 依賴。

:::

在 HTML 文件中添加以下腳本：

```html
<!-- 開發環境 -->
<script async src="https://ga.jspm.io/npm:es-module-shims@2.0.10/dist/es-module-shims.js"></script>

<!-- 生產環境 -->
<script async src="/path/to/es-module-shims.js"></script>
```

::: tip 最佳實踐

1. 生產環境建議：
   - 將 es-module-shims 部署到自有伺服器
   - 確保資源載入的穩定性和存取速度
   - 避免潛在的安全風險
2. 效能考量：
   - 相容模式會帶來少量效能開銷
   - 可以根據目標用戶群的瀏覽器分佈決定是否啟用

:::
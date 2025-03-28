---
titleSuffix: Esmx 框架靜態資源路徑配置指南
description: 詳細介紹 Esmx 框架的基礎路徑配置，包括多環境部署、CDN 分發和資源存取路徑設定，幫助開發者實現靈活的靜態資源管理。
head:
  - - meta
    - property: keywords
      content: Esmx, 基礎路徑, Base Path, CDN, 靜態資源, 多環境部署, 資源管理
---

# 基礎路徑

基礎路徑（Base Path）是指應用程式中靜態資源（如 JavaScript、CSS、圖片等）的存取路徑前綴。在 Esmx 中，合理配置基礎路徑對於以下場景至關重要：

- **多環境部署**：支援開發環境、測試環境、生產環境等不同環境的資源存取
- **多區域部署**：適應不同地區或國家的叢集部署需求
- **CDN 分發**：實現靜態資源的全球分發和加速

## 預設路徑機制

Esmx 採用基於服務名稱的自動路徑生成機制。預設情況下，框架會讀取專案 `package.json` 中的 `name` 欄位來生成靜態資源的基礎路徑：`/your-app-name/`。

```json title="package.json"
{
    "name": "your-app-name"
}
```

這種約定優於配置的設計具有以下優勢：

- **一致性**：確保所有靜態資源使用統一的存取路徑
- **可預測性**：透過 `package.json` 的 `name` 欄位即可推斷出資源的存取路徑
- **可維護性**：無需額外配置，降低維護成本

## 動態路徑配置

在實際專案中，我們經常需要將同一套程式碼部署到不同的環境或區域。Esmx 提供了動態基礎路徑的支援，使得應用程式能夠適應不同的部署場景。

### 使用場景

#### 二級目錄部署
```
- example.com      -> 預設主站
- example.com/cn/  -> 中文站點
- example.com/en/  -> 英文站點
```

#### 獨立網域部署
```
- example.com    -> 預設主站
- cn.example.com -> 中文站點
- en.example.com -> 英文站點
```

### 配置方法

透過 `esmx.render()` 方法的 `base` 參數，你可以根據請求上下文動態設定基礎路徑：

```ts
const render = await esmx.render({
    base: '/cn',  // 設定基礎路徑
    params: {
        url: req.url
    }
});
```
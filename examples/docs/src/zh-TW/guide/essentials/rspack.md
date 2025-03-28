---
titleSuffix: Esmx 框架高效能建置引擎
description: 深入解析 Esmx 框架的 Rspack 建置系統，包括高效能編譯、多環境建置、資源優化等核心特性，協助開發者建置高效、可靠的現代 Web 應用。
head:
  - - meta
    - property: keywords
      content: Esmx, Rspack, 建置系統, 高效能編譯, 熱更新, 多環境建置, Tree Shaking, 程式碼分割, SSR, 資源優化, 開發效率, 建置工具
---

# Rspack

Esmx 基於 [Rspack](https://rspack.dev/) 建置系統實現，充分利用了 Rspack 的高效能建置能力。本文檔將介紹 Rspack 在 Esmx 框架中的定位和核心功能。

## 特性

Rspack 是 Esmx 框架的核心建置系統，它提供了以下關鍵特性：

- **高效能建置**：基於 Rust 實現的建置引擎，提供極速的編譯效能，顯著提升大型專案的建置速度
- **開發體驗優化**：支援熱更新（HMR）、增量編譯等現代開發特性，提供流暢的開發體驗
- **多環境建置**：統一的建置配置支援客戶端（client）、伺服器端（server）和 Node.js（node）環境，簡化多端開發流程
- **資源優化**：內建的資源處理和優化能力，支援程式碼分割、Tree Shaking、資源壓縮等特性

## 建置應用

Esmx 的 Rspack 建置系統採用模組化設計，主要包含以下核心模組：

### @esmx/rspack

基礎建置模組，提供以下核心能力：

- **統一建置配置**：提供標準化的建置配置管理，支援多環境配置
- **資源處理**：內建對 TypeScript、CSS、圖片等資源的處理能力
- **建置優化**：提供程式碼分割、Tree Shaking 等效能優化特性
- **開發伺服器**：整合高效能的開發伺服器，支援 HMR

### @esmx/rspack-vue

Vue 框架專用建置模組，提供：

- **Vue 元件編譯**：支援 Vue 2/3 元件的高效編譯
- **SSR 優化**：針對伺服器端渲染場景的特定優化
- **開發增強**：Vue 開發環境的特定功能增強

## 建置流程

Esmx 的建置流程主要分為以下幾個階段：

1. **配置初始化**
   - 載入專案配置
   - 合併預設配置和使用者配置
   - 根據環境變數調整配置

2. **資源編譯**
   - 解析原始碼相依
   - 轉換各類資源（TypeScript、CSS 等）
   - 處理模組匯入匯出

3. **優化處理**
   - 執行程式碼分割
   - 應用 Tree Shaking
   - 壓縮程式碼和資源

4. **輸出生成**
   - 生成目標檔案
   - 輸出資源映射
   - 生成建置報告

## 最佳實踐

### 開發環境優化

- **增量編譯配置**：合理配置 `cache` 選項，利用快取加快建置速度
- **HMR 優化**：針對性配置熱更新範圍，避免不必要的模組更新
- **資源處理優化**：使用適當的 loader 配置，避免重複處理

### 生產環境優化

- **程式碼分割策略**：合理配置 `splitChunks`，優化資源載入
- **資源壓縮**：啟用適當的壓縮配置，平衡建置時間和產物大小
- **快取優化**：利用內容雜湊和長期快取策略，提升載入效能

## 配置範例

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // 自訂建置配置
                config({ config }) {
                    // 在此處新增自訂的 Rspack 配置
                }
            })
        );
    },
} satisfies EsmxOptions;
```

::: tip
更多詳細的 API 說明和配置選項，請參考 [Rspack API 文件](/api/app/rspack.html)。
:::
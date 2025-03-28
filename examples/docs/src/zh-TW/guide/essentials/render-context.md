---
titleSuffix: Esmx 框架服務端渲染核心機制
description: 詳細介紹 Esmx 框架的渲染上下文（RenderContext）機制，包括資源管理、HTML 生成和 ESM 模組系統，幫助開發者理解和使用服務端渲染功能。
head:
  - - meta
    - property: keywords
      content: Esmx, 渲染上下文, RenderContext, SSR, 服務端渲染, ESM, 資源管理
---

# 渲染上下文

RenderContext 是 Esmx 框架中的一個核心類別，主要負責服務端渲染（SSR）過程中的資源管理和 HTML 生成。它具有以下核心特點：

1. **基於 ESM 的模組系統**
   - 採用現代的 ECMAScript Modules 標準
   - 支援原生的模組導入導出
   - 實現了更好的程式碼分割和按需加載

2. **智慧依賴收集**
   - 基於實際渲染路徑動態收集依賴
   - 避免不必要的資源加載
   - 支援非同步元件和動態導入

3. **精確的資源注入**
   - 嚴格控制資源加載順序
   - 優化首屏加載效能
   - 確保客戶端激活（Hydration）的可靠性

4. **靈活的配置機制**
   - 支援動態基礎路徑配置
   - 提供多種導入映射模式
   - 適應不同的部署場景

## 使用方式

在 Esmx 框架中，開發者通常不需要直接建立 RenderContext 實例，而是透過 `esmx.render()` 方法來取得實例：

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // 靜態檔案處理
        esmx.middleware(req, res, async () => {
            // 透過 esmx.render() 取得 RenderContext 實例
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // 回應 HTML 內容
            res.end(rc.html);
        });
    });
}
```

## 主要功能

### 依賴收集

RenderContext 實現了一套智慧的依賴收集機制，它基於實際渲染的元件來動態收集依賴，而不是簡單地預加載所有可能用到的資源：

#### 按需收集
- 在元件實際渲染過程中自動追蹤和記錄模組依賴
- 只收集當前頁面渲染時真正使用到的 CSS、JavaScript 等資源
- 透過 `importMetaSet` 精確記錄每個元件的模組依賴關係
- 支援非同步元件和動態導入的依賴收集

#### 自動化處理
- 開發者無需手動管理依賴收集過程
- 框架自動在元件渲染時收集依賴資訊
- 透過 `commit()` 方法統一處理所有收集到的資源
- 自動處理循環依賴和重複依賴的問題

#### 效能優化
- 避免加載未使用的模組，顯著減少首屏加載時間
- 精確控制資源加載順序，優化頁面渲染效能
- 自動生成最優的導入映射（Import Map）
- 支援資源預加載和按需加載策略

### 資源注入

RenderContext 提供了多種方法來注入不同類型的資源，每個方法都經過精心設計以優化資源加載效能：

- `preload()`：預加載 CSS 和 JS 資源，支援優先級配置
- `css()`：注入首屏樣式表，支援關鍵 CSS 提取
- `importmap()`：注入模組導入映射，支援動態路徑解析
- `moduleEntry()`：注入客戶端入口模組，支援多入口配置
- `modulePreload()`：預加載模組依賴，支援按需加載策略

### 資源注入順序

RenderContext 嚴格控制資源注入順序，這種順序設計是基於瀏覽器的工作原理和效能優化考慮：

1. head 部分：
   - `preload()`：預加載 CSS 和 JS 資源，讓瀏覽器盡早發現並開始加載這些資源
   - `css()`：注入首屏樣式表，確保頁面樣式在內容渲染時就位

2. body 部分：
   - `importmap()`：注入模組導入映射，定義 ESM 模組的路徑解析規則
   - `moduleEntry()`：注入客戶端入口模組，必須在 importmap 之後執行
   - `modulePreload()`：預加載模組依賴，必須在 importmap 之後執行

## 完整渲染流程

一個典型的 RenderContext 使用流程如下：

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. 渲染頁面內容並收集依賴
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. 提交依賴收集
    await rc.commit();
    
    // 3. 生成完整 HTML
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
};
```

## 進階特性

### 基礎路徑配置

RenderContext 提供了一個靈活的動態基礎路徑配置機制，支援在執行時動態設定靜態資源的基礎路徑：

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // 設定基礎路徑
    params: {
        url: req.url
    }
});
```

這種機制特別適用於以下場景：

1. **多語言站點部署**
   ```
   主域名.com      → 預設語言
   主域名.com/cn/  → 中文站點
   主域名.com/en/  → 英文站點
   ```

2. **微前端應用**
   - 支援子應用在不同路徑下靈活部署
   - 便於整合到不同的主應用中

### 導入映射模式

RenderContext 提供了兩種導入映射（Import Map）模式：

1. **Inline 模式**（預設）
   - 將導入映射直接內嵌到 HTML 中
   - 適合小型應用，減少額外的網路請求
   - 頁面加載時立即可用

2. **JS 模式**
   - 透過外部 JavaScript 檔案加載導入映射
   - 適合大型應用，可以利用瀏覽器快取機制
   - 支援動態更新映射內容

可以透過配置選擇合適的模式：

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### 入口函數配置

RenderContext 支援透過 `entryName` 配置來指定服務端渲染的入口函數：

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // 指定使用行動端入口函數
    params: {
        url: req.url
    }
});
```

這種機制特別適用於以下場景：

1. **多模板渲染**
   ```ts title="src/entry.server.ts"
   // 行動端入口函數
   export const mobile = async (rc: RenderContext) => {
       // 行動端特定的渲染邏輯
   };

   // 桌面端入口函數
   export const desktop = async (rc: RenderContext) => {
       // 桌面端特定的渲染邏輯
   };
   ```

2. **A/B 測試**
   - 支援同一頁面使用不同的渲染邏輯
   - 便於進行使用者體驗實驗
   - 靈活切換不同的渲染策略

3. **特殊渲染需求**
   - 支援某些頁面使用自訂的渲染流程
   - 適應不同場景的效能優化需求
   - 實現更精細的渲染控制

## 最佳實踐

1. **取得 RenderContext 實例**
   - 始終透過 `esmx.render()` 方法取得實例
   - 根據需要傳入適當的參數
   - 避免手動建立實例

2. **依賴收集**
   - 確保所有模組都正確呼叫 `importMetaSet.add(import.meta)`
   - 在渲染完成後立即呼叫 `commit()` 方法
   - 合理使用非同步元件和動態導入優化首屏加載

3. **資源注入**
   - 嚴格遵循資源注入順序
   - 不要在 body 中注入 CSS
   - 確保 importmap 在 moduleEntry 之前

4. **效能優化**
   - 使用 preload 預加載關鍵資源
   - 合理使用 modulePreload 優化模組加載
   - 避免不必要的資源加載
   - 利用瀏覽器快取機制優化加載效能
```
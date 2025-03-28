---
titleSuffix: Esmx 框架渲染上下文 API 參考
description: 詳細介紹 Esmx 框架的 RenderContext 核心類別，包括渲染控制、資源管理、狀態同步和路由控制等功能，幫助開發者實現高效的伺服器端渲染。
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, 伺服器端渲染, 渲染上下文, 狀態同步, 資源管理, Web 應用框架
---

# RenderContext

RenderContext 是 Esmx 框架中的核心類別，負責管理伺服器端渲染（SSR）的完整生命週期。它提供了一套完整的 API 來處理渲染上下文、資源管理、狀態同步等關鍵任務：

- **渲染控制**：管理伺服器端渲染流程，支援多入口渲染、條件渲染等場景
- **資源管理**：智慧收集和注入 JS、CSS 等靜態資源，最佳化載入效能
- **狀態同步**：處理伺服器端狀態序列化，確保客戶端正確啟用（hydration）
- **路由控制**：支援伺服器端重新導向、狀態碼設定等高階功能

## 類型定義

### ServerRenderHandle

伺服器端渲染處理函式的類型定義。

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

伺服器端渲染處理函式是一個非同步或同步函式，接收 RenderContext 實例作為參數，用於處理伺服器端渲染邏輯。

```ts title="entry.node.ts"
// 1. 非同步處理函式
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. 同步處理函式
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

渲染過程中收集的資源檔案列表的類型定義。

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: JavaScript 檔案列表
- **css**: 樣式表檔案列表
- **modulepreload**: 需要預載的 ESM 模組列表
- **resources**: 其他資源檔案列表（圖片、字型等）

```ts
// 資源檔案列表示例
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

定義 importmap 的生成模式。

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: 將 importmap 內容直接內嵌到 HTML 中，適用於以下場景：
  - 需要減少 HTTP 請求數量
  - importmap 內容較小
  - 對首屏載入效能要求較高
- `js`: 將 importmap 內容生成為獨立的 JS 檔案，適用於以下場景：
  - importmap 內容較大
  - 需要利用瀏覽器快取機制
  - 多個頁面共享相同的 importmap

渲染上下文類別，負責伺服器端渲染（SSR）過程中的資源管理和 HTML 生成。
## 實例選項

定義渲染上下文的配置選項。

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **類型**: `string`
- **預設值**: `''`

靜態資源的基礎路徑。
- 所有靜態資源（JS、CSS、圖片等）都會基於此路徑載入
- 支援執行時動態配置，無需重新建置
- 常用於多語言站點、微前端應用等場景

#### entryName

- **類型**: `string`
- **預設值**: `'default'`

伺服器端渲染入口函式名稱。用於指定伺服器端渲染時使用的入口函式，當一個模組匯出多個渲染函式時使用。

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // 行動端渲染邏輯
};

export const desktop = async (rc: RenderContext) => {
  // 桌面端渲染邏輯
};
```

#### params

- **類型**: `Record<string, any>`
- **預設值**: `{}`

渲染參數。可以傳遞任意類型的參數給渲染函式，常用於傳遞請求資訊（URL、query 參數等）。

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

- **類型**: `'inline' | 'js'`
- **預設值**: `'inline'`

匯入映射（Import Map）的生成模式：
- `inline`: 將 importmap 內容直接內嵌到 HTML 中
- `js`: 將 importmap 內容生成為獨立的 JS 檔案


## 實例屬性

### esmx

- **類型**: `Esmx`
- **唯讀**: `true`

Esmx 實例引用。用於存取框架核心功能和配置資訊。

### redirect

- **類型**: `string | null`
- **預設值**: `null`

重新導向地址。設定後，伺服器端可以根據此值進行 HTTP 重新導向，常用於登入驗證、權限控制等場景。

```ts title="entry.node.ts"
// 登入驗證示例
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // 繼續渲染頁面...
};

// 權限控制示例
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // 繼續渲染頁面...
};
```

### status

- **類型**: `number | null`
- **預設值**: `null`

HTTP 回應狀態碼。可以設定任意有效的 HTTP 狀態碼，常用於錯誤處理、重新導向等場景。

```ts title="entry.node.ts"
// 404 錯誤處理示例
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // 渲染 404 頁面...
    return;
  }
  // 繼續渲染頁面...
};

// 臨時重新導向示例
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // 臨時重新導向，保持請求方法不變
    return;
  }
  // 繼續渲染頁面...
};
```

### html

- **類型**: `string`
- **預設值**: `''`

HTML 內容。用於設定和取得最終生成的 HTML 內容，在設定時自動處理基礎路徑佔位符。

```ts title="entry.node.ts"
// 基礎用法
export default async (rc: RenderContext) => {
  // 設定 HTML 內容
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

// 動態基礎路徑
const rc = await esmx.render({
  base: '/app',  // 設定基礎路徑
  params: { url: req.url }
});

// HTML 中的佔位符會被自動替換：
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// 替換為：
// /app/your-app-name/css/style.css
```

### base

- **類型**: `string`
- **唯讀**: `true`
- **預設值**: `''`

靜態資源的基礎路徑。所有靜態資源（JS、CSS、圖片等）都會基於此路徑載入，支援執行時動態配置。

```ts
// 基礎用法
const rc = await esmx.render({
  base: '/esmx',  // 設定基礎路徑
  params: { url: req.url }
});

// 多語言站點示例
const rc = await esmx.render({
  base: '/cn',  // 中文站點
  params: { lang: 'zh-CN' }
});

// 微前端應用示例
const rc = await esmx.render({
  base: '/app1',  // 子應用1
  params: { appId: 1 }
});
```

### entryName

- **類型**: `string`
- **唯讀**: `true`
- **預設值**: `'default'`

伺服器端渲染入口函式名稱。用於從 entry.server.ts 中選擇要使用的渲染函式。

```ts title="entry.node.ts"
// 預設入口函式
export default async (rc: RenderContext) => {
  // 預設渲染邏輯
};

// 多個入口函式
export const mobile = async (rc: RenderContext) => {
  // 行動端渲染邏輯
};

export const desktop = async (rc: RenderContext) => {
  // 桌面端渲染邏輯
};

// 根據裝置類型選擇入口函式
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **類型**: `Record<string, any>`
- **唯讀**: `true`
- **預設值**: `{}`

渲染參數。可以在伺服器端渲染過程中傳遞和存取參數，常用於傳遞請求資訊、頁面配置等。

```ts
// 基礎用法 - 傳遞 URL 和語言設定
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// 頁面配置 - 設定主題和佈局
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// 環境配置 - 注入 API 地址
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **類型**: `Set<ImportMeta>`

模組依賴收集集合。在元件渲染過程中自動追蹤和記錄模組依賴，只收集當前頁面渲染時真正使用到的資源。

```ts
// 基礎用法
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // 在渲染過程中自動收集模組依賴
  // 框架會在元件渲染時自動呼叫 context.importMetaSet.add(import.meta)
  // 開發者無需手動處理依賴收集
  return '<div id="app">Hello World</div>';
};

// 使用示例
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **類型**: `RenderFiles`

資源檔案列表：
- js: JavaScript 檔案列表
- css: 樣式表檔案列表
- modulepreload: 需要預載的 ESM 模組列表
- resources: 其他資源檔案列表（圖片、字型等）

```ts
// 資源收集
await rc.commit();

// 資源注入
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- 預載資源 -->
    ${rc.preload()}
    <!-- 注入樣式表 -->
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

- **類型**: `'inline' | 'js'`
- **預設值**: `'inline'`

匯入映射的生成模式：
- `inline`: 將 importmap 內容直接內嵌到 HTML 中
- `js`: 將 importmap 內容生成為獨立的 JS 檔案


## 實例方法

### serialize()

- **參數**: 
  - `input: any` - 需要序列化的資料
  - `options?: serialize.SerializeJSOptions` - 序列化選項
- **回傳值**: `string`

將 JavaScript 物件序列化為字串。用於在伺服器端渲染過程中序列化狀態資料，確保資料可以安全地嵌入到 HTML 中。

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

- **參數**: 
  - `varName: string` - 變數名
  - `data: Record<string, any>` - 狀態資料
- **回傳值**: `string`

將狀態資料序列化並注入到 HTML 中。使用安全的序列化方法處理資料，支援複雜的資料結構。

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

- **回傳值**: `Promise<void>`

提交依賴收集並更新資源列表。從 importMetaSet 中收集所有使用到的模組，基於 manifest 檔案解析每個模組的具體資源。

```ts
// 渲染並提交依賴
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// 提交依賴收集
await rc.commit();
```

### preload()

- **回傳值**: `string`

生成資源預載標籤。用於預載 CSS 和 JavaScript 資源，支援優先級配置，自動處理基礎路徑。

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}  <!-- 注入樣式表 -->
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

- **回傳值**: `string`

生成 CSS 樣式表標籤。注入收集到的 CSS 檔案，確保樣式表按正確順序載入。

```ts
rc.html = `
  <head>
    ${rc.css()}  <!-- 注入所有收集到的樣式表 -->
  </head>
`;
```

### importmap()

- **回傳值**: `string`

生成匯入映射標籤。根據 importmapMode 配置生成內嵌或外部匯入映射。

```ts
rc.html = `
  <head>
    ${rc.importmap()}  <!-- 注入匯入映射 -->
  </head>
`;
```

### moduleEntry()

- **回傳值**: `string`

生成客戶端入口模組標籤。注入客戶端入口模組，必須在 importmap 之後執行。

```ts
rc.html = `
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}  <!-- 注入客戶端入口模組 -->
  </body>
`;
```

### modulePreload()

- **回傳值**: `string`

生成模組預載標籤。預載收集到的 ESM 模組，最佳化首屏載入效能。

```ts
rc.html = `
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}  <!-- 預載模組依賴 -->
  </body>
`;
```
---
titleSuffix: 框架核心類 API 參考
description: 詳細介紹 Esmx 框架的核心類 API，包括應用生命週期管理、靜態資源處理和伺服器端渲染能力，幫助開發者深入理解框架的核心功能。
head:
  - - meta
    - property: keywords
      content: Esmx, API, 生命週期管理, 靜態資源, 伺服器端渲染, Rspack, Web 應用框架
---

# Esmx

## 簡介

Esmx 是一個基於 Rspack 的高效能 Web 應用框架，提供了完整的應用生命週期管理、靜態資源處理和伺服器端渲染能力。

## 類型定義

### RuntimeTarget

- **類型定義**:
```ts
type RuntimeTarget = 'client' | 'server'
```

應用程式執行環境類型：
- `client`: 執行在瀏覽器環境，支援 DOM 操作和瀏覽器 API
- `server`: 執行在 Node.js 環境，支援檔案系統和伺服器端功能

### ImportMap

- **類型定義**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

ES 模組匯入映射類型。

#### SpecifierMap

- **類型定義**:
```ts
type SpecifierMap = Record<string, string>
```

模組識別符映射類型，用於定義模組匯入路徑的映射關係。

#### ScopesMap

- **類型定義**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

作用域映射類型，用於定義特定作用域下的模組匯入映射關係。

### COMMAND

- **類型定義**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

命令類型列舉：
- `dev`: 開發環境命令，啟動開發伺服器並支援熱更新
- `build`: 建置命令，生成生產環境的建置產物
- `preview`: 預覽命令，啟動本地預覽伺服器
- `start`: 啟動命令，執行生產環境伺服器

## 實例選項

定義 Esmx 框架的核心配置選項。

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

- **類型**: `string`
- **預設值**: `process.cwd()`

專案根目錄路徑。可以是絕對路徑或相對路徑，相對路徑基於目前工作目錄解析。

#### isProd

- **類型**: `boolean`
- **預設值**: `process.env.NODE_ENV === 'production'`

環境標識。
- `true`: 生產環境
- `false`: 開發環境

#### basePathPlaceholder

- **類型**: `string | false`
- **預設值**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

基礎路徑佔位符配置。用於執行時動態替換資源的基礎路徑。設定為 `false` 可以停用此功能。

#### modules

- **類型**: `ModuleConfig`

模組配置選項。用於配置專案的模組解析規則，包括模組別名、外部依賴等配置。

#### packs

- **類型**: `PackConfig`

打包配置選項。用於將建置產物打包成標準的 npm .tgz 格式軟體包。

#### devApp

- **類型**: `(esmx: Esmx) => Promise<App>`

開發環境應用建立函式。僅在開發環境中使用，用於建立開發伺服器的應用實例。

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // 自訂 Rspack 配置
        }
      })
    )
  }
}
```

#### server

- **類型**: `(esmx: Esmx) => Promise<void>`

伺服器啟動配置函式。用於配置和啟動 HTTP 伺服器，在開發環境和生產環境中都可使用。

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

- **類型**: `(esmx: Esmx) => Promise<void>`

建置後置處理函式。在專案建置完成後執行，可用於：
- 執行額外的資源處理
- 部署操作
- 生成靜態檔案
- 傳送建置通知

## 實例屬性

### name

- **類型**: `string`
- **唯讀**: `true`

目前模組的名稱，來源於模組配置。

### varName

- **類型**: `string`
- **唯讀**: `true`

基於模組名生成的合法 JavaScript 變數名。

### root

- **類型**: `string`
- **唯讀**: `true`

專案根目錄的絕對路徑。如果配置的 `root` 為相對路徑，則基於目前工作目錄解析。

### isProd

- **類型**: `boolean`
- **唯讀**: `true`

判斷目前是否為生產環境。優先使用配置項中的 `isProd`，若未配置則根據 `process.env.NODE_ENV` 判斷。

### basePath

- **類型**: `string`
- **唯讀**: `true`
- **拋出**: `NotReadyError` - 框架未初始化時

取得以斜線開頭和結尾的模組基礎路徑。返回格式為 `/${name}/`，其中 name 來自模組配置。

### basePathPlaceholder

- **類型**: `string`
- **唯讀**: `true`

取得用於執行時動態替換的基礎路徑佔位符。可透過配置停用。

### middleware

- **類型**: `Middleware`
- **唯讀**: `true`

取得靜態資源處理中介軟體。根據環境提供不同實作：
- 開發環境：支援原始碼即時編譯、熱更新
- 生產環境：支援靜態資源的長期快取

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **類型**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **唯讀**: `true`

取得伺服器端渲染函式。根據環境提供不同實作：
- 開發環境：支援熱更新和即時預覽
- 生產環境：提供最佳化的渲染效能

```ts
// 基本用法
const rc = await esmx.render({
  params: { url: req.url }
});

// 進階配置
const rc = await esmx.render({
  base: '',                    // 基礎路徑
  importmapMode: 'inline',     // 匯入映射模式
  entryName: 'default',        // 渲染入口
  params: {
    url: req.url,
    state: { user: 'admin' }   // 狀態資料
  }
});
```

### COMMAND

- **類型**: `typeof COMMAND`
- **唯讀**: `true`

取得命令列舉類型定義。

### moduleConfig

- **類型**: `ParsedModuleConfig`
- **唯讀**: `true`
- **拋出**: `NotReadyError` - 框架未初始化時

取得目前模組的完整配置資訊，包括模組解析規則、別名配置等。

### packConfig

- **類型**: `ParsedPackConfig`
- **唯讀**: `true`
- **拋出**: `NotReadyError` - 框架未初始化時

取得目前模組的打包相關配置，包括輸出路徑、package.json 處理等。

## 實例方法

### constructor()

- **參數**: 
  - `options?: EsmxOptions` - 框架配置選項
- **返回值**: `Esmx`

建立 Esmx 框架實例。

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **參數**: `command: COMMAND`
- **返回值**: `Promise<boolean>`
- **拋出**:
  - `Error`: 重複初始化時
  - `NotReadyError`: 存取未初始化實例時

初始化 Esmx 框架實例。執行以下核心初始化流程：

1. 解析專案配置（package.json、模組配置、打包配置等）
2. 建立應用實例（開發環境或生產環境）
3. 根據命令執行相應的生命週期方法

::: warning 注意
- 重複初始化時會拋出錯誤
- 存取未初始化的實例時會拋出 `NotReadyError`

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

銷毀 Esmx 框架實例，執行資源清理和連線關閉等操作。主要用於：
- 關閉開發伺服器
- 清理暫存檔案和快取
- 釋放系統資源

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **返回值**: `Promise<boolean>`

執行應用程式的建置流程，包括：
- 編譯原始碼
- 生成生產環境的建置產物
- 最佳化和壓縮程式碼
- 生成資源清單

::: warning 注意
在框架實例未初始化時呼叫會拋出 `NotReadyError`
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // 建置完成後生成靜態 HTML
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
- **拋出**: `NotReadyError` - 框架未初始化時

啟動 HTTP 伺服器和配置伺服器實例。在以下生命週期中被呼叫：
- 開發環境（dev）：啟動開發伺服器，提供熱更新
- 生產環境（start）：啟動生產伺服器，提供生產級效能

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // 處理靜態資源
      esmx.middleware(req, res, async () => {
        // 伺服器端渲染
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

執行建置後的處理邏輯，用於：
- 生成靜態 HTML 檔案
- 處理建置產物
- 執行部署任務
- 傳送建置通知

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // 生成多個頁面的靜態 HTML
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

解析專案路徑，將相對路徑轉換為絕對路徑。

- **參數**:
  - `projectPath: ProjectPath` - 專案路徑類型
  - `...args: string[]` - 路徑片段
- **返回值**: `string` - 解析後的絕對路徑

- **範例**:
```ts
// 解析靜態資源路徑
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

同步寫入檔案內容。

- **參數**:
  - `filepath`: `string` - 檔案的絕對路徑
  - `data`: `any` - 要寫入的資料，可以是字串、Buffer 或物件
- **返回值**: `boolean` - 寫入是否成功

- **範例**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

同步讀取並解析 JSON 檔案。

- **參數**:
  - `filename`: `string` - JSON 檔案的絕對路徑

- **返回值**: `any` - 解析後的 JSON 物件
- **異常**: 當檔案不存在或 JSON 格式錯誤時拋出異常

- **範例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // 使用 manifest 物件
}
```

### readJson()

非同步讀取並解析 JSON 檔案。

- **參數**:
  - `filename`: `string` - JSON 檔案的絕對路徑

- **返回值**: `Promise<any>` - 解析後的 JSON 物件
- **異常**: 當檔案不存在或 JSON 格式錯誤時拋出異常

- **範例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
  // 使用 manifest 物件
}
```

### getManifestList()

取得建置清單列表。

- **參數**:
  - `target`: `RuntimeTarget` - 目標環境類型
    - `'client'`: 客戶端環境
    - `'server'`: 伺服器端環境

- **返回值**: `Promise<readonly ManifestJson[]>` - 唯讀的建置清單列表
- **異常**: 在框架實例未初始化時拋出 `NotReadyError`

該方法用於取得指定目標環境的建置清單列表，包含以下功能：
1. **快取管理**
   - 使用內部快取機制避免重複載入
   - 返回不可變的清單列表

2. **環境適配**
   - 支援客戶端和伺服器端兩種環境
   - 根據目標環境返回對應的清單資訊

3. **模組映射**
   - 包含模組匯出資訊
   - 記錄資源依賴關係

- **範例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  // 取得客戶端建置清單
  const manifests = await esmx.getManifestList('client');

  // 查找特定模組的建置資訊
  const appModule = manifests.find(m => m.name === 'my-app');
  if (appModule) {
    console.log('App exports:', appModule.exports);
    console.log('App chunks:', appModule.chunks);
  }
}
```

### getImportMap()

取得匯入映射物件。

- **參數**:
  - `target`: `RuntimeTarget` - 目標環境類型
    - `'client'`: 生成瀏覽器環境的匯入映射
    - `'server'`: 生成伺服器端環境的匯入映射

- **返回值**: `Promise<Readonly<ImportMap>>` - 唯讀的匯入映射物件
- **異常**: 在框架實例未初始化時拋出 `NotReadyError`

該方法用於生成 ES 模組匯入映射（Import Map），具有以下特點：
1. **模組解析**
   - 基於建置清單生成模組映射
   - 支援客戶端和伺服器端兩種環境
   - 自動處理模組路徑解析

2. **快取最佳化**
   - 使用內部快取機制
   - 返回不可變的映射物件

3. **路徑處理**
   - 自動處理模組路徑
   - 支援動態基礎路徑

- **範例**:
```ts title="src/entry.node.ts"
async server(esmx) {
  // 取得客戶端匯入映射
  const importmap = await esmx.getImportMap('client');

  // 自訂 HTML 模板
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script type="importmap">
        ${JSON.stringify(importmap)}
      </script>
    </head>
    <body>
      <!-- 頁面內容 -->
    </body>
    </html>
  `;
}
```

### getImportMapClientInfo()

取得客戶端匯入映射資訊。

- **參數**:
  - `mode`: `ImportmapMode` - 匯入映射模式
    - `'inline'`: 內嵌模式，返回 HTML script 標籤
    - `'js'`: JS 檔案模式，返回帶有檔案路徑的資訊

- **返回值**: 
  - JS 檔案模式:
    ```ts
    {
      src: string;      // JS 檔案的 URL
      filepath: string;  // JS 檔案的本地路徑
      code: string;      // HTML script 標籤內容
    }
    ```
  - 內嵌模式:
    ```ts
    {
      src: null;
      filepath: null;
      code:
---
titleSuffix: Esmx 框架專案結構與規範指南
description: 詳細介紹 Esmx 框架的標準專案結構、入口檔案規範和設定檔規範，幫助開發者建立規範化、可維護的 SSR 應用。
head:
  - - meta
    - property: keywords
      content: Esmx, 專案結構, 入口檔案, 設定規範, SSR框架, TypeScript, 專案規範, 開發標準
---

# 標準規範

Esmx 是一個現代化的 SSR 框架，採用標準化的專案結構和路徑解析機制，以確保專案在開發和生產環境中的一致性和可維護性。

## 專案結構規範

### 標準目錄結構

```txt
root
│─ dist                  # 編譯輸出目錄
│  ├─ package.json       # 編譯輸出後的軟體套件設定
│  ├─ server             # 伺服器端編譯輸出
│  │  └─ manifest.json   # 編譯清單輸出，用於產生 importmap
│  ├─ node               # Node 伺服器程式編譯輸出
│  ├─ client             # 用戶端編譯輸出
│  │  ├─ versions        # 版本儲存目錄
│  │  │  └─ latest.tgz   # 將 dist 目錄歸檔，對外提供軟體套件分發
│  │  └─ manifest.json   # 編譯清單輸出，用於產生 importmap
│  └─ src                # 使用 tsc 產生的檔案類型
├─ src
│  ├─ entry.server.ts    # 伺服器端應用程式入口
│  ├─ entry.client.ts    # 用戶端應用程式入口
│  └─ entry.node.ts      # Node 伺服器應用程式入口
├─ tsconfig.json         # TypeScript 設定
└─ package.json          # 軟體套件設定
```

::: tip 拓展知識
- `esmx.name` 來源於 `package.json` 的 `name` 欄位
- `dist/package.json` 來源於根目錄的 `package.json`
- 設定 `packs.enable` 為 `true` 時，才會對 `dist` 目錄進行歸檔

:::

## 入口檔案規範

### entry.client.ts
用戶端入口檔案負責：
- **初始化應用**：設定用戶端應用的基礎設定
- **路由管理**：處理用戶端路由和導航
- **狀態管理**：實現用戶端狀態的儲存和更新
- **互動處理**：管理使用者事件和介面互動

### entry.server.ts
伺服器端入口檔案負責：
- **伺服器端渲染**：執行 SSR 渲染流程
- **HTML 生成**：建立初始頁面結構
- **資料預取**：處理伺服器端資料獲取
- **狀態注入**：將伺服器端狀態傳遞給用戶端
- **SEO 優化**：確保頁面的搜尋引擎優化

### entry.node.ts
Node.js 伺服器入口檔案負責：
- **伺服器設定**：設定 HTTP 伺服器參數
- **路由處理**：管理伺服器端路由規則
- **中介軟體整合**：設定伺服器中介軟體
- **環境管理**：處理環境變數和設定
- **請求回應**：處理 HTTP 請求和回應

## 設定檔規範

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```
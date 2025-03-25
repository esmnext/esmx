---
titleSuffix: Gez 框架 HTML SSR 應用範例
description: 從零開始搭建基於 Gez 的 HTML SSR 應用，透過實例展示框架的基本用法，包括專案初始化、HTML 配置和入口檔案設定。
head:
  - - meta
    - property: keywords
      content: Gez, HTML, SSR應用, TypeScript配置, 專案初始化, 伺服器端渲染, 客戶端互動
---

# HTML

本教學將幫助你從零開始搭建一個基於 Gez 的 HTML SSR 應用。我們將透過一個完整的範例來展示如何使用 Gez 框架建立伺服器端渲染應用。

## 專案結構

首先，讓我們了解專案的基本結構：

```bash
.
├── package.json         # 專案配置文件，定義依賴和腳本指令
├── tsconfig.json        # TypeScript 配置文件，設定編譯選項
└── src                  # 原始碼目錄
    ├── app.ts           # 主應用元件，定義頁面結構和互動邏輯
    ├── create-app.ts    # 應用實例建立工廠，負責初始化應用
    ├── entry.client.ts  # 客戶端入口檔案，處理瀏覽器端渲染
    ├── entry.node.ts    # Node.js 伺服器入口檔案，負責開發環境配置和伺服器啟動
    └── entry.server.ts  # 伺服器端入口檔案，處理 SSR 渲染邏輯
```

## 專案配置

### package.json

建立 `package.json` 檔案，配置專案依賴和腳本：

```json title="package.json"
{
  "name": "ssr-demo-html",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3"
  }
}
```

建立完 `package.json` 檔案後，需要安裝專案依賴。你可以使用以下任一指令來安裝：
```bash
pnpm install
# 或
yarn install
# 或
npm install
```

這將安裝所有必需的依賴套件，包括 TypeScript 和 SSR 相關的依賴。

### tsconfig.json

建立 `tsconfig.json` 檔案，配置 TypeScript 編譯選項：

```json title="tsconfig.json"
{
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "node",
        "isolatedModules": true,
        "resolveJsonModule": true,
        
        "target": "ESNext",
        "lib": ["ESNext", "DOM"],
        
        "strict": true,
        "skipLibCheck": true,
        "types": ["@types/node"],
        
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        
        "baseUrl": ".",
        "paths": {
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## 原始碼結構

### app.ts

建立主應用元件 `src/app.ts`，實作頁面結構和互動邏輯：

```ts title="src/app.ts"
/**
 * @file 範例元件
 * @description 展示一個帶有自動更新時間的頁面標題，用於演示 Gez 框架的基本功能
 */

export default class App {
    /**
     * 當前時間，使用 ISO 格式
     * @type {string}
     */
    public time = '';

    /**
     * 建立應用實例
     * @param {SsrContext} [ssrContext] - 伺服器端上下文，包含匯入元資料集合
     */
    public constructor(public ssrContext?: SsrContext) {
        // 建構函式中不需要額外初始化
    }

    /**
     * 渲染頁面內容
     * @returns {string} 返回頁面 HTML 結構
     */
    public render(): string {
        // 確保在伺服器端環境下正確收集匯入元資料
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Gez 快速開始</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * 客戶端初始化
     * @throws {Error} 當找不到時間顯示元素時拋出錯誤
     */
    public onClient(): void {
        // 取得時間顯示元素
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('找不到時間顯示元素');
        }

        // 設定定時器，每秒更新一次時間
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * 伺服器端初始化
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * 伺服器端上下文介面
 * @interface
 */
export interface SsrContext {
    /**
     * 匯入元資料集合
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

建立 `src/create-app.ts` 檔案，負責建立應用實例：

```ts title="src/create-app.ts"
/**
 * @file 應用實例建立
 * @description 負責建立和配置應用實例
 */

import App from './app';

export function createApp() {
    const app = new App();
    return {
        app
    };
}
```

### entry.client.ts

建立客戶端入口檔案 `src/entry.client.ts`：

```ts title="src/entry.client.ts"
/**
 * @file 客戶端入口檔案
 * @description 負責客戶端互動邏輯和動態更新
 */

import { createApp } from './create-app';

// 建立應用實例並初始化
const { app } = createApp();
app.onClient();
```

### entry.node.ts

建立 `entry.node.ts` 檔案，配置開發環境和伺服器啟動：

```ts title="src/entry.node.ts"
/**
 * @file Node.js 伺服器入口檔案
 * @description 負責開發環境配置和伺服器啟動，提供 SSR 執行時環境
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * 配置開發環境的應用建立器
     * @description 建立並配置 Rspack 應用實例，用於開發環境的建置和熱更新
     * @param gez Gez 框架實例，提供核心功能和配置介面
     * @returns 返回配置好的 Rspack 應用實例，支援 HMR 和即時預覽
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // 在此處自訂 Rspack 編譯配置
                }
            })
        );
    },

    /**
     * 配置並啟動 HTTP 伺服器
     * @description 建立 HTTP 伺服器實例，整合 Gez 中介軟體，處理 SSR 請求
     * @param gez Gez 框架實例，提供中介軟體和渲染功能
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // 使用 Gez 中介軟體處理請求
            gez.middleware(req, res, async () => {
                // 執行伺服器端渲染
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('服務啟動: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

這個檔案是開發環境配置和伺服器啟動的入口檔案，主要包含兩個核心功能：

1. `devApp` 函式：負責建立和配置開發環境的 Rspack 應用實例，支援熱更新和即時預覽功能。
2. `server` 函式：負責建立和配置 HTTP 伺服器，整合 Gez 中介軟體處理 SSR 請求。

### entry.server.ts

建立伺服器端渲染入口檔案 `src/entry.server.ts`：

```ts title="src/entry.server.ts"
/**
 * @file 伺服器端渲染入口檔案
 * @description 負責伺服器端渲染流程、HTML 生成和資源注入
 */

import type { RenderContext } from '@gez/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// 封裝頁面內容生成邏輯
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // 將伺服器端渲染上下文注入到應用實例中
    app.ssrContext = ssrContext;
    // 初始化伺服器端
    app.onServer();

    // 生成頁面內容
    return app.render();
};

export default async (rc: RenderContext) => {
    // 建立應用實例，返回包含 app 實例的物件
    const { app } = createApp();
    // 使用 renderToString 生成頁面內容
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // 提交依賴收集，確保所有必要資源都被載入
    await rc.commit();

    // 生成完整的 HTML 結構
    rc.html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    ${rc.preload()}
    <title>Gez 快速開始</title>
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

## 執行專案

完成上述檔案配置後，你可以使用以下指令來執行專案：

1. 開發模式：
```bash
npm run dev
```

2. 建置專案：
```bash
npm run build
```

3. 生產環境執行：
```bash
npm run start
```

現在，你已經成功建立了一個基於 Gez 的 HTML SSR 應用！訪問 http://localhost:3000 即可看到效果。
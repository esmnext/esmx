---
titleSuffix: Esmx 框架 Vue3 SSR 應用範例
description: 從零開始搭建基於 Esmx 的 Vue3 SSR 應用，透過實例展示框架的基本用法，包括專案初始化、Vue3 配置和入口檔案設定。
head:
  - - meta
    - property: keywords
      content: Esmx, Vue3, SSR應用, TypeScript配置, 專案初始化, 伺服器端渲染, 客戶端互動, 組合式API
---

# Vue3

本教學將幫助你從零開始搭建一個基於 Esmx 的 Vue3 SSR 應用。我們將透過一個完整的範例來展示如何使用 Esmx 框架建立伺服器端渲染應用。

## 專案結構

首先，讓我們了解專案的基本結構：

```bash
.
├── package.json         # 專案配置文件，定義依賴和腳本指令
├── tsconfig.json        # TypeScript 配置文件，設定編譯選項
└── src                  # 原始碼目錄
    ├── app.vue          # 主應用元件，定義頁面結構和互動邏輯
    ├── create-app.ts    # Vue 實例建立工廠，負責初始化應用
    ├── entry.client.ts  # 客戶端入口檔案，處理瀏覽器端渲染
    ├── entry.node.ts    # Node.js 伺服器入口檔案，負責開發環境配置和伺服器啟動
    └── entry.server.ts  # 伺服器端入口檔案，處理 SSR 渲染邏輯
```

## 專案配置

### package.json

建立 `package.json` 檔案，配置專案依賴和腳本：

```json title="package.json"
{
  "name": "ssr-demo-vue3",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack-vue": "*",
    "@types/node": "22.8.6",
    "@vue/server-renderer": "^3.5.13",
    "typescript": "^5.7.3",
    "vue": "^3.5.13",
    "vue-tsc": "^2.1.6"
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

這將安裝所有必需的依賴套件，包括 Vue3、TypeScript 和 SSR 相關的依賴。

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
            "ssr-demo-vue3/src/*": ["./src/*"],
            "ssr-demo-vue3/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## 原始碼結構

### app.vue

建立主應用元件 `src/app.vue`，使用 Vue3 的組合式 API：

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Esmx 快速開始</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file 範例元件
 * @description 展示一個帶有自動更新時間的頁面標題，用於演示 Esmx 框架的基本功能
 */

import { onMounted, onUnmounted, ref } from 'vue';

// 當前時間，每秒更新一次
const time = ref(new Date().toISOString());
let timer: NodeJS.Timeout;

onMounted(() => {
    timer = setInterval(() => {
        time.value = new Date().toISOString();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>
```

### create-app.ts

建立 `src/create-app.ts` 檔案，負責建立 Vue 應用實例：

```ts title="src/create-app.ts"
/**
 * @file Vue 實例建立
 * @description 負責建立和配置 Vue 應用實例
 */

import { createSSRApp } from 'vue';
import App from './app.vue';

export function createApp() {
    const app = createSSRApp(App);
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

// 建立 Vue 實例
const { app } = createApp();

// 掛載 Vue 實例
app.mount('#app');
```

### entry.node.ts

建立 `entry.node.ts` 檔案，配置開發環境和伺服器啟動：

```ts title="src/entry.node.ts"
/**
 * @file Node.js 伺服器入口檔案
 * @description 負責開發環境配置和伺服器啟動，提供 SSR 執行時環境
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * 配置開發環境的應用建立器
     * @description 建立並配置 Rspack 應用實例，用於開發環境的建構和熱更新
     * @param esmx Esmx 框架實例，提供核心功能和配置介面
     * @returns 返回配置好的 Rspack 應用實例，支援 HMR 和即時預覽
     */
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx, {
                config(context) {
                    // 在此處自訂 Rspack 編譯配置
                }
            })
        );
    },

    /**
     * 配置並啟動 HTTP 伺服器
     * @description 建立 HTTP 伺服器實例，整合 Esmx 中介軟體，處理 SSR 請求
     * @param esmx Esmx 框架實例，提供中介軟體和渲染功能
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // 使用 Esmx 中介軟體處理請求
            esmx.middleware(req, res, async () => {
                // 執行伺服器端渲染
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('服務啟動: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

這個檔案是開發環境配置和伺服器啟動的入口檔案，主要包含兩個核心功能：

1. `devApp` 函式：負責建立和配置開發環境的 Rspack 應用實例，支援熱更新和即時預覽功能。這裡使用 `createRspackVue3App` 來建立專門用於 Vue3 的 Rspack 應用實例。
2. `server` 函式：負責建立和配置 HTTP 伺服器，整合 Esmx 中介軟體處理 SSR 請求。

### entry.server.ts

建立伺服器端渲染入口檔案 `src/entry.server.ts`：

```ts title="src/entry.server.ts"
/**
 * @file 伺服器端渲染入口檔案
 * @description 負責伺服器端渲染流程、HTML 生成和資源注入
 */

import type { RenderContext } from '@esmx/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // 建立 Vue 應用實例
    const { app } = createApp();

    // 使用 Vue 的 renderToString 生成頁面內容
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // 提交依賴收集，確保所有必要資源都被載入
    await rc.commit();

    // 生成完整的 HTML 結構
    rc.html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    ${rc.preload()}
    <title>Esmx 快速開始</title>
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
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

2. 建構專案：
```bash
npm run build
```

3. 生產環境執行：
```bash
npm run start
```

現在，你已經成功建立了一個基於 Esmx 的 Vue3 SSR 應用！訪問 http://localhost:3000 即可看到效果。
---
titleSuffix: Esmx 框架 HTML SSR 应用示例
description: 从零开始搭建基于 Esmx 的 HTML SSR 应用，通过实例展示框架的基本用法，包括项目初始化、HTML 配置和入口文件设置。
head:
  - - meta
    - property: keywords
      content: Esmx, HTML, SSR应用, TypeScript配置, 项目初始化, 服务端渲染, 客户端交互
---

# HTML

本教程将帮助你从零开始搭建一个基于 Esmx 的 HTML SSR 应用。我们将通过一个完整的示例来展示如何使用 Esmx 框架创建服务端渲染应用。

## 项目结构

首先，让我们了解项目的基本结构：

```bash
.
├── package.json         # 项目配置文件，定义依赖和脚本命令
├── tsconfig.json        # TypeScript 配置文件，设置编译选项
└── src                  # 源代码目录
    ├── app.ts           # 主应用组件，定义页面结构和交互逻辑
    ├── create-app.ts    # 应用实例创建工厂，负责初始化应用
    ├── entry.client.ts  # 客户端入口文件，处理浏览器端渲染
    ├── entry.node.ts    # Node.js 服务器入口文件，负责开发环境配置和服务器启动
    └── entry.server.ts  # 服务端入口文件，处理 SSR 渲染逻辑
```

## 项目配置

### package.json

创建 `package.json` 文件，配置项目依赖和脚本：

```json title="package.json"
{
  "name": "ssr-demo-html",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.mjs",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack": "*",
    "@types/node": "^24.0.10",
    "typescript": "^5.8.3"
  }
}
```

创建完 `package.json` 文件后，需要安装项目依赖。你可以使用以下任一命令来安装：
```bash
pnpm install
# 或
yarn install
# 或
npm install
```

这将安装所有必需的依赖包，包括 TypeScript 和 SSR 相关的依赖。



### tsconfig.json

创建 `tsconfig.json` 文件，配置 TypeScript 编译选项：

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

## 源码结构

### app.ts

创建主应用组件 `src/app.ts`，实现页面结构和交互逻辑：

```ts title="src/app.ts"
/**
 * @file 示例组件
 * @description 展示一个带有自动更新时间的页面标题，用于演示 Esmx 框架的基本功能
 */

export default class App {
    /**
     * 当前时间，使用 ISO 格式
     * @type {string}
     */
    public time = '';

    /**
     * 创建应用实例
     * @param {SsrContext} [ssrContext] - 服务端上下文，包含导入元数据集合
     */
    public constructor(public ssrContext?: SsrContext) {
        // 构造函数中不需要额外初始化
    }

    /**
     * 渲染页面内容
     * @returns {string} 返回页面 HTML 结构
     */
    public render(): string {
        // 确保在服务端环境下正确收集导入元数据
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Esmx 快速开始</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * 客户端初始化
     * @throws {Error} 当找不到时间显示元素时抛出错误
     */
    public onClient(): void {
        // 获取时间显示元素
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('找不到时间显示元素');
        }

        // 设置定时器，每秒更新一次时间
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * 服务端初始化
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * 服务端上下文接口
 * @interface
 */
export interface SsrContext {
    /**
     * 导入元数据集合
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

创建 `src/create-app.ts` 文件，负责创建应用实例：

```ts title="src/create-app.ts"
/**
 * @file 应用实例创建
 * @description 负责创建和配置应用实例
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

创建客户端入口文件 `src/entry.client.ts`：

```ts title="src/entry.client.ts"
/**
 * @file 客户端入口文件
 * @description 负责客户端交互逻辑和动态更新
 */

import { createApp } from './create-app';

// 创建应用实例并初始化
const { app } = createApp();
app.onClient();
```

### entry.node.ts

创建 `entry.node.ts` 文件，配置开发环境和服务器启动：

```ts title="src/entry.node.ts"
/**
 * @file Node.js 服务器入口文件
 * @description 负责开发环境配置和服务器启动，提供 SSR 运行时环境
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * 配置开发环境的应用创建器
     * @description 创建并配置 Rspack 应用实例，用于开发环境的构建和热更新
     * @param esmx Esmx 框架实例，提供核心功能和配置接口
     * @returns 返回配置好的 Rspack 应用实例，支持 HMR 和实时预览
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // 在此处自定义 Rspack 编译配置
                }
            })
        );
    },

    /**
     * 配置并启动 HTTP 服务器
     * @description 创建 HTTP 服务器实例，集成 Esmx 中间件，处理 SSR 请求
     * @param esmx Esmx 框架实例，提供中间件和渲染功能
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // 使用 Esmx 中间件处理请求
            esmx.middleware(req, res, async () => {
                // 执行服务端渲染
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('服务启动: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

这个文件是开发环境配置和服务器启动的入口文件，主要包含两个核心功能：

1. `devApp` 函数：负责创建和配置开发环境的 Rspack 应用实例，支持热更新和实时预览功能。
2. `server` 函数：负责创建和配置 HTTP 服务器，集成 Esmx 中间件处理 SSR 请求。

### entry.server.ts

创建服务端渲染入口文件 `src/entry.server.ts`：

```ts title="src/entry.server.ts"
/**
 * @file 服务端渲染入口文件
 * @description 负责服务端渲染流程、HTML 生成和资源注入
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// 封装页面内容生成逻辑
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // 将服务端渲染上下文注入到应用实例中
    app.ssrContext = ssrContext;
    // 初始化服务端
    app.onServer();

    // 生成页面内容
    return app.render();
};

export default async (rc: RenderContext) => {
    // 创建应用实例，返回包含 app 实例的对象
    const { app } = createApp();
    // 使用 renderToString 生成页面内容
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // 提交依赖收集，确保所有必要资源都被加载
    await rc.commit();

    // 生成完整的 HTML 结构
    rc.html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    ${rc.preload()}
    <title>Esmx 快速开始</title>
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

## 运行项目

完成上述文件配置后，你可以使用以下命令来运行项目：

1. 开发模式：
```bash
npm run dev
```

2. 构建项目：
```bash
npm run build
```

3. 生产环境运行：
```bash
npm run start
```

现在，你已经成功创建了一个基于 Esmx 的 HTML SSR 应用！访问 http://localhost:3000 即可看到效果。

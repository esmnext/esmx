---
titleSuffix: Esmx 框架项目结构与规范指南
description: 详细介绍 Esmx 框架的标准项目结构、入口文件规范和配置文件规范，帮助开发者构建规范化、可维护的 SSR 应用。
head:
  - - meta
    - property: keywords
      content: Esmx, 项目结构, 入口文件, 配置规范, SSR框架, TypeScript, 项目规范, 开发标准
---

# 标准规范

Esmx 是一个现代化的 SSR 框架，采用标准化的项目结构和路径解析机制，以确保项目在开发和生产环境中的一致性和可维护性。

## 项目结构规范

### 标准目录结构

```txt
root
│─ dist                  # 编译输出目录
│  ├─ package.json       # 编译输出后的软件包配置
│  ├─ server             # 服务端编译输出
│  │  └─ manifest.json   # 编译清单输出，用于生成 importmap
│  ├─ node               # Node 服务器程序编译输出
│  ├─ client             # 客户端编译输出
│  │  ├─ versions        # 版本存储目录
│  │  │  └─ latest.tgz   # 将 dist 目录归档，对外提供软件包分发
│  │  └─ manifest.json   # 编译清单输出，用于生成 importmap
│  └─ src                # 使用 tsc 生成的文件类型
├─ src
│  ├─ entry.server.ts    # 服务端应用程序入口
│  ├─ entry.client.ts    # 客户端应用程序入口
│  └─ entry.node.ts      # Node 服务器应用程序入口
├─ tsconfig.json         # TypeScript 配置
└─ package.json          # 软件包配置
```

::: tip 拓展知识
- `esmx.name` 来源于 `package.json` 的 `name` 字段
- `dist/package.json` 来源于根目录的 `package.json`
- 设置 `packs.enable` 为 `true` 时，才会对 `dist` 目录进行归档

:::

## 入口文件规范

### entry.client.ts
客户端入口文件负责：
- **初始化应用**：配置客户端应用的基础设置
- **路由管理**：处理客户端路由和导航
- **状态管理**：实现客户端状态的存储和更新
- **交互处理**：管理用户事件和界面交互

### entry.server.ts
服务端入口文件负责：
- **服务端渲染**：执行 SSR 渲染流程
- **HTML 生成**：构建初始页面结构
- **数据预取**：处理服务端数据获取
- **状态注入**：将服务端状态传递给客户端
- **SEO 优化**：确保页面的搜索引擎优化

### entry.node.ts
Node.js 服务器入口文件负责：
- **服务器配置**：设置 HTTP 服务器参数
- **路由处理**：管理服务端路由规则
- **中间件集成**：配置服务器中间件
- **环境管理**：处理环境变量和配置
- **请求响应**：处理 HTTP 请求和响应

## 配置文件规范

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
        "start": "esmx start"
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
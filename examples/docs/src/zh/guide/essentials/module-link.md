---
titleSuffix: Esmx 框架服务间代码共享机制
description: 详细介绍 Esmx 框架的模块链接机制，包括服务间代码共享、依赖管理和 ESM 规范实现，帮助开发者构建高效的微前端应用。
head:
  - - meta
    - property: keywords
      content: Esmx, 模块链接, Module Link, ESM, 代码共享, 依赖管理, 微前端
---

# 模块链接

Esmx 框架提供了一套完整的模块链接机制，用于管理服务间的代码共享和依赖关系。该机制基于 ESM（ECMAScript Module）规范实现，支持源码级别的模块导出和导入，以及完整的依赖管理功能。

### 核心概念

#### 模块导出
模块导出是将服务中的特定代码单元（如组件、工具函数等）以 ESM 格式对外暴露的过程。支持两种导出类型：
- **源码导出**：直接导出项目中的源代码文件
- **依赖导出**：导出项目使用的第三方依赖包

#### 模块链接
模块导入是在服务中引用其他服务导出的代码单元的过程。支持多种安装方式：
- **源码安装**：适用于开发环境，支持实时修改和热更新
- **软件包安装**：适用于生产环境，直接使用构建产物

## 模块导出

### 配置说明

在 `entry.node.ts` 中配置需要导出的模块：

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: [
            // 导出源码文件
            'root:src/components/button.vue',  // Vue 组件
            'root:src/utils/format.ts',        // 工具函数
            // 导出第三方依赖
            'npm:vue',                         // Vue 框架
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies EsmxOptions;
```

导出配置支持两种类型：
- `root:*`：导出源码文件，路径相对于项目根目录
- `npm:*`：导出第三方依赖，直接指定包名

## 模块导入

### 配置说明

在 `entry.node.ts` 中配置需要导入的模块：

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // 链接配置
        links: {
            // 源码安装：指向构建产物目录
            'ssr-remote': './node_modules/ssr-remote/dist',
            // 软件包安装：指向包目录
            'other-remote': './node_modules/other-remote'
        },
        // 导入映射设置
        imports: {
            // 使用远程模块中的依赖
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies EsmxOptions;
```

配置项说明：
1. **imports**：配置远程模块的本地路径
   - 源码安装：指向构建产物目录（dist）
   - 软件包安装：直接指向包目录

2. **externals**：配置外部依赖
   - 用于共享远程模块中的依赖
   - 避免重复打包相同依赖
   - 支持多个模块共享依赖

### 安装方式

#### 源码安装
适用于开发环境，支持实时修改和热更新。

1. **Workspace 方式**
推荐在 Monorepo 项目中使用：
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Link 方式**
用于本地开发调试：
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### 软件包安装
适用于生产环境，直接使用构建产物。

1. **NPM Registry**
通过 npm registry 安装：
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **静态服务器**
通过 HTTP/HTTPS 协议安装：
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## 软件包构建

### 配置说明

在 `entry.node.ts` 中配置构建选项：

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    // 模块导出配置
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // 构建配置
    pack: {
        // 启用构建
        enable: true,

        // 输出配置
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // 自定义 package.json
        packageJson: async (esmx, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // 构建前处理
        onBefore: async (esmx, pkg) => {
            // 生成类型声明
            // 执行测试用例
            // 更新文档等
        },

        // 构建后处理
        onAfter: async (esmx, pkg, file) => {
            // 上传到 CDN
            // 发布到 npm 仓库
            // 部署到测试环境等
        }
    }
} satisfies EsmxOptions;
```

### 构建产物

```
your-app-name.tgz
├── package.json        # 包信息
├── index.js            # 生产环境入口
├── server/             # 服务端资源
│   └── manifest.json   # 服务端资源映射
├── node/               # Node.js 运行时
└── client/             # 客户端资源
    └── manifest.json   # 客户端资源映射
```

### 发布流程

```bash
# 1. 构建生产版本
esmx build

# 2. 发布到 npm
npm publish dist/versions/your-app-name.tgz
```

---
titleSuffix: Esmx 框架服务间代码共享机制
description: 详细介绍 Esmx 框架的模块链接机制，包括服务间代码共享、依赖管理和 ESM 规范实现，帮助开发者构建高效的微前端应用。
head:
  - - meta
    - property: keywords
      content: Esmx, 模块链接, Module Link, ESM, 代码共享, 依赖管理, 微前端
---

# 模块链接

模块链接（Module Link）是 Esmx 提供的一种微服务架构下的代码共享机制。它支持在不同的独立服务之间：

- 共享组件和工具函数
- 统一管理第三方依赖的版本
- 支持不同环境的特定实现

## 快速开始

以在微服务架构中共享 Vue 框架为例：

1. 在提供服务中导出 Vue
```ts
// service-shared/entry.node.ts
export default {
    modules: {
        exports: ['npm:vue']
    }
}
```

2. 在使用服务中导入
```ts
// service-app/entry.node.ts
export default {
    modules: {
        links: {
            'shared': '../service-shared/dist'    // 指向共享服务的构建目录
        },
        imports: {
            'vue': 'shared/vue'                   // 从共享服务导入 Vue
        }
    }
}
```

3. 在代码中使用
```ts
import { createApp } from 'vue';        // 自动使用共享服务提供的 Vue 版本
```

## 基本概念

模块链接涉及两个主要角色：

### 提供服务
作为共享能力的提供方，负责导出公共依赖、组件和工具函数：

```ts
// service-shared/entry.node.ts
export default {
    modules: {
        exports: [
            'npm:vue',                         // 共享 npm 包
            'root:src/components/button.vue',  // 共享组件
            {
                'api': {                       // 环境特定实现
                    inputTarget: {
                        client: './src/api.browser.ts',
                        server: './src/api.node.ts'
                    }
                }
            }
        ]
    }
}
```

### 使用服务
作为能力的使用方，通过模块链接机制使用其他服务提供的代码：

```ts
// service-app/entry.node.ts
export default {
    modules: {
        // 1. 声明依赖的服务
        links: {
            'shared': '../service-shared/dist'
        },

        // 2. 配置要使用的功能
        imports: {
            'vue': 'shared/vue',                    // 使用共享的 Vue
            'button': 'shared/components/button',    // 使用共享组件
            'api': 'shared/api'                     // 使用共享 API
        }
    }
}
```

## 导出规则

服务间共享支持三种方式：

### 1. npm 包
用于在服务间统一第三方依赖的版本：
```ts
// 导出 npm 包
'npm:vue'           // Vue 框架
'npm:axios'         // HTTP 客户端
```

### 2. 服务内组件
用于共享服务内部开发的组件和工具：
```ts
// 导出源码文件（需要带扩展名）
'root:src/components/button.vue'    // Vue 组件
'root:src/utils/format.ts'         // 工具函数
```

### 3. 环境适配
用于提供不同环境下的特定实现：
```ts
{
    'api': {
        inputTarget: {
            client: './src/api.browser.ts',    // 使用浏览器 API
            server: './src/api.node.ts'        // 使用 Node.js API
        }
    }
}
```

## 参考示例

你可以参考以下完整示例：

- [共享服务示例](https://github.com/esmnext/esmx/tree/master/examples/ssr-vue2-remote) - 基于 Vue 的共享服务示例，提供可复用的组件
- [使用服务示例](https://github.com/esmnext/esmx/tree/master/examples/ssr-vue2-host) - 基于 Vue 的业务服务示例，演示如何使用共享服务的能力

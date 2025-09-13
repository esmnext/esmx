---
titleSuffix: Esmx 模块间代码共享
description: "Esmx 模块链接：基于 ESM 标准的零运行时微前端代码共享解决方案"
head:
  - - meta
    - property: keywords
      content: Esmx, 模块链接, Module Linking, ESM, 代码共享, 微前端
---

# 模块链接

模块链接（Module Linking）是 Esmx 提供的跨应用代码共享机制，基于 ECMAScript 模块标准，实现无运行时开销的微前端架构。

## 概述

在微前端架构中，多个独立应用往往需要使用相同的第三方库（如 HTTP 客户端、工具库、UI 组件库）和共享组件。传统方案存在以下问题：

- **资源重复**：每个应用独立打包相同依赖，导致用户下载重复代码
- **版本不一致**：不同应用使用不同版本的同一库，可能引起兼容性问题  
- **内存浪费**：浏览器中存在多个相同库的实例，占用额外内存
- **缓存失效**：相同库的不同打包版本无法共享浏览器缓存

模块链接通过 ECMAScript 模块系统和 Import Maps 规范解决这些问题，让多个应用能够安全、高效地共享代码模块。

### 工作原理

模块链接基于现代浏览器原生支持的技术标准：

**共享模块提供者**：一个应用作为**模块提供者**，负责构建和暴露共享的第三方库和组件。其他应用作为**模块消费者**，通过标准的 ESM 导入语法使用这些共享模块。

**Import Maps 解析**：浏览器使用 Import Maps 将模块导入语句映射到实际的文件路径：

```javascript
import axios from 'axios';
import { formatDate } from 'shared-lib/src/utils/date-utils';

// Import Maps 将其解析为
import axios from 'shared-lib/axios.389c4cab.final.mjs';
import { formatDate } from 'shared-lib/src/utils/date-utils.2d79c0c2.final.mjs';
```

## 快速开始

### 基础示例

假设我们有一个共享库应用（shared-lib）和一个业务应用（business-app）：

```typescript
// shared-lib/entry.node.ts - 提供共享模块
export default {
  modules: {
    exports: [
      'pkg:axios',                    // 共享 HTTP 客户端
      'root:src/utils/format.ts'      // 共享工具函数
    ]
  }
} satisfies EsmxOptions;

// business-app/entry.node.ts - 使用共享模块
export default {
  modules: {
    links: { 'shared-lib': '../shared-lib/dist' },
    imports: { 'axios': 'shared-lib/axios' }
  }
} satisfies EsmxOptions;
```

在业务应用中使用：

```typescript
// business-app/src/api/orders.ts
import axios from 'axios';  // 使用共享的 axios 实例
import { formatDate } from 'shared-lib/src/utils/format';  // 使用共享工具函数

export async function fetchOrders() {
  const response = await axios.get('/api/orders');
  return response.data.map(order => ({
    ...order,
    date: formatDate(order.createdAt)
  }));
}
```

## 核心配置

模块链接配置位于 `entry.node.ts` 文件的 `modules` 字段内，包含三个核心配置项：

### 模块链接 (links)

`links` 配置指定当前模块链接到其他模块的路径：

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-lib': '../shared-lib/dist',     // 相对路径
      'api-utils': '/var/www/api-utils/dist'  // 绝对路径
    }
  }
} satisfies EsmxOptions;
```

### 模块导入 (imports)

`imports` 配置将本地模块名映射到远程模块标识符，支持标准导入和环境特定配置：

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-lib': '../shared-lib/dist'
    },
    imports: {
      // 标准导入映射（适用于两个环境）
      'axios': 'shared-lib/axios',
      'lodash': 'shared-lib/lodash',
      
      // 环境特定的导入映射
      'storage': {
        client: 'shared-lib/storage/client',
        server: 'shared-lib/storage/server'
      },
      'config': {
        client: 'shared-lib/config/browser',
        server: 'shared-lib/config/node'
      }
    }
  }
} satisfies EsmxOptions;
```

### 模块导出 (exports)

`exports` 配置定义模块向外提供的内容，仅支持数组格式：

```typescript
// shared-lib/entry.node.ts
export default {
  modules: {
    exports: [
      // npm包：保持原始导入路径
      'pkg:axios',                    // 导入时: import axios from 'axios'
      'pkg:lodash',                   // 导入时: import { debounce } from 'lodash'
      
      // 源码模块：自动重写为模块路径
      'root:src/utils/date-utils.ts',     // 导入时: import { formatDate } from 'shared-lib/src/utils/date-utils'
      'root:src/components/Chart.js',     // 导入时: import Chart from 'shared-lib/src/components/Chart'
      
      // 对象形式 - 复杂配置
      {
        'api': './src/api.ts',        // 简单映射
        'store': {                    // 完整配置
          file: './src/store.ts',
          pkg: true
        }
      }
    ]
  }
} satisfies EsmxOptions;
```

**前缀处理说明**：
- `pkg:axios` → 等价于 `{ 'axios': { file: 'axios', pkg: false } }`
- `root:src/utils/date-utils.ts` → 等价于 `{ 'src/utils/date-utils': { file: './src/utils/date-utils', pkg: true } }`

**文件扩展名支持**：支持 `.js`, `.mjs`, `.cjs`, `.jsx`, `.mjsx`, `.cjsx`, `.ts`, `.mts`, `.cts`, `.tsx`, `.mtsx`, `.ctsx` 等扩展名，配置时会自动去除扩展名。

## 高级配置

### 环境差异化构建

```typescript
exports: [
  {
    'src/storage/db': {
      files: {
        client: './src/storage/indexedDB',  // 客户端使用 IndexedDB
        server: './src/storage/mongoAdapter' // 服务端使用 MongoDB 适配器
      }
    }
  },
  {
    'src/client-only': {
      files: {
        client: './src/client-feature',  // 仅客户端可用
        server: false                    // 服务端不可用
      }
    }
  }
]
```

### 混合配置格式

```typescript
exports: [
  'pkg:axios',
  'root:src/utils/format.ts',
  {
    'api': './src/api/index.ts',
    'components': {
      file: './src/components/index.ts',
      pkg: true
    }
  },
  {
    'storage': {
      files: {
        client: './src/storage/browser.ts',
        server: './src/storage/node.ts'
      }
    }
  }
]
```

## 最佳实践

### 适用场景判断

**适用场景**：
- 多个应用使用相同的第三方库（axios、lodash、moment 等）
- 需要共享业务组件库或工具函数
- 希望减少应用体积和提高加载性能
- 需要确保多应用间库版本一致性

**不适用场景**：
- 单应用项目（无共享需求）
- 频繁变动的实验性代码
- 应用间耦合度要求极低的场景

### 导入规范

**第三方库导入**：
```typescript
// ✅ 推荐 - 使用标准库名，符合生态标准
import axios from 'axios';
import { debounce } from 'lodash';

// ❌ 不推荐 - 违背模块生态标准，不利于库替换和维护
import axios from 'shared-lib/axios';
```

**自定义模块导入**：
```typescript
// ✅ 推荐 - 直接使用模块链接路径，明确依赖来源
import { formatDate } from 'shared-lib/src/utils/date-utils';

// ❌ 无效配置 - imports不支持路径前缀功能
imports: { 'components': 'shared-lib/src/components' }
import Chart from 'components/Chart';  // 此导入无法解析
```

### 配置原则

1. **第三方库**：必须配置 `imports` 映射，使用标准名称导入
2. **自定义模块**：直接使用完整模块链接路径  
3. **imports用途**：仅用于第三方库标准名称映射，不是目录别名

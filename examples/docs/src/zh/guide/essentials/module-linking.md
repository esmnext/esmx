---
titleSuffix: Esmx 模块间代码共享
description: Esmx 模块链接：基于 ESM 标准的零运行时微前端代码共享解决方案
head:
  - - meta
    - property: keywords
      content: Esmx, 模块链接, Module Linking, ESM, 代码共享, 微前端
---

# 模块链接

模块链接（Module Linking）是 Esmx 提供的跨应用代码共享机制，基于 ECMAScript 模块标准，实现无运行时开销的微前端架构。

## 为什么需要模块链接？

在微前端架构中，多个独立应用往往需要使用相同的第三方库（如 HTTP 客户端、工具库、UI 组件库）和共享组件。传统方案存在以下问题：

- **资源重复**：每个应用独立打包相同依赖，导致用户下载重复代码
- **版本不一致**：不同应用使用不同版本的同一库，可能引起兼容性问题  
- **内存浪费**：浏览器中存在多个相同库的实例，占用额外内存
- **缓存失效**：相同库的不同打包版本无法共享浏览器缓存

模块链接通过 ECMAScript 模块系统和 Import Maps 规范解决这些问题，让多个应用能够安全、高效地共享代码模块。

## 工作原理

模块链接基于现代浏览器原生支持的技术标准：

### 共享模块提供者

一个应用作为**模块提供者**，负责构建和暴露共享的第三方库和组件。其他应用作为**模块消费者**，通过标准的 ESM 导入语法使用这些共享模块。

### Import Maps 解析

浏览器使用 Import Maps 将模块导入语句映射到实际的文件路径：

```javascript
// 应用代码中的导入语句
import axios from 'axios';  // 通过 scopes 配置映射
import { formatDate } from 'shared-lib/src/utils/date-utils';  // 通过 imports 配置映射

// Import Maps 将其解析为
import axios from 'shared-lib/axios.389c4cab.final.mjs';
import { formatDate } from 'shared-lib/src/utils/date-utils.2d79c0c2.final.mjs';
```

### 模块实例共享

所有应用共享同一个模块实例，确保：
- 全局状态一致性（如库的全局配置）
- 事件系统统一（如全局事件总线）
- 内存使用优化（避免重复实例化）



## 快速开始

### 基础示例

假设我们有一个共享库应用（shared-lib）和一个业务应用（business-app）：

```typescript
// shared-lib/entry.node.ts - 提供共享模块
export default {
  modules: {
    exports: [
      'npm:axios',                    // 共享 HTTP 客户端
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

## 配置指南

模块链接配置位于 `entry.node.ts` 文件的 `modules` 字段内，包含三个核心配置项：

### 基础配置

#### 模块导出

`exports` 配置定义模块向外提供的内容，支持两种前缀：

> **前缀说明**：`npm:` 和 `root:` 前缀是配置简化的语法糖，仅在 `exports` 数组形式的字符串项中有效。它们自动应用最佳实践配置，简化常见使用场景。

```typescript
// shared-lib/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  // 其他配置...
  modules: {
    exports: [
      // npm包：保持原始导入路径
      'npm:axios',                    // 导入时: import axios from 'axios'
      'npm:lodash',                   // 导入时: import { debounce } from 'lodash'
      
      // 源码模块：自动重写为模块路径
      'root:src/utils/date-utils.ts',     // 导入时: import { formatDate } from 'shared-lib/src/utils/date-utils'
      'root:src/components/Chart.js'      // 导入时: import Chart from 'shared-lib/src/components/Chart'
    ]
  }
} satisfies EsmxOptions;
```

**前缀处理说明**：
- `npm:axios` → 等价于 `{ 'axios': { input: 'axios', rewrite: false } }`
- `root:src/utils/date-utils.ts` → 等价于 `{ 'src/utils/date-utils': { input: './src/utils/date-utils', rewrite: true } }`

#### 模块链接

`links` 配置指定当前模块链接到其他模块的路径：

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  // 其他配置...
  modules: {
    links: {
      'shared-lib': '../shared-lib/dist',     // 相对路径
      'api-utils': '/var/www/api-utils/dist'  // 绝对路径
    }
  }
} satisfies EsmxOptions;
```

#### 模块导入

`imports` 配置将本地模块名映射到远程模块标识符，**主要用于第三方库的标准导入**：

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-lib': '../shared-lib/dist'
    },
    imports: {
      // 第三方库标准导入映射
      'axios': 'shared-lib/axios',
      'lodash': 'shared-lib/lodash'
    }
  }
} satisfies EsmxOptions;

// 使用方式
import axios from 'axios';  // 正确 - 使用标准库名
import { debounce } from 'lodash';  // 正确 - 使用标准库名

// 自定义模块导入
import { formatDate } from 'shared-lib/src/utils/date-utils';  // 正确 - 直接使用链接路径
```

### 高级配置

#### exports 高级配置

`exports` 支持多种配置形式。当需要复杂配置（如 `inputTarget`）时，前缀语法糖无法满足，需要使用完整的对象形式：

**数组形式**：
```typescript
// shared-lib/entry.node.ts
export default {
  modules: {
    exports: [
      // 字符串形式 - 使用前缀语法糖
      'npm:axios',                    // 导出 npm 包
      'root:src/utils/format.ts',     // 导出源码文件
      
      // 对象形式 - 复杂配置无法使用前缀
      {
        'api': './src/api.ts',        // 简单映射
        'store': {                    // 完整配置
          input: './src/store.ts',
          rewrite: true
        }
      }
    ]
  }
} satisfies EsmxOptions;
```

**对象形式**：
```typescript
// shared-lib/entry.node.ts
export default {
  modules: {
    exports: {
      // 简单映射方式
      'axios': 'axios',            // 直接指定 npm 包名
      
      // 完整配置对象
      'src/utils/format': {
        input: './src/utils/format',  // 输入文件路径
        rewrite: true,                // 是否重写导入路径（默认为 true）
        inputTarget: {                // 客户端/服务端差异化构建
          client: './src/utils/format.client',  // 客户端特定版本
          server: './src/utils/format.server'   // 服务端特定版本
        }
      }
    }
  }
} satisfies EsmxOptions;
```

#### inputTarget 环境差异化构建

```typescript
exports: {
  'src/storage/db': {
    inputTarget: {
      client: './src/storage/indexedDB',  // 客户端使用 IndexedDB
      server: './src/storage/mongoAdapter' // 服务端使用 MongoDB适配器
    }
  }
}
```

设置 `false` 可禁用特定环境的构建：

```typescript
exports: {
  'src/client-only': {
    inputTarget: {
      client: './src/client-feature',  // 仅客户端可用
      server: false                    // 服务端不可用
    }
  }
}
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
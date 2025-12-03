---
titleSuffix: "零运行时代码共享方案"
description: "Esmx 模块链接：基于 ESM 标准的零运行时微前端代码共享解决方案"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 模块链接, Module Linking, ESM, 代码共享, 微前端"
---

# 模块链接

模块链接（Module Linking）是 Esmx 提供的一种**跨应用代码共享方案**。它基于浏览器原生的 ESM（ECMAScript Modules）标准，让多个应用可以共享代码模块，无需额外的运行时库。

## 核心优势

- **零运行时开销**：直接使用浏览器原生 ESM 加载器，不引入任何代理或包装层
- **高效共享**：通过导入映射（Import Maps）在编译时解析依赖，运行时直接加载
- **版本隔离**：支持不同应用使用不同版本的同一模块，避免冲突
- **简单易用**：配置直观，与原生 ESM 语法完全兼容

简单来说，模块链接就是一个"模块共享管理器"，让不同的应用可以安全、高效地共享代码，就像使用本地模块一样简单。

## 快速开始

### 基础示例

假设我们有一个共享模块应用（shared-modules）和一个业务应用（business-app）：

```typescript
export default {
  modules: {
    exports: [
      'pkg:axios',
      'root:src/utils/format.ts'
    ]
  }
} satisfies EsmxOptions;

export default {
  modules: {
    links: { 'shared-modules': '../shared-modules/dist' },
    imports: { 'axios': 'shared-modules/axios' }
  }
} satisfies EsmxOptions;
```

在业务应用中使用：

```typescript
// business-app/src/api/orders.ts
import axios from 'axios';
import { formatDate } from 'shared-modules/src/utils/format';

export async function fetchOrders() {
  const response = await axios.get('/api/orders');
  return response.data.map(order => ({
    ...order,
    date: formatDate(order.createdAt)
  }));
}
```

## 核心配置

模块链接配置位于 `entry.node.ts` 文件的 `modules` 字段内，包含五个核心配置项：

### 库模式 (lib)

`lib` 配置用于指定当前模块是否为纯库模式。当设置为 `true` 时，模块不会自动创建默认的入口文件导出（如 `src/entry.client` 和 `src/entry.server`）。

```typescript
// shared-modules/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    lib: true,
    exports: [
      'pkg:axios',
      'root:src/utils/format.ts',
      {
        'date-utils': './src/utils/date.ts',
        'api-client': './src/api/index.ts'
      }
    ]
  }
} satisfies EsmxOptions;
```

**使用场景**：
- **纯库模块**：只提供工具函数、组件等，不需要独立运行
- **共享代码包**：专注于代码共享，不包含应用逻辑
- **类型定义模块**：主要导出 TypeScript 类型定义

**注意事项**：
- 启用 `lib: true` 后，模块不会自动创建 `src/entry.client` 和 `src/entry.server` 的默认导出
- 需要通过 `exports` 配置明确指定要导出的内容
- 适合作为依赖模块被其他应用引用，不适合作为独立应用运行

### 模块链接 (links)

`links` 配置指定当前模块链接到其他模块的路径：

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist',
      'api-utils': '/var/www/api-utils/dist'
    }
  }
} satisfies EsmxOptions;
```

### 模块导入 (imports)

`imports` 配置将本地模块名映射到远程模块标识符，支持标准导入和环境特定配置：

```typescript
// business-app/entry.node.ts
export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist'
    },
    imports: {
      'axios': 'shared-modules/axios',
      'lodash': 'shared-modules/lodash',
      'storage': {
        client: 'shared-modules/storage/client',
        server: 'shared-modules/storage/server'
      }
    }
  }
} satisfies EsmxOptions;
```

### 范围映射 (scopes)

`scopes` 配置为特定目录范围或包范围定义导入映射，实现版本隔离和依赖替换。支持目录范围映射和包范围映射两种类型。

#### 目录范围映射

目录范围映射只影响特定目录下的模块导入，实现不同目录间的版本隔离。

以下示例展示了如何使用 `scopes` 配置为 `vue2/` 目录下的模块指定不同的 Vue 版本：

```typescript
// shared-modules/entry.node.ts  
export default {
  modules: {
    scopes: {
      'vue2/': {
        'vue': 'shared-modules/vue2',
        'vue-router': 'shared-modules/vue2-router'
      }
    }
  }
} satisfies EsmxOptions;
```

#### 包范围映射

包范围映射影响特定包内部的依赖解析，用于依赖替换和版本管理：

```typescript
// shared-modules/entry.node.ts
export default {
  modules: {
    scopes: {
      'vue': {
        '@vue/shared': 'shared-modules/@vue/shared'
      }
    }
  }
} satisfies EsmxOptions;
```

### 模块导出 (exports)

`exports` 配置定义模块向外提供的内容，仅支持数组格式：

```typescript
// shared-modules/entry.node.ts
export default {
  modules: {
    exports: [
      'pkg:axios',
      'pkg:lodash',
      'root:src/utils/date-utils.ts',
      'root:src/components/Chart.js',
      {
        'api': './src/api.ts',
        'store': './src/store.ts'
      }
    ]
  }
} satisfies EsmxOptions;
```

**前缀处理说明**：
- `pkg:axios` → 保持原始包名导入，适用于第三方 npm 包
- `root:src/utils/date-utils.ts` → 转换为模块相对路径，适用于项目内部源码模块

**文件扩展名支持**：对于 `root:` 前缀的配置，支持 `.js`, `.mjs`, `.cjs`, `.jsx`, `.mjsx`, `.cjsx`, `.ts`, `.mts`, `.cts`, `.tsx`, `.mtsx`, `.ctsx` 等扩展名，配置时会自动去除扩展名。对于 `pkg:` 前缀和普通字符串配置，不会去除扩展名。

## 高级配置

### 环境差异化构建

```typescript
exports: [
  {
    'src/storage/db': {
      client: './src/storage/indexedDB',
      server: './src/storage/mongoAdapter'
    }
  },
  {
    'src/client-only': {
      client: './src/client-feature',
      server: false
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
    'api': './src/api/index.ts'
  },
  {
    'components': './src/components/index.ts'
  },
  {
    'storage': {
      client: './src/storage/browser.ts',
      server: './src/storage/node.ts'
    }
  }
]
```

## 完整示例

基于实际项目结构的完整示例：

### 共享模块 (shared-modules)

```typescript
// shared-modules/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    lib: true,
    exports: [
      'pkg:@esmx/router',
      {
        vue: 'pkg:vue/dist/vue.runtime.esm-browser.js',
        '@esmx/router-vue': 'pkg:@esmx/router-vue',
        vue2: 'pkg:vue2/dist/vue.runtime.esm.js',
        'vue2/@esmx/router-vue': 'pkg:@esmx/router-vue'
      }
    ],
    scopes: {
      'vue2/': {
        vue: 'shared-modules/vue2'
      }
    }
  }
} satisfies EsmxOptions;
```

### Vue3 应用 (vue3-app)

```typescript
// vue3-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist'
    },
    imports: {
      'vue': 'shared-modules/vue',
      '@esmx/router': 'shared-modules/@esmx/router',
      '@esmx/router-vue': 'shared-modules/@esmx/router-vue'
    },
    exports: [
      'root:src/routes.ts'
    ]
  }
} satisfies EsmxOptions;
```

### Vue2 应用 (vue2-app)

```typescript
// vue2-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist'
    },
    imports: {
      'vue': 'shared-modules/vue2',
      '@esmx/router': 'shared-modules/vue2/@esmx/router',
      '@esmx/router-vue': 'shared-modules/vue2/@esmx/router-vue'
    },
    exports: [
      'root:src/routes.ts'
    ]
  }
} satisfies EsmxOptions;
```

### 聚合应用 (business-app)

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist',
      'vue2-app': '../vue2-app/dist',
      'vue3-app': '../vue3-app/dist'
    },
    imports: {
      '@esmx/router': 'shared-modules/vue2/@esmx/router'
    }
  }
} satisfies EsmxOptions;
```

这种配置方式展示了：
- **共享模块**：提供多版本框架支持，通过作用域映射实现版本隔离
- **Vue3 应用**：使用 Vue 3 的业务应用，只导出路由配置
- **Vue2 专用应用**：专门使用 Vue 2 的业务应用，只导出路由配置
- **聚合应用**：统一入口，协调不同版本的子应用，包含完整的Vue模块导入

每个模块的配置都符合实际项目的使用场景，依赖关系清晰，功能职责明确，技术实现准确。

---
titleSuffix: "Esmx 框架模块导入路径映射指南"
description: "详细介绍 Esmx 框架的路径别名机制，包括简化导入路径、避免深层嵌套、类型安全和模块解析优化等特性，帮助开发者提升代码可维护性。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 路径别名, Path Alias, TypeScript, 模块导入, 路径映射, 代码可维护性"
---

# 路径别名

路径别名（Path Alias）是一种模块导入路径映射机制，它允许开发者使用简短、语义化的标识符来替代完整的模块路径。在 Esmx 中，路径别名机制具有以下优势：

- **简化导入路径**：使用语义化的别名替代冗长的相对路径，提高代码可读性
- **避免深层嵌套**：消除多层级目录引用（如 `../../../../`）带来的维护困难
- **类型安全**：与 TypeScript 的类型系统完全集成，提供代码补全和类型检查
- **模块解析优化**：通过预定义的路径映射，提升模块解析性能

## 默认别名机制

Esmx 采用基于服务名（Service Name）的自动别名机制，这种约定优于配置的设计具有以下特点：

- **自动配置**：基于 `package.json` 中的 `name` 字段自动生成别名，无需手动配置
- **统一规范**：确保所有服务模块遵循一致的命名和引用规范
- **类型支持**：配合 `npm run build:dts` 命令，自动生成类型声明文件，实现跨服务的类型推导
- **可预测性**：通过服务名即可推断出模块的引用路径，降低维护成本

## 配置说明

### package.json 配置

在 `package.json` 中，通过 `name` 字段定义服务的名称，该名称将作为服务的默认别名前缀：

```json title="package.json"
{
    "name": "your-app-name"
}
```

### tsconfig.json 配置

为了使 TypeScript 能够正确解析别名路径，需要在 `tsconfig.json` 中配置 `paths` 映射：

```json title="tsconfig.json"
{
    "compilerOptions": {
        "paths": {
            "your-app-name/src/*": [
                "./src/*"
            ],
            "your-app-name/*": [
                "./*"
            ]
        }
    }
}
```

## 使用示例

### 导入服务内部模块

```ts
import { MyComponent } from 'your-app-name/src/components';
import { MyComponent as Rel } from '../components';
```

### 导入其他服务模块

```ts
import { SharedComponent } from 'other-service/src/components';
import { utils } from 'other-service/src/utils';
```

::: tip 最佳实践
- 优先使用别名路径而不是相对路径
- 保持别名路径的语义化和一致性
- 避免在别名路径中使用过多的目录层级

:::

``` ts
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';
import type { UserInfo } from 'your-app-name/src/types';
```

### 跨服务导入

当配置了模块链接后，可以使用相同的方式导入其他服务的模块：

```ts
import { Header } from 'remote-service/src/components';
import { logger } from 'remote-service/src/utils';
```

### 自定义别名

对于第三方包或特殊场景，可以通过 Esmx 配置文件自定义别名：

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        'vue$': 'vue/dist/vue.esm.js',
                        '@': './src',
                        '@components': './src/components'
                    }
                }
            })
        );
    }
} satisfies EsmxOptions;
```

::: warning 注意事项
1. 对于业务模块，建议始终使用默认的别名机制，以保持项目的一致性
2. 自定义别名主要用于处理第三方包的特殊需求或优化开发体验
3. 过度使用自定义别名可能会影响代码的可维护性和构建优化

:::

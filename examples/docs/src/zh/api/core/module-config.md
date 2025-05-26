---
titleSuffix: Esmx 框架模块配置 API 参考
description: 详细介绍 Esmx 框架的 ModuleConfig 配置接口，包括模块导入导出规则、别名配置和外部依赖管理，帮助开发者深入理解框架的模块化系统。
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, 模块配置, 模块导入导出, 外部依赖, 别名配置, 依赖管理, Web 应用框架
---

# ModuleConfig

ModuleConfig 用于配置模块的导入导出规则：

```typescript
interface ModuleConfig {
    /**
     * 服务与服务之间的链接配置
     * 键：远程服务的名称
     * 值：远程服务的构建产物目录路径
     */
    links?: Record<string, string>;

    /**
     * 导入配置，用于将当前服务中的模块标识符映射到远程服务提供的模块
     * 键：在当前服务中使用的模块标识符
     * 值：远程服务导出的模块路径
     */
    imports?: Record<string, string>;

    /**
     * 导出配置，用于将当前服务的模块暴露给其他服务使用
     */
    exports?: ModuleConfigExportExports;
}
```

## links 配置

指定远程服务的构建目录位置：

```typescript
{
  links: {
    'vue-remote-service': '../vue-remote-service/dist',  // 相对路径
    'other-service': '/var/www/other-service/dist'  // 绝对路径
  }
}
```

## imports 配置

配置要使用的模块及其来源：

```typescript
{
  imports: {
    'remote-button': 'vue-remote-service/components/button'
  }
}
```

## exports 配置

系统会默认导出以下入口文件：
```typescript
{
  'src/entry.client': {
    inputTarget: {
      client: './src/entry.client',
      server: false
    }
  },
  'src/entry.server': {
    inputTarget: {
      client: false,
      server: './src/entry.server'
    }
  }
}
```

### 数组形式

```typescript
exports: [
    // 导出 npm 包
    'npm:vue',                           // 会自动设置 rewrite: false
    
    // 导出源码文件（必须包含文件扩展名）
    'root:src/components/button.ts',     // 会被解析为 './src/components/button'
    
    // 对象配置方式
    {
      'store': {
        input: './src/store.ts',         // 同构模块
        inputTarget: {                   // 或指定不同的客户端/服务端实现
          client: './src/store.client.ts',
          server: './src/store.server.ts'
        },
        rewrite: true                    // 默认为 true
      }
    }
]
```

### 对象形式

```typescript
exports: {
    // 直接指定源文件路径
    'utils': './src/utils.ts',

    // 完整配置
    'api': {
        input: './src/api/index.ts'      // 同构模块的入口文件
    },
    
    // 客户端/服务端分离
    'entry': {
        inputTarget: {
            client: './src/entry.client.ts',  // false 表示该环境下不提供实现
            server: './src/entry.server.ts'
        }
    }
}
```

## 配置属性说明

### ModuleConfigExportObject

```typescript
interface ModuleConfigExportObject {
    /**
     * 模块的源文件路径
     */
    input?: string;

    /**
     * 客户端和服务端的不同入口文件配置
     * false 表示在该环境下不提供实现
     */
    inputTarget?: Record<'client' | 'server', string | false>;

    /**
     * 是否需要重写模块路径
     * @default true
     * @remarks 仅在导出 npm 包时可能需要设为 false
     */
    rewrite?: boolean;
}
```

## 使用限制

1. **路径要求**
   - 除了 `npm:` 前缀的包导出外，其他所有路径都必须指向具体文件
   - 使用 `root:` 前缀的文件路径必须包含文件扩展名（.ts, .js 等）

2. **路径解析规则**
   - `npm:` 前缀: 用于导出 npm 包，会自动设置 `rewrite: false`
   - `root:` 前缀: 用于导出源码文件，会被解析为相对路径

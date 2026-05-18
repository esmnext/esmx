# ssr-micro-shared

共享依赖包，用于微前端示例项目。

## 说明

本包作为共享依赖中心，导出 `@esmx/router` 供所有子应用使用，避免重复打包，确保运行时版本一致。

## 导出的模块

- `@esmx/router` - Esmx 路由核心库

## 使用方式

其他子应用通过 `modules.links` 链接到本包，并通过 `modules.imports` 映射裸模块导入：

```typescript
modules: {
    links: {
        'ssr-micro-shared': '../ssr-micro-shared/dist'
    },
    imports: {
        '@esmx/router': 'ssr-micro-shared/@esmx/router'
    }
}
```

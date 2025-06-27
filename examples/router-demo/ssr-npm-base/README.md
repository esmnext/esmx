# Router Demo NPM Base

所有路由示例的共享 npm 包，提供了以下模块：

- `@esmx/router` - 路由库

## 使用方式

在项目的 `src/entry.node.ts` 中：

```typescript
export default {
    // ...其他配置项

    modules: {
        links: {
            'ssr-npm-base': './node_modules/ssr-npm-base/dist'
        },
        imports: {
            '@esmx/router': 'ssr-npm-base/@esmx/router',
        }
    },

    // ...其他配置项
} satisfies EsmxOptions;
```

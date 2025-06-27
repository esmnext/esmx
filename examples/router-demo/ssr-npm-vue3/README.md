# Router Demo NPM Vue3

Vue 3 专用共享服务，提供以下模块：

- `vue` - Vue 3
- `@esmx/router-vue` - Vue 路由集成（其要基于具体的 vue 版本进行打包）

## 使用方式

在项目的 `src/entry.node.ts` 中：

```typescript
export default {
    // ...其他配置项

    modules: {
        links: {
            'ssr-npm-vue3': './node_modules/ssr-npm-vue3/dist'
        },
        imports: {
            vue: 'ssr-npm-vue3/vue',
            '@esmx/router-vue': 'ssr-npm-vue3/@esmx/router-vue',
        }
    },

    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx)
        );
    },

    // ...其他配置项
} satisfies EsmxOptions;
```

在项目中可以直接使用 `vue` 和 `@esmx/router-vue` 包。

项目本身安装 `vue` 和 `@esmx/router-vue` 都不是必须的，都能正常打包。

但由于现代代码编辑器的代码提示依赖于 `node_modules` 中的包，因此可能需要安装 `vue` 包，为了更好的代码提示。如果能将本包中的 vue 提升到全局（例如借助 pnpm 的依赖提升 hoisting 机制），则项目本身安装 `vue` 并不是必须的。

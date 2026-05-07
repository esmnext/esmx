# Router Demo NPM Vue3

Vue 3 dedicated shared service, providing the following modules:

- `vue` - Vue 3
- `@esmx/router-vue` - Vue router integration (needs to be bundled based on specific vue version)

## Usage

In the project's `src/entry.node.ts`:

```typescript
export default {
    // ...other config

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

    // ...other config
} satisfies EsmxOptions;
```

You can directly use `vue` and `@esmx/router-vue` packages in the project.

Installing `vue` and `@esmx/router-vue` in the project itself is not required for building.

However, modern code editors rely on packages in `node_modules` for code hints, so you may need to install `vue` for better IDE support. If you can hoist vue from this package to global scope (e.g., using pnpm's dependency hoisting mechanism), then installing `vue` in the project itself is not necessary.

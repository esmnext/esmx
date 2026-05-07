# Router Demo NPM Vue2

Vue 2 dedicated shared service, providing the following modules:

- `vue` - Vue 2.7
- `@esmx/router-vue` - Vue router integration (needs to be bundled based on specific vue version)

## Usage

In the project's `src/entry.node.ts`:

```typescript
export default {
    // ...other config

    modules: {
        links: {
            'ssr-npm-vue2': './node_modules/ssr-npm-vue2/dist'
        },
        imports: {
            vue: 'ssr-npm-vue2/vue',
            '@esmx/router-vue': 'ssr-npm-vue2/@esmx/router-vue',
        }
    },

    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue2App(esmx)
        );
    },

    // ...other config
} satisfies EsmxOptions;
```

You can directly use `vue` and `@esmx/router-vue` packages in the project.

Installing `vue` and `@esmx/router-vue` in the project itself is not required for building.

However, modern code editors rely on packages in `node_modules` for code hints, so you may need to install `vue` for better IDE support. If you can hoist vue from this package to global scope (e.g., using pnpm's dependency hoisting mechanism), then installing `vue` in the project itself is not necessary.

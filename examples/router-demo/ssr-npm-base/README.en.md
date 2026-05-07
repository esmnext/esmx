# Router Demo NPM Base

Shared npm package for all routing examples, providing the following modules:

- `@esmx/router` - Router library

## Usage

In the project's `src/entry.node.ts`:

```typescript
export default {
    // ...other config

    modules: {
        links: {
            'ssr-npm-base': './node_modules/ssr-npm-base/dist'
        },
        imports: {
            '@esmx/router': 'ssr-npm-base/@esmx/router',
        }
    },

    // ...other config
} satisfies EsmxOptions;
```

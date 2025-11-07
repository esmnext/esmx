---
titleSuffix: "Path Alias Guide for Esmx"
description: "Detailed guide to Esmx path aliasing: simplifying imports, avoiding deep nesting, type safety, and optimized module resolution to improve maintainability."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Path Alias, TypeScript, Module Imports, Path Mapping, Maintainability"
---

# Path Aliases

Path aliases map import identifiers to paths, enabling short, semantic identifiers to replace full module paths. In Esmx, aliases provide:

- **Simplified imports**: semantic aliases instead of verbose relative paths
- **Avoid deep nesting**: remove `../../../../` style complexity
- **Type safety**: integrates with TypeScript for completion and checks
- **Resolution optimization**: predefined mappings improve resolution performance

## Default Alias Mechanism

Esmx uses an automatic alias mechanism based on the service name:

- **Auto-configured**: generated from `package.json:name`, no manual setup
- **Unified convention**: consistent naming and referencing across services
- **Type support**: with `npm run build:dts`, type declarations are generated for cross-service inference
- **Predictable**: the service name implies import paths

## Configuration

### package.json

Define the service name:

```json title="package.json"
{
    "name": "your-app-name"
}
```

### tsconfig.json

Configure `paths` to make TypeScript resolve aliases:

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

## Usage Examples

### Import internal modules

```ts
import { MyComponent } from 'your-app-name/src/components';
import { MyComponent as Rel } from '../components';
```

### Import modules from other services

```ts
import { SharedComponent } from 'other-service/src/components';
import { utils } from 'other-service/src/utils';
```

::: tip
- Prefer aliases over relative paths
- Keep alias paths semantic and consistent
- Avoid excessive directory depth in aliases
:::

```ts
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';
import type { UserInfo } from 'your-app-name/src/types';
```

### Cross-service imports

With module linking configured, import other services similarly:

```ts
import { Header } from 'remote-service/src/components';
import { logger } from 'remote-service/src/utils';
```

### Custom aliases

Customize aliases for third-party packages or special cases:

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

::: warning
1. For business modules, prefer the default alias mechanism to keep consistency
2. Custom aliases mainly serve third-party packages or developer experience optimization
3. Overusing custom aliases may harm maintainability and build optimization
:::

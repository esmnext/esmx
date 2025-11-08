---
titleSuffix: "Esmx Framework Module Import Path Mapping Guide"
description: "Detailed introduction to Esmx framework's path alias mechanism, including simplifying import paths, avoiding deep nesting, type safety, and module resolution optimization, helping developers improve code maintainability."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, path alias, Path Alias, TypeScript, module import, path mapping, code maintainability"
---

# Path Alias

Path Alias is a module import path mapping mechanism that allows developers to use short, semantic identifiers to replace complete module paths. In Esmx, the path alias mechanism provides the following advantages:

- **Simplify Import Paths**: Use semantic aliases to replace lengthy relative paths, improving code readability
- **Avoid Deep Nesting**: Eliminate maintenance difficulties caused by multi-level directory references (like `../../../../`)
- **Type Safety**: Fully integrated with TypeScript's type system, providing code completion and type checking
- **Module Resolution Optimization**: Improve module resolution performance through predefined path mappings

## Default Alias Mechanism

Esmx adopts an automatic alias mechanism based on Service Name. This convention-over-configuration design has the following characteristics:

- **Automatic Configuration**: Automatically generates aliases based on the `name` field in `package.json`, no manual configuration needed
- **Unified Specification**: Ensures all service modules follow consistent naming and reference specifications
- **Type Support**: Works with `npm run build:dts` command to automatically generate type declaration files, enabling cross-service type inference
- **Predictability**: Module reference paths can be inferred through service name, reducing maintenance costs

## Configuration Instructions

### package.json Configuration

In `package.json`, define the service name through the `name` field, which will serve as the default alias prefix for the service:

```json title="package.json"
{
    "name": "your-app-name"
}
```

### tsconfig.json Configuration

To enable TypeScript to correctly resolve alias paths, configure `paths` mapping in `tsconfig.json`:

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

### Import Internal Service Modules

```ts
import { MyComponent } from 'your-app-name/src/components';
import { MyComponent as Rel } from '../components';
```

### Import Other Service Modules

```ts
import { SharedComponent } from 'other-service/src/components';
import { utils } from 'other-service/src/utils';
```

::: tip Best Practices
- Prefer alias paths over relative paths
- Keep alias paths semantic and consistent
- Avoid using too many directory levels in alias paths

:::

``` ts
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';
import type { UserInfo } from 'your-app-name/src/types';
```

### Cross-Service Import

When module linking is configured, you can import modules from other services in the same way:

```ts
import { Header } from 'remote-service/src/components';
import { logger } from 'remote-service/src/utils';
```

### Custom Aliases

For third-party packages or special scenarios, you can customize aliases through Esmx configuration files:

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

::: warning Notes
1. For business modules, it's recommended to always use the default alias mechanism to maintain project consistency
2. Custom aliases are mainly used to handle special needs of third-party packages or optimize development experience
3. Overuse of custom aliases may affect code maintainability and build optimization

:::
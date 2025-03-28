---
titleSuffix: Esmx Framework Module Import Path Mapping Guide
description: Detailed explanation of Esmx framework's path alias mechanism, including features such as simplified import paths, avoiding deep nesting, type safety, and module resolution optimization, helping developers improve code maintainability.
head:
  - - meta
    - property: keywords
      content: Esmx, Path Alias, TypeScript, Module Import, Path Mapping, Code Maintainability
---

# Path Alias

Path Alias is a module import path mapping mechanism that allows developers to use short, semantic identifiers to replace full module paths. In Esmx, the path alias mechanism offers the following advantages:

- **Simplified Import Paths**: Use semantic aliases to replace lengthy relative paths, improving code readability.
- **Avoid Deep Nesting**: Eliminate maintenance difficulties caused by multi-level directory references (e.g., `../../../../`).
- **Type Safety**: Fully integrated with TypeScript's type system, providing code completion and type checking.
- **Module Resolution Optimization**: Improve module resolution performance through predefined path mappings.

## Default Alias Mechanism

Esmx adopts an automatic alias mechanism based on service names, which follows the convention-over-configuration design with the following characteristics:

- **Automatic Configuration**: Automatically generates aliases based on the `name` field in `package.json`, eliminating the need for manual configuration.
- **Unified Standard**: Ensures all service modules follow consistent naming and referencing conventions.
- **Type Support**: Works with the `npm run build:dts` command to automatically generate type declaration files, enabling cross-service type inference.
- **Predictability**: Allows inferring module reference paths from service names, reducing maintenance costs.

## Configuration Instructions

### package.json Configuration

In `package.json`, define the service name using the `name` field, which will serve as the default alias prefix for the service:

```json title="package.json"
{
    "name": "your-app-name"
}
```

### tsconfig.json Configuration

To ensure TypeScript correctly resolves alias paths, configure the `paths` mapping in `tsconfig.json`:

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

### Importing Internal Service Modules

```ts
// Using alias import
import { MyComponent } from 'your-app-name/src/components';

// Equivalent relative path import
import { MyComponent } from '../components';
```

### Importing Modules from Other Services

```ts
// Importing components from another service
import { SharedComponent } from 'other-service/src/components';

// Importing utility functions from another service
import { utils } from 'other-service/src/utils';
```

::: tip Best Practices
- Prefer using alias paths over relative paths.
- Maintain semantic and consistent alias paths.
- Avoid excessive directory levels in alias paths.

:::

``` ts
// Importing components
import { Button } from 'your-app-name/src/components';
import { Layout } from 'your-app-name/src/components/layout';

// Importing utility functions
import { formatDate } from 'your-app-name/src/utils';
import { request } from 'your-app-name/src/utils/request';

// Importing type definitions
import type { UserInfo } from 'your-app-name/src/types';
```

### Cross-Service Imports

When module linking (Module Link) is configured, you can import modules from other services in the same way:

```ts
// Importing components from a remote service
import { Header } from 'remote-service/src/components';

// Importing utility functions from a remote service
import { logger } from 'remote-service/src/utils';
```

### Custom Aliases

For third-party packages or special scenarios, you can define custom aliases through the Esmx configuration file:

```ts title="src/entry.node.ts"
export default {
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createApp(esmx, (buildContext) => {
                buildContext.config.resolve = {
                    ...buildContext.config.resolve,
                    alias: {
                        ...buildContext.config.resolve?.alias,
                        // Configure a specific build version for Vue
                        'vue$': 'vue/dist/vue.esm.js',
                        // Configure short aliases for commonly used directories
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
1. For business modules, it is recommended to always use the default alias mechanism to maintain project consistency.
2. Custom aliases are primarily used for handling special requirements of third-party packages or optimizing development experience.
3. Excessive use of custom aliases may impact code maintainability and build optimization.

:::
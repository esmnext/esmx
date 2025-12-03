---
titleSuffix: "Zero-Runtime Code Sharing"
description: "Esmx Module Linking: Zero-runtime Micro-Frontend code sharing solution based on ESM standards"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, module linking, ESM, code sharing, Micro-Frontend"
---

# Module Linking

Module Linking is a **cross-application code sharing solution** provided by Esmx. It is based on browser-native ESM (ECMAScript Modules) standards, allowing multiple applications to share code modules without requiring additional runtime libraries.

## Core Advantages

- **Zero Runtime Overhead**: Directly uses browser-native ESM loader, without introducing any proxy or wrapper layer
- **Efficient Sharing**: Resolves dependencies at compile time through Import Maps, with direct loading at runtime
- **Version Isolation**: Supports different applications using different versions of the same module, avoiding conflicts
- **Simple and Easy to Use**: Intuitive configuration, fully compatible with native ESM syntax

In simple terms, module linking is a "module sharing manager" that allows different applications to safely and efficiently share code, as simple as using local modules.

## Quick Start

### Basic Example

Assume we have a shared module application (shared-modules) and a business application (business-app):

```typescript
export default {
  modules: {
    exports: [
      'pkg:axios',
      'root:src/utils/format.ts'
    ]
  }
} satisfies EsmxOptions;

export default {
  modules: {
    links: { 'shared-modules': '../shared-modules/dist' },
    imports: { 'axios': 'shared-modules/axios' }
  }
} satisfies EsmxOptions;
```

Usage in the business application:

```typescript
// business-app/src/api/orders.ts
import axios from 'axios';
import { formatDate } from 'shared-modules/src/utils/format';

export async function fetchOrders() {
  const response = await axios.get('/api/orders');
  return response.data.map(order => ({
    ...order,
    date: formatDate(order.createdAt)
  }));
}
```

## Core Configuration

Module linking configuration is located in the `modules` field of the `entry.node.ts` file, containing five core configuration items:

### Library Mode (lib)

`lib` configuration specifies whether the current module is in pure library mode. When set to `true`, the module will not automatically create default entry file exports (such as `src/entry.client` and `src/entry.server`).

```typescript
// shared-modules/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    lib: true,
    exports: [
      'pkg:axios',
      'root:src/utils/format.ts',
      {
        'date-utils': './src/utils/date.ts',
        'api-client': './src/api/index.ts'
      }
    ]
  }
} satisfies EsmxOptions;
```

**Use Cases**:
- **Pure Library Modules**: Only provide utility functions, components, etc., without needing to run independently
- **Shared Code Packages**: Focus on code sharing, without application logic
- **Type Definition Modules**: Mainly export TypeScript type definitions

**Notes**:
- When `lib: true` is enabled, the module will not automatically create default exports for `src/entry.client` and `src/entry.server`
- You need to explicitly specify what to export through `exports` configuration
- Suitable for being referenced as a dependency module by other applications, not suitable for running as an independent application

### Module Linking (links)

`links` configuration specifies the paths where the current module links to other modules:

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist',
      'api-utils': '/var/www/api-utils/dist'
    }
  }
} satisfies EsmxOptions;
```

### Module Imports (imports)

`imports` configuration maps local module names to remote module identifiers, supporting standard imports and environment-specific configuration:

```typescript
// business-app/entry.node.ts
export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist'
    },
    imports: {
      'axios': 'shared-modules/axios',
      'lodash': 'shared-modules/lodash',
      'storage': {
        client: 'shared-modules/storage/client',
        server: 'shared-modules/storage/server'
      }
    }
  }
} satisfies EsmxOptions;
```

### Scope Mapping (scopes)

`scopes` configuration defines import mappings for specific directory scopes or package scopes, achieving version isolation and dependency replacement. Supports directory scope mapping and package scope mapping.

#### Directory Scope Mapping

Directory scope mapping only affects module imports under specific directories, achieving version isolation between different directories.

The following example shows how to use `scopes` configuration to specify different Vue versions for modules under the `vue2/` directory:

```typescript
// shared-modules/entry.node.ts  
export default {
  modules: {
    scopes: {
      'vue2/': {
        'vue': 'shared-modules/vue2',
        'vue-router': 'shared-modules/vue2-router'
      }
    }
  }
} satisfies EsmxOptions;
```

#### Package Scope Mapping

Package scope mapping affects dependency resolution within specific packages, used for dependency replacement and version management:

```typescript
// shared-modules/entry.node.ts
export default {
  modules: {
    scopes: {
      'vue': {
        '@vue/shared': 'shared-modules/@vue/shared'
      }
    }
  }
} satisfies EsmxOptions;
```

### Module Exports (exports)

`exports` configuration defines what the module provides externally, only supports array format:

```typescript
// shared-modules/entry.node.ts
export default {
  modules: {
    exports: [
      'pkg:axios',
      'pkg:lodash',
      'root:src/utils/date-utils.ts',
      'root:src/components/Chart.js',
      {
        'api': './src/api.ts',
        'store': './src/store.ts'
      }
    ]
  }
} satisfies EsmxOptions;
```

**Prefix Processing Instructions**:
- `pkg:axios` → Keeps original package name import, suitable for third-party npm packages
- `root:src/utils/date-utils.ts` → Converts to module-relative path, suitable for project internal source modules

**File Extension Support**: For `root:` prefix configuration, supports extensions like `.js`, `.mjs`, `.cjs`, `.jsx`, `.mjsx`, `.cjsx`, `.ts`, `.mts`, `.cts`, `.tsx`, `.mtsx`, `.ctsx`. Extensions are automatically removed during configuration. For `pkg:` prefix and normal string configuration, extensions are not removed.

## Advanced Configuration

### Environment-Differentiated Build

```typescript
exports: [
  {
    'src/storage/db': {
      client: './src/storage/indexedDB',
      server: './src/storage/mongoAdapter'
    }
  },
  {
    'src/client-only': {
      client: './src/client-feature',
      server: false
    }
  }
]
```

### Mixed Configuration Format

```typescript
exports: [
  'pkg:axios',
  'root:src/utils/format.ts',
  {
    'api': './src/api/index.ts'
  },
  {
    'components': './src/components/index.ts'
  },
  {
    'storage': {
      client: './src/storage/browser.ts',
      server: './src/storage/node.ts'
    }
  }
]
```

## Complete Example

Complete example based on actual project structure:

### Shared Module (shared-modules)

```typescript
// shared-modules/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    lib: true,
    exports: [
      'pkg:@esmx/router',
      {
        vue: 'pkg:vue/dist/vue.runtime.esm-browser.js',
        '@esmx/router-vue': 'pkg:@esmx/router-vue',
        vue2: 'pkg:vue2/dist/vue.runtime.esm.js',
        'vue2/@esmx/router-vue': 'pkg:@esmx/router-vue'
      }
    ],
    scopes: {
      'vue2/': {
        vue: 'shared-modules/vue2'
      }
    }
  }
} satisfies EsmxOptions;
```

### Vue3 Application (vue3-app)

```typescript
// vue3-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist'
    },
    imports: {
      'vue': 'shared-modules/vue',
      '@esmx/router': 'shared-modules/@esmx/router',
      '@esmx/router-vue': 'shared-modules/@esmx/router-vue'
    },
    exports: [
      'root:src/routes.ts'
    ]
  }
} satisfies EsmxOptions;
```

### Vue2 Application (vue2-app)

```typescript
// vue2-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist'
    },
    imports: {
      'vue': 'shared-modules/vue2',
      '@esmx/router': 'shared-modules/vue2/@esmx/router',
      '@esmx/router-vue': 'shared-modules/vue2/@esmx/router-vue'
    },
    exports: [
      'root:src/routes.ts'
    ]
  }
} satisfies EsmxOptions;
```

### Aggregation Application (business-app)

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist',
      'vue2-app': '../vue2-app/dist',
      'vue3-app': '../vue3-app/dist'
    },
    imports: {
      '@esmx/router': 'shared-modules/vue2/@esmx/router'
    }
  }
} satisfies EsmxOptions;
```

This configuration demonstrates:
- **Shared Module**: Provides multi-version framework support, achieves version isolation through scope mapping
- **Vue3 Application**: Business application using Vue 3, only exports route configuration
- **Vue2-Specific Application**: Business application specifically using Vue 2, only exports route configuration
- **Aggregation Application**: Unified entry, coordinates sub-applications of different versions, includes complete Vue module imports

Each module's configuration conforms to actual project usage scenarios, with clear dependency relationships, clear functional responsibilities, and accurate technical implementation.

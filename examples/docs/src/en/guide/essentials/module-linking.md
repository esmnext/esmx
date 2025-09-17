---
titleSuffix: Esmx Code Sharing Between Modules
description: "Esmx Module Linking: A zero-runtime micro-frontend code sharing solution based on ESM standards"
head:
  - - meta
    - property: keywords
      content: Esmx, Module Linking, ESM, Code Sharing, Micro-frontend
---

# Module Linking

Module Linking is a **cross-application code sharing solution** provided by Esmx. It's based on the browser's native ESM (ECMAScript Modules) standard, allowing multiple applications to share code modules without additional runtime libraries.

## Core Advantages

- **Zero Runtime Overhead**: Direct use of browser's native ESM loader, without introducing any proxy or wrapper layers
- **Efficient Sharing**: Dependencies are resolved at build time through Import Maps, loaded directly at runtime
- **Version Isolation**: Supports different applications using different versions of the same module, avoiding conflicts
- **Simple and Easy to Use**: Intuitive configuration, fully compatible with native ESM syntax

Simply put, Module Linking is a "module sharing manager" that enables different applications to share code safely and efficiently, as simple as using local modules.

## Quick Start

### Basic Example

Suppose we have a shared module application (shared-modules) and a business application (business-app):

```typescript
// shared-modules/entry.node.ts - providing shared modules
export default {
  modules: {
    exports: [
      'pkg:axios',                    // shared HTTP client
      'root:src/utils/format.ts'      // shared utility functions
    ]
  }
} satisfies EsmxOptions;

// business-app/entry.node.ts - using shared modules
export default {
  modules: {
    links: { 'shared-modules': '../shared-modules/dist' },
    imports: { 'axios': 'shared-modules/axios' }
  }
} satisfies EsmxOptions;
```

Using in the business application:

```typescript
// business-app/src/api/orders.ts
import axios from 'axios';  // using shared axios instance
import { formatDate } from 'shared-modules/src/utils/format';  // using shared utility functions

export async function fetchOrders() {
  const response = await axios.get('/api/orders');
  return response.data.map(order => ({
    ...order,
    date: formatDate(order.createdAt)
  }));
}
```

## Core Configuration

Module linking configuration is located in the `modules` field of the `entry.node.ts` file, containing four core configuration items:

### Module Links (links)

The `links` configuration specifies the paths for linking the current module to other modules:

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist',     // relative path
      'api-utils': '/var/www/api-utils/dist'  // absolute path
    }
  }
} satisfies EsmxOptions;
```

### Module Imports (imports)

The `imports` configuration maps local module names to remote module identifiers, supporting standard imports and environment-specific configurations:

```typescript
// business-app/entry.node.ts
export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist'
    },
    imports: {
      // standard import mapping
      'axios': 'shared-modules/axios',
      'lodash': 'shared-modules/lodash',
      
      // environment-specific configuration
      'storage': {
        client: 'shared-modules/storage/client',
        server: 'shared-modules/storage/server'
      }
    }
  }
} satisfies EsmxOptions;
```

### Scope Mapping (scopes)

The `scopes` configuration defines import mappings for specific directory scopes or package scopes, achieving version isolation and dependency replacement. Supports two types: directory scope mapping and package scope mapping.

#### Directory Scope Mapping

Directory scope mapping only affects module imports within specific directories, achieving version isolation between different directories.

The following example shows how to use `scopes` configuration to specify different Vue versions for modules under the `vue2/` directory:

```typescript
// shared-modules/entry.node.ts  
export default {
  modules: {
    scopes: {
      // Vue2 directory scope mapping: only affects imports under vue2/ directory
      // Business code in vue2/ directory: import Vue from 'vue' → shared-modules/vue2 (version isolation)
      // Business code in other directories: import Vue from 'vue' → Vue 3 (common module)
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
      // Package scope mapping: affects dependency resolution within vue package
      // When vue package depends on @vue/shared, use the specified replacement version
      'vue': {
        '@vue/shared': 'shared-modules/@vue/shared'
      }
    }
  }
} satisfies EsmxOptions;
```

### Module Exports (exports)

The `exports` configuration defines the content provided by the module to the outside, only supporting array format:

```typescript
// shared-modules/entry.node.ts
export default {
  modules: {
    exports: [
      // npm packages: maintain original import path
      'pkg:axios',                    // when importing: import axios from 'axios'
      'pkg:lodash',                   // when importing: import { debounce } from 'lodash'
      
      // source modules: automatically rewritten to module paths
      'root:src/utils/date-utils.ts',     // when importing: import { formatDate } from 'shared-modules/src/utils/date-utils'
      'root:src/components/Chart.js',     // when importing: import Chart from 'shared-modules/src/components/Chart'
      
      // object form - complex configuration
      {
        'api': './src/api.ts',        // simple mapping
        'store': './src/store.ts'     // string value
      }
    ]
  }
} satisfies EsmxOptions;
```

**Prefix Handling Notes**:
- `pkg:axios` → maintains original package name import, suitable for third-party npm packages
- `root:src/utils/date-utils.ts` → converted to module relative path, suitable for project internal source code modules

**File Extension Support**: For `root:` prefix configurations, supports extensions like `.js`, `.mjs`, `.cjs`, `.jsx`, `.mjsx`, `.cjsx`, `.ts`, `.mts`, `.cts`, `.tsx`, `.mtsx`, `.ctsx`, extensions are automatically removed during configuration. For `pkg:` prefix and plain string configurations, extensions are not removed.

## Advanced Configuration

### Environment-Differentiated Builds

```typescript
exports: [
  {
    'src/storage/db': {
      client: './src/storage/indexedDB',  // client uses IndexedDB
      server: './src/storage/mongoAdapter' // server uses MongoDB adapter
    }
  },
  {
    'src/client-only': {
      client: './src/client-feature',  // client-only available
      server: false                    // server will not build
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

A complete example based on actual project structure:

### Shared Modules (shared-modules)

```typescript
// shared-modules/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
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

### Aggregated Application (business-app)

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

This configuration approach demonstrates:
- **Shared Modules**: Provides multi-version framework support, achieving version isolation through scope mapping
- **Vue3 Application**: Business application using Vue 3, only exports route configuration
- **Vue2 Dedicated Application**: Business application dedicated to Vue 2, only exports route configuration
- **Aggregated Application**: Unified entry point, coordinating different versions of sub-applications, including complete Vue module imports

Each module's configuration conforms to actual project usage scenarios, with clear dependency relationships, distinct functional responsibilities, and accurate technical implementation.

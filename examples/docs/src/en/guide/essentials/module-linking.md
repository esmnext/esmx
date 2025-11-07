---
titleSuffix: "Module Linking"
description: "Module Linking in Esmx: a zero-runtime micro frontend code sharing solution based on ESM standards."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Module Linking, ESM, Code Sharing, Micro Frontends"
---

# Module Linking

Module Linking is Esmx’s cross-application code sharing solution. It relies on native ESM so multiple apps can share modules without extra runtime libraries.

## Key Advantages

- Zero runtime overhead
- Efficient sharing via Import Maps
- Version isolation across apps
- Simple configuration compatible with native ESM

## Quick Start

### Basic Example

```ts
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

Usage:

```ts
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

Configuration lives under `modules` in `entry.node.ts`.

### links

```ts
export default {
  modules: {
    links: {
      'shared-modules': '../shared-modules/dist',
      'api-utils': '/var/www/api-utils/dist'
    }
  }
} satisfies EsmxOptions;
```

### imports

```ts
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

### scopes

#### Directory scope mapping

```ts
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

#### Package scope mapping

```ts
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

### exports

```ts
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

Prefix behavior:
- `pkg:axios` keeps original package imports
- `root:src/utils/date-utils.ts` rewrites to module-relative path

`root:` supports `.js`, `.mjs`, `.cjs`, `.jsx`, `.mjsx`, `.cjsx`, `.ts`, `.mts`, `.cts`, `.tsx`, `.mtsx`, `.ctsx`. Extensions are removed; `pkg:` and bare strings keep extensions.

## Advanced

### Environment-differentiated builds

```ts
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

### Mixed formats

```ts
exports: [
  'pkg:axios',
  'root:src/utils/format.ts',
  { 'api': './src/api/index.ts' },
  { 'components': './src/components/index.ts' },
  {
    'storage': {
      client: './src/storage/browser.ts',
      server: './src/storage/node.ts'
    }
  }
]
```

## Complete Example

### shared-modules

```ts
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

### vue3-app

```ts
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

### vue2-app

```ts
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

### business-app

```ts
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

This composition demonstrates:
- **Shared modules**: provide multi-version framework support with version isolation via scope mappings
- **Vue3 app**: uses Vue 3 and exports only route configuration
- **Vue2 app**: dedicated Vue 2 app that exports only route configuration
- **Aggregator app**: unified entry orchestrating different versions and coordinating imports

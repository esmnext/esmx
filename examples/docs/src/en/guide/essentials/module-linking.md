---
titleSuffix: Esmx Inter-Module Code Sharing
description: "Esmx Module Linking: Zero-runtime Micro-frontend Code Sharing Solution Based on ESM Standards"
head:
  - - meta
    - property: keywords
      content: Esmx, Module Linking, ESM, Code Sharing, Micro-frontend
---

# Module Linking

Module Linking is Esmx's cross-application code sharing mechanism, based on ECMAScript module standards, achieving micro-frontend architecture with zero runtime overhead.

## Overview

In micro-frontend architectures, multiple independent applications often need to use the same third-party libraries (such as HTTP clients, utility libraries, UI component libraries) and shared components. Traditional approaches have the following issues:

- **Resource Duplication**: Each application bundles the same dependencies independently, causing users to download duplicate code
- **Version Inconsistency**: Different applications using different versions of the same library may cause compatibility issues  
- **Memory Waste**: Multiple instances of the same library exist in the browser, occupying additional memory
- **Cache Invalidation**: Different bundled versions of the same library cannot share browser cache

Module Linking solves these problems through the ECMAScript module system and Import Maps specification, enabling multiple applications to safely and efficiently share code modules.

### How It Works

Module Linking is based on technology standards natively supported by modern browsers:

**Shared Module Provider**: One application acts as a **module provider**, responsible for building and exposing shared third-party libraries and components. Other applications act as **module consumers**, using these shared modules through standard ESM import syntax.

**Import Maps Resolution**: Browsers use Import Maps to map module import statements to actual file paths:

```javascript
import axios from 'axios';
import { formatDate } from 'shared-lib/src/utils/date-utils';

// Import Maps resolves them to
import axios from 'shared-lib/axios.389c4cab.final.mjs';
import { formatDate } from 'shared-lib/src/utils/date-utils.2d79c0c2.final.mjs';
```

## Quick Start

### Basic Example

Assume we have a shared library application (shared-lib) and a business application (business-app):

```typescript
// shared-lib/entry.node.ts - Provide shared modules
export default {
  modules: {
    exports: [
      'npm:axios',                    // Share HTTP client
      'root:src/utils/format.ts'      // Share utility functions
    ]
  }
} satisfies EsmxOptions;

// business-app/entry.node.ts - Use shared modules
export default {
  modules: {
    links: { 'shared-lib': '../shared-lib/dist' },
    imports: { 'axios': 'shared-lib/axios' }
  }
} satisfies EsmxOptions;
```

Using in business application:

```typescript
// business-app/src/api/orders.ts
import axios from 'axios';  // Use shared axios instance
import { formatDate } from 'shared-lib/src/utils/format';  // Use shared utility functions

export async function fetchOrders() {
  const response = await axios.get('/api/orders');
  return response.data.map(order => ({
    ...order,
    date: formatDate(order.createdAt)
  }));
}
```

## Core Configuration

Module Linking configuration is located in the `modules` field of the `entry.node.ts` file, containing three core configuration items:

### Module Links (links)

`links` configuration specifies paths where the current module links to other modules:

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-lib': '../shared-lib/dist',     // Relative path
      'api-utils': '/var/www/api-utils/dist'  // Absolute path
    }
  }
} satisfies EsmxOptions;
```

### Module Imports (imports)

`imports` configuration maps local module names to remote module identifiers, supporting standard imports and environment-specific configurations:

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-lib': '../shared-lib/dist'
    },
    imports: {
      // Standard import mapping (applies to both environments)
      'axios': 'shared-lib/axios',
      'lodash': 'shared-lib/lodash',
      
      // Environment-specific import mapping
      'storage': {
        client: 'shared-lib/storage/client',
        server: 'shared-lib/storage/server'
      },
      'config': {
        client: 'shared-lib/config/browser',
        server: 'shared-lib/config/node'
      }
    }
  }
} satisfies EsmxOptions;
```

### Module Exports (exports)

`exports` configuration defines content that modules expose externally, supporting only array format:

```typescript
// shared-lib/entry.node.ts
export default {
  modules: {
    exports: [
      // npm packages: maintain original import paths
      'npm:axios',                    // Import: import axios from 'axios'
      'npm:lodash',                   // Import: import { debounce } from 'lodash'
      
      // Source modules: automatically rewrite to module paths
      'root:src/utils/date-utils.ts',     // Import: import { formatDate } from 'shared-lib/src/utils/date-utils'
      'root:src/components/Chart.js',     // Import: import Chart from 'shared-lib/src/components/Chart'
      
      // Object form - complex configurations
      {
        'api': './src/api.ts',        // Simple mapping
        'store': {                    // Complete configuration
          file: './src/store.ts',
          rewrite: true
        }
      }
    ]
  }
} satisfies EsmxOptions;
```

**Prefix Processing**:
- `npm:axios` → Equivalent to `{ 'axios': { file: 'axios', rewrite: false } }`
- `root:src/utils/date-utils.ts` → Equivalent to `{ 'src/utils/date-utils': { file: './src/utils/date-utils', rewrite: true } }`

**File Extension Support**: Supports extensions like `.js`, `.mjs`, `.cjs`, `.jsx`, `.mjsx`, `.cjsx`, `.ts`, `.mts`, `.cts`, `.tsx`, `.mtsx`, `.ctsx`, which are automatically removed during configuration.

## Advanced Configuration

### Environment Differentiated Builds

```typescript
exports: {
  'src/storage/db': {
    files: {
      client: './src/storage/indexedDB',  // Client uses IndexedDB
      server: './src/storage/mongoAdapter' // Server uses MongoDB adapter
    }
  }
}
```

Setting `false` can disable builds for specific environments:

```typescript
exports: {
  'src/client-only': {
    files: {
      client: './src/client-feature',  // Only available on client
      server: false                    // Not available on server
    }
  }
}
```

### Mixed Configuration Format

```typescript
exports: [
  'npm:axios',
  'root:src/utils/format.ts',
  {
    'api': './src/api/index.ts',
    'components': {
      file: './src/components/index.ts',
      rewrite: true
    }
  },
  {
    'storage': {
      files: {
        client: './src/storage/browser.ts',
        server: './src/storage/node.ts'
      }
    }
  }
]
```

## Best Practices

### Use Case Evaluation

**Suitable Cases**:
- Multiple applications using the same third-party libraries (axios, lodash, moment, etc.)
- Need to share business component libraries or utility functions
- Want to reduce application size and improve loading performance
- Need to ensure library version consistency across multiple applications

**Not Suitable Cases**:
- Single application projects (no sharing needs)
- Frequently changing experimental code
- Scenarios requiring extremely low coupling between applications

### Import Guidelines

**Third-party Library Imports**:
```typescript
// ✅ Recommended - Use standard library names, conforming to ecosystem standards
import axios from 'axios';
import { debounce } from 'lodash';

// ❌ Not Recommended - Violates module ecosystem standards, not conducive to library replacement and maintenance
import axios from 'shared-lib/axios';
```

**Custom Module Imports**:
```typescript
// ✅ Recommended - Directly use module linking paths, clearly indicating dependency source
import { formatDate } from 'shared-lib/src/utils/date-utils';

// ❌ Invalid Configuration - imports does not support path prefix functionality
imports: { 'components': 'shared-lib/src/components' }
import Chart from 'components/Chart';  // This import cannot be resolved
```

### Configuration Principles

1. **Third-party Libraries**: Must configure `imports` mapping, use standard names for importing
2. **Custom Modules**: Directly use complete module linking paths  
3. **imports Purpose**: Only for third-party library standard name mapping, not directory aliases

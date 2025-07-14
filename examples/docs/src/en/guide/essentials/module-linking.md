---
titleSuffix: Esmx Module Code Sharing
description: "Esmx Module Linking: Zero Runtime Micro-frontend Code Sharing Solution Based on ESM Standards"
head:
  - - meta
    - property: keywords
      content: Esmx, Module Linking, ESM, Code Sharing, Micro-frontend
---

# Module Linking

Module Linking is Esmx's cross-application code sharing mechanism, based on ECMAScript module standards, achieving micro-frontend architecture with zero runtime overhead.

## Why Module Linking?

In micro-frontend architectures, multiple independent applications often need to use the same third-party libraries (such as HTTP clients, utility libraries, UI component libraries) and shared components. Traditional approaches have the following issues:

- **Resource Duplication**: Each application bundles the same dependencies independently, causing users to download duplicate code
- **Version Inconsistency**: Different applications using different versions of the same library may cause compatibility issues
- **Memory Waste**: Multiple instances of the same library exist in the browser, occupying additional memory
- **Cache Invalidation**: Different bundled versions of the same library cannot share browser cache

Module Linking solves these problems through the ECMAScript module system and Import Maps specification, enabling multiple applications to safely and efficiently share code modules.

## How It Works

Module Linking is based on technology standards natively supported by modern browsers:

### Shared Module Provider

One application acts as a **module provider**, responsible for building and exposing shared third-party libraries and components. Other applications act as **module consumers**, using these shared modules through standard ESM import syntax.

### Import Maps Resolution

Browsers use Import Maps to map module import statements to actual file paths:

```javascript
// Import statements in application code
import axios from 'axios';  // Mapped via scopes configuration
import { formatDate } from 'shared-lib/src/utils/date-utils';  // Mapped via imports configuration

// Import Maps resolves them to
import axios from 'shared-lib/axios.389c4cab.final.mjs';
import { formatDate } from 'shared-lib/src/utils/date-utils.2d79c0c2.final.mjs';
```

### Module Instance Sharing

All applications share the same module instance, ensuring:
- Global state consistency (such as library global configuration)
- Unified event system (such as global event bus)
- Memory usage optimization (avoiding duplicate instantiation)

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

## Configuration Guide

Module Linking configuration is located in the `modules` field of the `entry.node.ts` file, containing three core configuration items:

### Basic Configuration

#### Module Export

`exports` configuration defines content that modules expose externally, supporting two prefixes:

> **Prefix Note**: `npm:` and `root:` prefixes are syntactic sugar for configuration simplification, only valid in string items of `exports` array form. They automatically apply best practice configurations to simplify common use cases.

```typescript
// shared-lib/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  // Other configurations...
  modules: {
    exports: [
      // npm packages: maintain original import paths
      'npm:axios',                    // Import: import axios from 'axios'
      'npm:lodash',                   // Import: import { debounce } from 'lodash'
      
      // Source modules: automatically rewrite to module paths
      'root:src/utils/date-utils.ts',     // Import: import { formatDate } from 'shared-lib/src/utils/date-utils'
      'root:src/components/Chart.js'      // Import: import Chart from 'shared-lib/src/components/Chart'
    ]
  }
} satisfies EsmxOptions;
```

**Prefix Processing**:
- `npm:axios` → Equivalent to `{ 'axios': { input: 'axios', rewrite: false } }`
- `root:src/utils/date-utils.ts` → Equivalent to `{ 'src/utils/date-utils': { input: './src/utils/date-utils', rewrite: true } }`

#### Module Linking

`links` configuration specifies paths where the current module links to other modules:

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  // Other configurations...
  modules: {
    links: {
      'shared-lib': '../shared-lib/dist',     // Relative path
      'api-utils': '/var/www/api-utils/dist'  // Absolute path
    }
  }
} satisfies EsmxOptions;
```

#### Module Import

`imports` configuration maps local module names to remote module identifiers, **mainly used for standard imports of third-party libraries**:

```typescript
// business-app/entry.node.ts
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    links: {
      'shared-lib': '../shared-lib/dist'
    },
    imports: {
      // Third-party library standard import mapping
      'axios': 'shared-lib/axios',
      'lodash': 'shared-lib/lodash'
    }
  }
} satisfies EsmxOptions;

// Usage
import axios from 'axios';  // Correct - use standard library name
import { debounce } from 'lodash';  // Correct - use standard library name

// Custom module import
import { formatDate } from 'shared-lib/src/utils/date-utils';  // Correct - directly use link path
```

### Advanced Configuration

#### Advanced exports Configuration

`exports` supports multiple configuration forms. When complex configurations (such as `inputTarget`) are needed, prefix syntactic sugar cannot satisfy requirements, and complete object form is needed:

**Array Form**:
```typescript
// shared-lib/entry.node.ts
export default {
  modules: {
    exports: [
      // String form - using prefix syntactic sugar
      'npm:axios',                    // Export npm package
      'root:src/utils/format.ts',     // Export source file
      
      // Object form - complex configurations cannot use prefixes
      {
        'api': './src/api.ts',        // Simple mapping
        'store': {                    // Complete configuration
          input: './src/store.ts',
          rewrite: true
        }
      }
    ]
  }
} satisfies EsmxOptions;
```

**Object Form**:
```typescript
// shared-lib/entry.node.ts
export default {
  modules: {
    exports: {
      // Simple mapping
      'axios': 'axios',            // Directly specify npm package name
      
      // Complete configuration object
      'src/utils/format': {
        input: './src/utils/format',  // Input file path
        rewrite: true,                // Whether to rewrite import paths (default true)
        inputTarget: {                // Client/server differentiated builds
          client: './src/utils/format.client',  // Client-specific version
          server: './src/utils/format.server'   // Server-specific version
        }
      }
    }
  }
} satisfies EsmxOptions;
```

#### inputTarget Environment Differentiated Builds

```typescript
exports: {
  'src/storage/db': {
    inputTarget: {
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
    inputTarget: {
      client: './src/client-feature',  // Only available on client
      server: false                    // Not available on server
    }
  }
}
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
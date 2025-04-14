---
titleSuffix: Esmx Framework Inter-Service Code Sharing Mechanism
description: Detailed introduction to Esmx framework's module linking mechanism, including inter-service code sharing, dependency management, and ESM specification implementation, helping developers build efficient micro-frontend applications.
head:
  - - meta
    - property: keywords
      content: Esmx, Module Linking, Module Link, ESM, Code Sharing, Dependency Management, Micro-frontend
---

# Module Linking

The Esmx framework provides a comprehensive module linking mechanism for managing code sharing and dependency relationships between services. This mechanism is implemented based on the ESM (ECMAScript Module) specification, supporting source-level module exports/imports and complete dependency management functionality.

### Core Concepts

#### Module Export
Module export is the process of exposing specific code units (such as components, utility functions, etc.) from a service in ESM format. Two export types are supported:
- **Source Export**: Directly exports source code files from the project
- **Dependency Export**: Exports third-party dependency packages used by the project

#### Module Linking
Module import is the process of referencing code units exported by other services. Multiple installation methods are supported:
- **Source Installation**: Suitable for development environments, supports real-time modifications and hot updates
- **Package Installation**: Suitable for production environments, uses build artifacts directly

## Module Export

### Configuration Instructions

Configure modules to be exported in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: [
            // Export source files
            'root:src/components/button.vue',  // Vue component
            'root:src/utils/format.ts',        // Utility function
            // Export third-party dependencies
            'pkg:vue',                         // Vue framework
            'pkg:vue-router'                   // Vue Router
        ]
    }
} satisfies EsmxOptions;
```

Export configuration supports two types:
- `root:*`: Exports source files, with paths relative to the project root
- `pkg:*`: Exports third-party dependencies, specified by package name directly

## Module Import

### Configuration Instructions

Configure modules to be imported in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // Link configuration
        links: {
            // Source installation: points to build output directory
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // Package installation: points to package directory
            'other-remote': 'root:./node_modules/other-remote'
        },
        // Import mapping settings
        imports: {
            // Use dependencies from remote modules
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies EsmxOptions;
```

Configuration items explanation:
1. **imports**: Configures local paths for remote modules
   - Source installation: Points to build output directory (dist)
   - Package installation: Directly points to package directory

2. **externals**: Configures external dependencies
   - Used for sharing dependencies from remote modules
   - Avoids duplicate packaging of same dependencies
   - Supports dependency sharing across multiple modules

### Installation Methods

#### Source Installation
Suitable for development environments, supports real-time modifications and hot updates.

1. **Workspace Method**
Recommended for Monorepo projects:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Link Method**
For local development and debugging:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### Package Installation
Suitable for production environments, uses build artifacts directly.

1. **NPM Registry**
Install via npm registry:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "^1.0.0"
    }
}
```

2. **Static Server**
Install via HTTP/HTTPS protocol:
```ts title="package.json"
{
    "dependencies": {
        "ssr-remote": "https://cdn.example.com/ssr-remote/1.0.0.tgz"
    }
}
```

## Package Building

### Configuration Instructions

Configure build options in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
    // Module export configuration
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'pkg:vue'
        ]
    },
    // Build configuration
    pack: {
        // Enable building
        enable: true,

        // Output configuration
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // Custom package.json
        packageJson: async (esmx, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // Pre-build processing
        onBefore: async (esmx, pkg) => {
            // Generate type declarations
            // Execute test cases
            // Update documentation, etc.
        },

        // Post-build processing
        onAfter: async (esmx, pkg, file) => {
            // Upload to CDN
            // Publish to npm registry
            // Deploy to test environment, etc.
        }
    }
} satisfies EsmxOptions;
```

### Build Artifacts

```
your-app-name.tgz
├── package.json        # Package information
├── index.js            # Production entry
├── server/             # Server resources
│   └── manifest.json   # Server resource mapping
├── node/               # Node.js runtime
└── client/             # Client resources
    └── manifest.json   # Client resource mapping
```

### Publishing Process

```bash
# 1. Build production version
esmx build

# 2. Publish to npm
npm publish dist/versions/your-app-name.tgz
```
---
titleSuffix: Gez Framework Inter-Service Code Sharing Mechanism
description: Detailed introduction to Gez framework's module linking mechanism, including inter-service code sharing, dependency management, and ESM specification implementation, helping developers build efficient micro-frontend applications.
head:
  - - meta
    - property: keywords
      content: Gez, Module Linking, Module Link, ESM, Code Sharing, Dependency Management, Micro-frontend
---

# Module Linking

The Gez framework provides a comprehensive module linking mechanism for managing code sharing and dependency relationships between services. This mechanism is implemented based on the ESM (ECMAScript Module) specification, supporting source-level module exports and imports, as well as complete dependency management functionality.

### Core Concepts

#### Module Export
Module export is the process of exposing specific code units (such as components, utility functions, etc.) from a service in ESM format. Two types of exports are supported:
- **Source Code Export**: Directly exporting source code files from the project
- **Dependency Export**: Exporting third-party dependency packages used by the project

#### Module Linking
Module import is the process of referencing code units exported by other services within a service. Multiple installation methods are supported:
- **Source Code Installation**: Suitable for development environments, supports real-time modifications and hot updates
- **Package Installation**: Suitable for production environments, directly using build artifacts

## Module Export

### Configuration Instructions

Configure the modules to be exported in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        exports: [
            // Export source code files
            'root:src/components/button.vue',  // Vue component
            'root:src/utils/format.ts',        // Utility function
            // Export third-party dependencies
            'npm:vue',                         // Vue framework
            'npm:vue-router'                   // Vue Router
        ]
    }
} satisfies GezOptions;
```

Export configuration supports two types:
- `root:*`: Export source code files, with paths relative to the project root directory
- `npm:*`: Export third-party dependencies, directly specifying the package name

## Module Import

### Configuration Instructions

Configure the modules to be imported in `entry.node.ts`:

```ts title="src/entry.node.ts"
import type { GezOptions } from '@gez/core';

export default {
    modules: {
        // Link configuration
        links: {
            // Source code installation: points to the build artifact directory
            'ssr-remote': 'root:./node_modules/ssr-remote/dist',
            // Package installation: points to the package directory
            'other-remote': 'root:./node_modules/other-remote'
        },
        // Import mapping settings
        imports: {
            // Use dependencies from remote modules
            'vue': 'ssr-remote/npm/vue',
            'vue-router': 'ssr-remote/npm/vue-router'
        }
    }
} satisfies GezOptions;
```

Configuration item descriptions:
1. **imports**: Configure the local paths of remote modules
   - Source code installation: points to the build artifact directory (dist)
   - Package installation: directly points to the package directory

2. **externals**: Configure external dependencies
   - Used for sharing dependencies from remote modules
   - Avoids duplicate packaging of the same dependencies
   - Supports multiple modules sharing dependencies

### Installation Methods

#### Source Code Installation
Suitable for development environments, supports real-time modifications and hot updates.

1. **Workspace Method**
Recommended for use in Monorepo projects:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "workspace:*"
    }
}
```

2. **Link Method**
Used for local development and debugging:
```ts title="package.json"
{
    "devDependencies": {
        "ssr-remote": "link:../ssr-remote"
    }
}
```

#### Package Installation
Suitable for production environments, directly using build artifacts.

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
import type { GezOptions } from '@gez/core';

export default {
    // Module export configuration
    modules: {
        exports: [
            'root:src/components/button.vue',
            'root:src/utils/format.ts',
            'npm:vue'
        ]
    },
    // Build configuration
    pack: {
        // Enable build
        enable: true,

        // Output configuration
        outputs: [
            'dist/client/versions/latest.tgz',
            'dist/client/versions/1.0.0.tgz'
        ],

        // Custom package.json
        packageJson: async (gez, pkg) => {
            pkg.version = '1.0.0';
            return pkg;
        },

        // Pre-build processing
        onBefore: async (gez, pkg) => {
            // Generate type declarations
            // Execute test cases
            // Update documentation, etc.
        },

        // Post-build processing
        onAfter: async (gez, pkg, file) => {
            // Upload to CDN
            // Publish to npm registry
            // Deploy to test environment, etc.
        }
    }
} satisfies GezOptions;
```

### Build Artifacts

```
your-app-name.tgz
├── package.json        # Package information
├── index.js            # Production environment entry
├── server/             # Server-side resources
│   └── manifest.json   # Server-side resource mapping
├── node/               # Node.js runtime
└── client/             # Client-side resources
    └── manifest.json   # Client-side resource mapping
```

### Publishing Process

```bash
# 1. Build production version
gez build

# 2. Publish to npm
npm publish dist/versions/your-app-name.tgz
```
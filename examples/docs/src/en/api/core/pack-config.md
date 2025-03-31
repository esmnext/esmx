---
titleSuffix: Esmx Framework Pack Configuration API Reference
description: Detailed documentation on the PackConfig interface in the Esmx framework, including package bundling rules, output configurations, and lifecycle hooks to help developers implement standardized build processes.
head:
  - - meta
    - property: keywords
      content: Esmx, PackConfig, package bundling, build configuration, lifecycle hooks, packaging configuration, web application framework
---

# PackConfig

`PackConfig` is the package bundling configuration interface used to package service build artifacts into standard npm .tgz format packages.

- **Standardization**: Uses npm's standard .tgz packaging format
- **Completeness**: Includes all necessary files such as module source code, type declarations, and configuration files
- **Compatibility**: Fully compatible with the npm ecosystem, supporting standard package management workflows

## Type Definition

```ts
interface PackConfig {
    enable?: boolean;
    outputs?: string | string[] | boolean;
    packageJson?: (esmx: Esmx, pkg: Record<string, any>) => Promise<Record<string, any>>;
    onBefore?: (esmx: Esmx, pkg: Record<string, any>) => Promise<void>;
    onAfter?: (esmx: Esmx, pkg: Record<string, any>, file: Buffer) => Promise<void>;
}
```

### PackConfig

#### enable

Whether to enable the packaging feature. When enabled, build artifacts will be packaged into standard npm .tgz format packages.

- Type: `boolean`
- Default: `false`

#### outputs

Specifies the output package file path(s). Supports the following configuration methods:
- `string`: Single output path, e.g., 'dist/versions/my-app.tgz'
- `string[]`: Multiple output paths for generating multiple versions simultaneously
- `boolean`: When true, uses the default path 'dist/client/versions/latest.tgz'

#### packageJson

Callback function for customizing package.json content. Called before packaging to modify package.json content.

- Parameters:
  - `esmx: Esmx` - Esmx instance
  - `pkg: any` - Original package.json content
- Returns: `Promise<any>` - Modified package.json content

Common use cases:
- Modifying package name and version
- Adding or updating dependencies
- Adding custom fields
- Configuring publishing-related information

Example:
```ts
packageJson: async (esmx, pkg) => {
  // Set package information
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'My Application';

  // Add dependencies
  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  // Add publish configuration
  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Callback function for pre-packaging preparation work.

- Parameters:
  - `esmx: Esmx` - Esmx instance
  - `pkg: Record<string, any>` - package.json content
- Returns: `Promise<void>`

Common use cases:
- Adding additional files (README, LICENSE, etc.)
- Running tests or build validation
- Generating documentation or metadata
- Cleaning temporary files

Example:
```ts
onBefore: async (esmx, pkg) => {
  // Add documentation
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  // Run tests
  await runTests();

  // Generate documentation
  await generateDocs();

  // Clean temporary files
  await cleanupTempFiles();
}
```

#### onAfter

Callback function for post-packaging processing. Called after .tgz file generation to handle packaged artifacts.

- Parameters:
  - `esmx: Esmx` - Esmx instance
  - `pkg: Record<string, any>` - package.json content
  - `file: Buffer` - Packaged file content
- Returns: `Promise<void>`

Common use cases:
- Publishing to npm registry (public or private)
- Uploading to static asset servers
- Performing version management
- Triggering CI/CD pipelines

Example:
```ts
onAfter: async (esmx, pkg, file) => {
  // Publish to private npm registry
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  // Upload to static asset server
  await uploadToServer(file, 'https://assets.example.com/packages');

  // Create version tag
  await createGitTag(pkg.version);

  // Trigger deployment pipeline
  await triggerDeploy(pkg.version);
}
```

## Usage Example

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Configure modules to export
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'npm:vue',
      'npm:vue-router'
    ]
  },
  // Packaging configuration
  pack: {
    // Enable packaging
    enable: true,

    // Output multiple versions simultaneously
    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    // Customize package.json
    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    // Pre-packaging preparation
    onBefore: async (esmx, pkg) => {
      // Add necessary files
      await fs.writeFile('dist/README.md', '# Your App\n\nModule export instructions...');
      // Run type checking
      await runTypeCheck();
    },

    // Post-packaging processing
    onAfter: async (esmx, pkg, file) => {
      // Publish to private npm registry
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      // Or deploy to static server
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
```
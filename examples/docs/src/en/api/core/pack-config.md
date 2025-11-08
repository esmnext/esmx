---
titleSuffix: "Esmx Framework Packaging Configuration API Reference"
description: "Detailed introduction to Esmx framework's PackConfig configuration interface, including software package packaging rules, output configuration, and lifecycle hooks, helping developers implement standardized build processes."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, PackConfig, software package packaging, build configuration, lifecycle hooks, packaging configuration, Web application framework"
---

# PackConfig

`PackConfig` is the software package packaging configuration interface, used to package service build artifacts into standard npm .tgz format packages.

- **Standardization**: Uses npm standard .tgz packaging format
- **Completeness**: Contains all necessary files including module source code, type declarations, and configuration files
- **Compatibility**: Fully compatible with npm ecosystem, supports standard package management workflows

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

Enables or disables packaging functionality. When enabled, build artifacts will be packaged into standard npm .tgz format packages.

- Type: `boolean`
- Default: `false`

#### outputs

Specifies the output package file path. Supports the following configuration methods:
- `string`: Single output path, e.g., 'dist/versions/my-app.tgz'
- `string[]`: Multiple output paths, for generating multiple versions simultaneously
- `boolean`: true uses the default path 'dist/client/versions/latest.tgz'

#### packageJson

Callback function to customize package.json content. Called before packaging, used to customize the package.json content.

- Parameters:
  - `esmx: Esmx` - Esmx instance
  - `pkg: Record<string, any>` - Original package.json content
- Returns: `Promise<Record<string, any>>` - Modified package.json content

Common use cases:
- Modify package name and version
- Add or update dependencies
- Add custom fields
- Configure publishing-related information

Example:
```ts
packageJson: async (esmx, pkg) => {
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'My App';

  pkg.dependencies = {
    'vue': '^3.0.0',
    'express': '^4.17.1'
  };

  pkg.publishConfig = {
    registry: 'https://registry.example.com'
  };

  return pkg;
}
```

#### onBefore

Pre-packaging preparation callback function.

- Parameters:
  - `esmx: Esmx` - Esmx instance
  - `pkg: Record<string, any>` - package.json content
- Returns: `Promise<void>`

Common use cases:
- Add additional files (README, LICENSE, etc.)
- Execute tests or build validation
- Generate documentation or metadata
- Clean temporary files

Example:
```ts
onBefore: async (esmx, pkg) => {
  await fs.writeFile('dist/README.md', '# My App');
  await fs.writeFile('dist/LICENSE', 'MIT License');

  await runTests();

  await generateDocs();

  await cleanupTempFiles();
}
```

#### onAfter

Post-packaging processing callback function. Called after .tgz file generation, used to process packaging artifacts.

- Parameters:
  - `esmx: Esmx` - Esmx instance
  - `pkg: Record<string, any>` - package.json content
  - `file: Buffer` - Packaged file content
- Returns: `Promise<void>`

Common use cases:
- Publish to npm registry (public or private)
- Upload to static resource server
- Execute version management
- Trigger CI/CD processes

Example:
```ts
onAfter: async (esmx, pkg, file) => {
  await publishToRegistry(file, {
    registry: 'https://registry.example.com'
  });

  await uploadToServer(file, 'https://assets.example.com/packages');

  await createGitTag(pkg.version);

  await triggerDeploy(pkg.version);
}
```

## Usage Examples

```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    exports: [
      'root:src/components/button.vue',
      'root:src/utils/format.ts',
      'pkg:vue',
      'pkg:vue-router'
    ]
  },
  packs: {
    enable: true,

    outputs: [
      'dist/versions/latest.tgz',
      'dist/versions/1.0.0.tgz'
    ],

    packageJson: async (esmx, pkg) => {
      pkg.version = '1.0.0';
      return pkg;
    },

    onBefore: async (esmx, pkg) => {
      await fs.writeFile('dist/README.md', '# Your App\n\nModule export instructions...');
      await runTypeCheck();
    },

    onAfter: async (esmx, pkg, file) => {
      await publishToRegistry(file, {
        registry: 'https://npm.your-registry.com/'
      });
      await uploadToServer(file, 'https://static.example.com/packages');
    }
  }
} satisfies EsmxOptions;
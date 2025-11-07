---
titleSuffix: "Esmx Framework Packaging Configuration API Reference"
description: "PackConfig interface for packaging build outputs into npm .tgz, including outputs, package.json hook, lifecycle hooks, and usage to standardize builds."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, PackConfig, package, build config, lifecycle hooks, packaging"
---

# PackConfig

`PackConfig` is the package configuration interface used to bundle build outputs into a standard npm `.tgz` package.

- Standardized: uses npm-standard `.tgz` packaging
- Complete: includes source, type declarations, and necessary config files
- Compatible: fully compatible with the npm ecosystem and workflows

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

Whether to enable packaging. When enabled, build outputs are bundled into npm `.tgz` packages.

- Type: `boolean`
- Default: `false`

#### outputs

Configure output package file paths:
- `string`: single output path, e.g. `dist/versions/my-app.tgz`
- `string[]`: multiple output paths for multiple versions
- `boolean`: when `true`, uses default `dist/client/versions/latest.tgz`

#### packageJson

Hook to customize `package.json` before packaging.

- Params:
  - `esmx: Esmx` – Esmx instance
  - `pkg: Record<string, any>` – original `package.json`
- Returns: `Promise<Record<string, any>>` – modified `package.json`

Common use cases:
- Modify name and version
- Add or update dependencies
- Add custom fields
- Configure publish-related info

Example:
```ts
packageJson: async (esmx, pkg) => {
  pkg.name = 'my-app';
  pkg.version = '1.0.0';
  pkg.description = 'My application';

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

Pre-packaging preparation hook.

- Params:
  - `esmx: Esmx`
  - `pkg: Record<string, any>` – package.json content
- Returns: `Promise<void>`

Common use cases:
- Add extra files (README, LICENSE)
- Run tests or build validations
- Generate docs or metadata
- Cleanup temporary files

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

Post-packaging hook. Called after `.tgz` is generated to handle the artifact.

- Params:
  - `esmx: Esmx`
  - `pkg: Record<string, any>`
  - `file: Buffer` – packaged file content
- Returns: `Promise<void>`

Common use cases:
- Publish to npm registry (public or private)
- Upload to static asset server
- Perform version management
- Trigger CI/CD pipelines

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

## Usage Example

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
      await fs.writeFile('dist/README.md', '# Your App\n\nModule export notes...');
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
```

---
titleSuffix: Esmx Framework Module Configuration API Reference
description: Detailed documentation on the ModuleConfig interface of the Esmx framework, including module import/export rules, alias configuration, and external dependency management, helping developers gain a deeper understanding of the framework's modular system.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, Module Configuration, Module Import/Export, External Dependencies, Alias Configuration, Dependency Management, Web Application Framework
---

# ModuleConfig

ModuleConfig provides module configuration capabilities for the Esmx framework, used to define module import/export rules, alias configuration, and external dependencies.

## Type Definitions

### PathType

- **Type Definition**:
```ts
enum PathType {
  npm = 'npm:', 
  root = 'root:'
}
```

Module path type enumeration:
- `npm`: Represents dependencies in node_modules
- `root`: Represents files in the project root directory

### ModuleConfig

- **Type Definition**:
```ts
interface ModuleConfig {
  exports?: string[]
  links?: Record<string, string>
  imports?: Record<string, string>
}
```

Module configuration interface, used to define service exports, imports, and external dependency configurations.

#### exports

Export configuration list, exposing specific code units (such as components, utility functions, etc.) from the service in ESM format.

Supports two types:
- `root:*`: Exports source code files, e.g., `root:src/components/button.vue`
- `npm:*`: Exports third-party dependencies, e.g., `npm:vue`

Each export item contains the following properties:
- `name`: Original export path, e.g., `npm:vue` or `root:src/components`
- `type`: Path type (`npm` or `root`)
- `importName`: Import name, format: `${serviceName}/${type}/${path}`
- `exportName`: Export path, relative to the service root directory
- `exportPath`: Actual file path
- `externalName`: External dependency name, used as an identifier when other services import this module

#### links

Service dependency configuration mapping, used to configure other services (local or remote) that the current service depends on and their local paths. Each configuration item's key is the service name, and the value is the local path of that service.

Different installation methods require different configurations:
- Source code installation (Workspace, Git): Needs to point to the dist directory, as it requires using built files
- Package installation (Link, static server, private mirror source, File): Directly points to the package directory, as the package already contains built files

#### imports

External dependency mapping, configuring external dependencies to be used, typically using dependencies from remote modules.

Each dependency item contains the following properties:
- `match`: Regular expression used to match import statements
- `import`: Actual module path

**Example**:
```ts title="entry.node.ts"
import type { EsmxOptions } from '@esmx/core';

export default {
  modules: {
    // Export configuration
    exports: [
      'root:src/components/button.vue',  // Export source code file
      'root:src/utils/format.ts',
      'npm:vue',  // Export third-party dependency
      'npm:vue-router'
    ],

    // Import configuration
    links: {
      // Source code installation: Needs to point to the dist directory
      'ssr-remote': 'root:./node_modules/ssr-remote/dist',
      // Package installation: Directly points to the package directory
      'other-remote': 'root:./node_modules/other-remote'
    },

    // External dependency configuration
    imports: {
      'vue': 'ssr-remote/npm/vue',
      'vue-router': 'ssr-remote/npm/vue-router'
    }
  }
} satisfies EsmxOptions;
```

### ParsedModuleConfig

- **Type Definition**:
```ts
interface ParsedModuleConfig {
  name: string
  root: string
  exports: {
    name: string
    type: PathType
    importName: string
    exportName: string
    exportPath: string
    externalName: string
  }[]
  links: Array<{
    /**
     * Package name
     */
    name: string
    /**
     * Package root directory
     */
    root: string
  }>
  imports: Record<string, { match: RegExp; import?: string }>
}
```

Parsed module configuration, converting the original module configuration into a standardized internal format:

#### name
Current service name
- Used to identify the module and generate import paths

#### root
Current service root directory path
- Used to resolve relative paths and store build artifacts

#### exports
Export configuration list
- `name`: Original export path, e.g., 'npm:vue' or 'root:src/components'
- `type`: Path type (npm or root)
- `importName`: Import name, format: '${serviceName}/${type}/${path}'
- `exportName`: Export path, relative to the service root directory
- `exportPath`: Actual file path
- `externalName`: External dependency name, used as an identifier when other services import this module

#### links
Import configuration list
- `name`: Package name
- `root`: Package root directory

#### imports
External dependency mapping
- Maps module import paths to actual module locations
- `match`: Regular expression used to match import statements
- `import`: Actual module path
```
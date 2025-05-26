---
titleSuffix: Esmx Framework Module Configuration API Reference
description: Detailed documentation on the ModuleConfig interface of the Esmx framework, covering module import/export rules, alias configuration, and external dependency management to help developers understand the framework's modular system.
head:
  - - meta
    - property: keywords
      content: Esmx, ModuleConfig, Module Configuration, Module Import/Export, External Dependencies, Alias Configuration, Dependency Management, Web Application Framework
---

# ModuleConfig

ModuleConfig is used to configure module import and export rules:

```typescript
interface ModuleConfig {
    /**
     * Links configuration between services
     * Key: Name of the remote service
     * Value: Path to the build output directory of the remote service
     */
    links?: Record<string, string>;

    /**
     * Import configuration: Maps module identifiers in the current service to modules provided by remote services
     * Key: Module identifier used in the current service
     * Value: Module path exported by the remote service
     */
    imports?: Record<string, string>;

    /**
     * Export configuration: Exposes modules from the current service for use by other services
     */
    exports?: ModuleConfigExportExports;
}
```

## links Configuration

Specify build directory locations of remote services:

```typescript
{
  links: {
    'vue-remote-service': '../vue-remote-service/dist',  // Relative path
    'other-service': '/var/www/other-service/dist'  // Absolute path
  }
}
```

## imports Configuration

Configure modules to use and their sources:

```typescript
{
  imports: {
    'remote-button': 'vue-remote-service/components/button'
  }
}
```

## exports Configuration

The system exports these entry files by default:
```typescript
{
  'src/entry.client': {
    inputTarget: {
      client: './src/entry.client',
      server: false
    }
  },
  'src/entry.server': {
    inputTarget: {
      client: false,
      server: './src/entry.server'
    }
  }
}
```

### Array Format

```typescript
exports: [
    // Export npm package
    'npm:vue',                           // Will set rewrite: false automatically
    
    // Export source file (must include file extension)
    'root:src/components/button.ts',     // Will be resolved to './src/components/button'
    
    // Object configuration
    {
      'store': {
        input: './src/store.ts',         // Isomorphic module
        inputTarget: {                   // Or specify different client/server implementations
          client: './src/store.client.ts',
          server: './src/store.server.ts'
        },
        rewrite: true                    // Defaults to true
      }
    }
]
```

### Object Format

```typescript
exports: {
    // Directly specify source file path
    'utils': './src/utils.ts',

    // Complete configuration
    'api': {
        input: './src/api/index.ts'      // Entry file for isomorphic module
    },
    
    // Client/Server separation
    'entry': {
        inputTarget: {
            client: './src/entry.client.ts',  // false means no implementation for this environment
            server: './src/entry.server.ts'
        }
    }
}
```

## Configuration Properties

### ModuleConfigExportObject

```typescript
interface ModuleConfigExportObject {
    /**
     * Source file path of the module
     */
    input?: string;

    /**
     * Different entry file configurations for client and server
     * false means no implementation for that environment
     */
    inputTarget?: Record<'client' | 'server', string | false>;

    /**
     * Whether to rewrite module paths
     * @default true
     * @remarks Only needs to be false when exporting npm packages
     */
    rewrite?: boolean;
}
```

## Usage Restrictions

1. **Path Requirements**
   - All paths except `npm:` prefix exports must point to specific files
   - File paths with `root:` prefix must include file extensions (.ts, .js, etc.)

2. **Path Resolution Rules**
   - `npm:` prefix: For exporting npm packages, automatically sets `rewrite: false`
   - `root:` prefix: For exporting source files, resolved to relative paths
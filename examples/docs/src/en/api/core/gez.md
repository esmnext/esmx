---
titleSuffix: Framework Core Class API Reference
description: Detailed documentation of the Esmx framework's core class API, including application lifecycle management, static asset handling, and server-side rendering capabilities, helping developers gain a deep understanding of the framework's core functionalities.
head:
  - - meta
    - property: keywords
      content: Esmx, API, Lifecycle Management, Static Assets, Server-Side Rendering, Rspack, Web Application Framework
---

# Esmx

## Introduction

Esmx is a high-performance web application framework based on Rspack, providing comprehensive application lifecycle management, static asset handling, and server-side rendering capabilities.

## Type Definitions

### RuntimeTarget

- **Type Definition**:
```ts
type RuntimeTarget = 'client' | 'server'
```

Application runtime environment types:
- `client`: Runs in the browser environment, supporting DOM operations and browser APIs
- `server`: Runs in the Node.js environment, supporting file system and server-side functionalities

### ImportMap

- **Type Definition**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

ES module import mapping type.

#### SpecifierMap

- **Type Definition**:
```ts
type SpecifierMap = Record<string, string>
```

Module specifier mapping type, used to define the mapping relationships of module import paths.

#### ScopesMap

- **Type Definition**:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

Scope mapping type, used to define module import mappings within specific scopes.

### COMMAND

- **Type Definition**:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

Command type enumeration:
- `dev`: Development environment command, starts the development server with hot reloading
- `build`: Build command, generates production build artifacts
- `preview`: Preview command, starts a local preview server
- `start`: Start command, runs the production server

## Instance Options

Defines the core configuration options for the Esmx framework.

```ts
interface EsmxOptions {
  root?: string
  isProd?: boolean
  basePathPlaceholder?: string | false
  modules?: ModuleConfig
  packs?: PackConfig
  devApp?: (esmx: Esmx) => Promise<App>
  server?: (esmx: Esmx) => Promise<void>
  postBuild?: (esmx: Esmx) => Promise<void>
}
```

#### root

- **Type**: `string`
- **Default**: `process.cwd()`

Project root directory path. Can be an absolute or relative path, with relative paths resolved based on the current working directory.

#### isProd

- **Type**: `boolean`
- **Default**: `process.env.NODE_ENV === 'production'`

Environment flag.
- `true`: Production environment
- `false`: Development environment

#### basePathPlaceholder

- **Type**: `string | false`
- **Default**: `'[[[___GEZ_DYNAMIC_BASE___]]]'`

Base path placeholder configuration. Used for runtime dynamic replacement of resource base paths. Set to `false` to disable this feature.

#### modules

- **Type**: `ModuleConfig`

Module configuration options. Used to configure the project's module resolution rules, including module aliases and external dependencies.

#### packs

- **Type**: `PackConfig`

Pack configuration options. Used to package build artifacts into standard npm .tgz format packages.

#### devApp

- **Type**: `(esmx: Esmx) => Promise<App>`

Development environment application creation function. Used only in the development environment to create the application instance for the development server.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {
          // Custom Rspack configuration
        }
      })
    )
  }
}
```

#### server

- **Type**: `(esmx: Esmx) => Promise<void>`

Server startup configuration function. Used to configure and start the HTTP server, available in both development and production environments.

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      esmx.middleware(req, res, async () => {
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000);
  }
}
```

#### postBuild

- **Type**: `(esmx: Esmx) => Promise<void>`

Post-build processing function. Executed after the project build is completed, useful for:
- Performing additional resource processing
- Deployment operations
- Generating static files
- Sending build notifications

## Instance Properties

### name

- **Type**: `string`
- **Read-only**: `true`

The name of the current module, derived from the module configuration.

### varName

- **Type**: `string`
- **Read-only**: `true`

A valid JavaScript variable name generated based on the module name.

### root

- **Type**: `string`
- **Read-only**: `true`

The absolute path of the project root directory. If the configured `root` is a relative path, it is resolved based on the current working directory.

### isProd

- **Type**: `boolean`
- **Read-only**: `true`

Determines whether the current environment is production. Prioritizes the `isProd` configuration option; if not configured, it checks `process.env.NODE_ENV`.

### basePath

- **Type**: `string`
- **Read-only**: `true`
- **Throws**: `NotReadyError` - When the framework is not initialized

Gets the module base path with leading and trailing slashes. Returns the format `/${name}/`, where name is from the module configuration.

### basePathPlaceholder

- **Type**: `string`
- **Read-only**: `true`

Gets the base path placeholder for runtime dynamic replacement. Can be disabled via configuration.

### middleware

- **Type**: `Middleware`
- **Read-only**: `true`

Gets the static asset handling middleware. Provides different implementations based on the environment:
- Development environment: Supports real-time source compilation and hot reloading
- Production environment: Supports long-term caching of static assets

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- **Type**: `(options?: RenderContextOptions) => Promise<RenderContext>`
- **Read-only**: `true`

Gets the server-side rendering function. Provides different implementations based on the environment:
- Development environment: Supports hot reloading and real-time preview
- Production environment: Provides optimized rendering performance

```ts
// Basic usage
const rc = await esmx.render({
  params: { url: req.url }
});

// Advanced configuration
const rc = await esmx.render({
  base: '',                    // Base path
  importmapMode: 'inline',     // Import map mode
  entryName: 'default',        // Rendering entry
  params: {
    url: req.url,
    state: { user: 'admin' }   // State data
  }
});
```

### COMMAND

- **Type**: `typeof COMMAND`
- **Read-only**: `true`

Gets the command enumeration type definition.

### moduleConfig

- **Type**: `ParsedModuleConfig`
- **Read-only**: `true`
- **Throws**: `NotReadyError` - When the framework is not initialized

Gets the complete configuration information of the current module, including module resolution rules and alias configurations.

### packConfig

- **Type**: `ParsedPackConfig`
- **Read-only**: `true`
- **Throws**: `NotReadyError` - When the framework is not initialized

Gets the packaging-related configuration of the current module, including output paths and package.json processing.

## Instance Methods

### constructor()

- **Parameters**: 
  - `options?: EsmxOptions` - Framework configuration options
- **Returns**: `Esmx`

Creates a Esmx framework instance.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- **Parameters**: `command: COMMAND`
- **Returns**: `Promise<boolean>`
- **Throws**:
  - `Error`: When re-initializing
  - `NotReadyError`: When accessing an uninitialized instance

Initializes the Esmx framework instance. Executes the following core initialization processes:

1. Parses project configuration (package.json, module configuration, pack configuration, etc.)
2. Creates the application instance (development or production environment)
3. Executes corresponding lifecycle methods based on the command

::: warning Note
- Throws an error when re-initializing
- Throws `NotReadyError` when accessing an uninitialized instance

:::

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});

await esmx.init(COMMAND.dev);
```

### destroy()

- **Returns**: `Promise<boolean>`

Destroys the Esmx framework instance, performing resource cleanup and connection closure. Mainly used for:
- Shutting down the development server
- Cleaning up temporary files and caches
- Releasing system resources

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **Returns**: `Promise<boolean>`

Executes the application build process, including:
- Compiling source code
- Generating production build artifacts
- Optimizing and minifying code
- Generating asset manifests

::: warning Note
Throws `NotReadyError` when called on an uninitialized framework instance
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
    // Generate static HTML after build
    const render = await esmx.render({
      params: { url: '/' }
    });
    esmx.writeSync(
      esmx.resolvePath('dist/client', 'index.html'),
      render.html
    );
  }
}
```

### server()

- **Returns**: `Promise<void>`
- **Throws**: `NotReadyError` - When the framework is not initialized

Starts the HTTP server and configures the server instance. Called during the following lifecycles:
- Development environment (dev): Starts the development server with hot reloading
- Production environment (start): Starts the production server with production-grade performance

```ts title="entry.node.ts"
export default {
  async server(esmx) {
    const server = http.createServer((req, res) => {
      // Handle static assets
      esmx.middleware(req, res, async () => {
        // Server-side rendering
        const render = await esmx.render({
          params: { url: req.url }
        });
        res.end(render.html);
      });
    });

    server.listen(3000, () => {
      console.log('Server running at http://localhost:3000');
    });
  }
}
```

### postBuild()

- **Returns**: `Promise<boolean>`

Executes post-build processing logic, useful for:
- Generating static HTML files
- Processing build artifacts
- Executing deployment tasks
- Sending build notifications

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    // Generate static HTML for multiple pages
    const pages = ['/', '/about', '/404'];

    for (const url of pages) {
      const render = await esmx.render({
        params: { url }
      });

      await esmx.write(
        esmx.resolvePath('dist/client', url.substring(1), 'index.html'),
        render.html
      );
    }
  }
}
```

### resolvePath

Resolves project paths, converting relative paths to absolute paths.

- **Parameters**:
  - `projectPath: ProjectPath` - Project path type
  - `...args: string[]` - Path segments
- **Returns**: `string` - Resolved absolute path

- **Example**:
```ts
// Resolve static asset path
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

Synchronously writes file content.

- **Parameters**:
  - `filepath`: `string` - Absolute path of the file
  - `data`: `any` - Data to write, can be a string, Buffer, or object
- **Returns**: `boolean` - Whether the write was successful

- **Example**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

Synchronously reads and parses a JSON file.

- **Parameters**:
  - `filename`: `string` - Absolute path of the JSON file

- **Returns**: `any` - Parsed JSON object
- **Throws**: Throws an exception when the file does not exist or the JSON format is invalid

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // Use the manifest object
}
```

### readJson()

Asynchronously reads and parses a JSON file.

- **Parameters**:
  - `filename`: `string` - Absolute path of the JSON file

- **Returns**: `Promise<any>` - Parsed JSON object
- **Throws**: Throws an exception when the file does not exist or the JSON format is invalid

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
  // Use the manifest object
}
```

### getManifestList()

Gets the build manifest list.

- **Parameters**:
  - `target`: `RuntimeTarget` - Target environment type
    - `'client'`: Client environment
    - `'server'`: Server environment

- **Returns**: `Promise<readonly ManifestJson[]>` - Read-only build manifest list
- **Throws**: Throws `NotReadyError` when the framework instance is not initialized

This method is used to get the build manifest list for the specified target environment, including the following functionalities:
1. **Cache Management**
   - Uses internal caching to avoid repeated loading
   - Returns immutable manifest lists

2. **Environment Adaptation**
   - Supports both client and server environments
   - Returns corresponding manifest information based on the target environment

3. **Module Mapping**
   - Includes module export information
   - Records resource dependencies

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  // Get client build manifest
  const manifests = await esmx.getManifestList('client');

  // Find build information for a specific module
  const appModule = manifests.find(m => m.name === 'my-app');
  if (appModule) {
    console.log('App exports:', appModule.exports);
    console.log('App chunks:', appModule.chunks);
  }
}
```

### getImportMap()

Gets the import map object.

- **Parameters**:
  - `target`: `RuntimeTarget` - Target environment type
    - `'client'`: Generates import maps for the browser environment
    - `'server'`: Generates import maps for the server environment

- **Returns**: `Promise<Readonly<ImportMap>>` - Read-only import map object
- **Throws**: Throws `NotReadyError` when the framework instance is not initialized

This method is used to generate ES module import maps (Import Map), with the following characteristics:
1. **Module Resolution**
   - Generates module mappings based on build manifests
   - Supports both client and server environments
   - Automatically handles module path resolution

2. **Cache Optimization**
   - Uses internal caching
   - Returns immutable mapping objects

3. **Path Handling**
   - Automatically handles module paths
   - Supports dynamic base paths

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  // Get client import map
  const importmap = await esmx.getImportMap('client');

  // Custom HTML template
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script type="importmap">
        ${JSON.stringify(importmap)}
      </script>
    </head>
    <body>
      <!-- Page content -->
    </body>
    </html>
  `;
}
```

### getImportMapClientInfo()

Gets client import map information.

- **Parameters**:
  - `mode`: `ImportmapMode` - Import map mode
    - `'inline'`: Inline mode, returns HTML script tag
    - `'js'`: JS file mode, returns information with file path

- **Returns**: 
  - JS file mode:
    ```ts
    {
      src: string;      // URL of the JS file
      filepath: string;  // Local path of the JS file
      code: string;      // HTML script tag content
    }
    ```
  - Inline mode:
    ```ts
    {
      src: null;
      filepath: null;
      code: string;      // HTML script tag content
    }
    ```

- **Throws**: Throws `NotReadyError` when the framework instance is not initialized

This method is used to generate import map code for the client environment, supporting two modes:
1. **Inline Mode (inline)**
   - Inlines the import map directly into the HTML
   - Reduces additional network requests
   - Suitable for scenarios with smaller import maps

2. **JS File Mode (js)**
   - Generates a standalone JS file
   - Supports browser caching
   - Suitable for scenarios with larger import maps

Core functionalities:
- Automatically handles dynamic base paths
- Supports runtime replacement of module paths
- Optimizes caching strategies
- Ensures module loading order

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const server = express();
  server.use(esmx.middleware);

  server.get('*', async (req, res) => {
    // Use JS file mode
    const result = await esmx.render({
      importmapMode: 'js',
      params: { url: req.url }
    });
    res.send(result.html);
  });

  // Or use inline mode
  server.get('/inline', async (req, res) => {
    const result = await esmx.render({
      importmapMode: 'inline',
      params
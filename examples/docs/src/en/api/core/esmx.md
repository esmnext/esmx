---
titleSuffix: Framework Core Class API Reference
description: Detailed documentation of the Esmx framework's core class APIs, including application lifecycle management, static asset handling, and server-side rendering capabilities, helping developers deeply understand the framework's core functionalities.
head:
  - - meta
    - property: keywords
      content: Esmx, API, Lifecycle Management, Static Assets, Server-Side Rendering, Rspack, Web Application Framework
---

# Esmx

## Introduction

Esmx is a high-performance web application framework based on Rspack, providing comprehensive application lifecycle management, static asset handling, and server-side rendering capabilities.

## Type Definitions

### BuildEnvironment

- **Type Definition**:
```ts
type BuildEnvironment = 'client' | 'server'
```

Application runtime environment types:
- `client`: Runs in browser environment, supports DOM operations and browser APIs
- `server`: Runs in Node.js environment, supports filesystem and server-side functionalities

### ImportMap

- **Type Definition**:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

ES Module import map type.

#### SpecifierMap

- **Type Definition**:
```ts
type SpecifierMap = Record<string, string>
```

Module specifier mapping type, used to define module import path mappings.

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
- `dev`: Development environment command, starts development server with hot reload
- `build`: Build command, generates production build artifacts
- `preview`: Preview command, launches local preview server
- `start`: Start command, runs production server

## Instance Options

Defines core configuration options for the Esmx framework.

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

Project root directory path. Can be absolute or relative path (resolved relative to current working directory).

#### isProd

- **Type**: `boolean`
- **Default**: `process.env.NODE_ENV === 'production'`

Environment flag:
- `true`: Production environment
- `false`: Development environment

#### basePathPlaceholder

- **Type**: `string | false`
- **Default**: `'[[[___ESMX_DYNAMIC_BASE___]]]'`

Base path placeholder configuration. Used for runtime dynamic replacement of asset base paths. Set to `false` to disable this feature.

#### modules

- **Type**: `ModuleConfig`

Module configuration options. Used to configure project module resolution rules, including module aliases, external dependencies, etc.

#### packs

- **Type**: `PackConfig`

Packaging configuration options. Used to package build artifacts into standard npm .tgz format packages.

#### devApp

- **Type**: `(esmx: Esmx) => Promise<App>`

Development environment application creation function. Only used in development environment to create application instances for development server.

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

Server startup configuration function. Used to configure and start HTTP server, available in both development and production environments.

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

Post-build processing function. Executed after project build completes, can be used for:
- Additional resource processing
- Deployment operations
- Generating static files
- Sending build notifications

## Instance Properties

### name

- **Type**: `string`
- **Read-only**: `true`

Current module name, derived from module configuration.

### varName

- **Type**: `string`
- **Read-only**: `true`

Valid JavaScript variable name generated from module name.

### root

- **Type**: `string`
- **Read-only**: `true`

Absolute path to project root directory. If configured `root` is relative path, resolved relative to current working directory.

### isProd

- **Type**: `boolean`
- **Read-only**: `true`

Determines whether current environment is production. Prioritizes `isProd` from configuration, otherwise uses `process.env.NODE_ENV`.

### basePath

- **Type**: `string`
- **Read-only**: `true`
- **Throws**: `NotReadyError` - When framework is not initialized

Gets module base path with leading and trailing slashes. Returns format `/${name}/`, where name comes from module configuration.

### basePathPlaceholder

- **Type**: `string`
- **Read-only**: `true`

Gets base path placeholder for runtime dynamic replacement. Can be disabled via configuration.

### middleware

- **Type**: `Middleware`
- **Read-only**: `true`

Gets static asset handling middleware. Provides different implementations based on environment:
- Development: Supports real-time compilation and hot reload
- Production: Supports long-term caching of static assets

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

Gets server-side rendering function. Provides different implementations based on environment:
- Development: Supports hot reload and real-time preview
- Production: Provides optimized rendering performance

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

Gets command enumeration type definition.

### moduleConfig

- **Type**: `ParsedModuleConfig`
- **Read-only**: `true`
- **Throws**: `NotReadyError` - When framework is not initialized

Gets complete configuration information for current module, including module resolution rules, alias configurations, etc.

### packConfig

- **Type**: `ParsedPackConfig`
- **Read-only**: `true`
- **Throws**: `NotReadyError` - When framework is not initialized

Gets packaging-related configuration for current module, including output paths, package.json processing, etc.

## Instance Methods

### constructor()

- **Parameters**: 
  - `options?: EsmxOptions` - Framework configuration options
- **Returns**: `Esmx`

Creates Esmx framework instance.

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
  - `Error`: When initializing repeatedly
  - `NotReadyError`: When accessing uninitialized instance

Initializes Esmx framework instance. Executes core initialization processes:

1. Resolves project configuration (package.json, module config, pack config, etc.)
2. Creates application instance (development or production environment)
3. Executes corresponding lifecycle methods based on command

::: warning Note
- Throws error when initializing repeatedly
- Throws `NotReadyError` when accessing uninitialized instance
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

Destroys Esmx framework instance, performs resource cleanup and connection closing. Mainly used for:
- Shutting down development server
- Cleaning temporary files and caches
- Releasing system resources

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- **Returns**: `Promise<boolean>`

Executes application build process, including:
- Compiling source code
- Generating production build artifacts
- Optimizing and minifying code
- Generating asset manifests

::: warning Note
Throws `NotReadyError` when called on uninitialized framework instance
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
- **Throws**: `NotReadyError` - When framework is not initialized

Starts HTTP server and configures server instance. Called during following lifecycles:
- Development (dev): Starts development server with hot reload
- Production (start): Starts production server with production-grade performance

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

Executes post-build processing logic, used for:
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

Resolves project path, converts relative paths to absolute paths.

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
  - `filepath`: `string` - Absolute file path
  - `data`: `any` - Data to write, can be string, Buffer or object
- **Returns**: `boolean` - Whether write succeeded

- **Example**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = await esmx.write(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

Synchronously reads and parses JSON file.

- **Parameters**:
  - `filename`: `string` - Absolute path to JSON file

- **Returns**: `any` - Parsed JSON object
- **Exceptions**: Throws when file doesn't exist or JSON is malformed

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
  // Use manifest object
}
```

### readJson()

Asynchronously reads and parses JSON file.

- **Parameters**:
  - `filename`: `string` - Absolute path to JSON file

- **Returns**: `Promise<any>` - Parsed JSON object
- **Exceptions**: Throws when file doesn't exist or JSON is malformed

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
  // Use manifest object
}
```

### getManifestList()

Gets build manifest list.

- **Parameters**:
  - `target`: `BuildEnvironment` - Target environment type
    - `'client'`: Client environment
    - `'server'`: Server environment

- **Returns**: `Promise<readonly ManifestJson[]>` - Read-only build manifest list
- **Exceptions**: Throws `NotReadyError` when framework instance is not initialized

This method retrieves build manifest list for specified target environment, with following features:
1. **Cache Management**
   - Uses internal caching mechanism to avoid repeated loading
   - Returns immutable manifest list

2. **Environment Adaptation**
   - Supports both client and server environments
   - Returns corresponding manifest information based on target environment

3. **Module Mapping**
   - Contains module export information
   - Records asset dependencies

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  // Get client build manifest
  const manifests = await esmx.getManifestList('client');

  // Find build information for specific module
  const appModule = manifests.find(m => m.name === 'my-app');
  if (appModule) {
    console.log('App exports:', appModule.exports);
    console.log('App chunks:', appModule.chunks);
  }
}
```

### getImportMap()

Gets import map object.

- **Parameters**:
  - `target`: `BuildEnvironment` - Target environment type
    - `'client'`: Generates browser environment import map
    - `'server'`: Generates server environment import map

- **Returns**: `Promise<Readonly<ImportMap>>` - Read-only import map object
- **Exceptions**: Throws `NotReadyError` when framework instance is not initialized

This method generates ES Module import maps (Import Map), with following characteristics:
1. **Module Resolution**
   - Generates module mappings based on build manifest
   - Supports both client and server environments
   - Automatically handles module path resolution

2. **Cache Optimization**
   - Uses internal caching mechanism
   - Returns immutable mapping object

3. **Path Handling**
   - Automatically processes module paths
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
      src: string;      // JS file URL
      filepath: string;  // JS file local path
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

- **Exceptions**: Throws `NotReadyError` when framework instance is not initialized

This method generates client environment import map code, supporting two modes:
1. **Inline Mode (inline)**
   - Inlines import map directly into HTML
   - Reduces additional network requests
   - Suitable for smaller import maps

2. **JS File Mode (js)**
   - Generates standalone JS file
   - Supports browser caching
   - Suitable for larger import maps

Core features:
- Automatically handles dynamic base paths
- Supports runtime module path replacement
- Optimizes caching strategy
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
      params: { url: req.url }
    });
    res.send(result.html);
  });
}
```

### getStaticImportPaths()

Gets module's static import path list.

- **Parameters**:
  - `target`: `BuildEnvironment` - Build target
    - `'client'`: Client environment
    - `'server'`: Server environment
  - `specifier`: `string` - Module specifier

- **Returns**: `Promise<readonly string[] | null>` - Returns static import path list, returns null if not found
- **Exceptions**: Throws `NotReadyError` when framework instance is not initialized

- **Example**:
```ts
// Get static import paths for client entry module
const paths = await esmx.getStaticImportPaths(
  'client',
  `your-app-name/src/entry.client`
);
```
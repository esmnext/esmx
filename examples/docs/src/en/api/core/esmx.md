---
titleSuffix: "Framework Core Class API Reference"
description: "Detailed introduction to Esmx framework's core class API, including application lifecycle management, static resource handling, and Server-Side Rendering capabilities, helping developers deeply understand the framework's core functionality."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, API, lifecycle management, static resources, Server-Side Rendering, Rspack, Web application framework"
---

# Esmx

## Introduction

Esmx is a high-performance web application framework based on Rspack, providing complete application lifecycle management, static resource handling, and Server-Side Rendering capabilities.

## Type Definitions

### BuildEnvironment

- **Type Definition**:
```ts
type BuildEnvironment = 'client' | 'server'
```

Application runtime environment types:
- `client`: Runs in the browser environment, supporting DOM operations and browser APIs
- `server`: Runs in the Node.js environment, supporting file system and server-side functionality

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
- `dev`: Development environment command, starts the development server with hot reload support
- `build`: Build command, generates production build artifacts
- `preview`: Preview command, starts a local preview server
- `start`: Start command, runs the production environment server

## Instance Options

Defines the core configuration options of the Esmx framework.

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

Project root directory path. Can be an absolute or relative path; relative paths are resolved based on the current working directory.

#### isProd

- **Type**: `boolean`
- **Default**: `process.env.NODE_ENV === 'production'`

Environment identifier.
- `true`: Production environment
- `false`: Development environment

#### basePathPlaceholder

- **Type**: `string | false`
- **Default**: `'[[[___ESMX_DYNAMIC_BASE___]]]'`

Base path placeholder configuration. Used for runtime dynamic replacement of resource base paths. Set to `false` to disable this feature.

#### modules

- **Type**: `ModuleConfig`

Module configuration options. Used to configure project module resolution rules, including module aliases, external dependencies, etc.

#### packs

- **Type**: `PackConfig`

Packaging configuration options. Used to package build artifacts into standard npm .tgz format packages.

#### devApp

- **Type**: `(esmx: Esmx) => Promise<App>`

Development environment application creation function. Only used in the development environment to create development server application instances.

```ts title="entry.node.ts"
export default {
  async devApp(esmx) {
    return import('@esmx/rspack').then((m) =>
      m.createRspackHtmlApp(esmx, {
        config(context) {}
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

Post-build processing function. Executed after project build completion, can be used for:
- Executing additional resource processing
- Deployment operations
- Generating static files
- Sending build notifications

## Instance Properties

### name

- **Type**: `string`
- **Read-only**: `true`

Current module name, sourced from the module configuration.

### varName

- **Type**: `string`
- **Read-only**: `true`

Legal JavaScript variable name generated based on the module name.

### root

- **Type**: `string`
- **Read-only**: `true`

Absolute path of the project root directory. If the configured `root` is a relative path, it's resolved based on the current working directory.

### isProd

- **Type**: `boolean`
- **Read-only**: `true`

Determines if the current environment is production. Prioritizes `isProd` from the configuration; if not configured, determines based on `process.env.NODE_ENV`.

### basePath

- **Type**: `string`
- **Read-only**: `true`
- **Throws**: `NotReadyError` - When framework is not initialized

Gets the module base path starting and ending with slashes. Returns format `/${name}/`, where name comes from the module configuration.

### basePathPlaceholder

- **Type**: `string`
- **Read-only**: `true`

Gets the base path placeholder for runtime dynamic replacement. Can be disabled through configuration.

### middleware

- **Type**: `Middleware`
- **Read-only**: `true`

Gets the static resource handling middleware. Provides different implementations based on the environment:
- Development environment: Supports source code real-time compilation and hot reloading
- Production environment: Supports long-term caching of static resources

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

Gets the Server-Side Rendering function. Provides different implementations based on the environment:
- Development environment: Supports hot reloading and real-time preview
- Production environment: Provides optimized rendering performance

```ts
const rc = await esmx.render({
  params: { url: req.url }
});

const rc = await esmx.render({
  base: '',
  importmapMode: 'inline',
  entryName: 'default',
  params: {
    url: req.url,
    state: { user: 'admin' }
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
- **Throws**: `NotReadyError` - When framework is not initialized

Gets complete configuration information of the current module, including module resolution rules, alias configuration, etc.

### packConfig

- **Type**: `ParsedPackConfig`
- **Read-only**: `true`
- **Throws**: `NotReadyError` - When framework is not initialized

Gets packaging-related configuration of the current module, including output paths, package.json processing, etc.

## Instance Methods

### constructor()

- **Parameters**: 
  - `options?: EsmxOptions` - Framework configuration options
- **Returns**: `Esmx`

Create Esmx framework instance.

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
  - `Error`: When initialized repeatedly
  - `NotReadyError`: When accessing uninitialized instance

Initializes the Esmx framework instance. Executes the following core initialization process:

1. Parse project configuration (package.json, module configuration, packaging configuration, etc.)
2. Create application instance (development environment or production environment)
3. Execute corresponding lifecycle methods based on command

::: warning Note
- Throws an error when initialized repeatedly
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

Destroys the Esmx framework instance, executing resource cleanup and connection closing operations. Mainly used for:
- Closing the development server
- Cleaning temporary files and cache
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
- Generating production environment build artifacts
- Optimizing and compressing code
- Generating resource manifest

::: warning Note
Throws `NotReadyError` when called on uninitialized framework instance
:::

```ts title="entry.node.ts"
export default {
  async postBuild(esmx) {
    await esmx.build();
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

Starts the HTTP server and configures the server instance. Called in the following lifecycles:
- Development environment (dev): Starts the development server, provides hot reloading
- Production environment (start): Starts the production server, provides production-level performance

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
  - `...args: string[]` - Path fragments
- **Returns**: `string` - Resolved absolute path

- **Example**:
```ts
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

Synchronously writes file content.

- **Parameters**:
  - `filepath`: `string` - Absolute path of file
  - `data`: `any` - Data to write, can be string, Buffer, or object
- **Returns**: `boolean` - Whether write was successful

- **Example**:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = esmx.writeSync(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

Synchronously reads and parses JSON files.

- **Parameters**:
  - `filename`: `string` - Absolute path of JSON file

- **Returns**: `any` - Parsed JSON object
- **Exception**: Throws exception when file doesn't exist or JSON format is invalid

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
}
```

### readJson()

Asynchronously reads and parses JSON files.

- **Parameters**:
  - `filename`: `string` - Absolute path of JSON file

- **Returns**: `Promise<any>` - Parsed JSON object
- **Exception**: Throws exception when file doesn't exist or JSON format is invalid

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
}
```

### getManifestList()

Get build manifest list.

- **Parameters**:
  - `target`: `BuildEnvironment` - Target environment type
    - `'client'`: Client environment
    - `'server'`: Server environment

- **Returns**: `Promise<readonly ManifestJson[]>` - Read-only build manifest list
- **Exception**: Throws `NotReadyError` when framework instance is not initialized

This method gets build manifest list for specified target environment, includes following features:
1. **Cache Management**
   - Uses internal cache mechanism to avoid repeated loading
   - Returns immutable manifest list

2. **Environment Adaptation**
   - Supports both client and server environments
   - Returns corresponding manifest information based on target environment

3. **Module Mapping**
   - Contains module export information
   - Records resource dependency relationships

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifests = await esmx.getManifestList('client');

  const appModule = manifests.find(m => m.name === 'my-app');
  if (appModule) {
    console.log('App exports:', appModule.exports);
    console.log('App chunks:', appModule.chunks);
  }
}
```

### getImportMap()

Get import mapping object.

- **Parameters**:
  - `target`: `BuildEnvironment` - Target environment type
    - `'client'`: Generate import map for browser environment
    - `'server'`: Generate import map for server environment

- **Returns**: `Promise<Readonly<ImportMap>>` - Read-only import mapping object
- **Exception**: Throws `NotReadyError` when framework instance is not initialized

This method generates ES module import maps (Import Maps), with the following characteristics:
1. **Module Resolution**
   - Generates module mappings based on build manifests
   - Supports both client and server environments
   - Automatically handles module path resolution

2. **Cache Optimization**
   - Uses an internal cache mechanism
   - Returns an immutable mapping object

3. **Path Handling**
   - Automatically handles module paths
   - Supports dynamic base paths

- **Example**:
```ts title="src/entry.node.ts"
async server(esmx) {
  const importmap = await esmx.getImportMap('client');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <script type="importmap">
        ${JSON.stringify(importmap)}
      </script>
    </head>
    <body>
    </body>
    </html>
  `;
}
```

### getImportMapClientInfo()

Get client import map information.

- **Parameters**:
  - `mode`: `ImportmapMode` - Import map mode
    - `'inline'`: Inline mode, returns HTML script tag
    - `'js'`: JS file mode, returns information with file path

- **Returns**: 
  - JS file mode:
    ```ts
    {
      src: string;
      filepath: string;
      code: string;
    }
    ```
  - Inline mode:
    ```ts
    {
      src: null;
      filepath: null;
      code: string;
    }
    ```

- **Exception**: Throws `NotReadyError` when framework instance is not initialized

This method generates import map code for the client environment, supporting two modes:
1. **Inline Mode (inline)**
   - Embeds the import map directly into HTML
   - Reduces additional network requests
   - Suitable for scenarios with small import maps

2. **JS File Mode (js)**
   - Generates an independent JS file
   - Supports browser caching
   - Suitable for scenarios with large import maps

Core features:
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
    const result = await esmx.render({
      importmapMode: 'js',
      params: { url: req.url }
    });
    res.send(result.html);
  });

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

Gets the module's static import path list.

- **Parameters**:
  - `target`: `BuildEnvironment` - Build target
    - `'client'`: Client environment
    - `'server'`: Server environment
  - `specifier`: `string` - Module specifier

- **Returns**: `Promise<readonly string[] | null>` - Returns static import path list, returns null if not found
- **Exception**: Throws `NotReadyError` when framework instance is not initialized

- **Example**:
```ts
const paths = await esmx.getStaticImportPaths(
  'client',
  `your-app-name/src/entry.client`
);

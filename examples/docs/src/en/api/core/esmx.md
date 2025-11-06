---
titleSuffix: "Framework Core Class API Reference"
description: "Detailed introduction to the Esmx framework’s core class API, including application lifecycle management, static asset handling, and server-side rendering capabilities, helping developers understand the core features."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, API, lifecycle management, static assets, server-side rendering, Rspack, Web application framework"
---

# Esmx

## Introduction

Esmx is a high-performance web application framework built on Rspack. It provides complete application lifecycle management, static asset handling, and server-side rendering capabilities.

## Type Definitions

### BuildEnvironment

- Type:
```ts
type BuildEnvironment = 'client' | 'server'
```

Runtime environment type:
- `client`: runs in the browser, supports DOM operations and browser APIs
- `server`: runs in Node.js, supports file system and server-side features

### ImportMap

- Type:
```ts
type ImportMap = {
  imports?: SpecifierMap
  scopes?: ScopesMap
}
```

ES module import map type.

#### SpecifierMap

- Type:
```ts
type SpecifierMap = Record<string, string>
```

Module specifier mapping type that defines import path mappings.

#### ScopesMap

- Type:
```ts
type ScopesMap = Record<string, SpecifierMap>
```

Scope mapping type that defines module import mappings under specific scopes.

### COMMAND

- Type:
```ts
enum COMMAND {
    dev = 'dev',
    build = 'build',
    preview = 'preview',
    start = 'start'
}
```

Command type enum:
- `dev`: development command, starts the dev server with HMR
- `build`: build command, produces production build outputs
- `preview`: preview command, starts a local preview server
- `start`: start command, runs the production server

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

- Type: `string`
- Default: `process.cwd()`

Project root directory path. Can be absolute or relative; relative paths are resolved against the current working directory.

#### isProd

- Type: `boolean`
- Default: `process.env.NODE_ENV === 'production'`

Environment flag.
- `true`: production environment
- `false`: development environment

#### basePathPlaceholder

- Type: `string | false`
- Default: `'[[[___ESMX_DYNAMIC_BASE___]]]'`

Base path placeholder configuration. Used to dynamically replace the base path for assets at runtime. Set to `false` to disable.

#### modules

- Type: `ModuleConfig`

Module configuration options. Configure module resolution rules such as aliases and external dependencies.

#### packs

- Type: `PackConfig`

Packaging configuration options. Packages build outputs into standard npm `.tgz` packages.

#### devApp

- Type: `(esmx: Esmx) => Promise<App>`

Development environment app creation function. Used only in development to create the dev server app instance.

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

- Type: `(esmx: Esmx) => Promise<void>`

Server startup configuration function. Configures and starts an HTTP server, usable in both development and production.

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

- Type: `(esmx: Esmx) => Promise<void>`

Post-build handler executed after the project build completes. Useful for:
- extra asset processing
- deployment operations
- generating static files
- sending build notifications

## Instance Properties

### name

- Type: `string`
- Readonly: `true`

Current module name from the module configuration.

### varName

- Type: `string`
- Readonly: `true`

Valid JavaScript variable name derived from the module name.

### root

- Type: `string`
- Readonly: `true`

Absolute path to the project root. If `root` is relative, it is resolved from the current working directory.

### isProd

- Type: `boolean`
- Readonly: `true`

Indicates whether the current environment is production. Prefers the `isProd` option; otherwise derives from `process.env.NODE_ENV`.

### basePath

- Type: `string`
- Readonly: `true`
- Throws: `NotReadyError` when the framework is not initialized

Returns the module base path that begins and ends with a slash. The format is `/${name}/` where `name` comes from the module configuration.

### basePathPlaceholder

- Type: `string`
- Readonly: `true`

Returns the base path placeholder used for runtime replacement. Can be disabled via configuration.

### middleware

- Type: `Middleware`
- Readonly: `true`

Returns the static asset handling middleware. Provides different implementations for each environment:
- development: supports source compilation and HMR
- production: supports long-term caching of static assets

```ts
const server = http.createServer((req, res) => {
  esmx.middleware(req, res, async () => {
    const rc = await esmx.render({ url: req.url });
    res.end(rc.html);
  });
});
```

### render

- Type: `(options?: RenderContextOptions) => Promise<RenderContext>`
- Readonly: `true`

Returns the server-side rendering function. Environment-specific behaviors:
- development: supports HMR and live preview
- production: optimized rendering performance

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

- Type: `typeof COMMAND`
- Readonly: `true`

Provides the command enum type definition.

### moduleConfig

- Type: `ParsedModuleConfig`
- Readonly: `true`
- Throws: `NotReadyError` when the framework is not initialized

Returns the full module configuration, including resolution rules and alias settings.

### packConfig

- Type: `ParsedPackConfig`
- Readonly: `true`
- Throws: `NotReadyError` when the framework is not initialized

Returns the packaging-related configuration, including output paths and `package.json` processing.

## Instance Methods

### constructor()

- Parameters:
  - `options?: EsmxOptions` – framework configuration options
- Returns: `Esmx`

Creates an Esmx framework instance.

```ts
const esmx = new Esmx({
  root: './src',
  isProd: process.env.NODE_ENV === 'production'
});
```

### init()

- Parameters: `command: COMMAND`
- Returns: `Promise<boolean>`
- Throws:
  - `Error`: when initialized repeatedly
  - `NotReadyError`: when accessing an uninitialized instance

Initializes the Esmx framework instance. Performs the following core steps:

1. Parse project configuration (`package.json`, module config, pack config)
2. Create the app instance (development or production)
3. Execute lifecycle functions according to the command

::: warning Note
- Throws an error on repeated initialization
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

- Returns: `Promise<boolean>`

Destroys the Esmx framework instance, performing resource cleanup and connection shutdown. Commonly used for:
- closing the dev server
- cleaning temporary files and caches
- releasing system resources

```ts
process.once('SIGTERM', async () => {
  await esmx.destroy();
  process.exit(0);
});
```

### build()

- Returns: `Promise<boolean>`

Executes the application build process, including:
- compiling source code
- producing production build outputs
- optimizing and minifying code
- generating resource manifests

::: warning Note
Throws `NotReadyError` if called before the framework is initialized.
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

- Returns: `Promise<void>`
- Throws: `NotReadyError` when the framework is not initialized

Starts the HTTP server and configures the server instance. Invoked in these lifecycles:
- development (`dev`): starts the dev server with HMR
- production (`start`): starts the production server with production-grade performance

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

- Returns: `Promise<boolean>`

Executes post-build logic, useful for:
- generating static HTML files
- processing build outputs
- running deployment tasks
- sending build notifications

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

Resolves project paths, converting relative paths to absolute ones.

- Parameters:
  - `projectPath: ProjectPath` – project path type
  - `...args: string[]` – path segments
- Returns: `string` – resolved absolute path

- Example:
```ts
const htmlPath = esmx.resolvePath('dist/client', 'index.html');
```

### writeSync()

Synchronously writes file contents.

- Parameters:
  - `filepath`: `string` – absolute file path
  - `data`: `any` – data to write, string, Buffer, or object
- Returns: `boolean` – whether the write succeeded

- Example:
```ts title="src/entry.node.ts"

async postBuild(esmx) {
  const htmlPath = esmx.resolvePath('dist/client', 'index.html');
  const success = esmx.writeSync(htmlPath, '<html>...</html>');
}
```

### readJsonSync()

Synchronously reads and parses a JSON file.

- Parameters:
  - `filename`: `string` – absolute path to the JSON file

- Returns: `any` – parsed JSON object
- Exceptions: throws when the file does not exist or JSON is invalid

- Example:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = esmx.readJsonSync(esmx.resolvePath('dist/client', 'manifest.json'));
}
```

### readJson()

Asynchronously reads and parses a JSON file.

- Parameters:
  - `filename`: `string` – absolute path to the JSON file

- Returns: `Promise<any>` – parsed JSON object
- Exceptions: throws when the file does not exist or JSON is invalid

- Example:
```ts title="src/entry.node.ts"
async server(esmx) {
  const manifest = await esmx.readJson(esmx.resolvePath('dist/client', 'manifest.json'));
}
```

### getManifestList()

Retrieves the build manifest list.

- Parameters:
  - `target`: `BuildEnvironment` – target environment
    - `'client'`: client environment
    - `'server'`: server environment

- Returns: `Promise<readonly ManifestJson[]>` – read-only build manifest list
- Exceptions: throws `NotReadyError` when the framework is not initialized

Features:
1. Caching
   - uses internal caching to avoid duplicate loads
   - returns immutable manifest lists
2. Environment adaptation
   - supports both client and server environments
   - returns environment-specific manifest information
3. Module mapping
   - includes module export information
   - records resource dependency relations

- Example:
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

Retrieves the import map object.

- Parameters:
  - `target`: `BuildEnvironment` – target environment
    - `'client'`: generates an import map for the browser environment
    - `'server'`: generates an import map for the server environment

- Returns: `Promise<Readonly<ImportMap>>` – read-only import map
- Exceptions: throws `NotReadyError` when the framework is not initialized

Features:
1. Module resolution
   - generates module mappings from build manifests
   - supports both client and server environments
   - automatically resolves module paths
2. Cache optimization
   - uses internal caching
   - returns immutable map objects
3. Path handling
   - automatically processes module paths
   - supports dynamic base paths

- Example:
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

Retrieves client-side import map information.

- Parameters:
  - `mode`: `ImportmapMode` – import map mode
    - `'inline'`: inline mode, returns HTML script tag code
    - `'js'`: JS file mode, returns file path info

- Returns:
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

- Exceptions: throws `NotReadyError` when the framework is not initialized

Supports two modes for generating client import map code:
1. Inline mode
   - inlines the import map directly into HTML
   - reduces extra network requests
   - suitable when the import map is small
2. JS file mode
   - generates a standalone JS file
   - benefits from browser caching
   - suitable when the import map is large

Core features:
- handles dynamic base paths
- supports runtime replacement of module paths
- optimizes caching strategies
- ensures module load order

- Example:
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

Retrieves the list of static import paths for a module.

- Parameters:
  - `target`: `BuildEnvironment` – build target
    - `'client'`: client environment
    - `'server'`: server environment
  - `specifier`: `string` – module specifier

- Returns: `Promise<readonly string[] | null>` – static import paths, or `null` if not found
- Exceptions: throws `NotReadyError` when the framework is not initialized

- Example:
```ts
const paths = await esmx.getStaticImportPaths(
  'client',
  `your-app-name/src/entry.client`
);
```

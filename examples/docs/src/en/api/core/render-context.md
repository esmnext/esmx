---
titleSuffix: "Esmx Framework RenderContext API Reference"
description: "Detailed introduction to Esmx framework's RenderContext core class, including rendering control, resource management, state synchronization, and routing control, helping developers implement efficient Server-Side Rendering."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, RenderContext, SSR, Server-Side Rendering, rendering context, state synchronization, resource management, Web application framework"
---

# RenderContext

RenderContext is a core class in the Esmx framework, responsible for managing the complete lifecycle of Server-Side Rendering (SSR). It provides a comprehensive API to handle rendering contexts, resource management, state synchronization, and other key tasks:

- **Rendering Control**: Manages the Server-Side Rendering flow, supporting multi-entry rendering, conditional rendering, and other scenarios
- **Resource Management**: Intelligently collects and injects JS, CSS, and other static resources, optimizing loading performance
- **State Synchronization**: Handles server-side state serialization, ensuring proper client-side hydration
- **Routing Control**: Supports advanced features like server-side redirects and status code setting

## Type Definitions

### ServerRenderHandle

Type definition for Server-Side Rendering handler function.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void>;
```

The Server-Side Rendering handler function is an async or sync function that receives a RenderContext instance as a parameter, used to handle Server-Side Rendering logic.

```ts title="entry.node.ts"
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

export const simple = async (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

Type definition for resource file list collected during rendering process.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- **js**: JavaScript file list
- **css**: Stylesheet file list
- **modulepreload**: ESM module list that needs preloading
- **resources**: Other resource file list (images, fonts, etc.)

```ts
rc.files = {
  js: [
    '/assets/entry-client.js',
    '/assets/vendor.js'
  ],
  css: [
    '/assets/main.css',
    '/assets/vendor.css'
  ],
  modulepreload: [
    '/assets/Home.js',
    '/assets/About.js'
  ],
  resources: [
    '/assets/logo.png',
    '/assets/font.woff2'
  ]
};
```

### ImportmapMode

Defines the generation mode for importmap.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Embeds importmap content directly into HTML, suitable for:
  - Reducing HTTP request count
  - Small importmap content
  - High requirements for first-screen loading performance
- `js`: Generates importmap content as an independent JS file, suitable for:
  - Large importmap content
  - Utilizing browser caching mechanisms
  - Multiple pages sharing the same importmap

Rendering context class, responsible for resource management and HTML generation in the Server-Side Rendering (SSR) process.
## Instance Options

Defines configuration options for rendering context.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- **Type**: `string`
- **Default**: `''`

Base path for static resources.
- All static resources (JS, CSS, images, etc.) will be loaded based on this path
- Supports runtime dynamic configuration without rebuilding
- Commonly used in multi-language sites, micro-frontend applications, and other scenarios

#### entryName

- **Type**: `string`
- **Default**: `'default'`

Server-Side Rendering entry function name. Used to specify the entry function for Server-Side Rendering, utilized when a module exports multiple rendering functions.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
};

export const desktop = async (rc: RenderContext) => {
};
```

#### params

- **Type**: `Record<string, any>`
- **Default**: `{}`

Rendering parameters. Can pass parameters of any type to the rendering function, commonly used to pass request information (URL, query parameters, etc.).

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN',
    theme: 'dark'
  }
});
```

#### importmapMode

- **Type**: `'inline' | 'js'`
- **Default**: `'inline'`

Import map generation mode:
- `inline`: Embeds importmap content directly into HTML
- `js`: Generates importmap content as independent JS file


## Instance Properties

### esmx

- **Type**: `Esmx`
- **Read-only**: `true`

Reference to the Esmx instance. Used to access framework core functionality and configuration information.

### redirect

- **Type**: `string | null`
- **Default**: `null`

Redirect address. When set, the server can perform HTTP redirects based on this value, commonly used in login verification, permission control, and other scenarios.

```ts title="entry.node.ts"
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
};

export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
};
```

### status

- **Type**: `number | null`
- **Default**: `null`

HTTP response status code. Can set any valid HTTP status code, commonly used in error handling, redirects, and other scenarios.

```ts title="entry.node.ts"
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    return;
  }
};

export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307;
    return;
  }
};
```

### html

- **Type**: `string`
- **Default**: `''`

HTML content. Used to set and get the final generated HTML content, automatically handling base path placeholders when setting.

```ts title="entry.node.ts"
export default async (rc: RenderContext) => {
  rc.html = `
    <!DOCTYPE html>
    <html>
      <head>
        ${rc.preload()}
        ${rc.css()}
      </head>
      <body>
        <div id="app">Hello World</div>
        ${rc.importmap()}
        ${rc.moduleEntry()}
        ${rc.modulePreload()}
      </body>
    </html>
  `;
};

const rc = await esmx.render({
  base: '/app',
  params: { url: req.url }
});

```

### base

- **Type**: `string`
- **Read-only**: `true`
- **Default**: `''`

Base path for static resources. All static resources (JS, CSS, images, etc.) will be loaded based on this path, supporting runtime dynamic configuration.

```ts
const rc = await esmx.render({
  base: '/esmx',
  params: { url: req.url }
});

const rc = await esmx.render({
  base: '/cn',
  params: { lang: 'zh-CN' }
});

const rc = await esmx.render({
  base: '/app1',
  params: { appId: 1 }
});
```

### entryName

- **Type**: `string`
- **Read-only**: `true`
- **Default**: `'default'`

Server-Side Rendering entry function name. Used to select which rendering function to use from entry.server.ts.

```ts title="src/entry.node.ts"
export default async (rc: RenderContext) => {
};

export const mobile = async (rc: RenderContext) => {
};

export const desktop = async (rc: RenderContext) => {
};

const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Type**: `Record<string, any>`
- **Read-only**: `true`
- **Default**: `{}`

Rendering parameters. Can pass and access parameters during the Server-Side Rendering process, commonly used to pass request information, page configuration, etc.

```ts
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Type**: `Set<ImportMeta>`

Module dependency collection set. Automatically tracks and records module dependencies during component rendering, only collecting resources actually used in the current page rendering.

```ts
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  return '<div id="app">Hello World</div>';
};

const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Type**: `RenderFiles`

Resource file list:
- js: JavaScript file list
- css: Stylesheet file list
- modulepreload: ESM module list that needs preloading
- resources: Other resource file list (images, fonts, etc.)

```ts
await rc.commit();

rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### importmapMode

- **Type**: `'inline' | 'js'`
- **Default**: `'inline'`

Import map generation mode:
- `inline`: Embeds importmap content directly into HTML
- `js`: Generates importmap content as an independent JS file


## Instance Methods

### serialize()

- **Parameters**: 
  - `input: any` - Data to serialize
  - `options?: serialize.SerializeJSOptions` - Serialization options
- **Returns**: `string`

Serializes a JavaScript object to string. Used to serialize state data during Server-Side Rendering, ensuring data can be safely embedded into HTML.

```ts
const state = {
  user: { id: 1, name: 'Alice' },
  timestamp: new Date()
};

rc.html = `
  <script>
    window.__INITIAL_STATE__ = ${rc.serialize(state)};
  </script>
`;
```

### state()

- **Parameters**: 
  - `varName: string` - Variable name
  - `data: Record<string, any>` - State data
- **Returns**: `string`

Serializes state data and injects it into HTML. Uses a safe serialization method to handle data, supporting complex data structures.

```ts
const userInfo = {
  id: 1,
  name: 'John',
  roles: ['admin']
};

rc.html = `
  <head>
    ${rc.state('__USER__', userInfo)}
  </head>
`;
```

### commit()

- **Returns**: `Promise<void>`

Commits dependency collection and updates the resource list. Collects all used modules from importMetaSet, resolving specific resources for each module based on manifest files.

```ts
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

await rc.commit();
```

### preload()

- **Returns**: `string`

Generates resource preload tags. Used to preload CSS and JavaScript resources, supports priority configuration, and automatically handles base paths.

```ts
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    ${rc.preload()}
    ${rc.css()}
  </head>
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
  </html>
`;
```

### css()

- **Returns**: `string`

Generates CSS stylesheet tags. Injects collected CSS files, ensuring stylesheets load in the correct order.

```ts
rc.html = `
  <head>
    ${rc.css()}
  </head>
`;
```

### importmap()

- **Returns**: `string`

Generates import map tags. Generates inline or external import maps based on the importmapMode configuration.

```ts
rc.html = `
  <head>
    ${rc.importmap()}
  </head>
`;
```

### moduleEntry()

- **Returns**: `string`

Generates client entry module tags. Injects the client entry module, must be executed after importmap.

```ts
rc.html = `
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
  </body>
`;
```

### modulePreload()

- **Returns**: `string`

Generates module preload tags. Preloads collected ESM modules, optimizing first-screen loading performance.

```ts
rc.html = `
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
`;

---
titleSuffix: "Esmx Framework Render Context API Reference"
description: "Detailed introduction to Esmx’s RenderContext core class, including rendering control, resource management, state synchronization, and routing control, helping developers implement efficient server-side rendering."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, RenderContext, SSR, server-side rendering, render context, state synchronization, resource management, Web application framework"
---

# RenderContext

RenderContext is a core class in the Esmx framework, responsible for managing the full lifecycle of server-side rendering (SSR). It provides a complete API to handle rendering context, resource management, state synchronization, and more:

- Rendering control: manages SSR flows, supports multi-entry and conditional rendering
- Resource management: intelligently collects and injects static resources like JS and CSS to optimize load performance
- State synchronization: serializes server-side state to ensure correct client hydration
- Routing control: supports server-side redirects and status code settings

## Type Definitions

### ServerRenderHandle

Type definition for a server-side rendering handler.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void>;
```

The server rendering handler is an async or sync function that receives a RenderContext instance to perform SSR logic.

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

Type definition for the list of resource files collected during rendering.

```ts
interface RenderFiles {
  js: string[];
  css: string[];
  modulepreload: string[];
  resources: string[];
}
```

- js: JavaScript file list
- css: stylesheet file list
- modulepreload: ESM modules to preload
- resources: other asset files (images, fonts, etc.)

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

Defines the generation mode of the import map.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: inline the import map directly into HTML, suitable when:
  - reducing HTTP requests is desired
  - the import map is small
  - first-screen performance is critical
- `js`: generate the import map as a separate JS file, suitable when:
  - the import map is large
  - leveraging browser cache is preferred
  - multiple pages share the same import map

Rendering context class, responsible for resource management and HTML generation during SSR.

## Instance Options

Defines configuration options for the rendering context.

```ts
interface RenderContextOptions {
  base?: string
  entryName?: string
  params?: Record<string, any>
  importmapMode?: ImportmapMode
}
```

#### base

- Type: `string`
- Default: `''`

Base path for static assets.
- all static resources (JS, CSS, images, etc.) load relative to this path
- supports runtime dynamic configuration without rebuilding
- commonly used in multilingual sites and micro-frontend applications

#### entryName

- Type: `string`
- Default: `'default'`

Server-side render entry function name. Used when a module exports multiple rendering functions.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
};

export const desktop = async (rc: RenderContext) => {
};
```

#### params

- Type: `Record<string, any>`
- Default: `{}`

Rendering parameters. Arbitrary data can be passed to the rendering function, commonly request info such as URL and query.

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

- Type: `'inline' | 'js'`
- Default: `'inline'`

Import map generation mode:
- `inline`: inline the import map into HTML
- `js`: generate as a separate JS file

## Instance Properties

### esmx

- Type: `Esmx`
- Readonly: `true`

Reference to the Esmx instance. Provides access to core framework features and configuration.

### redirect

- Type: `string | null`
- Default: `null`

Redirect location. When set, the server can perform an HTTP redirect. Common in login checks and access control.

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

- Type: `number | null`
- Default: `null`

HTTP response status code. Set any valid HTTP status code, commonly for errors and redirects.

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

- Type: `string`
- Default: `''`

HTML content. Sets and retrieves the final generated HTML. When setting, the base path placeholder is handled automatically.

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

- Type: `string`
- Readonly: `true`
- Default: `''`

Base path for static assets. All static resources (JS, CSS, images, etc.) load based on this path and can be configured at runtime.

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

- Type: `string`
- Readonly: `true`
- Default: `'default'`

Server-side render entry function name. Selects which function in `entry.server.ts` to use.

```ts title="entry.node.ts"
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

- Type: `Record<string, any>`
- Readonly: `true`
- Default: `{}`

Rendering parameters. Can be passed and accessed during SSR, commonly request info and page configuration.

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

- Type: `Set<ImportMeta>`

Module dependency collection set. Automatically tracks and records module dependencies during component rendering, collecting only resources actually used for the current page render.

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

- Type: `RenderFiles`

Resource file list:
- js: JavaScript files
- css: stylesheet files
- modulepreload: ESM modules to preload
- resources: other resources

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

- Type: `'inline' | 'js'`
- Default: `'inline'`

Import map generation mode:
- `inline`: inline the import map into HTML
- `js`: generate as a JS file

## Instance Methods

### serialize()

- Parameters:
  - `input: any`
  - `options?: serialize.SerializeJSOptions`
- Returns: `string`

Serializes a JavaScript object to a string. Used to safely embed state data into HTML during SSR.

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

- Parameters:
  - `varName: string`
  - `data: Record<string, any>`
- Returns: `string`

Serializes and injects state data into HTML using a safe serialization method.

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

- Returns: `Promise<void>`

Commits dependency collection and updates the resource lists. Collects all used modules from `importMetaSet` and resolves concrete resources via the manifest.

```ts
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

await rc.commit();
```

### preload()

- Returns: `string`

Generates resource preload tags for CSS and JavaScript with priority support and base path handling.

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

- Returns: `string`

Generates CSS link tags, injecting collected stylesheets in the correct order.

```ts
rc.html = `
  <head>
    ${rc.css()}
  </head>
`;
```

### importmap()

- Returns: `string`

Generates the import map tag as configured by `importmapMode` (inline or external).

```ts
rc.html = `
  <head>
    ${rc.importmap()}
  </head>
`;
```

### moduleEntry()

- Returns: `string`

Generates the client entry module tag. Must be injected after the import map.

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

- Returns: `string`

Generates module preload tags to optimize first-screen load.

```ts
rc.html = `
  <body>
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
  </body>
`;
```

---
titleSuffix: Esmx Framework Rendering Context API Reference
description: Detailed documentation of the RenderContext core class in the Esmx framework, including rendering control, resource management, state synchronization, and routing control, helping developers achieve efficient server-side rendering.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, Server-Side Rendering, Rendering Context, State Synchronization, Resource Management, Web Application Framework
---

# RenderContext

RenderContext is the core class in the Esmx framework, responsible for managing the complete lifecycle of server-side rendering (SSR). It provides a comprehensive API to handle key tasks such as rendering context, resource management, and state synchronization:

- **Rendering Control**: Manages the server-side rendering process, supporting scenarios like multi-entry rendering and conditional rendering
- **Resource Management**: Intelligently collects and injects static resources like JS and CSS to optimize loading performance
- **State Synchronization**: Handles server-side state serialization to ensure proper client-side hydration
- **Routing Control**: Supports advanced features like server-side redirection and status code setting

## Type Definitions

### ServerRenderHandle

Type definition for server-side rendering handler functions.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

A server-side rendering handler function is an asynchronous or synchronous function that takes a RenderContext instance as a parameter, used to handle server-side rendering logic.

```ts title="entry.node.ts"
// 1. Asynchronous handler
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Synchronous handler
export const simple = (rc: RenderContext) => {
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

- **js**: List of JavaScript files
- **css**: List of stylesheet files
- **modulepreload**: List of ESM modules to be preloaded
- **resources**: List of other resource files (images, fonts, etc.)

```ts
// Example of resource file list
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

- `inline`: Inlines the importmap content directly into the HTML, suitable for:
  - Reducing the number of HTTP requests
  - When importmap content is small
  - When first-screen loading performance is critical
- `js`: Generates importmap content as a separate JS file, suitable for:
  - When importmap content is large
  - When leveraging browser caching mechanisms
  - When multiple pages share the same importmap

Rendering context class, responsible for resource management and HTML generation during server-side rendering (SSR).
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

- **Type**: `string`
- **Default**: `''`

Base path for static resources.
- All static resources (JS, CSS, images, etc.) will be loaded based on this path
- Supports runtime dynamic configuration without rebuilding
- Commonly used in multi-language sites, micro-frontend applications, etc.

#### entryName

- **Type**: `string`
- **Default**: `'default'`

Server-side rendering entry function name. Used to specify the entry function for server-side rendering when a module exports multiple rendering functions.

```ts title="src/entry.server.ts"
export const mobile = async (rc: RenderContext) => {
  // Mobile rendering logic
};

export const desktop = async (rc: RenderContext) => {
  // Desktop rendering logic
};
```

#### params

- **Type**: `Record<string, any>`
- **Default**: `{}`

Rendering parameters. Can pass any type of parameters to the rendering function, commonly used to pass request information (URL, query parameters, etc.).

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

Import Map generation mode:
- `inline`: Inlines the importmap content directly into the HTML
- `js`: Generates importmap content as a separate JS file


## Instance Properties

### esmx

- **Type**: `Esmx`
- **Read-only**: `true`

Reference to the Esmx instance. Used to access core framework functionality and configuration information.

### redirect

- **Type**: `string | null`
- **Default**: `null`

Redirection address. When set, the server can perform HTTP redirection based on this value, commonly used in login verification, permission control, etc.

```ts title="entry.node.ts"
// Login verification example
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // Continue rendering the page...
};

// Permission control example
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Continue rendering the page...
};
```

### status

- **Type**: `number | null`
- **Default**: `null`

HTTP response status code. Can set any valid HTTP status code, commonly used in error handling, redirection, etc.

```ts title="entry.node.ts"
// 404 error handling example
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // Render 404 page...
    return;
  }
  // Continue rendering the page...
};

// Temporary redirection example
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // Temporary redirect, keeping the request method unchanged
    return;
  }
  // Continue rendering the page...
};
```

### html

- **Type**: `string`
- **Default**: `''`

HTML content. Used to set and get the final generated HTML content, automatically handling base path placeholders when setting.

```ts title="entry.node.ts"
// Basic usage
export default async (rc: RenderContext) => {
  // Set HTML content
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

// Dynamic base path
const rc = await esmx.render({
  base: '/app',  // Set base path
  params: { url: req.url }
});

// Placeholders in HTML will be automatically replaced:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// Replaced with:
// /app/your-app-name/css/style.css
```

### base

- **Type**: `string`
- **Read-only**: `true`
- **Default**: `''`

Base path for static resources. All static resources (JS, CSS, images, etc.) will be loaded based on this path, supporting runtime dynamic configuration.

```ts
// Basic usage
const rc = await esmx.render({
  base: '/esmx',  // Set base path
  params: { url: req.url }
});

// Multi-language site example
const rc = await esmx.render({
  base: '/cn',  // Chinese site
  params: { lang: 'zh-CN' }
});

// Micro-frontend application example
const rc = await esmx.render({
  base: '/app1',  // Sub-application 1
  params: { appId: 1 }
});
```

### entryName

- **Type**: `string`
- **Read-only**: `true`
- **Default**: `'default'`

Server-side rendering entry function name. Used to select the rendering function to use from entry.server.ts.

```ts title="entry.node.ts"
// Default entry function
export default async (rc: RenderContext) => {
  // Default rendering logic
};

// Multiple entry functions
export const mobile = async (rc: RenderContext) => {
  // Mobile rendering logic
};

export const desktop = async (rc: RenderContext) => {
  // Desktop rendering logic
};

// Select entry function based on device type
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Type**: `Record<string, any>`
- **Read-only**: `true`
- **Default**: `{}`

Rendering parameters. Can pass and access parameters during server-side rendering, commonly used to pass request information, page configuration, etc.

```ts
// Basic usage - passing URL and language settings
const rc = await esmx.render({
  params: {
    url: req.url,
    lang: 'zh-CN'
  }
});

// Page configuration - setting theme and layout
const rc = await esmx.render({
  params: {
    theme: 'dark',
    layout: 'sidebar'
  }
});

// Environment configuration - injecting API address
const rc = await esmx.render({
  params: {
    apiBaseUrl: process.env.API_BASE_URL,
    version: '1.0.0'
  }
});
```

### importMetaSet

- **Type**: `Set<ImportMeta>`

Module dependency collection set. Automatically tracks and records module dependencies during component rendering, only collecting resources actually used during the current page rendering.

```ts
// Basic usage
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Automatically collects module dependencies during rendering
  // The framework automatically calls context.importMetaSet.add(import.meta) during component rendering
  // Developers do not need to manually handle dependency collection
  return '<div id="app">Hello World</div>';
};

// Usage example
const app = createApp();
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});
```

### files

- **Type**: `RenderFiles`

List of resource files:
- js: List of JavaScript files
- css: List of stylesheet files
- modulepreload: List of ESM modules to be preloaded
- resources: List of other resource files (images, fonts, etc.)

```ts
// Resource collection
await rc.commit();

// Resource injection
rc.html = `
  <!DOCTYPE html>
  <html>
  <head>
    <!-- Preload resources -->
    ${rc.preload()}
    <!-- Inject stylesheets -->
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

Import Map generation mode:
- `inline`: Inlines the importmap content directly into the HTML
- `js`: Generates importmap content as a separate JS file


## Instance Methods

### serialize()

- **Parameters**: 
  - `input: any` - Data to be serialized
  - `options?: serialize.SerializeJSOptions` - Serialization options
- **Returns**: `string`

Serializes a JavaScript object into a string. Used to serialize state data during server-side rendering, ensuring data can be safely embedded into HTML.

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

Serializes and injects state data into HTML. Uses safe serialization methods to handle data, supporting complex data structures.

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

Commits dependency collection and updates the resource list. Collects all used modules from importMetaSet, parsing each module's specific resources based on the manifest file.

```ts
// Render and commit dependencies
const html = await renderToString(app, {
  importMetaSet: rc.importMetaSet
});

// Commit dependency collection
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
    ${rc.css()}  <!-- Inject stylesheets -->
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

Generates CSS stylesheet tags. Injects collected CSS files, ensuring stylesheets are loaded in the correct order.

```ts
rc.html = `
  <head>
    ${rc.css()}  <!-- Inject all collected stylesheets -->
  </head>
`;
```

### importmap()

- **Returns**: `string`

Generates import map tags. Generates inline or external import maps based on importmapMode configuration.

```ts
rc.html = `
  <head>
    ${rc.importmap()}  <!-- Inject import map -->
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
    ${rc.moduleEntry()}  <!-- Inject client entry module -->
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
    ${rc.modulePreload()}  <!-- Preload module dependencies -->
  </body>
`;
```
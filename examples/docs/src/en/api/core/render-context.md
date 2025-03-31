---
titleSuffix: Esmx Framework Rendering Context API Reference
description: Detailed documentation on the RenderContext core class in the Esmx framework, covering rendering control, resource management, state synchronization, and routing capabilities to help developers achieve efficient server-side rendering.
head:
  - - meta
    - property: keywords
      content: Esmx, RenderContext, SSR, Server-Side Rendering, Rendering Context, State Synchronization, Resource Management, Web Application Framework
---

# RenderContext

RenderContext is the core class in the Esmx framework, responsible for managing the complete lifecycle of server-side rendering (SSR). It provides a comprehensive API for handling rendering context, resource management, state synchronization, and other critical tasks:

- **Rendering Control**: Manages server-side rendering workflows, supporting multi-entry rendering, conditional rendering, and other scenarios
- **Resource Management**: Intelligently collects and injects static resources like JS and CSS to optimize loading performance
- **State Synchronization**: Handles server-side state serialization to ensure proper client-side hydration
- **Routing Control**: Supports advanced features like server-side redirects and status code configuration

## Type Definitions

### ServerRenderHandle

Type definition for server-side rendering handler functions.

```ts
type ServerRenderHandle = (rc: RenderContext) => Promise<void> | void;
```

A server-side rendering handler is an async or sync function that receives a RenderContext instance as parameter for processing SSR logic.

```ts title="entry.node.ts"
// 1. Async handler
export default async (rc: RenderContext) => {
  const app = createApp();
  const html = await renderToString(app);
  rc.html = html;
};

// 2. Sync handler
export const simple = (rc: RenderContext) => {
  rc.html = '<h1>Hello World</h1>';
};
```

### RenderFiles

Type definition for resource file lists collected during rendering.

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
- **modulepreload**: List of ESM modules requiring preloading
- **resources**: Other resource file list (images, fonts, etc.)

```ts
// Example resource file list
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

Defines importmap generation modes.

```ts
type ImportmapMode = 'inline' | 'js';
```

- `inline`: Inlines importmap content directly into HTML, suitable for:
  - Reducing HTTP requests
  - Smaller importmap content
  - Critical first-load performance requirements
- `js`: Generates importmap as standalone JS file, suitable for:
  - Larger importmap content
  - Leveraging browser caching
  - Shared importmaps across multiple pages

The rendering context class responsible for resource management and HTML generation during server-side rendering (SSR).
## Instance Options

Configuration options for RenderContext.

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
- All static resources (JS, CSS, images, etc.) will load relative to this path
- Supports runtime dynamic configuration without rebuild
- Commonly used for multilingual sites, micro-frontend applications, etc.

#### entryName

- **Type**: `string`
- **Default**: `'default'`

Server-side rendering entry function name. Specifies which entry function to use when a module exports multiple render functions.

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

Rendering parameters. Can pass arbitrary parameters to render functions, commonly used for request information (URL, query params, etc.).

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
- `inline`: Inlines importmap content directly into HTML
- `js`: Generates importmap as standalone JS file


## Instance Properties

### esmx

- **Type**: `Esmx`
- **Readonly**: `true`

Reference to the Esmx instance. Used to access core framework functionality and configuration.

### redirect

- **Type**: `string | null`
- **Default**: `null`

Redirect URL. When set, the server can perform HTTP redirects based on this value, commonly used for login verification, permission control, etc.

```ts title="entry.node.ts"
// Login verification example
export default async (rc: RenderContext) => {
  if (!isLoggedIn()) {
    rc.redirect = '/login';
    rc.status = 302;
    return;
  }
  // Continue rendering...
};

// Permission control example
export default async (rc: RenderContext) => {
  if (!hasPermission()) {
    rc.redirect = '/403';
    rc.status = 403;
    return;
  }
  // Continue rendering...
};
```

### status

- **Type**: `number | null`
- **Default**: `null`

HTTP response status code. Can set any valid HTTP status code, commonly used for error handling, redirects, etc.

```ts title="entry.node.ts"
// 404 error handling example
export default async (rc: RenderContext) => {
  const page = await findPage(rc.params.url);
  if (!page) {
    rc.status = 404;
    // Render 404 page...
    return;
  }
  // Continue rendering...
};

// Temporary redirect example
export default async (rc: RenderContext) => {
  if (needMaintenance()) {
    rc.redirect = '/maintenance';
    rc.status = 307; // Temporary redirect preserving request method
    return;
  }
  // Continue rendering...
};
```

### html

- **Type**: `string`
- **Default**: `''`

HTML content. Used to set and get final generated HTML content, automatically processes base path placeholders when setting.

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

// Placeholders in HTML are automatically replaced:
// [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
// Becomes:
// /app/your-app-name/css/style.css
```

### base

- **Type**: `string`
- **Readonly**: `true`
- **Default**: `''`

Base path for static resources. All static resources (JS, CSS, images, etc.) load relative to this path, supports runtime dynamic configuration.

```ts
// Basic usage
const rc = await esmx.render({
  base: '/esmx',  // Set base path
  params: { url: req.url }
});

// Multilingual site example
const rc = await esmx.render({
  base: '/cn',  // Chinese site
  params: { lang: 'zh-CN' }
});

// Micro-frontend example
const rc = await esmx.render({
  base: '/app1',  // Sub-application 1
  params: { appId: 1 }
});
```

### entryName

- **Type**: `string`
- **Readonly**: `true`
- **Default**: `'default'`

Server-side rendering entry function name. Used to select which render function to use from entry.server.ts.

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

// Select entry function by device type
const rc = await esmx.render({
  entryName: isMobile ? 'mobile' : 'desktop',
  params: { url: req.url }
});
```

### params

- **Type**: `Record<string, any>`
- **Readonly**: `true`
- **Default**: `{}`

Rendering parameters. Can pass and access parameters during SSR, commonly used for request information, page configuration, etc.

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

Module dependency collection set. Automatically tracks and records module dependencies during component rendering, only collecting resources actually used during current page rendering.

```ts
// Basic usage
const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
  // Automatically collects module dependencies during rendering
  // Framework automatically calls context.importMetaSet.add(import.meta) during component rendering
  // Developers don't need to manually handle dependency collection
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

Resource file list:
- js: JavaScript file list
- css: Stylesheet file list
- modulepreload: List of ESM modules requiring preloading
- resources: Other resource file list (images, fonts, etc.)

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
- `inline`: Inlines importmap content directly into HTML
- `js`: Generates importmap as standalone JS file


## Instance Methods

### serialize()

- **Parameters**: 
  - `input: any` - Data to serialize
  - `options?: serialize.SerializeJSOptions` - Serialization options
- **Returns**: `string`

Serializes JavaScript objects to strings. Used during SSR to serialize state data for safe embedding in HTML.

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

Serializes and injects state data into HTML. Uses safe serialization methods supporting complex data structures.

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

Commits dependency collection and updates resource list. Collects all used modules from importMetaSet, resolves each module's specific resources based on manifest file.

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

Generates resource preload tags. Preloads CSS and JavaScript resources with priority configuration, automatically handles base paths.

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

Generates CSS stylesheet tags. Injects collected CSS files ensuring proper loading order.

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

Generates client entry module tags. Injects client entry module, must execute after importmap.

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

Generates module preload tags. Preloads collected ESM modules to optimize first-load performance.

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
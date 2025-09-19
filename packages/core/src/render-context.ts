import path from 'node:path';
import serialize from 'serialize-javascript';
import type { Esmx } from './core';

/**
 * Configuration options interface for RenderContext
 *
 * @description
 * RenderContextOptions is used to configure the behavior of RenderContext instances, including base path, entry name, parameters, and import map mode.
 *
 * @example
 * ```ts
 * // 1. Base path configuration example
 * // Supports deploying static assets to different paths
 * const rc = await esmx.render({
 *   // Set base path to /esmx, all static assets will be loaded based on this path
 *   base: '/esmx',
 *   // Other configurations...
 * });
 *
 * // 2. Multi-language site deployment example
 * // Support multi-language sites through different base paths
 * const rc = await esmx.render({
 *   base: '/cn',  // Chinese site
 *   params: { lang: 'zh-CN' }
 * });
 *
 * // 3. Import map mode configuration example
 * const rc = await esmx.render({
 *   // Use inline mode, suitable for small applications
 *   importmapMode: 'inline',
 *   // Other configurations...
 * });
 * ```
 */
export interface RenderContextOptions {
    /**
     * Base path for static assets
     * @description
     * - Defaults to empty string
     * - All static assets (JS, CSS, images, etc.) will be loaded based on this path
     * - Supports runtime dynamic configuration without rebuilding
     * - Commonly used for multi-language sites, micro-frontends, and other scenarios
     */
    base?: string;

    /**
     * Server-side rendering entry name
     * @description
     * - Defaults to 'default'
     * - Used to specify the entry function used during server-side rendering
     * - Used when a module exports multiple rendering functions
     */
    entryName?: string;

    /**
     * Rendering parameters
     * @description
     * - Can pass parameters of any type to the rendering function
     * - Commonly used to pass request information (URL, query parameters, etc.)
     * - Can be accessed through rc.params during server-side rendering
     */
    params?: Record<string, any>;

    /**
     * Define the generation mode for importmap
     *
     * @description
     * ImportmapMode is used to control the generation method of importmap, supporting two modes:
     * - `inline`: Inline importmap content directly into HTML (default value), suitable for the following scenarios:
     *   - Need to reduce the number of HTTP requests
     *   - Importmap content is small
     *   - High requirements for first-screen loading performance
     * - `js`: Generate importmap content as an independent JS file, suitable for the following scenarios:
     *   - Importmap content is large
     *   - Need to utilize browser caching mechanisms
     *   - Multiple pages share the same importmap
     *
     * Reasons for choosing 'inline' as the default value:
     * 1. Simple and direct
     *    - Reduce additional HTTP requests
     *    - No additional resource management required
     *    - Suitable for most application scenarios
     * 2. First-screen performance
     *    - Avoid additional network requests
     *    - Ensure import maps are immediately available
     *    - Reduce page loading time
     * 3. Easy to debug
     *    - Import maps are directly visible
     *    - Facilitate problem diagnosis
     *    - Simplify development process
     *
     * @example
     * ```ts
     * // Use inline mode (default)
     * const rc = await esmx.render({
     *   params: { url: req.url }
     * });
     *
     * // Explicitly specify inline mode
     * const rc = await esmx.render({
     *   importmapMode: 'inline',
     *   params: { url: req.url }
     * });
     *
     * // Use JS file mode
     * const rc = await esmx.render({
     *   importmapMode: 'js',
     *   params: { url: req.url }
     * });
     * ```
     */
    importmapMode?: ImportmapMode;
}

/**
 * Server-side rendering function
 */
export type ServerRenderHandle = (rc: RenderContext) => Promise<void>;

/**
 * Render resource file list interface
 * @description
 * The RenderFiles interface defines various static assets collected during the server-side rendering process:
 *
 * 1. **Resource Types**
 *    - css: List of stylesheet files
 *    - modulepreload: List of ESM modules that need to be preloaded
 *    - js: List of JavaScript files
 *    - resources: List of other resource files
 *
 * 2. **Use Cases**
 *    - Automatically collected in the commit() method
 *    - Injected through methods like preload(), css(), etc.
 *    - Supports base path configuration
 *
 * @example
 * ```ts
 * // 1. Resource collection
 * await rc.commit();
 *
 * // 2. Resource injection
 * rc.html = `
 *   <!DOCTYPE html>
 *   <html>
 *   <head>
 *     <!-- Preload resources -->
 *     ${rc.preload()}
 *     <!-- Inject stylesheets -->
 *     ${rc.css()}
 *   </head>
 *   <body>
 *     ${html}
 *     <!-- Inject import map -->
 *     ${rc.importmap()}
 *     <!-- Inject client entry -->
 *     ${rc.moduleEntry()}
 *     <!-- Preload modules -->
 *     ${rc.modulePreload()}
 *   </body>
 *   </html>
 * `;
 * ```
 */
export interface RenderFiles {
    /**
     * List of JavaScript files
     */
    js: string[];
    /**
     * List of CSS files
     */
    css: string[];
    /**
     * List of ESM modules that need to be preloaded
     */
    modulepreload: string[];
    /**
     * List of other resource files (images, fonts, etc.)
     */
    resources: string[];
}

/**
 * Define the generation mode for importmap
 *
 * @description
 * ImportmapMode is used to control the generation method of importmap, supporting two modes:
 * - `inline`: Inline importmap content directly into HTML (default value), suitable for the following scenarios:
 *   - Need to reduce the number of HTTP requests
 *   - Importmap content is small
 *   - High requirements for first-screen loading performance
 * - `js`: Generate importmap content as an independent JS file, suitable for the following scenarios:
 *   - Importmap content is large
 *   - Need to utilize browser caching mechanisms
 *   - Multiple pages share the same importmap
 *
 * Reasons for choosing 'inline' as the default value:
 * 1. Simple and direct
 *    - Reduce additional HTTP requests
 *    - No additional resource management required
 *    - Suitable for most application scenarios
 * 2. First-screen performance
 *    - Avoid additional network requests
 *    - Ensure import maps are immediately available
 *    - Reduce page loading time
 * 3. Easy to debug
 *    - Import maps are directly visible
 *    - Facilitate problem diagnosis
 *    - Simplify development process
 *
 * @example
 * ```ts
 * // Use inline mode (default)
 * const rc = await esmx.render({
 *   params: { url: req.url }
 * });
 *
 * // Explicitly specify inline mode
 * const rc = await esmx.render({
 *   importmapMode: 'inline',
 *   params: { url: req.url }
 * });
 *
 * // Use JS file mode
 * const rc = await esmx.render({
 *   importmapMode: 'js',
 *   params: { url: req.url }
 * });
 * ```
 */
export type ImportmapMode = 'inline' | 'js';

/**
 * RenderContext is the core class in the Esmx framework, responsible for resource management and HTML generation during server-side rendering (SSR)
 *
 * @description
 * RenderContext has the following core features:
 * 1. **ESM-based module system**
 *    - Adopts modern ECMAScript Modules standard
 *    - Supports native module imports and exports
 *    - Implements better code splitting and on-demand loading
 *
 * 2. **Intelligent dependency collection**
 *    - Dynamically collects dependencies based on actual rendering paths
 *    - Avoids unnecessary resource loading
 *    - Supports async components and dynamic imports
 *
 * 3. **Precise resource injection**
 *    - Strictly controls resource loading order
 *    - Optimizes first-screen loading performance
 *    - Ensures reliability of client-side hydration
 *
 * 4. **Flexible configuration mechanism**
 *    - Supports dynamic base path configuration
 *    - Provides multiple import map modes
 *    - Adapts to different deployment scenarios
 *
 * @example
 * ```ts
 * export default async (rc: RenderContext) => {
 *     // 1. Render page content and collect dependencies
 *     const app = createApp();
 *     const html = await renderToString(app, {
 *         importMetaSet: rc.importMetaSet
 *     });
 *
 *     // 2. Commit dependency collection
 *     await rc.commit();
 *
 *     // 3. Generate complete HTML
 *     rc.html = `
 *         <!DOCTYPE html>
 *         <html>
 *         <head>
 *             <!-- Preload CSS and JS resources to start loading early for performance optimization -->
 *             ${rc.preload()}
 *             <!-- Inject first-screen stylesheets to avoid page flickering -->
 *             ${rc.css()}
 *         </head>
 *         <body>
 *             ${html}
 *             <!-- Inject module import map to define path resolution rules for ESM modules -->
 *             ${rc.importmap()}
 *             <!-- Inject client entry module, must be executed after importmap -->
 *             ${rc.moduleEntry()}
 *             <!-- Preload module dependencies, optimized loading based on dependencies collected during actual rendering -->
 *             ${rc.modulePreload()}
 *         </body>
 *         </html>
 *     `;
 * };
 * ```
 */
export class RenderContext {
    public esmx: Esmx;
    /**
     * Redirect address
     * @description
     * - Defaults to null, indicating no redirect
     * - When set, the server can perform HTTP redirection based on this value
     * - Commonly used for scenarios like login verification, permission control, etc.
     *
     * @example
     * ```ts
     * // 1. Login verification example
     * export default async (rc: RenderContext) => {
     *   if (!isLoggedIn()) {
     *     rc.redirect = '/login';
     *     rc.status = 302;
     *     return;
     *   }
     *   // Continue rendering page...
     * };
     *
     * // 2. Permission control example
     * export default async (rc: RenderContext) => {
     *   if (!hasPermission()) {
     *     rc.redirect = '/403';
     *     rc.status = 403;
     *     return;
     *   }
     *   // Continue rendering page...
     * };
     *
     * // 3. Server-side processing example
     * app.use(async (req, res) => {
     *   const rc = await esmx.render({
     *     params: {
     *       url: req.url
     *     }
     *   });
     *
     *   // Handle redirect
     *   if (rc.redirect) {
     *     res.statusCode = rc.status || 302;
     *     res.setHeader('Location', rc.redirect);
     *     res.end();
     *     return;
     *   }
     *
     *   // Set status code
     *   if (rc.status) {
     *     res.statusCode = rc.status;
     *   }
     *
     *   // Respond with HTML content
     *   res.end(rc.html);
     * });
     * ```
     */
    public redirect: string | null = null;

    /**
     * HTTP response status code
     * @description
     * - Defaults to null, indicating use of 200 status code
     * - Can set any valid HTTP status code
     * - Commonly used for scenarios like error handling, redirection, etc.
     * - Usually used in conjunction with the redirect property
     *
     * @example
     * ```ts
     * // 1. 404 error handling example
     * export default async (rc: RenderContext) => {
     *   const page = await findPage(rc.params.url);
     *   if (!page) {
     *     rc.status = 404;
     *     // Render 404 page...
     *     return;
     *   }
     *   // Continue rendering page...
     * };
     *
     * // 2. Temporary redirect example
     * export default async (rc: RenderContext) => {
     *   if (needMaintenance()) {
     *     rc.redirect = '/maintenance';
     *     rc.status = 307; // Temporary redirect, keep request method unchanged
     *     return;
     *   }
     *   // Continue rendering page...
     * };
     *
     * // 3. Server-side processing example
     * app.use(async (req, res) => {
     *   const rc = await esmx.render({
     *     params: {
     *       url: req.url
     *     }
     *   });
     *
     *   // Handle redirect
     *   if (rc.redirect) {
     *     res.statusCode = rc.status || 302;
     *     res.setHeader('Location', rc.redirect);
     *     res.end();
     *     return;
     *   }
     *
     *   // Set status code
     *   if (rc.status) {
     *     res.statusCode = rc.status;
     *   }
     *
     *   // Respond with HTML content
     *   res.end(rc.html);
     * });
     * ```
     */
    public status: number | null = null;
    private _html = '';
    /**
     * Base path for static assets
     * @description
     * The base property is used to control the loading path of static assets and is the core of Esmx framework's dynamic base path configuration:
     *
     * 1. **Build-time Processing**
     *    - Static asset paths are marked with special placeholders: `[[[___ESMX_DYNAMIC_BASE___]]]/your-app-name/`
     *    - Placeholders are injected into all static asset reference paths
     *    - Supports various static assets like CSS, JavaScript, images, etc.
     *
     * 2. **Runtime Replacement**
     *    - Set the actual base path through the `base` parameter of `esmx.render()`
     *    - RenderContext automatically replaces placeholders in HTML with actual paths
     *
     * 3. **Technical Advantages**
     *    - Deployment flexibility: The same set of build artifacts can be deployed to any path
     *    - Performance optimization: Maintain the best caching strategy for static assets
     *    - Development-friendly: Simplify multi-environment configuration management
     *
     * @example
     * ```ts
     * // 1. Basic usage
     * const rc = await esmx.render({
     *   base: '/esmx',  // Set base path
     *   params: { url: req.url }
     * });
     *
     * // 2. Multi-language site example
     * const rc = await esmx.render({
     *   base: '/cn',  // Chinese site
     *   params: { lang: 'zh-CN' }
     * });
     *
     * // 3. Micro-frontend application example
     * const rc = await esmx.render({
     *   base: '/app1',  // Sub-application 1
     *   params: { appId: 1 }
     * });
     * ```
     */
    public readonly base: string;
    /**
     * Server-side rendering entry function name
     * @description
     * The entryName property is used to specify the entry function used during server-side rendering:
     *
     * 1. **Basic Usage**
     *    - Default value is 'default'
     *    - Used to select the rendering function to use from entry.server.ts
     *    - Supports scenarios where a module exports multiple rendering functions
     *
     * 2. **Use Cases**
     *    - Multi-template rendering: Different pages use different rendering templates
     *    - A/B testing: The same page uses different rendering logic
     *    - Special rendering: Some pages need custom rendering processes
     *
     * @example
     * ```ts
     * // 1. Default entry function
     * // entry.server.ts
     * export default async (rc: RenderContext) => {
     *   // Default rendering logic
     * };
     *
     * // 2. Multiple entry functions
     * // entry.server.ts
     * export const mobile = async (rc: RenderContext) => {
     *   // Mobile rendering logic
     * };
     *
     * export const desktop = async (rc: RenderContext) => {
     *   // Desktop rendering logic
     * };
     *
     * // 3. Select entry function based on device type
     * const rc = await esmx.render({
     *   entryName: isMobile ? 'mobile' : 'desktop',
     *   params: { url: req.url }
     * });
     * ```
     */
    public readonly entryName: string;

    /**
     * Rendering parameters
     * @description
     * The params property is used to pass and access parameters during the server-side rendering process:
     *
     * 1. **Parameter Types**
     *    - Supports key-value pairs of any type
     *    - Defined through Record<string, any> type
     *    - Remains unchanged throughout the entire rendering lifecycle
     *
     * 2. **Common Use Cases**
     *    - Pass request information (URL, query parameters, etc.)
     *    - Set page configuration (language, theme, etc.)
     *    - Inject environment variables (API address, version number, etc.)
     *    - Share server-side state (user information, permissions, etc.)
     *
     * 3. **Access Methods**
     *    - Accessed through rc.params in server-side rendering functions
     *    - Can destructure to get specific parameters
     *    - Supports setting default values
     *
     * @example
     * ```ts
     * // 1. Basic usage - Pass URL and language settings
     * const rc = await esmx.render({
     *   params: {
     *     url: req.url,
     *     lang: 'zh-CN'
     *   }
     * });
     *
     * // 2. Page configuration - Set theme and layout
     * const rc = await esmx.render({
     *   params: {
     *     theme: 'dark',
     *     layout: 'sidebar'
     *   }
     * });
     *
     * // 3. Environment configuration - Inject API address
     * const rc = await esmx.render({
     *   params: {
     *     apiBaseUrl: process.env.API_BASE_URL,
     *     version: '1.0.0'
     *   }
     * });
     *
     * // 4. Use in rendering function
     * export default async (rc: RenderContext) => {
     *   // Destructure to get parameters
     *   const { url, lang = 'en' } = rc.params;
     *
     *   // Execute different logic based on parameters
     *   if (lang === 'zh-CN') {
     *     // Chinese version processing...
     *   }
     *
     *   // Pass parameters to component
     *   const html = await renderToString(createApp({
     *     props: {
     *       currentUrl: url,
     *       language: lang
     *     }
     *   }));
     *
     *   // Set HTML
     *   rc.html = `
     *     <!DOCTYPE html>
     *     <html lang="${lang}">
     *       <body>${html}</body>
     *     </html>
     *   `;
     * };
     * ```
     */
    public readonly params: Record<string, any>;
    /**
     * Module dependency collection set
     * @description
     * importMetaSet is the core of Esmx framework's intelligent dependency collection mechanism, used to track and record module dependencies during the server-side rendering process:
     *
     * 1. **On-demand Collection**
     *    - Automatically tracks and records module dependencies during the actual component rendering process
     *    - Only collects resources actually used during the current page rendering
     *    - Precisely records the module dependency relationships of each component
     *
     * 2. **Performance Optimization**
     *    - Avoids loading unused modules, significantly reducing first-screen loading time
     *    - Precisely controls resource loading order, optimizing page rendering performance
     *    - Automatically generates optimal import maps
     *
     * 3. **Usage**
     *    - Passed to renderToString in the rendering function
     *    - Framework automatically collects dependencies, no manual handling required
     *    - Supports dependency collection for async components and dynamic imports
     *
     * @example
     * ```ts
     * // 1. Basic usage
     * const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
     *   // Automatically collect module dependencies during the rendering process
     *   // Framework will automatically call context.importMetaSet.add(import.meta) during component rendering
     *   // Developers do not need to manually handle dependency collection
     *   return '<div id="app">Hello World</div>';
     * };
     *
     * // Usage example
     * const app = createApp();
     * const html = await renderToString(app, {
     *   importMetaSet: rc.importMetaSet
     * });
     *
     * // 2. Commit dependencies
     * await rc.commit();
     *
     * // 3. Generate HTML
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     <!-- Automatically inject resources based on collected dependencies -->
     *     ${rc.preload()}
     *     ${rc.css()}
     *   </head>
     *   <body>
     *     ${html}
     *     ${rc.importmap()}
     *     ${rc.moduleEntry()}
     *     ${rc.modulePreload()}
     *   </body>
     *   </html>
     * `;
     * ```
     */
    public importMetaSet = new Set<ImportMeta>();
    /**
     * Resource file list
     * @description
     * The files property stores all static resource file paths collected during the server-side rendering process:
     *
     * 1. **Resource Types**
     *    - js: List of JavaScript files, containing all scripts and modules
     *    - css: List of stylesheet files
     *    - modulepreload: List of ESM modules that need to be preloaded
     *    - importmap: List of import map files
     *    - resources: List of other resource files (images, fonts, etc.)
     *
     * 2. **Use Cases**
     *    - Automatically collect and categorize resources in the commit() method
     *    - Inject resources into HTML through methods like preload(), css(), etc.
     *    - Supports base path configuration, implementing dynamic loading of resources
     *
     * @example
     * ```ts
     * // 1. Resource collection
     * await rc.commit();
     *
     * // 2. Resource injection
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     <!-- Preload resources -->
     *     ${rc.preload()}
     *     <!-- Inject stylesheets -->
     *     ${rc.css()}
     *   </head>
     *   <body>
     *     ${html}
     *     ${rc.importmap()}
     *     ${rc.moduleEntry()}
     *     ${rc.modulePreload()}
     *   </body>
     *   </html>
     * `;
     * ```
     */
    public files: RenderFiles = {
        js: [],
        css: [],
        modulepreload: [],
        resources: []
    };
    private _importMap: { src: string | null; code: string } = {
        src: '',
        code: ''
    };
    /**
     * Define the generation mode for importmap
     *
     * @description
     * ImportmapMode is used to control the generation method of importmap, supporting two modes:
     * - `inline`: Inline importmap content directly into HTML (default value), suitable for the following scenarios:
     *   - Need to reduce the number of HTTP requests
     *   - Importmap content is small
     *   - High requirements for first-screen loading performance
     * - `js`: Generate importmap content as an independent JS file, suitable for the following scenarios:
     *   - Importmap content is large
     *   - Need to utilize browser caching mechanisms
     *   - Multiple pages share the same importmap
     *
     * Reasons for choosing 'inline' as the default value:
     * 1. Simple and direct
     *    - Reduce additional HTTP requests
     *    - No additional resource management required
     *    - Suitable for most application scenarios
     * 2. First-screen performance
     *    - Avoid additional network requests
     *    - Ensure import maps are immediately available
     *    - Reduce page loading time
     * 3. Easy to debug
     *    - Import maps are directly visible
     *    - Facilitate problem diagnosis
     *    - Simplify development process
     *
     * @example
     * ```ts
     * // Use inline mode (default)
     * const rc = await esmx.render({
     *   params: { url: req.url }
     * });
     *
     * // Explicitly specify inline mode
     * const rc = await esmx.render({
     *   importmapMode: 'inline',
     *   params: { url: req.url }
     * });
     *
     * // Use JS file mode
     * const rc = await esmx.render({
     *   importmapMode: 'js',
     *   params: { url: req.url }
     * });
     * ```
     */
    public importmapMode: ImportmapMode;
    /**
     * HTML content
     * @description
     * The html property is used to set and get the final generated HTML content:
     *
     * 1. **Base Path Replacement**
     *    - Automatically handles base path placeholders when setting HTML
     *    - Replaces `[[[___ESMX_DYNAMIC_BASE___]]]/your-app-name/` with the actual base path
     *    - Ensures all static asset reference paths are correct
     *
     * 2. **Use Cases**
     *    - Set HTML content generated by server-side rendering
     *    - Support dynamic base path configuration
     *    - Automatically handle static asset reference paths
     *
     * @example
     * ```ts
     * // 1. Basic usage
     * export default async (rc: RenderContext) => {
     *   // Set HTML content
     *   rc.html = `
     *     <!DOCTYPE html>
     *     <html>
     *       <head>
     *         ${rc.preload()}
     *         ${rc.css()}
     *       </head>
     *       <body>
     *         <div id="app">Hello World</div>
     *         ${rc.importmap()}
     *         ${rc.moduleEntry()}
     *         ${rc.modulePreload()}
     *       </body>
     *     </html>
     *   `;
     * };
     *
     * // 2. Dynamic base path
     * const rc = await esmx.render({
     *   base: '/app',  // Set base path
     *   params: { url: req.url }
     * });
     *
     * // Placeholders in HTML will be automatically replaced:
     * // [[[___ESMX_DYNAMIC_BASE___]]]/your-app-name/css/style.css
     * // Replaced with:
     * // /app/your-app-name/css/style.css
     * ```
     */
    public get html() {
        return this._html;
    }
    public set html(html) {
        const varName = this.esmx.basePathPlaceholder;
        this._html = varName
            ? html.replaceAll(this.esmx.basePathPlaceholder, this.base)
            : html;
    }
    public constructor(esmx: Esmx, options: RenderContextOptions = {}) {
        this.esmx = esmx;
        this.base = options.base ?? '';
        this.params = options.params ?? {};
        this.entryName = options.entryName ?? 'default';
        this.importmapMode = options.importmapMode ?? 'inline';
    }
    /**
     * Serialize JavaScript object to string
     * @description
     * The serialize method is used to serialize state data during the server-side rendering process for passing to the client:
     *
     * 1. **Main Uses**
     *    - Serialize server-side state data
     *    - Ensure data can be safely embedded in HTML
     *    - Support complex data structures (such as Date, RegExp, etc.)
     *
     * 2. **Security Handling**
     *    - Automatically escape special characters
     *    - Prevent XSS attacks
     *    - Maintain data type integrity
     *
     * @example
     * ```ts
     * // 1. Basic usage - Serialize state data
     * export default async (rc: RenderContext) => {
     *   const state = {
     *     user: { id: 1, name: 'Alice' },
     *     timestamp: new Date(),
     *     regex: /\d+/
     *   };
     *
     *   rc.html = `
     *     <!DOCTYPE html>
     *     <html>
     *     <head>
     *       <script>
     *         // Inject serialized state into global variable
     *         window.__INITIAL_STATE__ = ${rc.serialize(state)};
     *       </script>
     *     </head>
     *     <body>${html}</body>
     *     </html>
     *   `;
     * };
     *
     * // 2. Custom serialization options
     * const state = { sensitive: 'data' };
     * const serialized = rc.serialize(state, {
     *   isJSON: true,  // Use JSON compatible mode
     *   unsafe: false  // Disable unsafe serialization
     * });
     * ```
     *
     * @param {any} input - Input data to be serialized
     * @param {serialize.SerializeJSOptions} [options] - Serialization options
     * @returns {string} Serialized string
     */
    public serialize(
        input: any,
        options?: serialize.SerializeJSOptions
    ): string {
        return serialize(input, options);
    }
    /**
     * Serialize state data and inject it into HTML
     * @description
     * The state method is used to serialize state data and inject it into HTML during server-side rendering, so that the client can restore these states when activating:
     *
     * 1. **Serialization Mechanism**
     *    - Use safe serialization methods to process data
     *    - Support complex data structures (objects, arrays, etc.)
     *    - Automatically handle special characters and XSS protection
     *
     * 2. **Use Cases**
     *    - Synchronize server-side state to client
     *    - Initialize client application state
     *    - Implement seamless server-side rendering to client activation
     *
     * @param varName Global variable name, used to access injected data on the client
     * @param data Data object that needs to be serialized
     * @returns Script tag string containing serialized data
     *
     * @example
     * ```ts
     * // 1. Basic usage - Inject user information
     * export default async (rc: RenderContext) => {
     *   const userInfo = {
     *     id: 1,
     *     name: 'John',
     *     roles: ['admin']
     *   };
     *
     *   rc.html = `
     *     <!DOCTYPE html>
     *     <html>
     *     <head>
     *       ${rc.state('__USER__', userInfo)}
     *     </head>
     *     <body>
     *       <div id="app"></div>
     *     </body>
     *     </html>
     *   `;
     * };
     *
     * // 2. Client-side usage
     * // Can directly access injected data on the client
     * const userInfo = window.__USER__;
     * console.log(userInfo.name); // Output: 'John'
     *
     * // 3. Complex data structures
     * export default async (rc: RenderContext) => {
     *   const appState = {
     *     user: {
     *       id: 1,
     *       preferences: {
     *         theme: 'dark',
     *         language: 'zh-CN'
     *       }
     *     },
     *     settings: {
     *       notifications: true,
     *       timezone: 'Asia/Shanghai'
     *     }
     *   };
     *
     *   rc.html = `
     *     <!DOCTYPE html>
     *     <html>
     *     <head>
     *       ${rc.state('__APP_STATE__', appState)}
     *     </head>
     *     <body>
     *       <div id="app"></div>
     *     </body>
     *     </html>
     *   `;
     * };
     * ```
     */
    public state(varName: string, data: Record<string, any>): string {
        return `<script>window[${serialize(varName)}] = ${serialize(data, { isJSON: true })};</script>`;
    }
    /**
     * Commit dependency collection and update resource list
     * @description
     * The commit method is the core of RenderContext's dependency collection mechanism, responsible for handling all collected module dependencies and updating the file resource list:
     *
     * 1. **Dependency Processing Flow**
     *    - Collect all used modules from importMetaSet
     *    - Parse specific resources for each module based on manifest files
     *    - Handle different types of dependencies such as JS, CSS, resource files, etc.
     *    - Automatically handle module preloading and import maps
     *
     * 2. **Resource Classification**
     *    - js: JavaScript files, containing all scripts and modules
     *    - css: Stylesheet files
     *    - modulepreload: ESM modules that need to be preloaded
     *    - importmap: Import map files
     *    - resources: Other resource files (images, fonts, etc.)
     *
     * 3. **Path Processing**
     *    - Automatically add base path prefix
     *    - Ensure the correctness of resource paths
     *    - Support resource isolation for multi-application scenarios
     *
     * @example
     * ```ts
     * // 1. Basic usage
     * export default async (rc: RenderContext) => {
     *   // Render page and collect dependencies
     *   const app = createApp();
     *   const html = await renderToString(app, {
     *     importMetaSet: rc.importMetaSet
     *   });
     *
     *   // Commit dependency collection
     *   await rc.commit();
     *
     *   // Generate HTML
     *   rc.html = `
     *     <!DOCTYPE html>
     *     <html>
     *     <head>
     *       ${rc.preload()}
     *       ${rc.css()}
     *     </head>
     *     <body>
     *       ${html}
     *       ${rc.importmap()}
     *       ${rc.moduleEntry()}
     *       ${rc.modulePreload()}
     *     </body>
     *     </html>
     *   `;
     * };
     *
     * // 2. Multi-application scenario
     * const rc = await esmx.render({
     *   base: '/app1',  // Set base path
     *   params: { appId: 1 }
     * });
     *
     * // Render and commit dependencies
     * const html = await renderApp(rc);
     * await rc.commit();
     *
     * // Resource paths will automatically add base path prefix
     * // For example: /app1/your-app-name/js/main.js
     * ```
     */
    public async commit() {
        const { esmx } = this;
        const chunkSet = new Set([`${esmx.name}@src/entry.client.ts`]);
        for (const item of this.importMetaSet) {
            if ('chunkName' in item && typeof item.chunkName === 'string') {
                chunkSet.add(item.chunkName);
            }
        }

        const files: {
            [K in keyof RenderFiles]: Set<string>;
        } = {
            js: new Set(),
            modulepreload: new Set(),
            css: new Set(),
            resources: new Set()
        };

        const getUrlPath = (...paths: string[]) =>
            path.posix.join('/', this.base, ...paths);

        const manifests = await this.esmx.getManifestList('client');
        manifests.forEach((item) => {
            const addPath = (setName: keyof RenderFiles, filepath: string) =>
                files[setName].add(getUrlPath(item.name, filepath));
            const addPaths = (
                setName: keyof RenderFiles,
                filepaths: string[]
            ) => filepaths.forEach((filepath) => addPath(setName, filepath));
            Object.entries(item.chunks).forEach(([filepath, info]) => {
                if (chunkSet.has(filepath)) {
                    addPath('js', info.js);
                    addPaths('css', info.css);
                    addPaths('resources', info.resources);
                }
            });
        });

        const paths = await esmx.getStaticImportPaths(
            'client',
            `${esmx.name}/src/entry.client`
        );
        paths?.forEach((filepath) =>
            files.modulepreload.add(getUrlPath(filepath))
        );

        files.js = new Set([...files.js, ...files.modulepreload]);
        Object.keys(files).forEach(
            (key) => (this.files[key] = Array.from(files[key]))
        );
        this._importMap = await esmx.getImportMapClientInfo(this.importmapMode);
    }
    /**
     * Generate resource preload tags
     * @description
     * The preload() method is used to generate resource preload tags, optimizing page performance by loading critical resources in advance:
     *
     * 1. **Resource Types**
     *    - CSS files: Use `as="style"` to preload stylesheets
     *    - JS files: Use `as="script"` to preload import map scripts
     *
     * 2. **Performance Optimization**
     *    - Discover and load critical resources in advance
     *    - Load in parallel with HTML parsing
     *    - Optimize resource loading order
     *    - Reduce page rendering blocking
     *
     * 3. **Best Practices**
     *    - Use as early as possible in the head
     *    - Only preload resources necessary for the current page
     *    - Use in conjunction with other resource loading methods
     *
     * @returns Returns HTML string containing all preload tags
     *
     * @example
     * ```ts
     * // Use in HTML head
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     <!-- Preload critical resources -->
     *     ${rc.preload()}
     *     <!-- Inject stylesheets -->
     *     ${rc.css()}
     *   </head>
     *   <body>
     *     ${html}
     *     ${rc.importmap()}
     *     ${rc.moduleEntry()}
     *     ${rc.modulePreload()}
     *   </body>
     *   </html>
     * `;
     * ```
     */
    public preload() {
        const { files, _importMap } = this;
        const list = files.css.map((url) => {
            return `<link rel="preload" href="${url}" as="style">`;
        });
        if (_importMap.src) {
            list.push(
                `<link rel="preload" href="${_importMap.src}" as="script">`
            );
        }
        return list.join('');
    }
    /**
     * Inject first-screen stylesheets
     * @description
     * The css() method is used to inject stylesheet resources required by the page:
     *
     * 1. **Injection Position**
     *    - Must be injected in the head tag
     *    - Avoid page flickering (FOUC) and reflow
     *    - Ensure styles are in place when content is rendered
     *
     * 2. **Performance Optimization**
     *    - Support critical CSS extraction
     *    - Automatically handle style dependency relationships
     *    - Utilize browser parallel loading capabilities
     *
     * 3. **Use Cases**
     *    - Inject styles necessary for the first screen
     *    - Handle component-level styles
     *    - Support theme switching and dynamic styles
     *
     * @example
     * ```ts
     * // 1. Basic usage
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     ${rc.preload()}  <!-- Preload resources -->
     *     ${rc.css()}      <!-- Inject stylesheets -->
     *   </head>
     *   <body>
     *     <div id="app">Hello World</div>
     *   </body>
     *   </html>
     * `;
     *
     * // 2. Use in conjunction with other resources
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     ${rc.preload()}  <!-- Preload resources -->
     *     ${rc.css()}      <!-- Inject stylesheets -->
     *   </head>
     *   <body>
     *     ${html}
     *     ${rc.importmap()}
     *     ${rc.moduleEntry()}
     *     ${rc.modulePreload()}
     *   </body>
     *   </html>
     * `;
     * ```
     */
    public css() {
        return this.files.css
            .map((url) => `<link rel="stylesheet" href="${url}">`)
            .join('');
    }
    /**
     * Inject module import map
     * @description
     * The importmap() method is used to inject path resolution rules for ESM modules:
     *
     * 1. **Injection Position**
     *    - Must be injected in the body
     *    - Must be executed before moduleEntry
     *    - Avoid blocking the first page render
     *
     * 2. **Import Map Modes**
     *    - Inline mode (inline):
     *      - Inline map content directly into HTML
     *      - Suitable for scenarios with smaller map content
     *      - Reduce the number of HTTP requests
     *    - JS file mode (js):
     *      - Generate independent JS files
     *      - Suitable for scenarios with larger map content
     *      - Can utilize browser caching mechanisms
     *
     * 3. **Technical Reasons**
     *    - Define path resolution rules for ESM modules
     *    - Client entry modules and their dependencies need to use these maps
     *    - Ensure the map is correctly set before executing module code
     *
     * @example
     * ```ts
     * // 1. Basic usage - Inline mode
     * const rc = await esmx.render({
     *   importmapMode: 'inline'  // Default mode
     * });
     *
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     ${rc.preload()}
     *     ${rc.css()}
     *   </head>
     *   <body>
     *     ${html}
     *     ${rc.importmap()}    <!-- Inject import map -->
     *     ${rc.moduleEntry()}  <!-- Execute after import map -->
     *     ${rc.modulePreload()}
     *   </body>
     *   </html>
     * `;
     *
     * // 2. JS file mode - Suitable for large applications
     * const rc = await esmx.render({
     *   importmapMode: 'js'  // Use JS file mode
     * });
     * ```
     */
    public importmap() {
        return this._importMap.code;
    }
    /**
     * Inject client entry module
     * @description
     * The moduleEntry() method is used to inject the client's entry module:
     * 1. **Injection Position**
     *    - Must be executed after importmap
     *    - Ensure the import map is correctly set before executing module code
     *    - Control the start timing of client activation (Hydration)
     *
     * 2. **Technical Reasons**
     *    - Serve as the entry point for client code
     *    - Need to wait for infrastructure (such as import maps) to be ready
     *    - Ensure correct module path resolution
     *
     * 3. **Use Cases**
     *    - Start the client application
     *    - Execute client activation
     *    - Initialize client state
     *
     * @example
     * ```ts
     * // 1. Basic usage
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     ${rc.preload()}
     *     ${rc.css()}
     *   </head>
     *   <body>
     *     ${html}
     *     ${rc.importmap()}    <!-- Inject import map first -->
     *     ${rc.moduleEntry()}  <!-- Then inject entry module -->
     *     ${rc.modulePreload()}
     *   </body>
     *   </html>
     * `;
     *
     * // 2. Multiple entry configuration
     * const rc = await esmx.render({
     *   entryName: 'mobile',  // Specify entry name
     *   params: { device: 'mobile' }
     * });
     * ```
     */
    public moduleEntry() {
        return `<script type="module">import "${this.esmx.name}/src/entry.client";</script>`;
    }

    /**
     * Preload module dependencies
     * @description
     * The modulePreload() method is used to preload modules that may be needed later:
     *
     * 1. **Injection Position**
     *    - Must be after importmap and moduleEntry
     *    - Ensure the correct module path mapping is used
     *    - Avoid competing with first-screen rendering for resources
     *
     * 2. **Performance Optimization**
     *    - Preload modules that may be needed later
     *    - Improve runtime performance
     *    - Optimize on-demand loading experience
     *
     * 3. **Technical Reasons**
     *    - Need correct path resolution rules
     *    - Avoid duplicate loading
     *    - Control loading priority
     *
     * @example
     * ```ts
     * // 1. Basic usage
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     ${rc.preload()}
     *     ${rc.css()}
     *   </head>
     *   <body>
     *     ${html}
     *     ${rc.importmap()}
     *     ${rc.moduleEntry()}
     *     ${rc.modulePreload()}  <!-- Preload module dependencies -->
     *   </body>
     *   </html>
     * `;
     *
     * // 2. Use with async components
     * const AsyncComponent = defineAsyncComponent(() =>
     *   import('./components/AsyncComponent.vue')
     * );
     * // modulePreload will automatically collect and preload dependencies of async components
     * ```
     */
    public modulePreload() {
        return this.files.modulepreload
            .map((url) => `<link rel="modulepreload" href="${url}">`)
            .join('');
    }
}

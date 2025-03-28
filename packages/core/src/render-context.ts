import path from 'node:path';
import serialize from 'serialize-javascript';
import type { Esmx } from './esmx';

/**
 * RenderContext 的配置选项接口
 *
 * @description
 * RenderContextOptions 用于配置 RenderContext 实例的行为，包括基础路径、入口名称、参数和导入映射模式等。
 *
 * @example
 * ```ts
 * // 1. 基础路径配置示例
 * // 支持将静态资源部署到不同的路径下
 * const rc = await esmx.render({
 *   // 设置基础路径为 /esmx，所有静态资源都会基于此路径加载
 *   base: '/esmx',
 *   // 其他配置...
 * });
 *
 * // 2. 多语言站点部署示例
 * // 通过不同的基础路径支持多语言站点
 * const rc = await esmx.render({
 *   base: '/cn',  // 中文站点
 *   params: { lang: 'zh-CN' }
 * });
 *
 * // 3. 导入映射模式配置示例
 * const rc = await esmx.render({
 *   // 使用内联模式，适合小型应用
 *   importmapMode: 'inline',
 *   // 其他配置...
 * });
 * ```
 */
export interface RenderContextOptions {
    /**
     * 静态资源的基础路径
     * @description
     * - 默认为空字符串
     * - 所有静态资源（JS、CSS、图片等）都会基于此路径加载
     * - 支持运行时动态配置，无需重新构建
     * - 常用于多语言站点、微前端应用等场景
     */
    base?: string;

    /**
     * 服务端渲染入口名称
     * @description
     * - 默认为 'default'
     * - 用于指定服务端渲染时使用的入口函数
     * - 当一个模块导出多个渲染函数时使用
     */
    entryName?: string;

    /**
     * 渲染参数
     * @description
     * - 可以传递任意类型的参数给渲染函数
     * - 常用于传递请求信息（URL、query 参数等）
     * - 在服务端渲染过程中可以通过 rc.params 访问
     */
    params?: Record<string, any>;

    /**
     * 定义 importmap 的生成模式
     *
     * @description
     * ImportmapMode 用于控制 importmap 的生成方式，支持两种模式：
     * - `inline`: 将 importmap 内容直接内联到 HTML 中（默认值），适用于以下场景：
     *   - 需要减少 HTTP 请求数量
     *   - importmap 内容较小
     *   - 对首屏加载性能要求较高
     * - `js`: 将 importmap 内容生成为独立的 JS 文件，适用于以下场景：
     *   - importmap 内容较大
     *   - 需要利用浏览器缓存机制
     *   - 多个页面共享相同的 importmap
     *
     * 默认值选择 'inline' 的原因：
     * 1. 简单直接
     *    - 减少额外的 HTTP 请求
     *    - 无需额外的资源管理
     *    - 适合大多数应用场景
     * 2. 首屏性能
     *    - 避免额外的网络请求
     *    - 确保导入映射立即可用
     *    - 减少页面加载时间
     * 3. 易于调试
     *    - 导入映射直接可见
     *    - 便于问题诊断
     *    - 简化开发流程
     *
     * @example
     * ```ts
     * // 使用内联模式（默认）
     * const rc = await esmx.render({
     *   params: { url: req.url }
     * });
     *
     * // 显式指定内联模式
     * const rc = await esmx.render({
     *   importmapMode: 'inline',
     *   params: { url: req.url }
     * });
     *
     * // 使用 JS 文件模式
     * const rc = await esmx.render({
     *   importmapMode: 'js',
     *   params: { url: req.url }
     * });
     * ```
     */
    importmapMode?: ImportmapMode;
}

/**
 * 服务端渲染函数
 */
export type ServerRenderHandle = (rc: RenderContext) => Promise<void>;

/**
 * 渲染资源文件列表接口
 * @description
 * RenderFiles 接口定义了服务端渲染过程中收集的各类静态资源：
 *
 * 1. **资源类型**
 *    - css: 样式表文件列表
 *    - modulepreload: 需要预加载的 ESM 模块列表
 *    - js: JavaScript 文件列表
 *    - resources: 其他资源文件列表
 *
 * 2. **使用场景**
 *    - 在 commit() 方法中自动收集
 *    - 通过 preload()、css() 等方法注入
 *    - 支持基础路径配置
 *
 * @example
 * ```ts
 * // 1. 资源收集
 * await rc.commit();
 *
 * // 2. 资源注入
 * rc.html = `
 *   <!DOCTYPE html>
 *   <html>
 *   <head>
 *     <!-- 预加载资源 -->
 *     ${rc.preload()}
 *     <!-- 注入样式表 -->
 *     ${rc.css()}
 *   </head>
 *   <body>
 *     ${html}
 *     <!-- 注入导入映射 -->
 *     ${rc.importmap()}
 *     <!-- 注入客户端入口 -->
 *     ${rc.moduleEntry()}
 *     <!-- 预加载模块 -->
 *     ${rc.modulePreload()}
 *   </body>
 *   </html>
 * `;
 * ```
 */
export interface RenderFiles {
    /**
     * JavaScript 文件列表
     */
    js: string[];
    /**
     * CSS 文件列表
     */
    css: string[];
    /**
     * 需要预加载的 ESM 模块列表
     */
    modulepreload: string[];
    /**
     * 其他资源文件列表（图片、字体等）
     */
    resources: string[];
}

/**
 * 定义 importmap 的生成模式
 *
 * @description
 * ImportmapMode 用于控制 importmap 的生成方式，支持两种模式：
 * - `inline`: 将 importmap 内容直接内联到 HTML 中（默认值），适用于以下场景：
 *   - 需要减少 HTTP 请求数量
 *   - importmap 内容较小
 *   - 对首屏加载性能要求较高
 * - `js`: 将 importmap 内容生成为独立的 JS 文件，适用于以下场景：
 *   - importmap 内容较大
 *   - 需要利用浏览器缓存机制
 *   - 多个页面共享相同的 importmap
 *
 * 默认值选择 'inline' 的原因：
 * 1. 简单直接
 *    - 减少额外的 HTTP 请求
 *    - 无需额外的资源管理
 *    - 适合大多数应用场景
 * 2. 首屏性能
 *    - 避免额外的网络请求
 *    - 确保导入映射立即可用
 *    - 减少页面加载时间
 * 3. 易于调试
 *    - 导入映射直接可见
 *    - 便于问题诊断
 *    - 简化开发流程
 *
 * @example
 * ```ts
 * // 使用内联模式（默认）
 * const rc = await esmx.render({
 *   params: { url: req.url }
 * });
 *
 * // 显式指定内联模式
 * const rc = await esmx.render({
 *   importmapMode: 'inline',
 *   params: { url: req.url }
 * });
 *
 * // 使用 JS 文件模式
 * const rc = await esmx.render({
 *   importmapMode: 'js',
 *   params: { url: req.url }
 * });
 * ```
 */
export type ImportmapMode = 'inline' | 'js';

/**
 * RenderContext 是 Esmx 框架中的核心类，负责服务端渲染（SSR）过程中的资源管理和 HTML 生成
 *
 * @description
 * RenderContext 具有以下核心特点：
 * 1. **基于 ESM 的模块系统**
 *    - 采用现代的 ECMAScript Modules 标准
 *    - 支持原生的模块导入导出
 *    - 实现了更好的代码分割和按需加载
 *
 * 2. **智能依赖收集**
 *    - 基于实际渲染路径动态收集依赖
 *    - 避免不必要的资源加载
 *    - 支持异步组件和动态导入
 *
 * 3. **精确的资源注入**
 *    - 严格控制资源加载顺序
 *    - 优化首屏加载性能
 *    - 确保客户端激活（Hydration）的可靠性
 *
 * 4. **灵活的配置机制**
 *    - 支持动态基础路径配置
 *    - 提供多种导入映射模式
 *    - 适应不同的部署场景
 *
 * @example
 * ```ts
 * export default async (rc: RenderContext) => {
 *     // 1. 渲染页面内容并收集依赖
 *     const app = createApp();
 *     const html = await renderToString(app, {
 *         importMetaSet: rc.importMetaSet
 *     });
 *
 *     // 2. 提交依赖收集
 *     await rc.commit();
 *
 *     // 3. 生成完整 HTML
 *     rc.html = `
 *         <!DOCTYPE html>
 *         <html>
 *         <head>
 *             <!-- 预加载 CSS 和 JS 资源，提前开始加载以优化性能 -->
 *             ${rc.preload()}
 *             <!-- 注入首屏样式表，避免页面闪烁 -->
 *             ${rc.css()}
 *         </head>
 *         <body>
 *             ${html}
 *             <!-- 注入模块导入映射，定义 ESM 模块的路径解析规则 -->
 *             ${rc.importmap()}
 *             <!-- 注入客户端入口模块，必须在 importmap 之后执行 -->
 *             ${rc.moduleEntry()}
 *             <!-- 预加载模块依赖，基于实际渲染收集的依赖进行优化加载 -->
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
     * 重定向地址
     * @description
     * - 默认为 null，表示不进行重定向
     * - 设置后，服务端可以根据此值进行 HTTP 重定向
     * - 常用于登录验证、权限控制等场景
     *
     * @example
     * ```ts
     * // 1. 登录验证示例
     * export default async (rc: RenderContext) => {
     *   if (!isLoggedIn()) {
     *     rc.redirect = '/login';
     *     rc.status = 302;
     *     return;
     *   }
     *   // 继续渲染页面...
     * };
     *
     * // 2. 权限控制示例
     * export default async (rc: RenderContext) => {
     *   if (!hasPermission()) {
     *     rc.redirect = '/403';
     *     rc.status = 403;
     *     return;
     *   }
     *   // 继续渲染页面...
     * };
     *
     * // 3. 服务端处理示例
     * app.use(async (req, res) => {
     *   const rc = await esmx.render({
     *     params: {
     *       url: req.url
     *     }
     *   });
     *
     *   // 处理重定向
     *   if (rc.redirect) {
     *     res.statusCode = rc.status || 302;
     *     res.setHeader('Location', rc.redirect);
     *     res.end();
     *     return;
     *   }
     *
     *   // 设置状态码
     *   if (rc.status) {
     *     res.statusCode = rc.status;
     *   }
     *
     *   // 响应 HTML 内容
     *   res.end(rc.html);
     * });
     * ```
     */
    public redirect: string | null = null;

    /**
     * HTTP 响应状态码
     * @description
     * - 默认为 null，表示使用 200 状态码
     * - 可以设置任意有效的 HTTP 状态码
     * - 常用于错误处理、重定向等场景
     * - 通常与 redirect 属性配合使用
     *
     * @example
     * ```ts
     * // 1. 404 错误处理示例
     * export default async (rc: RenderContext) => {
     *   const page = await findPage(rc.params.url);
     *   if (!page) {
     *     rc.status = 404;
     *     // 渲染 404 页面...
     *     return;
     *   }
     *   // 继续渲染页面...
     * };
     *
     * // 2. 临时重定向示例
     * export default async (rc: RenderContext) => {
     *   if (needMaintenance()) {
     *     rc.redirect = '/maintenance';
     *     rc.status = 307; // 临时重定向，保持请求方法不变
     *     return;
     *   }
     *   // 继续渲染页面...
     * };
     *
     * // 3. 服务端处理示例
     * app.use(async (req, res) => {
     *   const rc = await esmx.render({
     *     params: {
     *       url: req.url
     *     }
     *   });
     *
     *   // 处理重定向
     *   if (rc.redirect) {
     *     res.statusCode = rc.status || 302;
     *     res.setHeader('Location', rc.redirect);
     *     res.end();
     *     return;
     *   }
     *
     *   // 设置状态码
     *   if (rc.status) {
     *     res.statusCode = rc.status;
     *   }
     *
     *   // 响应 HTML 内容
     *   res.end(rc.html);
     * });
     * ```
     */
    public status: number | null = null;
    private _html = '';
    /**
     * 静态资源的基础路径
     * @description
     * base 属性用于控制静态资源的加载路径，是 Esmx 框架动态基础路径配置的核心：
     *
     * 1. **构建时处理**
     *    - 静态资源路径使用特殊占位符标记：`[[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/`
     *    - 占位符会被注入到所有静态资源的引用路径中
     *    - 支持 CSS、JavaScript、图片等各类静态资源
     *
     * 2. **运行时替换**
     *    - 通过 `esmx.render()` 的 `base` 参数设置实际基础路径
     *    - RenderContext 自动将 HTML 中的占位符替换为实际路径
     *
     * 3. **技术优势**
     *    - 部署灵活：同一套构建产物可部署到任意路径
     *    - 性能优化：保持静态资源的最佳缓存策略
     *    - 开发友好：简化多环境配置管理
     *
     * @example
     * ```ts
     * // 1. 基础用法
     * const rc = await esmx.render({
     *   base: '/esmx',  // 设置基础路径
     *   params: { url: req.url }
     * });
     *
     * // 2. 多语言站点示例
     * const rc = await esmx.render({
     *   base: '/cn',  // 中文站点
     *   params: { lang: 'zh-CN' }
     * });
     *
     * // 3. 微前端应用示例
     * const rc = await esmx.render({
     *   base: '/app1',  // 子应用1
     *   params: { appId: 1 }
     * });
     * ```
     */
    public readonly base: string;
    /**
     * 服务端渲染入口函数名称
     * @description
     * entryName 属性用于指定服务端渲染时使用的入口函数：
     *
     * 1. **基本用途**
     *    - 默认值为 'default'
     *    - 用于从 entry.server.ts 中选择要使用的渲染函数
     *    - 支持一个模块导出多个渲染函数的场景
     *
     * 2. **使用场景**
     *    - 多模板渲染：不同页面使用不同的渲染模板
     *    - A/B 测试：同一页面使用不同的渲染逻辑
     *    - 特殊渲染：某些页面需要自定义的渲染流程
     *
     * @example
     * ```ts
     * // 1. 默认入口函数
     * // entry.server.ts
     * export default async (rc: RenderContext) => {
     *   // 默认渲染逻辑
     * };
     *
     * // 2. 多个入口函数
     * // entry.server.ts
     * export const mobile = async (rc: RenderContext) => {
     *   // 移动端渲染逻辑
     * };
     *
     * export const desktop = async (rc: RenderContext) => {
     *   // 桌面端渲染逻辑
     * };
     *
     * // 3. 根据设备类型选择入口函数
     * const rc = await esmx.render({
     *   entryName: isMobile ? 'mobile' : 'desktop',
     *   params: { url: req.url }
     * });
     * ```
     */
    public readonly entryName: string;

    /**
     * 渲染参数
     * @description
     * params 属性用于在服务端渲染过程中传递和访问参数：
     *
     * 1. **参数类型**
     *    - 支持任意类型的键值对
     *    - 通过 Record<string, any> 类型定义
     *    - 在整个渲染生命周期中保持不变
     *
     * 2. **常见使用场景**
     *    - 传递请求信息（URL、query 参数等）
     *    - 设置页面配置（语言、主题等）
     *    - 注入环境变量（API 地址、版本号等）
     *    - 共享服务端状态（用户信息、权限等）
     *
     * 3. **访问方式**
     *    - 在服务端渲染函数中通过 rc.params 访问
     *    - 可以解构获取特定参数
     *    - 支持设置默认值
     *
     * @example
     * ```ts
     * // 1. 基础用法 - 传递 URL 和语言设置
     * const rc = await esmx.render({
     *   params: {
     *     url: req.url,
     *     lang: 'zh-CN'
     *   }
     * });
     *
     * // 2. 页面配置 - 设置主题和布局
     * const rc = await esmx.render({
     *   params: {
     *     theme: 'dark',
     *     layout: 'sidebar'
     *   }
     * });
     *
     * // 3. 环境配置 - 注入 API 地址
     * const rc = await esmx.render({
     *   params: {
     *     apiBaseUrl: process.env.API_BASE_URL,
     *     version: '1.0.0'
     *   }
     * });
     *
     * // 4. 在渲染函数中使用
     * export default async (rc: RenderContext) => {
     *   // 解构获取参数
     *   const { url, lang = 'en' } = rc.params;
     *
     *   // 根据参数执行不同逻辑
     *   if (lang === 'zh-CN') {
     *     // 中文版本处理...
     *   }
     *
     *   // 传递参数到组件
     *   const html = await renderToString(createApp({
     *     props: {
     *       currentUrl: url,
     *       language: lang
     *     }
     *   }));
     *
     *   // 设置 HTML
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
     * 模块依赖收集集合
     * @description
     * importMetaSet 是 Esmx 框架智能依赖收集机制的核心，用于在服务端渲染过程中追踪和记录模块依赖：
     *
     * 1. **按需收集**
     *    - 在组件实际渲染过程中自动追踪和记录模块依赖
     *    - 只收集当前页面渲染时真正使用到的资源
     *    - 精确记录每个组件的模块依赖关系
     *
     * 2. **性能优化**
     *    - 避免加载未使用的模块，显著减少首屏加载时间
     *    - 精确控制资源加载顺序，优化页面渲染性能
     *    - 自动生成最优的导入映射（Import Map）
     *
     * 3. **使用方式**
     *    - 在渲染函数中传递给 renderToString
     *    - 框架自动收集依赖，无需手动处理
     *    - 支持异步组件和动态导入的依赖收集
     *
     * @example
     * ```ts
     * // 1. 基础用法
     * const renderToString = (app: any, context: { importMetaSet: Set<ImportMeta> }) => {
     *   // 在渲染过程中自动收集模块依赖
     *   // 框架会在组件渲染时自动调用 context.importMetaSet.add(import.meta)
     *   // 开发者无需手动处理依赖收集
     *   return '<div id="app">Hello World</div>';
     * };
     *
     * // 使用示例
     * const app = createApp();
     * const html = await renderToString(app, {
     *   importMetaSet: rc.importMetaSet
     * });
     *
     * // 2. 提交依赖
     * await rc.commit();
     *
     * // 3. 生成 HTML
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     <!-- 基于收集的依赖自动注入资源 -->
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
     * 资源文件列表
     * @description
     * files 属性存储了在服务端渲染过程中收集到的所有静态资源文件路径：
     *
     * 1. **资源类型**
     *    - js: JavaScript 文件列表，包含所有脚本和模块
     *    - css: 样式表文件列表
     *    - modulepreload: 需要预加载的 ESM 模块列表
     *    - importmap: 导入映射文件列表
     *    - resources: 其他资源文件列表（图片、字体等）
     *
     * 2. **使用场景**
     *    - 在 commit() 方法中自动收集和分类资源
     *    - 通过 preload()、css() 等方法注入资源到 HTML
     *    - 支持基础路径配置，实现资源的动态加载
     *
     * @example
     * ```ts
     * // 1. 资源收集
     * await rc.commit();
     *
     * // 2. 资源注入
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     <!-- 预加载资源 -->
     *     ${rc.preload()}
     *     <!-- 注入样式表 -->
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
     * 定义 importmap 的生成模式
     *
     * @description
     * ImportmapMode 用于控制 importmap 的生成方式，支持两种模式：
     * - `inline`: 将 importmap 内容直接内联到 HTML 中（默认值），适用于以下场景：
     *   - 需要减少 HTTP 请求数量
     *   - importmap 内容较小
     *   - 对首屏加载性能要求较高
     * - `js`: 将 importmap 内容生成为独立的 JS 文件，适用于以下场景：
     *   - importmap 内容较大
     *   - 需要利用浏览器缓存机制
     *   - 多个页面共享相同的 importmap
     *
     * 默认值选择 'inline' 的原因：
     * 1. 简单直接
     *    - 减少额外的 HTTP 请求
     *    - 无需额外的资源管理
     *    - 适合大多数应用场景
     * 2. 首屏性能
     *    - 避免额外的网络请求
     *    - 确保导入映射立即可用
     *    - 减少页面加载时间
     * 3. 易于调试
     *    - 导入映射直接可见
     *    - 便于问题诊断
     *    - 简化开发流程
     *
     * @example
     * ```ts
     * // 使用内联模式（默认）
     * const rc = await esmx.render({
     *   params: { url: req.url }
     * });
     *
     * // 显式指定内联模式
     * const rc = await esmx.render({
     *   importmapMode: 'inline',
     *   params: { url: req.url }
     * });
     *
     * // 使用 JS 文件模式
     * const rc = await esmx.render({
     *   importmapMode: 'js',
     *   params: { url: req.url }
     * });
     * ```
     */
    public importmapMode: ImportmapMode;
    /**
     * HTML 内容
     * @description
     * html 属性用于设置和获取最终生成的 HTML 内容：
     *
     * 1. **基础路径替换**
     *    - 在设置 HTML 时自动处理基础路径占位符
     *    - 将 `[[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/` 替换为实际的 base 路径
     *    - 确保所有静态资源的引用路径正确
     *
     * 2. **使用场景**
     *    - 设置服务端渲染生成的 HTML 内容
     *    - 支持动态基础路径配置
     *    - 自动处理静态资源的引用路径
     *
     * @example
     * ```ts
     * // 1. 基础用法
     * export default async (rc: RenderContext) => {
     *   // 设置 HTML 内容
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
     * // 2. 动态基础路径
     * const rc = await esmx.render({
     *   base: '/app',  // 设置基础路径
     *   params: { url: req.url }
     * });
     *
     * // HTML 中的占位符会被自动替换：
     * // [[[___GEZ_DYNAMIC_BASE___]]]/your-app-name/css/style.css
     * // 替换为：
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
     * 将 JavaScript 对象序列化为字符串
     * @description
     * serialize 方法用于在服务端渲染过程中将状态数据序列化，以便传递到客户端：
     *
     * 1. **主要用途**
     *    - 序列化服务端状态数据
     *    - 确保数据可以安全地嵌入到 HTML 中
     *    - 支持复杂的数据结构（如 Date、RegExp 等）
     *
     * 2. **安全处理**
     *    - 自动转义特殊字符
     *    - 防止 XSS 攻击
     *    - 保持数据类型的完整性
     *
     * @example
     * ```ts
     * // 1. 基础用法 - 序列化状态数据
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
     *         // 将序列化后的状态注入到全局变量
     *         window.__INITIAL_STATE__ = ${rc.serialize(state)};
     *       </script>
     *     </head>
     *     <body>${html}</body>
     *     </html>
     *   `;
     * };
     *
     * // 2. 自定义序列化选项
     * const state = { sensitive: 'data' };
     * const serialized = rc.serialize(state, {
     *   isJSON: true,  // 使用 JSON 兼容模式
     *   unsafe: false  // 禁用不安全的序列化
     * });
     * ```
     *
     * @param {any} input - 要序列化的输入数据
     * @param {serialize.SerializeJSOptions} [options] - 序列化选项
     * @returns {string} 序列化后的字符串
     */
    public serialize(
        input: any,
        options?: serialize.SerializeJSOptions
    ): string {
        return serialize(input, options);
    }
    /**
     * 将状态数据序列化并注入到 HTML 中
     * @description
     * state 方法用于在服务端渲染时将状态数据序列化并注入到 HTML 中，以便客户端可以在激活时恢复这些状态：
     *
     * 1. **序列化机制**
     *    - 使用安全的序列化方法处理数据
     *    - 支持复杂的数据结构（对象、数组等）
     *    - 自动处理特殊字符和 XSS 防护
     *
     * 2. **使用场景**
     *    - 服务端状态同步到客户端
     *    - 初始化客户端应用状态
     *    - 实现无缝的服务端渲染到客户端激活
     *
     * @param varName 全局变量名，用于在客户端访问注入的数据
     * @param data 需要序列化的数据对象
     * @returns 包含序列化数据的 script 标签字符串
     *
     * @example
     * ```ts
     * // 1. 基础用法 - 注入用户信息
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
     * // 2. 客户端使用
     * // 在客户端可以直接访问注入的数据
     * const userInfo = window.__USER__;
     * console.log(userInfo.name); // 输出: 'John'
     *
     * // 3. 复杂数据结构
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
     * 提交依赖收集并更新资源列表
     * @description
     * commit 方法是 RenderContext 依赖收集机制的核心，负责处理所有收集到的模块依赖并更新文件资源列表：
     *
     * 1. **依赖处理流程**
     *    - 从 importMetaSet 中收集所有使用到的模块
     *    - 基于 manifest 文件解析每个模块的具体资源
     *    - 处理 JS、CSS、资源文件等不同类型的依赖
     *    - 自动处理模块预加载和导入映射
     *
     * 2. **资源分类**
     *    - js: JavaScript 文件，包含所有脚本和模块
     *    - css: 样式表文件
     *    - modulepreload: 需要预加载的 ESM 模块
     *    - importmap: 导入映射文件
     *    - resources: 其他资源文件（图片、字体等）
     *
     * 3. **路径处理**
     *    - 自动添加基础路径前缀
     *    - 确保资源路径的正确性
     *    - 支持多应用场景的资源隔离
     *
     * @example
     * ```ts
     * // 1. 基础用法
     * export default async (rc: RenderContext) => {
     *   // 渲染页面并收集依赖
     *   const app = createApp();
     *   const html = await renderToString(app, {
     *     importMetaSet: rc.importMetaSet
     *   });
     *
     *   // 提交依赖收集
     *   await rc.commit();
     *
     *   // 生成 HTML
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
     * // 2. 多应用场景
     * const rc = await esmx.render({
     *   base: '/app1',  // 设置基础路径
     *   params: { appId: 1 }
     * });
     *
     * // 渲染并提交依赖
     * const html = await renderApp(rc);
     * await rc.commit();
     *
     * // 资源路径会自动添加基础路径前缀
     * // 例如：/app1/your-app-name/js/main.js
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
     * 生成资源预加载标签
     * @description
     * preload() 方法用于生成资源预加载标签，通过提前加载关键资源来优化页面性能：
     *
     * 1. **资源类型**
     *    - CSS 文件：使用 `as="style"` 预加载样式表
     *    - JS 文件：使用 `as="script"` 预加载导入映射脚本
     *
     * 2. **性能优化**
     *    - 提前发现并加载关键资源
     *    - 与 HTML 解析并行加载
     *    - 优化资源加载顺序
     *    - 减少页面渲染阻塞
     *
     * 3. **最佳实践**
     *    - 在 head 中尽早使用
     *    - 只预加载当前页面必需的资源
     *    - 与其他资源加载方法配合使用
     *
     * @returns 返回包含所有预加载标签的 HTML 字符串
     *
     * @example
     * ```ts
     * // 在 HTML head 中使用
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     <!-- 预加载关键资源 -->
     *     ${rc.preload()}
     *     <!-- 注入样式表 -->
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
     * 注入首屏样式表
     * @description
     * css() 方法用于注入页面所需的样式表资源：
     *
     * 1. **注入位置**
     *    - 必须在 head 标签中注入
     *    - 避免页面闪烁（FOUC）和重排
     *    - 确保样式在内容渲染时就位
     *
     * 2. **性能优化**
     *    - 支持关键 CSS 提取
     *    - 自动处理样式依赖关系
     *    - 利用浏览器并行加载能力
     *
     * 3. **使用场景**
     *    - 注入首屏必需的样式
     *    - 处理组件级别的样式
     *    - 支持主题切换和动态样式
     *
     * @example
     * ```ts
     * // 1. 基础用法
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     ${rc.preload()}  <!-- 预加载资源 -->
     *     ${rc.css()}      <!-- 注入样式表 -->
     *   </head>
     *   <body>
     *     <div id="app">Hello World</div>
     *   </body>
     *   </html>
     * `;
     *
     * // 2. 与其他资源配合使用
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     ${rc.preload()}  <!-- 预加载资源 -->
     *     ${rc.css()}      <!-- 注入样式表 -->
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
     * 注入模块导入映射
     * @description
     * importmap() 方法用于注入 ESM 模块的路径解析规则：
     *
     * 1. **注入位置**
     *    - 必须在 body 中注入
     *    - 必须在 moduleEntry 之前执行
     *    - 避免阻塞页面首次渲染
     *
     * 2. **导入映射模式**
     *    - 内联模式（inline）：
     *      - 将映射内容直接内联到 HTML 中
     *      - 适合映射内容较小的场景
     *      - 减少 HTTP 请求数量
     *    - JS 文件模式（js）：
     *      - 生成独立的 JS 文件
     *      - 适合映射内容较大的场景
     *      - 可以利用浏览器缓存机制
     *
     * 3. **技术原因**
     *    - 定义了 ESM 模块的路径解析规则
     *    - 客户端入口模块和其依赖都需要使用这些映射
     *    - 确保在执行模块代码前已正确设置映射
     *
     * @example
     * ```ts
     * // 1. 基础用法 - 内联模式
     * const rc = await esmx.render({
     *   importmapMode: 'inline'  // 默认模式
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
     *     ${rc.importmap()}    <!-- 注入导入映射 -->
     *     ${rc.moduleEntry()}  <!-- 在导入映射之后执行 -->
     *     ${rc.modulePreload()}
     *   </body>
     *   </html>
     * `;
     *
     * // 2. JS 文件模式 - 适合大型应用
     * const rc = await esmx.render({
     *   importmapMode: 'js'  // 使用 JS 文件模式
     * });
     * ```
     */
    public importmap() {
        return this._importMap.code;
    }
    /**
     * 注入客户端入口模块
     * @description
     * moduleEntry() 方法用于注入客户端的入口模块：
     * 1. **注入位置**
     *    - 必须在 importmap 之后执行
     *    - 确保在执行模块代码前已正确设置导入映射
     *    - 控制客户端激活（Hydration）的开始时机
     *
     * 2. **技术原因**
     *    - 作为客户端代码的入口点
     *    - 需要等待基础设施（如导入映射）就绪
     *    - 确保正确的模块路径解析
     *
     * 3. **使用场景**
     *    - 启动客户端应用
     *    - 执行客户端激活
     *    - 初始化客户端状态
     *
     * @example
     * ```ts
     * // 1. 基础用法
     * rc.html = `
     *   <!DOCTYPE html>
     *   <html>
     *   <head>
     *     ${rc.preload()}
     *     ${rc.css()}
     *   </head>
     *   <body>
     *     ${html}
     *     ${rc.importmap()}    <!-- 先注入导入映射 -->
     *     ${rc.moduleEntry()}  <!-- 再注入入口模块 -->
     *     ${rc.modulePreload()}
     *   </body>
     *   </html>
     * `;
     *
     * // 2. 多入口配置
     * const rc = await esmx.render({
     *   entryName: 'mobile',  // 指定入口名称
     *   params: { device: 'mobile' }
     * });
     * ```
     */
    public moduleEntry() {
        return `<script type="module">import "${this.esmx.name}/src/entry.client";</script>`;
    }

    /**
     * 预加载模块依赖
     * @description
     * modulePreload() 方法用于预加载后续可能用到的模块：
     *
     * 1. **注入位置**
     *    - 必须在 importmap 和 moduleEntry 之后
     *    - 确保使用正确的模块路径映射
     *    - 避免与首屏渲染竞争资源
     *
     * 2. **性能优化**
     *    - 预加载后续可能用到的模块
     *    - 提升运行时性能
     *    - 优化按需加载体验
     *
     * 3. **技术原因**
     *    - 需要正确的路径解析规则
     *    - 避免重复加载
     *    - 控制加载优先级
     *
     * @example
     * ```ts
     * // 1. 基础用法
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
     *     ${rc.modulePreload()}  <!-- 预加载模块依赖 -->
     *   </body>
     *   </html>
     * `;
     *
     * // 2. 与异步组件配合使用
     * const AsyncComponent = defineAsyncComponent(() =>
     *   import('./components/AsyncComponent.vue')
     * );
     * // modulePreload 会自动收集并预加载异步组件的依赖
     * ```
     */
    public modulePreload() {
        return this.files.modulepreload
            .map((url) => `<link rel="modulepreload" href="${url}">`)
            .join('');
    }
}

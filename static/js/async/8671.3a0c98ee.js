"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([["8671"],{3968:function(e,s,n){n.r(s),n.d(s,{default:()=>l});var r=n(1549),c=n(6603),d=n(2231);function i(e){let s=Object.assign({h1:"h1",a:"a",p:"p",h2:"h2",code:"code",h3:"h3",pre:"pre",ul:"ul",li:"li",strong:"strong"},(0,c.ah)(),e.components);return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)(s.h1,{id:"esmxrspack",children:["@esmx/rspack",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#esmxrspack",children:"#"})]}),"\n",(0,r.jsx)(s.p,{children:"Rspack 包提供了一套用于创建和配置 Rspack 应用的 API，支持标准应用和 HTML 应用的构建与开发。"}),"\n",(0,r.jsxs)(s.h2,{id:"安装",children:["安装",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#安装",children:"#"})]}),"\n",(0,r.jsxs)(s.p,{children:["使用包管理器安装 ",(0,r.jsx)(s.code,{children:"@esmx/rspack"})," 开发依赖："]}),"\n",(0,r.jsx)(d.SU,{command:"install @esmx/rspack -D"}),"\n",(0,r.jsxs)(s.h2,{id:"类型导出",children:["类型导出",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#类型导出",children:"#"})]}),"\n",(0,r.jsxs)(s.h3,{id:"buildtarget",children:["BuildTarget",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#buildtarget",children:"#"})]}),"\n",(0,r.jsx)(s.pre,{children:(0,r.jsx)(s.code,{className:"language-ts",children:"type BuildTarget = 'node' | 'client' | 'server'\n"})}),"\n",(0,r.jsx)(s.p,{children:"构建目标环境类型，定义了应用程序的构建目标环境，用于配置构建过程中的特定优化和功能："}),"\n",(0,r.jsxs)(s.ul,{children:["\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"node"}),": 构建为 Node.js 环境运行的代码"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"client"}),": 构建为浏览器环境运行的代码"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"server"}),": 构建为服务端环境运行的代码"]}),"\n"]}),"\n",(0,r.jsxs)(s.h3,{id:"rspackappconfigcontext",children:["RspackAppConfigContext",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#rspackappconfigcontext",children:"#"})]}),"\n",(0,r.jsx)(s.pre,{children:(0,r.jsx)(s.code,{className:"language-ts",children:"interface RspackAppConfigContext {\n  esmx: Esmx\n  buildTarget: BuildTarget\n  config: RspackOptions\n  options: RspackAppOptions\n}\n"})}),"\n",(0,r.jsx)(s.p,{children:"Rspack 应用配置上下文接口，提供了在配置钩子函数中可以访问的上下文信息："}),"\n",(0,r.jsxs)(s.ul,{children:["\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"esmx"}),": Esmx 框架实例"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"buildTarget"}),": 当前的构建目标（client/server/node）"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"config"}),": Rspack 配置对象"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"options"}),": 应用配置选项"]}),"\n"]}),"\n",(0,r.jsxs)(s.h3,{id:"rspackappoptions",children:["RspackAppOptions",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#rspackappoptions",children:"#"})]}),"\n",(0,r.jsx)(s.pre,{children:(0,r.jsx)(s.code,{className:"language-ts",children:"interface RspackAppOptions {\n  css?: 'css' | 'js' | false\n  loaders?: {\n    styleLoader?: string\n  }\n  styleLoader?: Record<string, any>\n  cssLoader?: Record<string, any>\n  target?: {\n    web?: string[]\n    node?: string[]\n  }\n  definePlugin?: Record<string, any>\n  config?: (context: RspackAppConfigContext) => void | Promise<void>\n}\n"})}),"\n",(0,r.jsx)(s.p,{children:"Rspack 应用配置选项接口："}),"\n",(0,r.jsxs)(s.ul,{children:["\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"css"}),": CSS 输出方式，可选 'css'（独立文件）或 'js'（打包到JS中），默认根据环境自动选择：生产环境使用'css'以优化缓存和并行加载，开发环境使用'js'以支持热更新(HMR)"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"loaders"}),": 自定义 loader 配置"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"styleLoader"}),": style-loader 配置选项"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"cssLoader"}),": css-loader 配置选项"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"target"}),": 构建目标兼容性配置"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"definePlugin"}),": 全局常量定义"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"config"}),": 配置钩子函数"]}),"\n"]}),"\n",(0,r.jsxs)(s.h3,{id:"rspackhtmlappoptions",children:["RspackHtmlAppOptions",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#rspackhtmlappoptions",children:"#"})]}),"\n",(0,r.jsxs)(s.p,{children:["继承自 ",(0,r.jsx)(s.code,{children:"RspackAppOptions"}),"，用于配置 HTML 应用的特定选项。"]}),"\n",(0,r.jsxs)(s.h2,{id:"函数导出",children:["函数导出",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#函数导出",children:"#"})]}),"\n",(0,r.jsxs)(s.h3,{id:"createrspackapp",children:["createRspackApp",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#createrspackapp",children:"#"})]}),"\n",(0,r.jsx)(s.pre,{children:(0,r.jsx)(s.code,{className:"language-ts",children:"function createRspackApp(esmx: Esmx, options?: RspackAppOptions): Promise<App>\n"})}),"\n",(0,r.jsx)(s.p,{children:"创建一个标准的 Rspack 应用实例。"}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.strong,{children:"参数："})}),"\n",(0,r.jsxs)(s.ul,{children:["\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"esmx"}),": Esmx 框架实例"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"options"}),": Rspack 应用配置选项"]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.strong,{children:"返回值："})}),"\n",(0,r.jsxs)(s.ul,{children:["\n",(0,r.jsx)(s.li,{children:"返回一个 Promise，解析为创建的应用实例"}),"\n"]}),"\n",(0,r.jsxs)(s.h3,{id:"createrspackhtmlapp",children:["createRspackHtmlApp",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#createrspackhtmlapp",children:"#"})]}),"\n",(0,r.jsx)(s.pre,{children:(0,r.jsx)(s.code,{className:"language-ts",children:"function createRspackHtmlApp(esmx: Esmx, options?: RspackHtmlAppOptions): Promise<App>\n"})}),"\n",(0,r.jsx)(s.p,{children:"创建一个 HTML 类型的 Rspack 应用实例。"}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.strong,{children:"参数："})}),"\n",(0,r.jsxs)(s.ul,{children:["\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"esmx"}),": Esmx 框架实例"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"options"}),": HTML 应用配置选项"]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.strong,{children:"返回值："})}),"\n",(0,r.jsxs)(s.ul,{children:["\n",(0,r.jsx)(s.li,{children:"返回一个 Promise，解析为创建的 HTML 应用实例"}),"\n"]}),"\n",(0,r.jsxs)(s.h2,{id:"常量导出",children:["常量导出",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#常量导出",children:"#"})]}),"\n",(0,r.jsxs)(s.h3,{id:"rspack_loader",children:["RSPACK_LOADER",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#rspack_loader",children:"#"})]}),"\n",(0,r.jsx)(s.pre,{children:(0,r.jsx)(s.code,{className:"language-ts",children:"const RSPACK_LOADER: Record<string, string> = {\n  builtinSwcLoader: 'builtin:swc-loader',\n  lightningcssLoader: 'builtin:lightningcss-loader',\n  styleLoader: 'style-loader',\n  cssLoader: 'css-loader',\n  lessLoader: 'less-loader',\n  styleResourcesLoader: 'style-resources-loader',\n  workerRspackLoader: 'worker-rspack-loader'\n}\n"})}),"\n",(0,r.jsx)(s.p,{children:"Rspack 内置的 loader 标识符映射对象，提供了常用的 loader 名称常量："}),"\n",(0,r.jsxs)(s.ul,{children:["\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"builtinSwcLoader"}),": Rspack 内置的 SWC loader，用于处理 TypeScript/JavaScript 文件"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"lightningcssLoader"}),": Rspack 内置的 lightningcss loader，用于处理 CSS 文件的高性能编译器"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"styleLoader"}),": 用于将 CSS 注入到 DOM 中的 loader"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"cssLoader"}),": 用于解析 CSS 文件和处理 CSS 模块化的 loader"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"lessLoader"}),": 用于将 Less 文件编译为 CSS 的 loader"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"styleResourcesLoader"}),": 用于自动导入全局样式资源（如变量、mixins）的 loader"]}),"\n",(0,r.jsxs)(s.li,{children:[(0,r.jsx)(s.code,{children:"workerRspackLoader"}),": 用于处理 Web Worker 文件的 loader"]}),"\n"]}),"\n",(0,r.jsx)(s.p,{children:"使用这些常量可以在配置中引用内置的 loader，避免手动输入字符串："}),"\n",(0,r.jsx)(s.pre,{children:(0,r.jsx)(s.code,{className:"language-ts",meta:'title="src/entry.node.ts"',children:"import { RSPACK_LOADER } from '@esmx/rspack';\n\nexport default {\n  async devApp(esmx) {\n    return import('@esmx/rspack').then((m) =>\n      m.createRspackHtmlApp(esmx, {\n        loaders: {\n          // 使用常量引用 loader\n          styleLoader: RSPACK_LOADER.styleLoader,\n          cssLoader: RSPACK_LOADER.cssLoader,\n          lightningcssLoader: RSPACK_LOADER.lightningcssLoader\n        }\n      })\n    );\n  }\n};\n"})}),"\n",(0,r.jsx)(s.p,{children:(0,r.jsx)(s.strong,{children:"注意事项："})}),"\n",(0,r.jsxs)(s.ul,{children:["\n",(0,r.jsx)(s.li,{children:"这些 loader 已经内置在 Rspack 中，无需额外安装"}),"\n",(0,r.jsx)(s.li,{children:"在自定义 loader 配置时，可以使用这些常量来替换默认的 loader 实现"}),"\n",(0,r.jsxs)(s.li,{children:["某些 loader（如 ",(0,r.jsx)(s.code,{children:"builtinSwcLoader"}),"）有特定的配置选项，请参考相应的配置文档"]}),"\n"]}),"\n",(0,r.jsxs)(s.h2,{id:"模块导出",children:["模块导出",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#模块导出",children:"#"})]}),"\n",(0,r.jsxs)(s.h3,{id:"rspack",children:["rspack",(0,r.jsx)(s.a,{className:"header-anchor","aria-hidden":"true",href:"#rspack",children:"#"})]}),"\n",(0,r.jsxs)(s.p,{children:["重导出 ",(0,r.jsx)(s.code,{children:"@rspack/core"})," 包的所有内容，提供完整的 Rspack 核心功能。"]})]})}function a(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:s}=Object.assign({},(0,c.ah)(),e.components);return s?(0,r.jsx)(s,{...e,children:(0,r.jsx)(i,{...e})}):i(e)}let l=a;a.__RSPRESS_PAGE_META={},a.__RSPRESS_PAGE_META["zh%2Fapi%2Fapp%2Frspack.mdx"]={toc:[{text:"安装",id:"安装",depth:2},{text:"类型导出",id:"类型导出",depth:2},{text:"BuildTarget",id:"buildtarget",depth:3},{text:"RspackAppConfigContext",id:"rspackappconfigcontext",depth:3},{text:"RspackAppOptions",id:"rspackappoptions",depth:3},{text:"RspackHtmlAppOptions",id:"rspackhtmlappoptions",depth:3},{text:"函数导出",id:"函数导出",depth:2},{text:"createRspackApp",id:"createrspackapp",depth:3},{text:"createRspackHtmlApp",id:"createrspackhtmlapp",depth:3},{text:"常量导出",id:"常量导出",depth:2},{text:"RSPACK_LOADER",id:"rspack_loader",depth:3},{text:"模块导出",id:"模块导出",depth:2},{text:"rspack",id:"rspack",depth:3}],title:"@esmx/rspack",headingTitle:"@esmx/rspack",frontmatter:{titleSuffix:"Esmx 框架 Rspack 构建工具",description:"Esmx 框架的 Rspack 构建工具，提供高性能的应用构建能力，支持标准应用和 HTML 应用的开发与构建，内置多种资源处理器和优化配置。",head:[["meta",{property:"keywords",content:"Esmx, Rspack, 构建工具, 应用构建, HTML 应用, TypeScript, CSS, 资源处理, 性能优化"}]]}}}}]);
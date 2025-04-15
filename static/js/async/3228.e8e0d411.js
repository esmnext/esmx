"use strict";(self.webpackChunkdocs=self.webpackChunkdocs||[]).push([["3228"],{4285:function(e,n,r){r.r(n),r.d(n,{default:()=>c});var t=r(1549),s=r(6603);function i(e){let n=Object.assign({h1:"h1",a:"a",p:"p",h2:"h2",pre:"pre",code:"code",h3:"h3",ol:"ol",li:"li"},(0,s.ah)(),e.components);return(0,t.jsxs)(t.Fragment,{children:[(0,t.jsxs)(n.h1,{id:"vue2",children:["Vue2",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#vue2",children:"#"})]}),"\n",(0,t.jsx)(n.p,{children:"This tutorial will guide you through building a Vue2 SSR application with Esmx from the ground up. We'll demonstrate how to create a server-side rendered application using the Esmx framework through a complete example."}),"\n",(0,t.jsxs)(n.h2,{id:"project-structure",children:["Project Structure",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#project-structure",children:"#"})]}),"\n",(0,t.jsx)(n.p,{children:"First, let's understand the basic project structure:"}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:".\n├── package.json         # Project configuration file defining dependencies and scripts\n├── tsconfig.json       # TypeScript configuration file with compilation options\n└── src                 # Source code directory\n    ├── app.vue         # Main application component defining page structure and logic\n    ├── create-app.ts   # Vue instance factory for application initialization\n    ├── entry.client.ts # Client entry file handling browser-side rendering\n    ├── entry.node.ts   # Node.js server entry file for dev environment setup\n    └── entry.server.ts # Server entry file handling SSR rendering logic\n"})}),"\n",(0,t.jsxs)(n.h2,{id:"project-configuration",children:["Project Configuration",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#project-configuration",children:"#"})]}),"\n",(0,t.jsxs)(n.h3,{id:"packagejson",children:["package.json",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#packagejson",children:"#"})]}),"\n",(0,t.jsxs)(n.p,{children:["Create the ",(0,t.jsx)(n.code,{children:"package.json"})," file to configure project dependencies and scripts:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-json",meta:'title="package.json"',children:'{\n  "name": "ssr-demo-vue2",\n  "version": "1.0.0",\n  "type": "module",\n  "private": true,\n  "scripts": {\n    "dev": "esmx dev",\n    "build": "npm run build:dts && npm run build:ssr",\n    "build:ssr": "esmx build",\n    "preview": "esmx preview",\n    "start": "NODE_ENV=production node dist/index.mjs",\n    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"\n  },\n  "dependencies": {\n    "@esmx/core": "*"\n  },\n  "devDependencies": {\n    "@esmx/rspack-vue": "*",\n    "@types/node": "22.8.6",\n    "typescript": "^5.7.3",\n    "vue": "^2.7.16",\n    "vue-server-renderer": "^2.7.16",\n    "vue-tsc": "^2.1.6"\n  }\n}\n'})}),"\n",(0,t.jsxs)(n.p,{children:["After creating the ",(0,t.jsx)(n.code,{children:"package.json"})," file, install project dependencies using any of these commands:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"pnpm install\n# or\nyarn install\n# or\nnpm install\n"})}),"\n",(0,t.jsx)(n.p,{children:"This will install all required dependencies including Vue2, TypeScript, and SSR-related packages."}),"\n",(0,t.jsxs)(n.h3,{id:"tsconfigjson",children:["tsconfig.json",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#tsconfigjson",children:"#"})]}),"\n",(0,t.jsxs)(n.p,{children:["Create the ",(0,t.jsx)(n.code,{children:"tsconfig.json"})," file to configure TypeScript compilation:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-json",meta:'title="tsconfig.json"',children:'{\n    "compilerOptions": {\n        "module": "ESNext",\n        "moduleResolution": "node",\n        "isolatedModules": true,\n        "resolveJsonModule": true,\n        \n        "target": "ESNext",\n        "lib": ["ESNext", "DOM"],\n        \n        "strict": true,\n        "skipLibCheck": true,\n        "types": ["@types/node"],\n        \n        "experimentalDecorators": true,\n        "allowSyntheticDefaultImports": true,\n        \n        "baseUrl": ".",\n        "paths": {\n            "ssr-demo-vue2/src/*": ["./src/*"],\n            "ssr-demo-vue2/*": ["./*"]\n        }\n    },\n    "include": ["src"],\n    "exclude": ["dist", "node_modules"]\n}\n'})}),"\n",(0,t.jsxs)(n.h2,{id:"source-code-structure",children:["Source Code Structure",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#source-code-structure",children:"#"})]}),"\n",(0,t.jsxs)(n.h3,{id:"appvue",children:["app.vue",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#appvue",children:"#"})]}),"\n",(0,t.jsxs)(n.p,{children:["Create the main application component ",(0,t.jsx)(n.code,{children:"src/app.vue"})," using ",(0,t.jsx)(n.code,{children:"<script setup>"})," syntax:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-html",meta:'title="src/app.vue"',children:'<template>\n    <div id="app">\n        <h1><a href="https://www.esmnext.com/guide/frameworks/vue2.html" target="_blank">Esmx Quick Start</a></h1>\n        <time :datetime="time">{{ time }}</time>\n    </div>\n</template>\n\n<script setup lang="ts">\n/**\n * @file Example component\n * @description Displays a page title with auto-updating time to demonstrate Esmx framework basics\n */\n\nimport { onMounted, onUnmounted, ref } from \'vue\';\n\n// Current time updating every second\nconst time = ref(new Date().toISOString());\nlet timer: NodeJS.Timeout;\n\nonMounted(() => {\n    timer = setInterval(() => {\n        time.value = new Date().toISOString();\n    }, 1000);\n});\n\nonUnmounted(() => {\n    clearInterval(timer);\n});\n<\/script>\n'})}),"\n",(0,t.jsxs)(n.h3,{id:"create-appts",children:["create-app.ts",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#create-appts",children:"#"})]}),"\n",(0,t.jsxs)(n.p,{children:["Create ",(0,t.jsx)(n.code,{children:"src/create-app.ts"})," to handle Vue application instance creation:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",meta:'title="src/create-app.ts"',children:"/**\n * @file Vue instance creation\n * @description Creates and configures Vue application instances\n */\n\nimport Vue from 'vue';\nimport App from './app.vue';\n\nexport function createApp() {\n    const app = new Vue({\n        render: (h) => h(App)\n    });\n    return {\n        app\n    };\n}\n"})}),"\n",(0,t.jsxs)(n.h3,{id:"entryclientts",children:["entry.client.ts",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#entryclientts",children:"#"})]}),"\n",(0,t.jsxs)(n.p,{children:["Create the client entry file ",(0,t.jsx)(n.code,{children:"src/entry.client.ts"}),":"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",meta:'title="src/entry.client.ts"',children:"/**\n * @file Client entry file\n * @description Handles client-side interaction logic and dynamic updates\n */\n\nimport { createApp } from './create-app';\n\n// Create Vue instance\nconst { app } = createApp();\n\n// Mount Vue instance\napp.$mount('#app');\n"})}),"\n",(0,t.jsxs)(n.h3,{id:"entrynodets",children:["entry.node.ts",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#entrynodets",children:"#"})]}),"\n",(0,t.jsxs)(n.p,{children:["Create ",(0,t.jsx)(n.code,{children:"entry.node.ts"})," for development environment configuration:"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",meta:'title="src/entry.node.ts"',children:"/**\n * @file Node.js server entry file\n * @description Configures development environment and server startup for SSR runtime\n */\n\nimport http from 'node:http';\nimport type { EsmxOptions } from '@esmx/core';\n\nexport default {\n    /**\n     * Configures development environment application creator\n     * @description Creates and configures Rspack application instance for development builds and HMR\n     * @param esmx Esmx framework instance providing core functionality\n     * @returns Configured Rspack application instance with HMR support\n     */\n    async devApp(esmx) {\n        return import('@esmx/rspack-vue').then((m) =>\n            m.createRspackVue2App(esmx, {\n                config(context) {\n                    // Custom Rspack compilation configuration\n                }\n            })\n        );\n    },\n\n    /**\n     * Configures and starts HTTP server\n     * @description Creates HTTP server with Esmx middleware for SSR requests\n     * @param esmx Esmx framework instance providing middleware and rendering\n     */\n    async server(esmx) {\n        const server = http.createServer((req, res) => {\n            // Process requests with Esmx middleware\n            esmx.middleware(req, res, async () => {\n                // Perform server-side rendering\n                const rc = await esmx.render({\n                    params: { url: req.url }\n                });\n                res.end(rc.html);\n            });\n        });\n\n        server.listen(3000, () => {\n            console.log('Server started: http://localhost:3000');\n        });\n    }\n} satisfies EsmxOptions;\n"})}),"\n",(0,t.jsx)(n.p,{children:"This file serves as the entry point for development environment configuration and server startup, containing two core functions:"}),"\n",(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"devApp"}),": Creates and configures the Rspack application instance for development with HMR support using ",(0,t.jsx)(n.code,{children:"createRspackVue2App"}),"."]}),"\n",(0,t.jsxs)(n.li,{children:[(0,t.jsx)(n.code,{children:"server"}),": Creates and configures the HTTP server with Esmx middleware for SSR requests."]}),"\n"]}),"\n",(0,t.jsxs)(n.h3,{id:"entryserverts",children:["entry.server.ts",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#entryserverts",children:"#"})]}),"\n",(0,t.jsxs)(n.p,{children:["Create the SSR entry file ",(0,t.jsx)(n.code,{children:"src/entry.server.ts"}),":"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-ts",meta:'title="src/entry.server.ts"',children:"/**\n * @file Server-side rendering entry file\n * @description Handles SSR process, HTML generation and resource injection\n */\n\nimport type { RenderContext } from '@esmx/core';\nimport { createRenderer } from 'vue-server-renderer';\nimport { createApp } from './create-app';\n\n// Create renderer\nconst renderer = createRenderer();\n\nexport default async (rc: RenderContext) => {\n    // Create Vue application instance\n    const { app } = createApp();\n\n    // Generate page content with Vue's renderToString\n    const html = await renderer.renderToString(app, {\n        importMetaSet: rc.importMetaSet\n    });\n\n    // Commit dependency collection to ensure all required resources are loaded\n    await rc.commit();\n\n    // Generate complete HTML structure\n    rc.html = `<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    ${rc.preload()}\n    <title>Esmx Quick Start</title>\n    ${rc.css()}\n</head>\n<body>\n    ${html}\n    ${rc.importmap()}\n    ${rc.moduleEntry()}\n    ${rc.modulePreload()}\n</body>\n</html>\n`;\n};\n"})}),"\n",(0,t.jsxs)(n.h2,{id:"running-the-project",children:["Running the Project",(0,t.jsx)(n.a,{className:"header-anchor","aria-hidden":"true",href:"#running-the-project",children:"#"})]}),"\n",(0,t.jsx)(n.p,{children:"After completing the configuration, use these commands to run the project:"}),"\n",(0,t.jsxs)(n.ol,{children:["\n",(0,t.jsx)(n.li,{children:"Development mode:"}),"\n"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"npm run dev\n"})}),"\n",(0,t.jsxs)(n.ol,{start:"2",children:["\n",(0,t.jsx)(n.li,{children:"Build project:"}),"\n"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"npm run build\n"})}),"\n",(0,t.jsxs)(n.ol,{start:"3",children:["\n",(0,t.jsx)(n.li,{children:"Production run:"}),"\n"]}),"\n",(0,t.jsx)(n.pre,{children:(0,t.jsx)(n.code,{className:"language-bash",children:"npm run start\n"})}),"\n",(0,t.jsxs)(n.p,{children:["Congratulations! You've successfully created a Vue2 SSR application with Esmx. Visit ",(0,t.jsx)(n.a,{href:"http://localhost:3000",target:"_blank",rel:"noopener noreferrer",children:"http://localhost:3000"})," to see the result."]})]})}function a(){let e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},{wrapper:n}=Object.assign({},(0,s.ah)(),e.components);return n?(0,t.jsx)(n,{...e,children:(0,t.jsx)(i,{...e})}):i(e)}let c=a;a.__RSPRESS_PAGE_META={},a.__RSPRESS_PAGE_META["en%2Fguide%2Fframeworks%2Fvue2.md"]={toc:[{text:"Project Structure",id:"project-structure",depth:2},{text:"Project Configuration",id:"project-configuration",depth:2},{text:"package.json",id:"packagejson",depth:3},{text:"tsconfig.json",id:"tsconfigjson",depth:3},{text:"Source Code Structure",id:"source-code-structure",depth:2},{text:"app.vue",id:"appvue",depth:3},{text:"create-app.ts",id:"create-appts",depth:3},{text:"entry.client.ts",id:"entryclientts",depth:3},{text:"entry.node.ts",id:"entrynodets",depth:3},{text:"entry.server.ts",id:"entryserverts",depth:3},{text:"Running the Project",id:"running-the-project",depth:2}],title:"Vue2",headingTitle:"Vue2",frontmatter:{titleSuffix:"Esmx Framework Vue2 SSR Application Example",description:"Build a Vue2 SSR application with Esmx from scratch, demonstrating the framework's basic usage including project initialization, Vue2 configuration, and entry file setup.",head:[["meta",{property:"keywords",content:"Esmx, Vue2, SSR application, TypeScript configuration, project initialization, server-side rendering, client-side interaction"}]]}}}}]);
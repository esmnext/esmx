---
titleSuffix: Esmx Framework Vue3 SSR Application Example
description: Build a Vue3 SSR application from scratch using Esmx framework, demonstrating basic usage through examples including project initialization, Vue3 configuration, and entry file setup.
head:
  - - meta
    - property: keywords
      content: Esmx, Vue3, SSR application, TypeScript configuration, project initialization, server-side rendering, client-side interaction, Composition API
---

# Vue3

This tutorial will guide you through building a Vue3 SSR application from scratch using the Esmx framework. We'll demonstrate how to create a server-side rendered application through a complete example.

## Project Structure

First, let's understand the basic project structure:

```bash
.
├── package.json         # Project configuration file defining dependencies and scripts
├── tsconfig.json        # TypeScript configuration file with compilation options
└── src                  # Source code directory
    ├── app.vue          # Main application component defining page structure and interactions
    ├── create-app.ts    # Vue instance factory for application initialization
    ├── entry.client.ts  # Client entry file handling browser-side rendering
    ├── entry.node.ts    # Node.js server entry file for dev environment configuration
    └── entry.server.ts  # Server entry file handling SSR rendering logic
```

## Project Configuration

### package.json

Create the `package.json` file to configure project dependencies and scripts:

```json title="package.json"
{
  "name": "ssr-demo-vue3",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.mjs",
    "build:dts": "vue-tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack-vue": "*",
    "@types/node": "22.8.6",
    "@vue/server-renderer": "^3.5.13",
    "typescript": "^5.7.3",
    "vue": "^3.5.13",
    "vue-tsc": "^2.1.6"
  }
}
```

After creating the `package.json` file, install project dependencies using any of these commands:
```bash
pnpm install
# or
yarn install
# or
npm install
```

This will install all required dependencies including Vue3, TypeScript, and SSR-related packages.

### tsconfig.json

Create the `tsconfig.json` file to configure TypeScript compilation options:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "module": "ESNext",
        "moduleResolution": "node",
        "isolatedModules": true,
        "resolveJsonModule": true,
        
        "target": "ESNext",
        "lib": ["ESNext", "DOM"],
        
        "strict": true,
        "skipLibCheck": true,
        "types": ["@types/node"],
        
        "experimentalDecorators": true,
        "allowSyntheticDefaultImports": true,
        
        "baseUrl": ".",
        "paths": {
            "ssr-demo-vue3/src/*": ["./src/*"],
            "ssr-demo-vue3/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Source Code Structure

### app.vue

Create the main application component `src/app.vue` using Vue3's Composition API:

```html title="src/app.vue"
<template>
    <div>
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue3.html" target="_blank">Esmx Quick Start</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Example Component
 * @description Displays a page title with auto-updating time, demonstrating basic Esmx framework functionality
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Current time, updates every second
const time = ref(new Date().toISOString());
let timer: NodeJS.Timeout;

onMounted(() => {
    timer = setInterval(() => {
        time.value = new Date().toISOString();
    }, 1000);
});

onUnmounted(() => {
    clearInterval(timer);
});
</script>
```

### create-app.ts

Create `src/create-app.ts` to handle Vue application instance creation:

```ts title="src/create-app.ts"
/**
 * @file Vue Instance Creation
 * @description Handles creation and configuration of Vue application instance
 */

import { createSSRApp } from 'vue';
import App from './app.vue';

export function createApp() {
    const app = createSSRApp(App);
    return {
        app
    };
}
```

### entry.client.ts

Create the client entry file `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Client Entry File
 * @description Handles client-side interaction logic and dynamic updates
 */

import { createApp } from './create-app';

// Create Vue instance
const { app } = createApp();

// Mount Vue instance
app.mount('#app');
```

### entry.node.ts

Create `entry.node.ts` to configure the development environment and server startup:

```ts title="src/entry.node.ts"
/**
 * @file Node.js Server Entry File
 * @description Configures development environment and server startup, providing SSR runtime
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configures development environment application creator
     * @description Creates and configures Rspack application instance for development builds and HMR
     * @param esmx Esmx framework instance providing core functionality
     * @returns Configured Rspack application instance with HMR support
     */
    async devApp(esmx) {
        return import('@esmx/rspack-vue').then((m) =>
            m.createRspackVue3App(esmx, {
                config(context) {
                    // Custom Rspack compilation configuration can be added here
                }
            })
        );
    },

    /**
     * Configures and starts HTTP server
     * @description Creates HTTP server instance with Esmx middleware for SSR requests
     * @param esmx Esmx framework instance providing middleware and rendering
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Process requests with Esmx middleware
            esmx.middleware(req, res, async () => {
                // Perform server-side rendering
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server started: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;
```

This file serves as the entry point for development environment configuration and server startup, containing two core functions:

1. `devApp`: Creates and configures the Rspack application instance for development with HMR support, using `createRspackVue3App` specifically for Vue3.
2. `server`: Creates and configures the HTTP server with Esmx middleware for SSR requests.

### entry.server.ts

Create the server-side rendering entry file `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Server-Side Rendering Entry File
 * @description Handles SSR process, HTML generation and resource injection
 */

import type { RenderContext } from '@esmx/core';
import { renderToString } from '@vue/server-renderer';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Create Vue application instance
    const { app } = createApp();

    // Generate page content using Vue's renderToString
    const html = await renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Commit dependency collection to ensure all required resources are loaded
    await rc.commit();

    // Generate complete HTML structure
    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    ${rc.preload()}
    <title>Esmx Quick Start</title>
    ${rc.css()}
</head>
<body>
    <div id="app">${html}</div>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
```

## Running the Project

After completing the file configurations, use these commands to run the project:

1. Development mode:
```bash
npm run dev
```

2. Build the project:
```bash
npm run build
```

3. Production environment:
```bash
npm run start
```

You've now successfully created a Vue3 SSR application using the Esmx framework! Visit http://localhost:3000 to see the result.
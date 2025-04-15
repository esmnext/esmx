---
titleSuffix: Esmx Framework Vue2 SSR Application Example
description: Build a Vue2 SSR application with Esmx from scratch, demonstrating the framework's basic usage including project initialization, Vue2 configuration, and entry file setup.
head:
  - - meta
    - property: keywords
      content: Esmx, Vue2, SSR application, TypeScript configuration, project initialization, server-side rendering, client-side interaction
---

# Vue2

This tutorial will guide you through building a Vue2 SSR application with Esmx from the ground up. We'll demonstrate how to create a server-side rendered application using the Esmx framework through a complete example.

## Project Structure

First, let's understand the basic project structure:

```bash
.
├── package.json         # Project configuration file defining dependencies and scripts
├── tsconfig.json       # TypeScript configuration file with compilation options
└── src                 # Source code directory
    ├── app.vue         # Main application component defining page structure and logic
    ├── create-app.ts   # Vue instance factory for application initialization
    ├── entry.client.ts # Client entry file handling browser-side rendering
    ├── entry.node.ts   # Node.js server entry file for dev environment setup
    └── entry.server.ts # Server entry file handling SSR rendering logic
```

## Project Configuration

### package.json

Create the `package.json` file to configure project dependencies and scripts:

```json title="package.json"
{
  "name": "ssr-demo-vue2",
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
    "typescript": "^5.7.3",
    "vue": "^2.7.16",
    "vue-server-renderer": "^2.7.16",
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

This will install all required dependencies including Vue2, TypeScript, and SSR-related packages.

### tsconfig.json

Create the `tsconfig.json` file to configure TypeScript compilation:

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
            "ssr-demo-vue2/src/*": ["./src/*"],
            "ssr-demo-vue2/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Source Code Structure

### app.vue

Create the main application component `src/app.vue` using `<script setup>` syntax:

```html title="src/app.vue"
<template>
    <div id="app">
        <h1><a href="https://www.esmnext.com/guide/frameworks/vue2.html" target="_blank">Esmx Quick Start</a></h1>
        <time :datetime="time">{{ time }}</time>
    </div>
</template>

<script setup lang="ts">
/**
 * @file Example component
 * @description Displays a page title with auto-updating time to demonstrate Esmx framework basics
 */

import { onMounted, onUnmounted, ref } from 'vue';

// Current time updating every second
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
 * @file Vue instance creation
 * @description Creates and configures Vue application instances
 */

import Vue from 'vue';
import App from './app.vue';

export function createApp() {
    const app = new Vue({
        render: (h) => h(App)
    });
    return {
        app
    };
}
```

### entry.client.ts

Create the client entry file `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Client entry file
 * @description Handles client-side interaction logic and dynamic updates
 */

import { createApp } from './create-app';

// Create Vue instance
const { app } = createApp();

// Mount Vue instance
app.$mount('#app');
```

### entry.node.ts

Create `entry.node.ts` for development environment configuration:

```ts title="src/entry.node.ts"
/**
 * @file Node.js server entry file
 * @description Configures development environment and server startup for SSR runtime
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
            m.createRspackVue2App(esmx, {
                config(context) {
                    // Custom Rspack compilation configuration
                }
            })
        );
    },

    /**
     * Configures and starts HTTP server
     * @description Creates HTTP server with Esmx middleware for SSR requests
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

1. `devApp`: Creates and configures the Rspack application instance for development with HMR support using `createRspackVue2App`.
2. `server`: Creates and configures the HTTP server with Esmx middleware for SSR requests.

### entry.server.ts

Create the SSR entry file `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Server-side rendering entry file
 * @description Handles SSR process, HTML generation and resource injection
 */

import type { RenderContext } from '@esmx/core';
import { createRenderer } from 'vue-server-renderer';
import { createApp } from './create-app';

// Create renderer
const renderer = createRenderer();

export default async (rc: RenderContext) => {
    // Create Vue application instance
    const { app } = createApp();

    // Generate page content with Vue's renderToString
    const html = await renderer.renderToString(app, {
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
    ${html}
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};
```

## Running the Project

After completing the configuration, use these commands to run the project:

1. Development mode:
```bash
npm run dev
```

2. Build project:
```bash
npm run build
```

3. Production run:
```bash
npm run start
```

Congratulations! You've successfully created a Vue2 SSR application with Esmx. Visit http://localhost:3000 to see the result.
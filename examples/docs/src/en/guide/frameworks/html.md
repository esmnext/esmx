---
titleSuffix: Esmx Framework HTML SSR Application Example
description: Build a Esmx-based HTML SSR application from scratch. This example demonstrates the basic usage of the framework, including project initialization, HTML configuration, and entry file setup.
head:
  - - meta
    - property: keywords
      content: Esmx, HTML, SSR Application, TypeScript Configuration, Project Initialization, Server-Side Rendering, Client-Side Interaction
---

# HTML

This tutorial will guide you through building a Esmx-based HTML SSR application from scratch. We'll demonstrate how to create a server-side rendered application using the Esmx framework through a complete example.

## Project Structure

First, let's understand the basic project structure:

```bash
.
├── package.json         # Project configuration file, defines dependencies and script commands
├── tsconfig.json        # TypeScript configuration file, sets compilation options
└── src                  # Source code directory
    ├── app.ts           # Main application component, defines page structure and interaction logic
    ├── create-app.ts    # Application instance factory, responsible for initializing the application
    ├── entry.client.ts  # Client entry file, handles browser-side rendering
    ├── entry.node.ts    # Node.js server entry file, responsible for development environment configuration and server startup
    └── entry.server.ts  # Server entry file, handles SSR rendering logic
```

## Project Configuration

### package.json

Create the `package.json` file to configure project dependencies and scripts:

```json title="package.json"
{
  "name": "ssr-demo-html",
  "version": "1.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "dev": "esmx dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "esmx build",
    "preview": "esmx preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack": "*",
    "@types/node": "22.8.6",
    "typescript": "^5.7.3"
  }
}
```

After creating the `package.json` file, install the project dependencies using one of the following commands:
```bash
pnpm install
# or
yarn install
# or
npm install
```

This will install all necessary dependencies, including TypeScript and SSR-related packages.

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
            "ssr-demo-html/src/*": ["./src/*"],
            "ssr-demo-html/*": ["./*"]
        }
    },
    "include": ["src"],
    "exclude": ["dist", "node_modules"]
}
```

## Source Code Structure

### app.ts

Create the main application component `src/app.ts` to implement page structure and interaction logic:

```ts title="src/app.ts"
/**
 * @file Example Component
 * @description Demonstrates a page title with auto-updating time, showcasing basic Esmx framework functionality
 */

export default class App {
    /**
     * Current time in ISO format
     * @type {string}
     */
    public time = '';

    /**
     * Create application instance
     * @param {SsrContext} [ssrContext] - Server-side context containing import metadata collection
     */
    public constructor(public ssrContext?: SsrContext) {
        // No additional initialization needed in constructor
    }

    /**
     * Render page content
     * @returns {string} Returns page HTML structure
     */
    public render(): string {
        // Ensure correct collection of import metadata in server-side environment
        if (this.ssrContext) {
            this.ssrContext.importMetaSet.add(import.meta);
        }

        return `
        <div id="app">
            <h1><a href="https://www.esmnext.com/guide/frameworks/html.html" target="_blank">Esmx Quick Start</a></h1>
            <time datetime="${this.time}">${this.time}</time>
        </div>
        `;
    }

    /**
     * Client-side initialization
     * @throws {Error} Throws error if time display element is not found
     */
    public onClient(): void {
        // Get time display element
        const time = document.querySelector('#app time');
        if (!time) {
            throw new Error('Time display element not found');
        }

        // Set interval to update time every second
        setInterval(() => {
            this.time = new Date().toISOString();
            time.setAttribute('datetime', this.time);
            time.textContent = this.time;
        }, 1000);
    }

    /**
     * Server-side initialization
     */
    public onServer(): void {
        this.time = new Date().toISOString();
    }
}

/**
 * Server-side context interface
 * @interface
 */
export interface SsrContext {
    /**
     * Import metadata collection
     * @type {Set<ImportMeta>}
     */
    importMetaSet: Set<ImportMeta>;
}
```

### create-app.ts

Create the `src/create-app.ts` file to handle application instance creation:

```ts title="src/create-app.ts"
/**
 * @file Application Instance Creation
 * @description Responsible for creating and configuring application instances
 */

import App from './app';

export function createApp() {
    const app = new App();
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

// Create application instance and initialize
const { app } = createApp();
app.onClient();
```

### entry.node.ts

Create the `entry.node.ts` file to configure the development environment and server startup:

```ts title="src/entry.node.ts"
/**
 * @file Node.js Server Entry File
 * @description Responsible for development environment configuration and server startup, providing SSR runtime environment
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configure development environment application creator
     * @description Creates and configures Rspack application instance for development environment builds and hot updates
     * @param esmx Esmx framework instance, providing core functionality and configuration interfaces
     * @returns Returns configured Rspack application instance with HMR and live preview support
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                config(context) {
                    // Customize Rspack compilation configuration here
                }
            })
        );
    },

    /**
     * Configure and start HTTP server
     * @description Creates HTTP server instance, integrates Esmx middleware, and handles SSR requests
     * @param esmx Esmx framework instance, providing middleware and rendering functionality
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Use Esmx middleware to handle requests
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

1. `devApp` function: Responsible for creating and configuring the Rspack application instance for the development environment, supporting hot updates and live preview.
2. `server` function: Responsible for creating and configuring the HTTP server, integrating Esmx middleware to handle SSR requests.

### entry.server.ts

Create the server-side rendering entry file `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Server-Side Rendering Entry File
 * @description Handles server-side rendering process, HTML generation, and resource injection
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Encapsulate page content generation logic
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Inject server-side rendering context into application instance
    app.ssrContext = ssrContext;
    // Initialize server-side
    app.onServer();

    // Generate page content
    return app.render();
};

export default async (rc: RenderContext) => {
    // Create application instance, returning an object containing the app instance
    const { app } = createApp();
    // Use renderToString to generate page content
    const html = renderToString(app, {
        importMetaSet: rc.importMetaSet
    });

    // Commit dependency collection to ensure all necessary resources are loaded
    await rc.commit();

    // Generate complete HTML structure
    rc.html = `<!DOCTYPE html>
<html lang="zh-CN">
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

After completing the above file configurations, you can run the project using the following commands:

1. Development mode:
```bash
npm run dev
```

2. Build the project:
```bash
npm run build
```

3. Run in production environment:
```bash
npm run start
```

Now, you've successfully created a Esmx-based HTML SSR application! Visit http://localhost:3000 to see the result.
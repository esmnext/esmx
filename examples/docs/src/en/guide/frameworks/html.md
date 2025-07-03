---
titleSuffix: Esmx Framework HTML SSR Application Example
description: Build an HTML SSR application from scratch based on Esmx framework, demonstrating basic usage through examples including project initialization, HTML configuration, and entry file setup.
head:
  - - meta
    - property: keywords
      content: Esmx, HTML, SSR application, TypeScript configuration, project initialization, server-side rendering, client-side interaction
---

# HTML

This tutorial will guide you through building an HTML SSR application from scratch using the Esmx framework. We'll demonstrate how to create a server-side rendered application through a complete example.

## Project Structure

First, let's understand the basic project structure:

```bash
.
├── package.json         # Project configuration file defining dependencies and scripts
├── tsconfig.json        # TypeScript configuration file with compilation options
└── src                  # Source code directory
    ├── app.ts           # Main application component defining page structure and logic
    ├── create-app.ts    # Application instance factory for initialization
    ├── entry.client.ts  # Client entry file handling browser-side rendering
    ├── entry.node.ts    # Node.js server entry file for dev environment setup
    └── entry.server.ts  # Server entry file handling SSR rendering logic
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
    "start": "NODE_ENV=production node dist/index.mjs",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@esmx/core": "*"
  },
  "devDependencies": {
    "@esmx/rspack": "*",
    "@types/node": "^24.0.10",
    "typescript": "^5.8.3"
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

This will install all required dependencies including TypeScript and SSR-related packages.

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

Create the main application component `src/app.ts` implementing page structure and interaction logic:

```ts title="src/app.ts"
/**
 * @file Example component
 * @description Demonstrates a page title with auto-updating time, showcasing basic Esmx framework functionality
 */

export default class App {
    /**
     * Current time in ISO format
     * @type {string}
     */
    public time = '';

    /**
     * Creates application instance
     * @param {SsrContext} [ssrContext] - Server context containing import metadata collection
     */
    public constructor(public ssrContext?: SsrContext) {
        // No additional initialization needed in constructor
    }

    /**
     * Renders page content
     * @returns {string} Returns page HTML structure
     */
    public render(): string {
        // Ensure proper import metadata collection in server environment
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
     * @throws {Error} Throws error when time display element is not found
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
 * Server context interface
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

Create `src/create-app.ts` file responsible for application instance creation:

```ts title="src/create-app.ts"
/**
 * @file Application instance creation
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

Create client entry file `src/entry.client.ts`:

```ts title="src/entry.client.ts"
/**
 * @file Client entry file
 * @description Handles client-side interaction logic and dynamic updates
 */

import { createApp } from './create-app';

// Create application instance and initialize
const { app } = createApp();
app.onClient();
```

### entry.node.ts

Create `entry.node.ts` file for development environment configuration:

```ts title="src/entry.node.ts"
/**
 * @file Node.js server entry file
 * @description Configures development environment and server startup, providing SSR runtime
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configures development environment application creator
     * @description Creates and configures Rspack application instance for development builds and HMR
     * @param esmx Esmx framework instance providing core functionality
     * @returns Configured Rspack application instance supporting HMR and live preview
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

1. `devApp`: Creates and configures Rspack application instance for development with HMR support.
2. `server`: Creates and configures HTTP server with Esmx middleware for SSR requests.

### entry.server.ts

Create server-side rendering entry file `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Server-side rendering entry file
 * @description Handles SSR process, HTML generation and resource injection
 */

import type { RenderContext } from '@esmx/core';
import type App from './app';
import type { SsrContext } from './app';
import { createApp } from './create-app';

// Encapsulates page content generation logic
const renderToString = (app: App, ssrContext: SsrContext): string => {
    // Inject server context into application instance
    app.ssrContext = ssrContext;
    // Initialize server-side
    app.onServer();

    // Generate page content
    return app.render();
};

export default async (rc: RenderContext) => {
    // Create application instance
    const { app } = createApp();
    // Generate page content using renderToString
    const html = renderToString(app, {
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

After completing all configurations, use these commands to run the project:

1. Development mode:
```bash
npm run dev
```

2. Build project:
```bash
npm run build
```

3. Production environment:
```bash
npm run start
```

Congratulations! You've successfully created an HTML SSR application using Esmx framework. Visit http://localhost:3000 to see the result.
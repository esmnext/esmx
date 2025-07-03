---
titleSuffix: Esmx Framework Preact+HTM SSR Application Example
description: Build a Preact+HTM SSR application from scratch using the Esmx framework, demonstrating basic usage through practical examples including project initialization, Preact configuration, and entry file setup.
head:
  - - meta
    - property: keywords
      content: Esmx, Preact, HTM, SSR application, TypeScript configuration, project initialization, server-side rendering, client-side interaction
---

# Preact+HTM

This tutorial will guide you through building a Preact+HTM SSR application from scratch using the Esmx framework. We'll demonstrate how to create a server-side rendered application through a complete example.

## Project Structure

First, let's examine the basic project structure:

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
  "name": "ssr-demo-preact-htm",
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
    "htm": "^3.1.1",
    "preact": "^10.26.2",
    "preact-render-to-string": "^6.5.13",
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

This will install all required dependencies including Preact, HTM, TypeScript, and SSR-related packages.

### tsconfig.json

Create the `tsconfig.json` file to configure TypeScript compilation options:

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "moduleResolution": "node",
        "strict": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "paths": {
            "ssr-demo-preact-htm/src/*": [
                "./src/*"
            ],
            "ssr-demo-preact-htm/*": [
                "./*"
            ]
        }
    },
    "include": [
        "src"
    ],
    "exclude": [
        "dist"
    ]
}
```

## Source Code Structure

### app.ts

Create the main application component `src/app.ts` using Preact class components with HTM:

```ts title="src/app.ts"
/**
 * @file Example component
 * @description Demonstrates a page title with auto-updating time, showcasing basic Esmx framework functionality
 */

import { Component } from 'preact';
import { html } from 'htm/preact';

export default class App extends Component {
    state = {
        time: new Date().toISOString()
    };

    timer: NodeJS.Timeout | null = null;

    componentDidMount() {
        this.timer = setInterval(() => {
            this.setState({
                time: new Date().toISOString()
            });
        }, 1000);
    }

    componentWillUnmount() {
        if (this.timer) {
            clearInterval(this.timer);
        }
    }

    render() {
        const { time } = this.state;
        return html`
            <div>
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Esmx Quick Start</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Create `src/create-app.ts` to handle application instance creation:

```ts title="src/create-app.ts"
/**
 * @file Application instance creation
 * @description Handles creating and configuring application instances
 */

import type { VNode } from 'preact';
import { html } from 'htm/preact';
import App from './app';

export function createApp(): { app: VNode } {
    const app = html`<${App} />`;
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

import { render } from 'preact';
import { createApp } from './create-app';

// Create application instance
const { app } = createApp();

// Mount application instance
render(app, document.getElementById('app')!);
```

### entry.node.ts

Create `entry.node.ts` to configure the development environment and server startup:

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
     * @returns Configured Rspack application instance with HMR support
     */
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
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

1. `devApp`: Creates and configures the Rspack application instance for development with HMR support.
2. `server`: Creates and configures the HTTP server with Esmx middleware for SSR requests.

### entry.server.ts

Create the server-side rendering entry file `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Server-side rendering entry file
 * @description Handles SSR workflow, HTML generation and resource injection
 */

import type { RenderContext } from '@esmx/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Create application instance
    const { app } = createApp();

    // Generate page content using Preact's renderToString
    const html = render(app);

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

2. Build project:
```bash
npm run build
```

3. Production environment:
```bash
npm run start
```

Congratulations! You've successfully created a Preact+HTM SSR application using the Esmx framework. Visit http://localhost:3000 to see the result.
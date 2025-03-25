---
titleSuffix: Gez Framework Preact+HTM SSR Application Example
description: Build a Preact+HTM SSR application from scratch using the Gez framework. This example demonstrates the basic usage of the framework, including project initialization, Preact configuration, and entry file setup.
head:
  - - meta
    - property: keywords
      content: Gez, Preact, HTM, SSR Application, TypeScript Configuration, Project Initialization, Server-Side Rendering, Client-Side Interaction
---

# Preact+HTM

This tutorial will guide you through building a Preact+HTM SSR application from scratch using the Gez framework. We'll walk through a complete example to demonstrate how to create a server-side rendered application with Gez.

## Project Structure

First, let's understand the basic structure of the project:

```bash
.
├── package.json         # Project configuration file, defining dependencies and script commands
├── tsconfig.json        # TypeScript configuration file, setting compilation options
└── src                  # Source code directory
    ├── app.ts           # Main application component, defining page structure and interaction logic
    ├── create-app.ts    # Application instance factory, responsible for initializing the application
    ├── entry.client.ts  # Client entry file, handling browser-side rendering
    ├── entry.node.ts    # Node.js server entry file, responsible for development environment configuration and server startup
    └── entry.server.ts  # Server entry file, handling SSR rendering logic
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
    "dev": "gez dev",
    "build": "npm run build:dts && npm run build:ssr",
    "build:ssr": "gez build",
    "preview": "gez preview",
    "start": "NODE_ENV=production node dist/index.js",
    "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src"
  },
  "dependencies": {
    "@gez/core": "*"
  },
  "devDependencies": {
    "@gez/rspack": "*",
    "@types/node": "22.8.6",
    "htm": "^3.1.1",
    "preact": "^10.26.2",
    "preact-render-to-string": "^6.5.13",
    "typescript": "^5.2.2"
  }
}
```

After creating the `package.json` file, you need to install the project dependencies. You can use any of the following commands to install them:
```bash
pnpm install
# or
yarn install
# or
npm install
```

This will install all the necessary dependencies, including Preact, HTM, TypeScript, and SSR-related dependencies.

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

Create the main application component `src/app.ts`, using Preact's class component and HTM:

```ts title="src/app.ts"
/**
 * @file Example Component
 * @description Demonstrates a page title with an automatically updating timestamp, showcasing the basic functionality of the Gez framework
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
                <h1><a href="https://www.esmnext.com/guide/frameworks/preact-htm.html" target="_blank">Gez Quick Start</a></h1>
                <time datetime=${time}>${time}</time>
            </div>
        `;
    }
}
```

### create-app.ts

Create the `src/create-app.ts` file, responsible for creating the application instance:

```ts title="src/create-app.ts"
/**
 * @file Application Instance Creation
 * @description Responsible for creating and configuring the application instance
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
 * @file Client Entry File
 * @description Handles client-side interaction logic and dynamic updates
 */

import { render } from 'preact';
import { createApp } from './create-app';

// Create the application instance
const { app } = createApp();

// Mount the application instance
render(app, document.getElementById('app')!);
```

### entry.node.ts

Create the `entry.node.ts` file to configure the development environment and server startup:

```ts title="src/entry.node.ts"
/**
 * @file Node.js Server Entry File
 * @description Responsible for development environment configuration and server startup, providing the SSR runtime environment
 */

import http from 'node:http';
import type { GezOptions } from '@gez/core';

export default {
    /**
     * Configures the development environment application creator
     * @description Creates and configures the Rspack application instance for development environment builds and hot updates
     * @param gez Gez framework instance, providing core functionality and configuration interfaces
     * @returns Returns the configured Rspack application instance, supporting HMR and live preview
     */
    async devApp(gez) {
        return import('@gez/rspack').then((m) =>
            m.createRspackHtmlApp(gez, {
                config(context) {
                    // Customize Rspack compilation configuration here
                }
            })
        );
    },

    /**
     * Configures and starts the HTTP server
     * @description Creates an HTTP server instance, integrating Gez middleware to handle SSR requests
     * @param gez Gez framework instance, providing middleware and rendering functionality
     */
    async server(gez) {
        const server = http.createServer((req, res) => {
            // Use Gez middleware to handle requests
            gez.middleware(req, res, async () => {
                // Perform server-side rendering
                const rc = await gez.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server started: http://localhost:3000');
        });
    }
} satisfies GezOptions;
```

This file is the entry point for development environment configuration and server startup, containing two core functions:

1. `devApp` function: Responsible for creating and configuring the Rspack application instance for the development environment, supporting hot updates and live preview. It uses `createRspackHtmlApp` to create a Rspack application instance specifically for Preact+HTM.
2. `server` function: Responsible for creating and configuring the HTTP server, integrating Gez middleware to handle SSR requests.

### entry.server.ts

Create the server-side rendering entry file `src/entry.server.ts`:

```ts title="src/entry.server.ts"
/**
 * @file Server-Side Rendering Entry File
 * @description Handles the server-side rendering process, HTML generation, and resource injection
 */

import type { RenderContext } from '@gez/core';
import type { VNode } from 'preact';
import { render } from 'preact-render-to-string';
import { createApp } from './create-app';

export default async (rc: RenderContext) => {
    // Create the application instance
    const { app } = createApp();

    // Use Preact's renderToString to generate the page content
    const html = render(app);

    // Commit dependency collection to ensure all necessary resources are loaded
    await rc.commit();

    // Generate the complete HTML structure
    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    ${rc.preload()}
    <title>Gez Quick Start</title>
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

After completing the above file configurations, you can use the following commands to run the project:

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

Now, you have successfully created a Preact+HTM SSR application using the Gez framework! Visit http://localhost:3000 to see the result.
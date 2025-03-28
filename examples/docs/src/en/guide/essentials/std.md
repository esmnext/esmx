---
titleSuffix: Esmx Framework Project Structure and Specification Guide
description: Detailed introduction to the standard project structure, entry file specifications, and configuration file specifications of the Esmx framework, helping developers build standardized and maintainable SSR applications.
head:
  - - meta
    - property: keywords
      content: Esmx, Project Structure, Entry Files, Configuration Specifications, SSR Framework, TypeScript, Project Standards, Development Standards
---

# Standard Specifications

Esmx is a modern SSR framework that adopts standardized project structures and path resolution mechanisms to ensure consistency and maintainability across development and production environments.

## Project Structure Specifications

### Standard Directory Structure

```txt
root
│─ dist                  # Compilation output directory
│  ├─ package.json       # Compiled package configuration
│  ├─ server             # Server-side compilation output
│  │  └─ manifest.json   # Compilation manifest output, used for generating importmap
│  ├─ node               # Node server program compilation output
│  ├─ client             # Client-side compilation output
│  │  ├─ versions        # Version storage directory
│  │  │  └─ latest.tgz   # Archive of the dist directory for package distribution
│  │  └─ manifest.json   # Compilation manifest output, used for generating importmap
│  └─ src                # Files generated using tsc
├─ src
│  ├─ entry.server.ts    # Server application entry
│  ├─ entry.client.ts    # Client application entry
│  └─ entry.node.ts      # Node server application entry
├─ tsconfig.json         # TypeScript configuration
└─ package.json          # Package configuration
```

::: tip Extended Knowledge
- `esmx.name` is derived from the `name` field in `package.json`
- `dist/package.json` is derived from the root directory's `package.json`
- The `dist` directory is archived only when `packs.enable` is set to `true`

:::

## Entry File Specifications

### entry.client.ts
The client entry file is responsible for:
- **Application Initialization**: Configuring basic settings for the client application
- **Routing Management**: Handling client-side routing and navigation
- **State Management**: Implementing client-side state storage and updates
- **Interaction Handling**: Managing user events and interface interactions

### entry.server.ts
The server entry file is responsible for:
- **Server-Side Rendering**: Executing the SSR rendering process
- **HTML Generation**: Building the initial page structure
- **Data Prefetching**: Handling server-side data fetching
- **State Injection**: Passing server-side state to the client
- **SEO Optimization**: Ensuring search engine optimization for pages

### entry.node.ts
The Node.js server entry file is responsible for:
- **Server Configuration**: Setting HTTP server parameters
- **Routing Handling**: Managing server-side routing rules
- **Middleware Integration**: Configuring server middleware
- **Environment Management**: Handling environment variables and configurations
- **Request Response**: Processing HTTP requests and responses

## Configuration File Specifications

### package.json

```json title="package.json"
{
    "name": "your-app-name",
    "type": "module",
    "scripts": {
        "dev": "esmx dev",
        "build": "npm run build:dts && npm run build:ssr",
        "build:ssr": "esmx build",
        "build:dts": "tsc --declaration --emitDeclarationOnly --outDir dist/src",
        "preview": "esmx preview",
        "start": "NODE_ENV=production node dist/index.js"
    }
}
```

### tsconfig.json

```json title="tsconfig.json"
{
    "compilerOptions": {
        "isolatedModules": true,
        "allowJs": false,
        "experimentalDecorators": true,
        "resolveJsonModule": true,
        "types": [
            "@types/node"
        ],
        "target": "ESNext",
        "module": "ESNext",
        "importHelpers": false,
        "declaration": true,
        "sourceMap": true,
        "strict": true,
        "noImplicitAny": false,
        "noImplicitReturns": false,
        "noFallthroughCasesInSwitch": true,
        "noUnusedLocals": false,
        "noUnusedParameters": false,
        "moduleResolution": "node",
        "esModuleInterop": true,
        "skipLibCheck": true,
        "allowSyntheticDefaultImports": true,
        "forceConsistentCasingInFileNames": true,
        "noEmit": true
    },
    "include": [
        "src",
        "**.ts"
    ],
    "exclude": [
        "dist"
    ]
}
```
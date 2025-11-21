---
titleSuffix: "Core Terminology Explained"
description: "A glossary of core Esmx framework terminology, covering everything from underlying technologies to high-level architecture, aiming to help developers accurately understand and use Esmx's capabilities."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, glossary, module linking, micro-frontends, ESM, Import Maps, builder, dependency isolation"
---

# Glossary

## Core Technologies

### ESM (ECMAScript Modules)
The native module mechanism in browsers and Node.js, using `import`/`export` syntax.

### Import Maps
A native browser mechanism that controls the path mapping and scope of ESM modules.

## Architecture and Patterns

### Module Linking
Utilizes native ESM and Import Maps to link multiple packages or modules at runtime, achieving decoupling and collaboration.

### Micro-Frontends
A front-end architectural pattern that supports independent development and integration by multiple teams.

### Dependency Isolation
Avoids dependency conflicts and improves stability through Import Maps and module scoping.

### Framework Agnostic
Integrates multiple front-end frameworks within the same project, maintaining a framework-neutral design.

## Roles and Units

### Host
The core application that loads and orchestrates remote applications or modules.

### Remote
A sub-application or module dynamically loaded by the host application.

### Application
A front-end subsystem that can be run and deployed independently.

### Module
An independent, reusable unit of code that encapsulates specific functionality or data. In modern JavaScript (ESM), this usually refers to a file that interacts with other modules via `import` and `export`.

### Package
A collection of one or more modules, distributed and versioned as a single unit. In the Node.js ecosystem, this usually refers to a directory containing a `package.json` file, which can be published and installed via package managers like npm.

## Build and Render

### Builder
An encapsulation layer in Esmx used to simplify build configurations, providing out-of-the-box best practices for specific application types (e.g., HTML, Vue).

### Hydration
The process of associating server-side rendered (SSR) static HTML with client-side JavaScript, attaching event listeners, and restoring application state to make it fully interactive.

### Middleware
Functions or modules used to insert custom logic into the server-side request handling flow, often used for serving static assets, authentication, or adding logging.

### RenderContext
The core object in Esmx for managing the rendering process, responsible for injecting resources, constraining module loading order, and passing contextual data in both CSR and SSR scenarios.

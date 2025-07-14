---
titleSuffix: Overview of Esmx Framework
description: Esmx is an ESM-based micro-frontend framework providing high-performance server-side rendering capabilities.
head:
  - - meta
    - property: keywords
      content: Esmx, micro-frontend, ESM, server-side rendering, SSR, module linking, module federation
---

# Introduction

## What is Esmx

A micro-frontend framework based on ECMAScript Modules (ESM), designed for building high-performance SSR applications.

**Technical Evolution:**
- **v1.0**: On-demand component loading via HTTP requests
- **v2.0**: Application integration using Webpack Module Federation
- **v3.0**: [Module linking](/guide/essentials/module-linking) system based on native browser ESM

## Problems Solved

### Limitations of Traditional Micro-Frontend Approaches

- Performance overhead from runtime dependency injection and JavaScript sandbox proxies
- Custom sandboxes inferior to browser's native module isolation capabilities
- Build tool modifications required for dependency sharing
- Deployment strategies and runtime processing contradicting Web standards
- Framework coupling restricting technology stack choices

### Esmx Solutions

- Dependency management using browser ESM and Import Maps
- Application isolation through ECMAScript module scope
- Support for multiple frontend frameworks
- Zero runtime overhead

## Technical Composition

- [Import Maps](https://caniuse.com/?search=import%20map) for module mapping
- [es-module-shims](https://github.com/guybedford/es-module-shims) for compatibility support
- Rspack [module-import](https://rspack.dev/config/externals#externalstypemodule-import) for external dependency handling
- ESM hot updates and native TypeScript execution

## Core Features

Unlike [Next.js](https://nextjs.org) or [Nuxt.js](https://nuxt.com/), Esmx focuses on micro-frontend infrastructure:

### Functional Features

- Module linking system
- Server-side rendering
- TypeScript type support
- Framework neutrality

## Project Status

Validated through 5 years of iteration in enterprise environments, currently supporting dozens of business projects in stable production.
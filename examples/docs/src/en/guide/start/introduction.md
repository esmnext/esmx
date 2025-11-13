---
titleSuffix: "Overview"
description: "Esmx is based on ECMAScript Modules (ESM) and Import Maps, supporting both Client-Side Rendering (CSR) and Server-Side Rendering (SSR), while providing module linking capabilities."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Micro-Frontend, ESM, Client-Side Rendering, CSR, Server-Side Rendering, SSR, module linking"
---

# Introduction

## What is Esmx?

An engineering framework built on ESM and Import Maps, supporting both CSR/SSR and module linking capabilities. It's framework-agnostic and adaptable to multiple technology stacks.

**Core Capabilities:**
- Native ESM-based module system
- Import Maps for dependency and version management
- RenderContext for resource injection and ordering constraints
- SSR and CSR support for Vue/React and other frameworks

## Why Choose Esmx?

### Native Standards
- Uses standard ESM syntax
- Path resolution defined through Import Maps
- Dependency isolation and version coexistence via standard mechanisms

### Framework-Agnostic
- Compatible with Vue, React, Preact, Solid, Svelte, and more
- Framework-agnostic design for components and builds
- Flexible rendering entry points for different scenarios

### Build and Deployment
- Base path configuration and hook mechanisms
- Multi-language site and Micro-Frontend deployment support
- Integrated engineering workflow with Rspack

## Core Concepts

### ESM Module System
- Standard `import`/`export` syntax
- Static analysis and on-demand loading support
- Native circular reference handling

### Import Maps
- Module specifier to URL mapping
- Scoping and version coexistence support
- Backward compatibility via es-module-shims

### Module Linking
- Cross-package sharing and runtime linking
- Build-time and runtime collaboration
- Type safety and engineering constraints maintained

### Application Isolation
- Module scoping
- Style and state isolation
- Error boundaries

## Problems Solved

### Traditional Micro-Frontend Pain Points
- Runtime injection overhead
- Isolation relying on custom sandboxes
- Tightly coupled build tools
- Complex deployment strategies

### Esmx's Solution
- ESM and Import Maps for dependency management
- Isolation through module scoping
- Framework-agnostic rendering and building

### Comparison

| Dimension | Traditional Solutions | Esmx |
|-----------|----------------------|------|
| Runtime | Dependency Injection/Sandbox | Native ESM |
| Isolation | Custom Sandbox | Module Scoping |
| Build | Special Configuration | Standard Process |
| Learning | Framework-specific APIs | Standard Syntax |

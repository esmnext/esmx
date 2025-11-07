---
titleSuffix: "Overview"
description: "Esmx is built on ECMAScript Modules (ESM) and Import Maps, supports both Client-Side Rendering (CSR) and Server-Side Rendering (SSR), and provides module linking capabilities."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Micro Frontends, ESM, Client-side Rendering, CSR, Server-side Rendering, SSR, Module Linking"
---

# Introduction

## What is Esmx?

A framework built on ESM and Import Maps, supporting CSR/SSR and module linking; framework-agnostic and adaptable to multiple stacks.

**Core capabilities:**
- Module system built on native ESM
- Import Maps for dependency and version management
- RenderContext for resource injection and order constraints
- SSR and CSR practices for frameworks such as Vue/React

## Why Esmx?

### Native Standards
- Use standard ESM syntax
- Define path resolution via Import Maps
- Isolation and version coexistence via standard mechanisms

### Framework Agnostic
- Compatible with Vue, React, Preact, Solid, Svelte, and more
- Components and builds remain framework-independent
- Rendering entry points can be switched per scenario

### Build and Deployment
- Support base path configuration and hook mechanisms
- Adapt to multi-language sites and micro frontend deployments
- Engineering workflow integrated with Rspack

## Core Concepts

### ESM Module System
- Use standard `import`/`export` syntax
- Support static analysis and on-demand loading
- Natively handle circular references

### Import Maps
- Map module identifiers to URLs
- Support scopes and version coexistence
- Provide backward compatibility via es-module-shims when needed

### Module Linking
- Cross-package sharing and runtime linking
- Collaboration across build time and runtime
- Maintain type safety and engineering constraints

### Application Isolation
- Module scoping
- Style and state isolation
- Error boundaries

## Problems Addressed

### Pain Points of Traditional Micro Frontends
- Runtime injection introduces extra overhead
- Isolation depends on custom sandboxes
- Strong coupling with build tools
- Complex deployment strategies

### Esmx Solutions
- Manage dependencies using ESM and Import Maps
- Achieve isolation through module scopes
- Framework-neutral rendering and build process

### Comparison

| Dimension | Traditional | Esmx |
|------|----------|------|
| Runtime | Injection/Sandbox | Native ESM |
| Isolation | Custom sandbox | Module scope |
| Build | Special configuration | Standard workflow |
| Learning | Framework-specific APIs | Standard syntax |

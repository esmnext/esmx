---
titleSuffix: Overview of Esmx Framework
description: Esmx is an ESM-based micro-frontend framework providing high-performance server-side rendering capabilities.
head:
  - - meta
    - property: keywords
      content: Esmx, micro-frontend, ESM, server-side rendering, SSR, module linking, module federation
---

# Introduction

## What is Esmx?

A micro-frontend framework based on ECMAScript Modules (ESM) that supports high-performance server-side rendering (SSR).

**Technical Evolution:**
- **v1.0**: On-demand component loading via HTTP requests
- **v2.0**: Application integration using Webpack Module Federation
- **v3.0**: [Module linking](/guide/essentials/module-linking) system based on native browser ESM

**Core Features Overview:**
- Micro-frontend architecture with zero runtime overhead
- Native ESM module system support
- Multi-framework compatibility (Vue, React, Preact, Solid, etc.)
- Complete server-side rendering capabilities

## Why Choose Esmx?

### Zero Runtime Overhead
- Based on browser-native ESM + ImportMap, no sandbox proxy needed
- No runtime dependency injection and performance loss
- Native module isolation ensuring application runtime stability

### Native ESM Support
- Uses standard ECMAScript module syntax
- Browser-native module loading mechanism
- Dependency management based on Import Maps
- Strong caching strategy based on content hashing

### Multi-Framework Compatibility
- Supports mainstream frameworks like Vue, React, Preact, Solid, Svelte, etc.
- Framework-neutral design philosophy
- No need to modify existing component code
- Flexible technology stack choices

### High-Performance Build
- Build tool driven by Rspack
- Significantly improved build speed
- Supports ESM hot updates
- Native TypeScript execution support

## Core Concepts

### ESM Module System
- **Standard Module Syntax**: Uses standard `import`/`export` syntax
- **Static Analysis**: Supports static module analysis at compile time
- **On-Demand Loading**: Browser-native on-demand module loading capability
- **Circular References**: Native support for circular reference handling

### Import Maps
- **Dependency Mapping**: Maps module identifiers to specific URLs
- **Version Management**: Supports coexistence of multiple dependency versions
- **Cache Control**: Strong caching strategy based on content
- **Compatibility**: Provides backward compatibility through es-module-shims

### Module Linking
- **Cross-Application Sharing**: Enables module sharing between different applications
- **Static Linking**: Determines module dependencies at build time
- **Type Safety**: Complete TypeScript type support
- **Developer-Friendly**: Supports hot updates and development-time debugging

### Application Isolation
- **Module Scope**: Utilizes ESM's native module scope
- **Style Isolation**: CSS module and scoped style support
- **State Isolation**: Independent application state management
- **Error Boundaries**: Application-level error isolation mechanisms

## Problems Solved

### Traditional Micro-Frontend Pain Points
- **Performance Loss**: Runtime dependency injection and sandbox proxies bring performance overhead
- **Isolation Limitations**: Custom sandboxes are inferior to browser's native module isolation capabilities
- **Build Dependencies**: Dependency sharing requires modifying build tools
- **Deployment Complexity**: Deployment strategies contradict Web standards
- **Technology Lock-in**: Framework coupling restricts technology stack choices

### Esmx's Solutions
- **Native Solution**: Manages dependencies through browser ESM and Import Maps
- **Standard Isolation**: Implements isolation through ECMAScript module scope
- **Framework Agnostic**: Supports mixed development with multiple frontend frameworks
- **Zero Overhead**: Completely based on browser standards, no runtime overhead

### Performance Comparison

| Feature | Traditional Approach | Esmx |
|---------|---------------------|------|
| **Runtime Overhead** | Has sandbox proxy overhead | Zero overhead |
| **Module Isolation** | Manual sandbox simulation | Browser-native |
| **Build Complexity** | Requires special configuration | Standard build process |
| **Learning Cost** | Framework-specific APIs | Standard ESM syntax |
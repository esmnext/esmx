---
titleSuffix: "Glossary"
description: "Core terminology and unified translations for Esmx, ensuring consistency with packages."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, glossary, Module Linking, Micro-Frontend, ESM, Import Maps"
---

# Glossary



## Module Linking

Uses native ESM and Import Maps to link multiple packages or modules at runtime, enabling decoupling and collaboration.

## ESM (ECMAScript Modules)

Native module mechanism for browsers and Node.js, using `import`/`export` syntax.

## Import Maps

Native browser mechanism for controlling ESM module path mapping and scoping.

## Hydration

The process of activating page interactions on the client side after SSR.

## Middleware

Abstract interface for static resource and request processing.

## Dependency Isolation

Prevents dependency conflicts through Import Maps and module scoping, improving stability.

## Multi-Framework Integration

Integrates multiple frontend frameworks within the same project while maintaining a framework-agnostic design.

## Package Collaboration / Module Decoupling

Enables independent package development and runtime collaboration through module linking.

## Micro-Frontends

Frontend architecture pattern supporting independent development and integration by multiple teams.

## Host Application

Core application that loads and orchestrates remote applications or modules.

## Remote Application/Module

Sub-applications or modules that are dynamically loaded by the host application.

## Application

Frontend subsystem that can run and be deployed independently.

## Module

Functional unit that can be linked and reused, such as component libraries and utility libraries.

## Package

npm package or Monorepo sub-package, emphasizing the publishing unit and physical structure.

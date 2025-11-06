---
titleSuffix: "Glossary"
description: "Core terms and unified translations for Esmx, consistent with packages."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Glossary, Module Linking, Micro Frontends, ESM, Import Maps"
---

# Glossary

## Module Linking

Link multiple packages or modules at runtime using native ESM and Import Maps to achieve decoupling and collaboration.

## ESM (ECMAScript Modules)

Native module system for browsers and Node.js using `import`/`export` syntax.

## Import Maps

Native browser mechanism that controls path mapping and scoping for ESM modules.

## Hydration

Client-side activation after SSR to enable page interactivity.

## Middleware

Abstraction for static assets and request handling.

## Dependency Isolation

Avoid dependency conflicts via Import Maps and module scoping to improve stability.

## Multi-Framework Integration

Integrate multiple front-end frameworks in one project while keeping a framework-agnostic design.

## Package Collaboration / Module Decoupling

Enable independent development and runtime collaboration across packages via module linking.

## Micro Frontends

Architecture that supports independent development and integration across multiple teams.

## Host Application

Primary application that loads and schedules remote apps or modules.

## Remote Application/Module

Sub-app or module loaded dynamically by the host.

## Application

Front-end subsystem that can run and be deployed independently.

## Module

Reusable functional unit that can be linked, such as component libraries and utility libraries.

## Package

npm package or monorepo subpackage, emphasizing publication units and physical structure.

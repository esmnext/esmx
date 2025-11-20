---
titleSuffix: "Introduction"
description: "Esmx is a modern front-end framework based on native ESM and Import Maps, designed to address the complexities of front-end modularization and micro-frontend architecture."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, micro-frontend, ESM, Import Maps, modularization, framework agnostic"
---

# Introduction

Esmx is a modern front-end framework based on web standards. It uses native ESM and Import Maps as its core to address the complexities of front-end modularization and micro-frontend architecture.

## Why Do We Need Esmx?

As the scale and complexity of front-end applications continue to grow, we often encounter the following challenges:

- **Technology Stack Barriers**: In large projects, different teams may use different technology stacks (such as Vue, React), making integration and maintenance difficult.
- **Non-Standard Micro-Frontends**: Many micro-frontend solutions rely on non-standard sandboxes or module loading mechanisms, which have a high learning curve and are disconnected from the community ecosystem.

Esmx was created to address these challenges, aiming to provide a clear and unified modular solution by returning to web standards.

## Core Principles

Esmx simplifies your development process by returning to web standards in the following ways:

### 1. Driven by Native ESM

Esmx's modular capabilities are built entirely on the browser's native ESM (ECMAScript Modules). It does not create a new module specification but directly utilizes web standards. The core advantage of this approach is:

- **Using the Browser for Module Isolation**: Esmx does not need to implement a custom JavaScript sandbox. The isolation between modules is entirely guaranteed by the browser's own module scope mechanism, which is the most standard and reliable way of isolation, fundamentally avoiding complex global state pollution problems.

### 2. Standardized Dependency Management with Import Maps

Esmx uses Import Maps, an emerging web standard, to manage module dependencies. You can declare the mapping relationship of all modules in a simple JSON file, and the browser will load the correct module version according to this "map".

This provides a standardized, build-tool-agnostic management solution for runtime dependencies, thereby greatly simplifying the dependency relationships between modules and making them clear and controllable.

### 3. Framework-Agnostic Design

Esmx's underlying design is decoupled from any specific UI framework (such as Vue, React). It provides a unified module loading and rendering context, allowing you to freely combine and render components from different technology stacks in the same application.

### 4. Compatible with Mainstream Build Ecosystems

Esmx focuses on the linking and composition of modules and is not tied to any specific build tool. You can freely choose any mainstream tool such as Vite, Rspack, or Webpack to build your modules. As long as the build output is in standard ESM format, Esmx can seamlessly integrate it into your application. This decoupled design provides you with maximum technical flexibility.

## Summary

Esmx is not a simple encapsulation of existing tools, but a rethinking of the front-end development paradigm. By embracing web standards, it hands over complexity to the browser, allowing developers to return to a purer and more efficient development experience.

Ready to get started? Let's explore the powerful features of Esmx together!

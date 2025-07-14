---
titleSuffix: Glossary
description: Core terminology explanations for the Esmx framework, helping developers understand key concepts such as module linking and dependency isolation.
head:
  - - meta
    - name: keywords
      content: Esmx, Glossary, Module Linking, Micro Frontends, ESM, import map
---

# Glossary

This glossary collects the most essential and easily confused technical terms in the Esmx framework and micro-frontend architecture, helping users quickly understand the project architecture and technical concepts.

## Module Linking

Module Linking refers to the process of dynamically connecting multiple packages or modules at runtime using native ES Modules (ESM) and import maps. This mechanism enables decoupling and collaboration between independently developed packages, allowing unified management and loading in the host application via import maps.

## Native ESM

Native ESM refers to the ES Modules system natively supported by browsers and Node.js, allowing developers to use standard import/export syntax for modular development. All module linking and dependency isolation in the Esmx framework are based on native ESM.

## import map

An import map is a browser-native mechanism for controlling the mapping of ESM import paths. By using import maps, dependency isolation and multi-package collaboration can be achieved, avoiding path conflicts between packages.

## Zero Runtime

Zero Runtime is a core design philosophy of Esmx, meaning that the framework itself does not introduce any additional runtime code. All features rely on native platform capabilities, improving performance and reducing complexity.

## No Sandbox

No Sandbox means that Esmx does not rely on traditional sandbox mechanisms such as iframes for module isolation. Instead, it achieves security and isolation through native ESM and import maps, enhancing flexibility and performance.

## Dependency Isolation

Dependency Isolation means that dependencies between modules or packages do not interfere with each other. Esmx achieves dependency isolation through import maps and ESM, preventing package conflicts and ensuring system stability.

## Multi-Framework Integration

Multi-Framework Integration means that Esmx supports integrating and running multiple frontend frameworks (such as Vue, React, Svelte, etc.) within the same project, enabling collaborative development across multiple teams and technology stacks.

## Package Collaboration / Module Decoupling

Package Collaboration and Module Decoupling refer to the ability for packages or modules to be developed, tested, and deployed independently through the module linking mechanism, while collaborating at runtime to improve maintainability and scalability.

## Micro Frontends

Micro Frontends is a frontend architecture pattern that allows multiple teams to independently develop, deploy, and run their own frontend applications, which are then integrated into a whole by the host application. Esmx belongs to the micro-frontend architecture category.

## Host

The Host refers to the main application in a micro-frontend or module linking architecture, responsible for loading, integrating, and orchestrating remote applications or modules. The host usually manages global routing, state, and UI frameworks.

## Remote

A Remote refers to an independent sub-application or functional module that is dynamically loaded and integrated by the host application, supporting independent development, testing, and deployment.

## Application

An Application refers to a frontend subsystem that can run and be deployed independently, usually containing complete pages, routing, and business logic.

## Module

A Module refers to a functional unit that can be linked and reused, such as packages, component libraries, or utility libraries. It is the foundation for decoupling and reuse in Esmx.

## Package

A Package refers to an NPM package or a Monorepo sub-package, emphasizing the physical structure and publishing unit. It is the basis for multi-package collaboration in Esmx. 
---
titleSuffix: Glossary
description: Core terminology explanations for the Esmx framework, helping developers understand key concepts such as module linking and dependency isolation.
head:
  - - meta
    - name: keywords
      content: Esmx, Glossary, Module Linking, Micro Frontends, ESM, import map
---

# Glossary

This glossary collects the most core and easily confused technical terms in the Esmx framework and micro-frontend architecture, helping users quickly understand the project architecture and technical concepts.

## Module Linking

Module Linking refers to the use of native ES Modules (ESM) and import maps to dynamically link multiple packages or modules at runtime, enabling decoupling and collaboration between them. This mechanism allows each package to be developed and deployed independently, while being managed and loaded uniformly in the host application through import maps.

## Native ESM

Native ESM refers to the ES Modules mechanism natively supported by browsers and Node.js, allowing developers to use standard import/export syntax for modular development. All module linking and dependency isolation in the Esmx framework are implemented based on native ESM.

## import map

import map is a browser-native mechanism used to control the mapping of ESM module import paths. Through import maps, dependency isolation and multi-package collaboration can be achieved, avoiding path conflicts between packages.

## Zero Runtime

Zero Runtime is a core design philosophy of Esmx, meaning that the framework itself does not introduce any additional runtime code. All functionality relies on native platform capabilities, thereby improving performance and reducing complexity.

## No Sandbox

No Sandbox means that Esmx does not rely on traditional sandbox mechanisms such as iframes for module isolation, but instead achieves security and isolation through native ESM and import maps, improving flexibility and performance.

## Dependency Isolation

Dependency Isolation means that dependencies between modules or packages do not interfere with each other. Esmx achieves dependency isolation through import maps and ESM, preventing conflicts between packages and ensuring system stability.

## Multi-Framework Integration

Multi-Framework Integration means that Esmx supports integrating and running multiple frontend frameworks (such as Vue, React, Svelte, etc.) within the same project, enabling collaborative development across multiple teams and technology stacks.

## Package Collaboration / Module Decoupling

Package Collaboration and Module Decoupling refer to the ability for packages or modules to be independently developed, tested, and deployed through the module linking mechanism, while working collaboratively at runtime to improve system maintainability and scalability.

## Micro Frontends

Micro Frontends is a frontend architecture pattern that allows multiple teams to independently develop, deploy, and run their respective frontend applications, which are then integrated into a whole through the host application. Esmx belongs to the micro-frontend architecture category.

## Host

Host refers to the main application in a micro-frontend or module linking architecture that is responsible for loading, integrating, and orchestrating remote applications or modules. The host application typically handles global routing, state management, and UI frameworks.

## Remote Application/Module

Remote Application or Module refers to independent sub-applications or functional modules that are dynamically loaded and integrated by the host application, supporting independent development, testing, and deployment.

## Application

Application refers to a frontend subsystem that can run and be deployed independently, typically containing complete pages, routing, and business logic.

## Module

Module refers to a functional unit that can be linked and reused, such as packages, component libraries, utility libraries, etc. It is the foundation for achieving decoupling and reuse in Esmx.

## Package

Package refers to NPM packages or Monorepo sub-packages, emphasizing physical structure and publishing units, and is the foundation for multi-package collaboration in Esmx. 
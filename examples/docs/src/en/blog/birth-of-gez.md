---
titleSuffix: "From Micro-Frontend Challenges to ESM Innovation: The Evolution of the Esmx Framework"
description: "Explore the journey of the Esmx framework from the challenges of traditional micro-frontend architectures to breakthroughs in ESM-based innovation. Share technical practices in performance optimization, dependency management, and build tool selection."
head:
  - - meta
    - property: keywords
      content: Esmx, Micro-Frontend Framework, ESM, Import Maps, Rspack, Module Federation, Dependency Management, Performance Optimization, Technical Evolution, Server-Side Rendering
sidebar: false
---

# From Component Sharing to Native Modularity: The Evolution of the Esmx Micro-Frontend Framework

## Project Background

Over the past few years, micro-frontend architecture has been searching for the right path. However, what we have seen are various complex technical solutions that simulate an ideal micro-frontend world with layers of packaging and artificial isolation. These solutions bring heavy performance burdens, complicate simple development, and obscure standard processes.

### Limitations of Traditional Solutions

In practicing micro-frontend architecture, we have deeply experienced the many limitations of traditional solutions:

- **Performance Overhead**: Runtime dependency injection, JS sandbox proxies—every operation consumes valuable performance.
- **Fragile Isolation**: Artificially created sandbox environments can never match the native isolation capabilities of browsers.
- **Build Complexity**: To handle dependency relationships, build tools must be heavily modified, making simple projects difficult to maintain.
- **Custom Rules**: Special deployment strategies and runtime processing deviate from standard modern development processes.
- **Ecosystem Constraints**: Framework coupling and custom APIs force technology choices to be tied to specific ecosystems.

These issues were particularly evident in a large enterprise project we worked on in 2019. At that time, a large product was divided into more than ten independent business subsystems, which needed to share a set of basic and business components. The initial npm-based component sharing solution exposed serious maintenance efficiency problems: when shared components were updated, all subsystems dependent on those components had to go through a complete build and deployment process.

## Technical Evolution

### v1.0: Exploring Remote Components

To address the efficiency issues of component sharing, Esmx v1.0 introduced the RemoteView component mechanism based on the HTTP protocol. This solution achieved on-demand code assembly between services through runtime dynamic requests, successfully solving the problem of long build dependency chains. However, due to the lack of a standardized runtime communication mechanism, state synchronization and event passing between services still had efficiency bottlenecks.

### v2.0: Module Federation Experiment

In version v2.0, we adopted [Webpack 5.0](https://webpack.js.org/)'s [Module Federation](https://webpack.js.org/concepts/module-federation/) technology. This technology significantly improved the collaboration efficiency between services through a unified module loading mechanism and runtime containers. However, in large-scale practice, the closed implementation mechanism of Module Federation brought new challenges: it was difficult to achieve precise dependency version management, especially when unifying shared dependencies across multiple services, often leading to version conflicts and runtime exceptions.

## Embracing the ESM Era

When planning version v3.0, we closely observed the development trends of the front-end ecosystem and found that advancements in native browser capabilities brought new possibilities for micro-frontend architecture:

### Standardized Module System

With mainstream browsers fully supporting [ES Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) and the maturity of the [Import Maps](https://github.com/WICG/import-maps) specification, front-end development has entered a true modular era. According to [Can I Use](https://caniuse.com/?search=importmap) statistics, the native support rate for ESM in mainstream browsers (Chrome >= 89, Edge >= 89, Firefox >= 108, Safari >= 16.4) has reached 93.5%, providing us with the following advantages:

- **Standardized Dependency Management**: Import Maps provide the ability to resolve module dependencies at the browser level, eliminating the need for complex runtime injection.
- **Resource Loading Optimization**: The browser's native module caching mechanism significantly improves resource loading efficiency.
- **Simplified Build Process**: The ESM-based development model makes the build process more consistent between development and production environments.

At the same time, with compatibility mode support (Chrome >= 87, Edge >= 88, Firefox >= 78, Safari >= 14), we can further increase browser coverage to 96.81%, allowing us to maintain high performance without sacrificing support for older browsers.

### Breakthroughs in Performance and Isolation

The native module system brings not only standardization but also qualitative improvements in performance and isolation:

- **Zero Runtime Overhead**: Eliminates the need for JavaScript sandbox proxies and runtime injection in traditional micro-frontend solutions.
- **Reliable Isolation Mechanism**: The strict module scope of ESM naturally provides the most reliable isolation capabilities.
- **Precise Dependency Management**: Static import analysis makes dependency relationships clearer and version control more precise.

### Build Tool Selection

In the implementation of the technical solution, the choice of build tools was a critical decision point. After nearly a year of technical research and practice, our selection evolved as follows:

1. **Vite Exploration**
   - **Advantages**: ESM-based development server, providing an excellent development experience.
   - **Challenges**: Differences between development and production builds introduced some uncertainty.

2. **[Rspack](https://www.rspack.dev/) Adoption**
   - **Performance Advantage**: High-performance compilation based on [Rust](https://www.rust-lang.org/), significantly improving build speed.
   - **Ecosystem Support**: High compatibility with the Webpack ecosystem, reducing migration costs.
   - **ESM Support**: Verified reliability in ESM builds through the Rslib project.

This decision allowed us to maintain a good development experience while gaining more stable production environment support. Based on the combination of ESM and Rspack, we ultimately built a high-performance, low-intrusive micro-frontend solution.

## Future Outlook

In future development plans, the Esmx framework will focus on the following three directions:

### Deep Optimization of Import Maps

- **Dynamic Dependency Management**: Implement intelligent runtime dependency version scheduling to resolve dependency conflicts between multiple applications.
- **Preloading Strategy**: Intelligent preloading based on route analysis to improve resource loading efficiency.
- **Build Optimization**: Automatically generate optimal Import Maps configurations, reducing manual configuration costs for developers.

### Framework-Agnostic Routing Solution

- **Unified Routing Abstraction**: Design a framework-agnostic routing interface to support mainstream frameworks like Vue and React.
- **Micro-Application Routing**: Implement routing linkage between applications to maintain URL and application state consistency.
- **Routing Middleware**: Provide an extensible middleware mechanism to support features like permission control and page transitions.

### Best Practices for Cross-Framework Communication

- **Example Applications**: Provide complete cross-framework communication examples, covering mainstream frameworks like Vue, React, and Preact.
- **State Synchronization**: Lightweight state sharing solution based on ESM.
- **Event Bus**: Standardized event communication mechanism to support decoupled communication between applications.

Through these optimizations and expansions, we aim to make Esmx a more comprehensive and user-friendly micro-frontend solution, providing developers with a better development experience and higher efficiency.
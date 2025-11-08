---
titleSuffix: "From Micro-Frontend Dilemma to ESM Innovation: The Evolution of Esmx Framework"
description: "Deep dive into Esmx framework's evolution from traditional micro-frontend architecture dilemmas to ESM-based innovations, sharing technical insights and practical experiences in performance optimization, dependency management, and build tool selection."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, micro-frontend framework, ESM, Import Maps, Rspack, module linking, module federation, dependency management, performance optimization, technical evolution, server-side rendering"
sidebar: false
---

# From Component Sharing to Native Modularization: The Evolution of Esmx Micro-Frontend Framework

## Project Background

In recent years, micro-frontend architecture has been searching for the right path. However, we encountered various complex technical solutions that used layers of packaging and artificial isolation to simulate an ideal micro-frontend world. These solutions imposed heavy performance burdens, complicated simple development tasks, and obscured standard processes.

### Limitations of Traditional Solutions

In our micro-frontend architecture practice, we experienced firsthand the many limitations of traditional solutions:

- **Performance Loss**: Runtime dependency injection and JS sandbox proxying consume precious performance with every operation
- **Fragile Isolation**: Artificially created sandbox environments can never reach the isolation capability of browser-native mechanisms
- **Build Complexity**: To handle dependency relationships, we had to modify build tools, making simple projects difficult to maintain
- **Customized Rules**: Special deployment strategies and runtime processing made every step deviate from modern development standard processes
- **Ecosystem Limitations**: Framework coupling and custom APIs forced technology choices to be bound to specific ecosystems

These issues were particularly prominent in an enterprise-level project in 2019. At that time, a large product was split into over a dozen independent business subsystems that needed to share a common set of basic and business components. The initial npm package-based component sharing solution revealed serious maintenance efficiency issues in practice: when shared components were updated, all dependent subsystems had to undergo a complete build and deployment process.

## Technical Evolution

### v1.0: Exploring Remote Components

To address the component sharing efficiency issues, Esmx v1.0 introduced an HTTP protocol-based RemoteView component mechanism. This approach enabled on-demand code assembly across services through runtime dynamic requests, successfully resolving problems with lengthy build dependency chains. However, the lack of standardized runtime communication mechanisms created efficiency bottlenecks in state synchronization and event transmission between services.

### v2.0: Module Federation Attempt

In version 2.0, we adopted [Webpack 5.0](https://webpack.js.org/)'s [Module Federation](https://webpack.js.org/concepts/module-federation/) technology. This approach significantly improved inter-service collaboration efficiency through a unified module loading mechanism and runtime container. However, in large-scale implementations, Module Federation's closed implementation mechanism introduced new challenges: achieving precise dependency version management became difficult, particularly when unifying shared dependencies across multiple services, often resulting in version conflicts and runtime exceptions.

## Embracing the ESM New Era

When planning version 3.0, we closely observed front-end ecosystem development trends and discovered that advances in browser native capabilities opened new possibilities for micro-frontend architecture:

### Standardized Module System

With comprehensive support for ES Modules across mainstream browsers and the maturation of the Import Maps specification, frontend development has entered a true modular era. According to Can I Use statistics, native ESM support in mainstream browsers (Chrome >= 89, Edge >= 89, Firefox >= 108, Safari >= 16.4) has reached 93.5%, providing us with several key advantages:

- **Standardized Dependency Management**: Import Maps provide browser-level module dependency resolution, eliminating the need for complex runtime injection
- **Optimized Resource Loading**: Browser-native module caching mechanisms significantly improve resource loading efficiency
- **Streamlined Build Process**: ESM-based development creates greater consistency between development and production build processes

At the same time, through compatibility mode support (Chrome >= 64, Edge >= 79, Firefox >= 67, Safari >= 11.1), we can further improve browser coverage to 95.59%, allowing us to maintain high performance without sacrificing support for older browsers.

### Performance and Isolation Breakthrough

The native module system brings not only standardization, but more importantly, substantial improvements in both performance and isolation:

- **Zero Runtime Overhead**: Eliminates JavaScript sandbox proxies and runtime injection found in traditional micro-frontend solutions
- **Reliable Isolation**: ESM's strict module scope naturally provides the most robust isolation capabilities
- **Precise Dependency Management**: Static import analysis makes dependency relationships clearer and version control more accurate

### Build Tool Selection

In the implementation process of the technical solution, the selection of build tools is a key decision point. After nearly a year of technical research and practice, our selection went through the following evolution:

1. **Vite Exploration**
   - Advantages: ESM-based development server delivers an excellent development experience
   - Challenges: Discrepancies between development and production build environments introduced some uncertainty

2. **Rspack Adoption**
   - Performance: Rust-based high-performance compilation significantly improves build speed
   - Ecosystem: High compatibility with the Webpack ecosystem reduces migration costs
   - ESM Support: Proven reliability in ESM builds through the Rslib project

This decision enabled us to achieve more stable production environment support while maintaining an excellent development experience. By combining ESM with Rspack, we ultimately built a high-performance, minimally intrusive micro-frontend solution.

## Future Outlook

In our future development roadmap, the Esmx framework will focus on the following three key directions:

### Import Maps Deep Optimization

- **Dynamic Dependency Management**: Implement intelligent runtime dependency version scheduling to solve dependency conflicts between multiple applications
- **Preload Strategy**: Intelligent preloading based on route analysis to improve resource loading efficiency
- **Build Optimization**: Automatically generate optimal Import Maps configuration to reduce developers' manual configuration costs

### Framework-Agnostic Routing Solution

- **Unified Routing Abstraction**: Design framework-agnostic routing interfaces, supporting Vue, React, and other mainstream frameworks
- **Micro-Application Routing**: Implement routing linkage between applications, maintaining consistency between URLs and application states
- **Routing Middleware**: Provide extensible middleware mechanisms, supporting permission control, page transitions, and other functions

### Cross-Framework Communication Best Practices

- **Example Applications**: Provide complete cross-framework communication examples, covering Vue, React, Preact, and other mainstream frameworks
- **State Synchronization**: ESM-based lightweight state sharing solution
- **Event Bus**: Standardized event communication mechanism, supporting decoupled communication between applications

Through these optimizations and extensions, we hope to make Esmx a more complete and easy-to-use micro-frontend solution, providing developers with a better development experience and higher development efficiency.
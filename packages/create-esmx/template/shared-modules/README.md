# {{projectName}}

An Esmx project demonstrating Shared Modules solution for micro-frontend architecture.

## 📦 Tech Stack

- **Framework**: [Esmx](https://esmnext.com) - Next generation micro-frontend framework based on native ESM
- **Solution Focus**: Shared Modules for multi-framework environments
- **Build Tool**: Rspack
- **Type Checking**: TypeScript

## 🎯 Core Features

- **Module Sharing**: Share modules across different framework versions
- **Zero Overhead**: Native ESM-based sharing with no runtime cost
- **Version Isolation**: Safe module sharing between framework versions
- **SSR Compatible**: Full server-side rendering support with shared modules

## 🚀 Quick Start

### Install Dependencies

```bash
pnpm install
```

### Development Environment

```bash
pnpm dev
```

Visit http://localhost:3000 to see the development environment.

### Production Build

```bash
pnpm build
```

### Start Production Server

```bash
pnpm start
```

### Type Generation

```bash
pnpm build:type
```

### Type Checking

```bash
pnpm lint:type
```

## 📁 Project Structure

```
{{projectName}}/
├── src/
│   ├── entry.client.ts     # Client-side entry
│   ├── entry.node.ts       # Node.js environment entry point
│   ├── entry.server.ts     # Server-side rendering functions
│   ├── vue/
│   │   └── index.ts        # Vue 3 shared modules
│   └── vue2/
│       └── index.ts        # Vue 2 shared modules
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration Details

- `entry.client.ts` - Responsible for client-side shared module consistency checking
- `entry.node.ts` - Handles shared module configuration and scope mapping
- `entry.server.ts` - Manages shared module rendering and HTML generation

## 📚 Additional Resources

- [Esmx Official Documentation](https://esmnext.com)
- [TypeScript Documentation](https://www.typescriptlang.org)

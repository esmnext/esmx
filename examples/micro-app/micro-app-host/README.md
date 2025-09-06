# micro-app-host

An Esmx project for Shared Packages.

## 📦 Tech Stack

- **Framework**: [Esmx](https://esmnext.com) - Next generation micro-frontend framework based on native ESM
- **Package Type**: Shared Packages
- **Build Tool**: Rspack
- **Type Checking**: TypeScript

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
micro-app-host/
├── src/
│   ├── entry.client.ts     # Client-side entry
│   ├── entry.node.ts       # Node.js environment entry point
│   └── entry.server.ts     # Server-side rendering functions
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration Details

- `entry.client.ts` - Responsible for client-side interaction and dynamic updates
- `entry.node.ts` - Handles server-side rendering and development server configuration
- `entry.server.ts` - Manages server-side rendering process and HTML generation

## 📚 Additional Resources

- [Esmx Official Documentation](https://esmnext.com)
- [TypeScript Documentation](https://www.typescriptlang.org)

# vue-csr-demo

An Esmx project with Vue 3 and Client-Side Rendering.

## 📦 Tech Stack

- **Framework**: [Esmx](https://esmx.dev) - Next generation micro-frontend framework based on native ESM
- **UI Framework**: Vue 3
- **Build Tool**: Rspack
- **Type Checking**: TypeScript
- **Rendering Mode**: Client-Side Rendering (CSR)

## 🚀 Quick Start

### Install Dependencies

```bash
npm install
```

### Development Environment

```bash
npm run dev
```

Visit http://localhost:3000 to see the development environment.

### Production Build

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

### Type Generation

```bash
npm run build:type
```

### Type Checking

```bash
npm run lint:type
```

## 📁 Project Structure

```
vue-csr-demo/
├── src/
│   ├── app.vue             # Main application component with Esmx and Vue logos
│   ├── components/         # UI components
│   │   └── hello-world.vue # Example component with counter functionality
│   ├── create-app.ts       # Vue instance creation
│   ├── entry.client.ts     # Client-side entry
│   ├── entry.node.ts       # Node.js environment entry point
│   └── entry.server.ts     # CSR HTML shell (no SSR)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration Details

- `entry.client.ts` - Responsible for client-side interaction and dynamic updates
- `entry.node.ts` - Handles development environment setup and tooling
- `entry.server.ts` - Generates the HTML shell for CSR (no SSR)

## 📚 Additional Resources

- [Esmx Official Documentation](https://esmx.dev)
- [Vue Documentation](https://vuejs.org)
- [TypeScript Documentation](https://www.typescriptlang.org)

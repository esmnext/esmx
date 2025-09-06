# vue2-app

An Esmx project with Vue2 and Server-Side Rendering.

## 📦 Tech Stack

- **Framework**: [Esmx](https://esmnext.com) - Next generation micro-frontend framework based on native ESM
- **UI Framework**: Vue2 with Composition API
- **Build Tool**: Rspack
- **Type Checking**: TypeScript
- **Rendering Mode**: Server-Side Rendering (SSR)

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
vue2-app/
├── src/
│   ├── app.vue             # Main application component with Esmx and Vue logos
│   ├── components/         # UI components
│   │   └── hello-world.vue # Example component with counter functionality
│   ├── create-app.ts       # Vue instance creation
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
- [Vue2 Documentation](https://v2.vuejs.org)
- [TypeScript Documentation](https://www.typescriptlang.org)
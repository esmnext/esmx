# {{projectName}}

An Esmx project with Vue3 and Server-Side Rendering.

## 📦 Tech Stack

- **Framework**: [Esmx](https://esmnext.com) - Next generation micro-frontend framework based on native ESM
- **UI Framework**: Vue3
- **Build Tool**: Rspack
- **Type Checking**: TypeScript
- **Rendering Mode**: Server-Side Rendering (SSR)

## 🚀 Quick Start

### Install Dependencies

```bash
{{installCommand}}
```

### Development Environment

```bash
{{devCommand}}
```

Visit http://localhost:3000 to see the development environment.

### Production Build

```bash
{{buildCommand}}
```

### Start Production Server

```bash
{{startCommand}}
```

### Type Generation

```bash
{{buildTypeCommand}}
```

### Type Checking

```bash
{{lintTypeCommand}}
```

## 📁 Project Structure

```
{{projectName}}/
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
- [Vue3 Documentation](https://vuejs.org)
- [TypeScript Documentation](https://www.typescriptlang.org)
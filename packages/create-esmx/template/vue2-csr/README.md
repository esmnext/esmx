# {{projectName}}

An Esmx project with Vue 2 and Client-Side Rendering.

## 📦 Tech Stack

- **Framework**: [Esmx](https://esmx.dev) - Next generation micro-frontend framework based on native ESM
- **UI Framework**: Vue 2 with Composition API
- **Build Tool**: Rspack
- **Type Checking**: TypeScript
- **Rendering Mode**: Client-Side Rendering (CSR)

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
- [Vue 2 Documentation](https://v2.vuejs.org)
- [TypeScript Documentation](https://www.typescriptlang.org)

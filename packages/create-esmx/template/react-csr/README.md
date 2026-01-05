# {{projectName}}

An Esmx project with React and Client-Side Rendering.

## 📦 Tech Stack

- **Framework**: [Esmx](https://esmx.dev) - Next generation micro-frontend framework based on native ESM
- **UI Framework**: React 18
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
│   ├── app.tsx             # Main application component with Esmx and React logos
│   ├── components/         # UI components
│   │   └── hello-world.tsx # Example component with counter functionality
│   ├── create-app.tsx     # React app instance creation
│   ├── entry.client.ts    # Client-side entry
│   ├── entry.node.ts      # Node.js environment entry point
│   └── entry.server.tsx   # CSR HTML shell (no SSR)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔧 Configuration Details

- `entry.client.ts` - Responsible for client-side interaction and dynamic updates
- `entry.node.ts` - Handles development environment setup and tooling
- `entry.server.tsx` - Generates the HTML shell for CSR (no SSR)

## 📚 Additional Resources

- [Esmx Official Documentation](https://esmx.dev)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)


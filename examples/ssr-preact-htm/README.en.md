# Esmx SSR Preact HTM

A server-side rendering example based on Preact and HTM, demonstrating how to build modern componentized applications with Esmx. HTM (Hyperscript Tagged Markup) provides a JSX alternative that doesn't require a compiler.

## Features

- **High Performance** - Lightweight virtual DOM implementation based on Preact
- **Zero Config** - HTM provides template syntax without compilation
- **Component-based** - Complete component-based development experience
- **Small Size** - Runtime only 4KB, suitable for performance-sensitive scenarios

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/esmnext/esmx.git
cd esmx/examples/ssr-preact-htm
```

2. Install pnpm (if not installed)
```bash
npm install -g pnpm
```

3. Install dependencies
```bash
pnpm install
```

4. Start development server
```bash
pnpm dev
```

## Project Structure

```
src/
├── app.ts             # Application root component
├── style.css          # Global styles
├── entry.client.ts    # Client entry
├── entry.server.ts    # Server entry
├── entry.node.ts      # Node environment entry
└── file.d.ts          # Type declarations
```

## Live Preview

Visit the [live example](https://esmx.dev/ssr-preact-htm/) to see it in action.

## Related Links

- [Documentation](https://esmx.dev/)
- [GitHub Repository](https://github.com/esmnext/esmx)

## License

MIT

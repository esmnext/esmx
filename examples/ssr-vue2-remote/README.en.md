# Esmx SSR Vue2 Remote

A Vue2-based microfrontend Remote application example demonstrating how to build independent modules that can be integrated by Host applications using Esmx, with server-side rendering support.

## Features

- 🚀 **High Performance** - Built on Rust-powered Rspack for ultimate build performance
- 💡 **Module Export** - Supports Module Linking for seamless integration by other applications
- 🛠 **Developer Experience** - Fast hot reload, friendly error messages, and complete type support
- 📱 **SSR Support** - Complete server-side rendering support to ensure SSR capability integration with Host applications

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/esmnext/esmx.git
cd esmx/examples/ssr-vue2-remote
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
├── components/             # Shared components
│   └── button/             # Button component
├── styles/                 # Global styles
├── assets/                 # Static assets
├── entry-client.ts         # Client entry
├── entry-server.ts         # Server entry
├── entry.node.ts           # Module Linking export configuration
└── App.vue                 # Root component
```

## Live Preview

Visit the [live example](https://esmx.dev/ssr-vue2-remote/) to see it in action.

## Related Links

- [Documentation](https://esmx.dev/)
- [GitHub Repository](https://github.com/esmnext/esmx)

## License

MIT

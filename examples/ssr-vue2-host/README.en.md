# Esmx SSR Vue2 Host

A Vue2-based microfrontend Host application example demonstrating how to build modern server-side rendering applications with Esmx and integrate Remote applications through Module Linking.

## Features

- 🚀 **High Performance** - Built on Rust-powered Rspack for ultimate build performance
- 💡 **Microfrontend Architecture** - Use Module Linking for application decoupling and independent deployment
- 🛠 **Developer Experience** - Fast hot reload, friendly error messages, and complete type support
- 📱 **SSR Support** - Complete server-side rendering support for better first-screen experience and SEO

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/esmnext/esmx.git
cd esmx/examples/ssr-vue2-host
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
│   └── layout/             # Layout components
├── pages/                  # Page components
│   ├── home/               # Home page
│   └── about/              # About page
├── styles/                 # Global styles
├── assets/                 # Static assets
├── entry-client.ts         # Client entry
├── entry-server.ts         # Server entry
├── router.ts               # Route configuration
└── App.vue                 # Root component
```

## Live Preview

Visit the [live example](https://esmx.dev/ssr-vue2-host/) to see it in action.

## Related Links

- [Documentation](https://esmx.dev/)
- [GitHub Repository](https://github.com/esmnext/esmx)

## License

MIT

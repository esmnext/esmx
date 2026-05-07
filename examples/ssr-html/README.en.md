# Esmx SSR HTML

A complete HTML server-side rendering example demonstrating how to build modern web applications with Esmx, including routing, components, styles, and asset management.

## Features

- 🚀 **High Performance** - Built on Rust-powered Rspack for ultimate build performance
- 💡 **Complete Features** - Includes routing, components, styles, images, and more
- 🛠 **Developer Experience** - Fast hot reload, friendly error messages, and complete type support
- 📱 **Responsive** - Modern responsive design, perfectly adapted to all devices

## Quick Start

1. Clone the repository
```bash
git clone https://github.com/esmnext/esmx.git
cd esmx/examples/ssr-html
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
├── components/         # Shared components
│   ├── layout.ts       # Layout component
│   └── layout.css      # Layout styles
├── views/              # Page components
│   ├── home.ts         # Home page
│   ├── about.ts        # About page
│   └── not-found.ts    # 404 page
├── styles/             # Global styles
├── images/             # Image assets
├── entry.client.ts     # Client entry
├── entry.server.ts     # Server entry
├── entry.node.ts       # Node environment entry
├── routes.ts           # Route configuration
└── page.ts             # Base page class
```

## Live Preview

Visit the [live example](https://esmx.dev/ssr-html/) to see it in action.

## Related Links

- [Documentation](https://esmx.dev/)
- [GitHub Repository](https://github.com/esmnext/esmx)

## License

MIT

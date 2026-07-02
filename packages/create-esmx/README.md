<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>create-esmx</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/create-esmx">
      <img src="https://img.shields.io/npm/v/create-esmx.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://esmx.dev/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/create-esmx.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/create-esmx">
      <img src="https://img.shields.io/bundlephobia/minzip/create-esmx" alt="size" />
    </a>
  </div>
  
  <p>A scaffold tool for creating Esmx projects</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/create-esmx/README.zh-CN.md">中文</a>
  </p>
</div>

## 🚀 Features

- **Interactive CLI** - Friendly command-line interactive interface
- **Multiple Templates** - Support for multiple project templates
- **TypeScript Support** - Complete TypeScript type support
- **Automatic Configuration** - Automatic project structure initialization

## 📦 Installation

```bash
# npm
npm create esmx@latest my-project

# pnpm
pnpm create esmx my-project

# yarn
yarn create esmx my-project
```

## 🚀 Quick Start

```bash
# Create a new project with interactive prompts
npm create esmx@latest my-project

# Or use pnpm
pnpm create esmx my-project
```

Follow the interactive prompts to select:
- **Project name** - Your project directory name
- **Template** - Choose from Vue SSR, Vue CSR, React SSR, React CSR, Vue2 SSR, Vue2 CSR, or Shared Modules

Then start development. The CLI prints the exact next-step commands for the package manager you scaffolded with — in general:
```bash
cd my-project
npm install   # or: pnpm install / yarn
npm run dev   # or: pnpm dev / yarn dev
```

## 📚 Documentation

Visit the [official documentation](https://esmx.dev) for detailed usage guides and API references.

## 📄 License

MIT © [Esmx Team](https://github.com/esmnext/esmx) 
<div align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>create-esmx</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/create-esmx">
      <img src="https://img.shields.io/npm/v/create-esmx.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
  </div>
  
  <p>A scaffold tool for creating Esmx projects</p>
  
  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/create-esmx/README.zh-CN.md">中文</a>
  </p>
</div>

## Features

- Interactive command-line interface
- Multiple project templates
- Full TypeScript support
- Automatic project configuration

## Installation

```bash
# Using npm
npm create esmx@latest my-project

# Using yarn
yarn create esmx my-project

# Using pnpm
pnpm create esmx my-project
```

## Options

```
Usage:
  create-esmx [project-name] [options]

Options:
  -t, --template <template>  Template to use (default: vue2)
  -f, --force                Force overwrite existing directory
  -h, --help                 Show help information
  -v, --version              Show version number
```

## Available Templates

Currently supported templates:

- `vue2` - Vue 2 project template

## License

MIT © Esmx Team 
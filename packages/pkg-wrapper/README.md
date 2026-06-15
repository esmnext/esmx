<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/pkg-wrapper</h1>

  <div>
    <a href="https://www.npmjs.com/package/@esmx/pkg-wrapper">
      <img src="https://img.shields.io/npm/v/@esmx/pkg-wrapper.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/pkg-wrapper.svg" alt="node version" />
    </a>
  </div>

  <p>Static named-export wrappers (<code>esmx://&lt;spec&gt;</code>) for CommonJS / ESM packages on the Esmx federation boundary</p>

  <p>
    English | <a href="https://github.com/esmnext/esmx/blob/master/packages/pkg-wrapper/README.zh-CN.md">中文</a>
  </p>
</div>

## Why

Esmx exports a federated package such as `react` as its own ESM chunk so every remote can share one copy at runtime. Building that chunk with a bundler entry pointed at `react` works in production, but in **development mode** rspack / rsbuild skip CJS named-export enumeration for the entry — `import { useState } from 'react'` then resolves to `undefined` and SSR crashes with `createContext is not a function`.

This package generates a small **virtual wrapper module** for each `pkg:` export. The wrapper imports the real package by its original specifier and re-exports every static named export explicitly — so the federation chunk preserves the package's API regardless of the bundler's enumeration shortcut.

```
        ┌───────────────────────────────────────┐
   pkg:react ──▶│  esmx://react   (virtual module)      │
                │                                       │
                │  export { useState, createContext,    │
                │           ... } from 'react';         │
                │  export { default } from 'react';     │
                └───────────────────────────────────────┘
                                │ bundler entry
                                ▼
                  federation chunk (react.<hash>.mjs)
                                │ import map
                                ▼
                          consumer remote
```

## Features

- **Bundler-aligned enumeration** — uses `cjs-module-lexer` (for CJS packages) and `es-module-lexer` (for ESM packages), the exact tools rspack / vite / rolldown use internally
- **Conditional CJS branches** — for the classic `if (NODE_ENV === 'production') module.exports = require('./prod') else require('./dev')` pattern (react, vue, react-dom), lexes both branches and takes the **intersection** so the wrapper compiles under whichever variant the bundler picks
- **ESM `export *` recursion** — follows `export * from './impl'` re-exports across files (vue's `index.mjs` → `index.js` chain)
- **ESM-only `exports` map** — resolves bare specifiers via `import.meta.resolve` first, so packages whose `package.json` only exposes an `import` condition (e.g. `@esmx/router`) still work
- **No runtime evaluation** — never executes the target package; surface-only inspection avoids picking up dynamic dev-only properties (e.g. react's `act`) that the bundler's static lexer won't see

## Installation

```bash
npm install @esmx/pkg-wrapper
# or
pnpm add @esmx/pkg-wrapper
```

## Usage

```ts
import { buildPkgWrapper } from '@esmx/pkg-wrapper';

const { source, names, hasDefault } = await buildPkgWrapper({
    root: '/path/to/project',
    spec: 'react'
});

// source:
//   export { useState, createContext, ... } from "react";
//   export { default } from "react";
```

Plug the `source` into your bundler's virtual-modules system:

| Bundler | Mechanism |
|---|---|
| Vite / Rolldown | Plugin `resolveId` + `load` hooks |
| rspack / rsbuild | [`rspack-plugin-virtual-module`](https://www.npmjs.com/package/rspack-plugin-virtual-module) |

That's how `@esmx/rspack`, `@esmx/rsbuild`, and `@esmx/vite` integrate this package — see their source for reference.

## API

### `buildPkgWrapper(opts): Promise<{ source, names, hasDefault }>`

Probe a package and return the wrapper source ready to install as a virtual module.

```ts
interface BuildPkgWrapperOptions {
    /** Project root (used as the resolution origin). */
    root: string;
    /** The pkg specifier — what the user wrote in `pkg:react`. */
    spec: string;
}
```

### `generatePkgWrapperSource(spec, names, hasDefault): string`

Pure source-string builder. Useful when you already have a names list.

### `inspectPkg(root, spec): Promise<{ names, hasDefault }>`

Just the probe step — returns the names a wrapper would expose.

## License

MIT

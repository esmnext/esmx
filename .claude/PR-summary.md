# PR Summary — Vite 8 + Federation Wrapper Architecture

> This summary covers the major architectural changes layered onto PR #300
> (feat: add Vite and Rsbuild integrations) during the validation push.
> Source-of-truth is the diff itself; this is the human-readable narrative.

## 1. Vite 7 → 8(rolldown 1.0.3)

**Why**: keep parity with the current Vite latest; surface rolldown-specific issues early.

**Changes**:
- `@esmx/vite` deps: `vite` ^7.0.0 → ^8.0.0
- `@esmx/vite-react` deps: `@vitejs/plugin-react` ^5 → ^6 (peer requires vite ^8)
- `examples/ssr-vite-html` deps: vite ^8
- `@esmx/vite` tsconfig: `moduleResolution: node` → `bundler` (vite 8 types require)
- `examples/ssr-vite-react`, `ssr-rsbuild-react`, `templates/react-csr`: react ^18 → ^19.2.6 (dedup with the rest of the repo)

**New plugin** — `packages/vite/src/vite/external-require-plugin.ts`:
- Rolldown 1.0.3 ESM output for CJS modules that depend on an EXTERNAL package emits
  `var __require = createRequire(import.meta.url); var React = __require("react")`.
  That `createRequire` bypasses esmx's `module.register` ESM resolve hook (and the
  browser has no `createRequire` at all), splitting the react instance and crashing
  SSR / hydration.
- The plugin runs in `generateBundle` (rolldown injects these helpers AFTER
  `renderChunk`) and:
  1. patches the `__toESM` ternary so `.default = exports` is set
     unconditionally (vue's `runtime-dom` was hitting the
     `__esModule: true` skip path);
  2. rewrites `<alias>("<external>")` call sites to top-level
     `import * as __esmExt_<X> from "<X>"`, routing both sides of the chunk
     graph through ESM resolve.

Verified by an isolated demo: a pure vite-8 + rolldown SSR app works on its own
but crashes with `useState is not a function` once `module.register` rewrites
the bare `react` specifier — exactly the esmx federation case.

## 2. Federation wrapper architecture(`@esmx/pkg-wrapper`)

**Why**: rspack / rsbuild **dev mode** skips CJS named-export enumeration for
the federation entry — `import { useState } from 'react'` resolves to
`undefined`, SSR crashes with `createContext is not a function`. Prod build is
fine (it does the enumeration); only dev is affected. Vite has the same shape
of problem but in a different mode.

**New package** — `packages/pkg-wrapper`:
- Exports `buildPkgWrapper`, `inspectPkg`, `generatePkgWrapperSource`.
- Uses **`cjs-module-lexer`** (CJS) and **`es-module-lexer`** (ESM), the exact
  tools rspack / vite / rolldown use internally — so the names we emit
  in the wrapper match the names the bundler can see during static analysis.
- Handles the four real-world shapes encountered:
  - CJS `if (NODE_ENV === 'production') module.exports = require('./prod')
    else require('./dev')` (react, react-dom, react-router) → lex **both**
    branches, take the **intersection**;
  - ESM proxy `export * from './impl'` (vue's `index.mjs` → `index.js`) →
    recursive ESM lex falling through to CJS lex at the boundary;
  - ESM-only `exports` map with only an `import` condition
    (`@esmx/router`) → resolved via Node 24's `findPackageJSON` (the two-arg
    form of `import.meta.resolve` is unreliable across cwd contexts);
  - Failing-package graceful warn (no throw, empty result).

**Adapter integration** — every federation `pkg:` export is installed as a
**virtual module** (mental model: `esmx://<spec>`):

| Adapter | Virtual mechanism |
|---|---|
| `@esmx/vite` | native rolldown `resolveId` + `load` plugin hooks (`esmxPkgReexportPlugin` in `vite/config.ts`) |
| `@esmx/rspack` | `rspack-plugin-virtual-module@^1.0.1` (new dep) |
| `@esmx/rsbuild` | `rspack-plugin-virtual-module@^1.0.1` (new dep) |

The entry points at the virtual id; the wrapper internally does
`export { useState, ... } from 'react'`; the bundler's externalizer is told
to **skip** that import when the issuer is the wrapper itself (otherwise the
wrapper would loop back through `module.register` and `import` itself).

## 3. Dependency churn

- **New**: `cjs-module-lexer`, `es-module-lexer` (already a core dep, now also in
  pkg-wrapper), `rspack-plugin-virtual-module` (rspack + rsbuild)
- **Bumped**: `vite` ^7→^8, `@vitejs/plugin-react` ^5→^6
- **Workspace**: new package `@esmx/pkg-wrapper` (depended on by rspack /
  rsbuild)

## 4. Verification (this session)

| Surface | Result |
|---|---|
| `pnpm build` × 21 examples (17 micro remotes + 4 standalones) | ✅ |
| `lint:type` × 17 packages | ✅ |
| Unit tests × 8 packages | ✅ **1438 tests** (1428 + 10 new in pkg-wrapper) |
| Standalone runtime SSR(`node dist/index.mjs` + curl) × 20 | ✅ |
| **Hub-composed cross-remote SSR × 20 paths**(15 remotes + landing + demo + 3 zh) | ✅ |
| Dev SSR matrix × 12 (vite + rspack + rsbuild × {react, vue, html, preact, solid, svelte, lit}) | ✅ |
| Browser hydration via hub:`/react/`, `/vue3/`, `/vite-react/`, `/rsbuild-vue/` — counter actually updates | ✅ |

See `.claude/validation-matrix.md` for the row-by-row tally and iteration log.

## 5. Known limitations

- `ssr-vite-vue` standalone postBuild SSR works in this session(was a stub
  earlier; restored). Still produces an `<h1>Vue SSR Demo`-rendered
  index.html. Live deploy(Cloudflare Pages) needs a re-run after merging
  since SRI hashes change with the new wrapper.
- Preview MCP proxy alters byte-stream-on-the-wire, mismatching SRI in some
  sessions(infrastructure-only; real deployments unaffected, as verified
  via curl directly against `node dist/index.mjs`).

## 6. Next steps

- Automate the matrix(this session's `.claude/validation-matrix.md` →
  CI workflow with the same checks).
- Open upstream issues:
  - rolldown 1.0.3 `__require` external CJS handling(esmx tracks via
    the local patch in `external-require-plugin.ts`).
  - rolldown 1.0.3 `__toESM` mis-skipping `.default` for
    `__esModule:true` CJS modules.

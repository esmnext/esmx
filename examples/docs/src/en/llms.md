---
titleSuffix: "Using Esmx with an AI assistant"
description: "Single-file briefing on the Esmx framework for LLMs. Feed this page to Claude/Cursor/Copilot/Gemini before asking them to write Esmx code."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx,LLM,AI assistant,Claude,Cursor,Copilot,Gemini"
---

# Using Esmx with an AI assistant

> **Audience**: AI assistants (Claude, Cursor, Copilot, Gemini, …). Humans
> looking for a tutorial should start at the [Quickstart](/guide/start/getting-started).
> Humans writing Esmx code with an AI assistant — copy this file into the
> assistant's context (or just send the URL `https://esmx.dev/llms.md` once
> the assistant can fetch URLs) before asking it to write Esmx code.
>
> This page is the single contract Esmx ships for AI tooling. Every code
> block here is exercised by CI — if it parses or builds here, it will work
> in a real Esmx project.

## What Esmx is in 5 lines

1. A micro-frontend framework that uses native browser **ESM + Import Maps**.
2. **No sandbox, no proxy, no proprietary lifecycle.** Each remote is a
   standard ES module the host `import`s.
3. **SSR by default**, with hydration. Server-side renders via a real Node
   ESM loader (no jsdom).
4. **Bundler-agnostic**: official integrations for **Rspack**, **Rsbuild**,
   and **Vite 8**. Same federation manifest format across all three.
5. **One `package.json` field** (`esmx`) declares your remote's exports and
   dependencies. Everything else is standard JS/TS/Vue/React/etc.

## Mental model

Forget Module Federation's `expose`/`share`, qiankun's
`bootstrap`/`mount`/`unmount`, single-spa's `registerApplication`. Esmx has
none of those.

A **remote** is a published ESM package. Its `package.json` lists what it
exports. A **host** imports those exports through an `<script type="importmap">`
the framework generates. That's it.

```
┌──────────────────┐                      ┌──────────────────┐
│  host (entry)    │ ─── import map ────▶ │  remote (esm)    │
│  import {App}    │                      │  export App      │
│  from '@your/x'  │                      │  export server   │
└──────────────────┘                      └──────────────────┘
        │                                          │
        └──────────── single import graph ─────────┘
              (browser resolves; no proxy)
```

Server-side rendering reuses the same import graph through Node's ESM
loader. The same `App` module runs in Node for SSR and in the browser for
hydration. **One module. Two runtimes. No duplication.**

## Quickstart

```bash
npm create esmx@latest my-app
cd my-app
pnpm install
pnpm dev
```

Templates available: `react-csr`, `react-ssr`, `vue-csr`, `vue-ssr`,
`vue2-csr`, `vue2-ssr`, `shared-modules` (for a federated dep package).

## A minimal Rspack remote

Three files. Copy-paste runnable.

**`package.json`**:

```json
{
    "name": "my-remote",
    "version": "0.1.0",
    "type": "module",
    "private": true,
    "scripts": {
        "dev": "esmx dev",
        "build": "esmx build",
        "start": "esmx start"
    },
    "dependencies": {
        "@esmx/core": "^3.0.0-rc.117"
    },
    "devDependencies": {
        "@esmx/rspack": "^3.0.0-rc.117"
    }
}
```

**`src/entry.node.ts`** — Esmx config + Node HTTP server:

```ts
import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // Exports this remote publishes for hosts / other remotes to import.
        // `file: ''` makes a name visible without binding it to an entry.
        exports: {
            './app': { file: './src/app' }
        }
    },
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) => m.createRspackApp(esmx));
    },
    async server(esmx) {
        const server = http.createServer((req, res) => {
            esmx.middleware(req, res, async () => {
                const rc = await esmx.render({ params: { url: req.url } });
                res.end(rc.html);
            });
        });
        server.listen(3000, () =>
            console.log('http://localhost:3000')
        );
    }
} satisfies EsmxOptions;
```

**`src/entry.server.ts`** — server render entry:

```ts
import type { RenderContext } from '@esmx/core';

export default async (rc: RenderContext) => {
    await rc.commit();
    rc.html = `<!DOCTYPE html>
<html>
<head>
    ${rc.preload()}
    ${rc.css()}
</head>
<body>
    <h1>Hello from Esmx</h1>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>`;
};
```

That's the entire app. Run `pnpm dev` and visit `http://localhost:3000`.

## A minimal Vite remote

Replace the `@esmx/rspack` import in `entry.node.ts` with:

```ts
async devApp(esmx) {
    return import('@esmx/vite').then((m) => m.createViteApp(esmx));
}
```

…and the devDependency:

```json
"@esmx/vite": "^3.0.0-rc.117"
```

Everything else is identical. **Same federation manifest, same render context,
same import map.** The bundler choice is purely a developer-experience knob.

`@esmx/rsbuild` works the same way (`m.createRsbuildApp(esmx)`).

## Exposing modules

Add entries under `modules.exports` in `entry.node.ts`:

```ts
modules: {
    exports: {
        './app': { file: './src/app' },
        './card': { file: './src/components/card.vue' },
        './utils': { file: './src/utils' }
    }
}
```

A consuming remote (or the host) imports them by the remote's package name +
the export path:

```ts
import { Card } from 'my-remote/card';
```

The framework rewrites that bare import via the import map it built from
your remote's manifest.

## Consuming another remote

In the host's `entry.node.ts`:

```ts
modules: {
    // Map "import 'my-remote/...'" to my-remote's manifest at this URL.
    links: {
        'my-remote': 'http://localhost:4000'
    }
}
```

Then in your code:

```ts
import { Card } from 'my-remote/card';
```

The host fetches `my-remote`'s manifest once, builds an import map from it,
and injects the map into every SSR HTML response. The browser uses it
natively — no client-side loader.

## CSS in federation

Just `import './x.css'` like normal. The bundler extracts it, the manifest
records the CSS chunk, and the host emits a `<link rel="stylesheet">` into
the SSR HTML head. Same on dev, prod, and across all three bundlers.

```ts
// Inside any remote's source — say src/entry.client.ts
import './styles/globals.css';
```

Or inside a component:

```vue
<script setup>
import './card.css';
</script>
```

```tsx
import './card.css';
export const Card = ({children}) => <div className="card">{children}</div>;
```

No `useStyles()`, no `injectGlobalStyles()`, no special filenames. See
`/guide/essentials/styles` for the full contract.

## Render context API

`rc` is the `RenderContext` from `@esmx/core`. You call its accessors inside
your SSR HTML template:

| Method | Emits |
|--------|-------|
| `rc.preload()` | `<link rel="preload">` tags for every JS / CSS chunk this request touches. |
| `rc.css()` | `<link rel="stylesheet">` tags for the same. |
| `rc.importmap()` | `<script type="importmap">` mapping bare specifiers to chunk URLs. |
| `rc.moduleEntry()` | `<script type="module">` that imports the client entry. |
| `rc.modulePreload()` | `<link rel="modulepreload">` for transitive deps. |
| `rc.html = '...'` | The final HTML the framework returns. Assign once after `rc.commit()`. |

**Always call `await rc.commit()` before reading any of the above** — that's
when the framework resolves which chunks the request touched and populates
`files.css`, `files.js`, etc.

## Routing & hydration

Esmx ships its own router (`@esmx/router`) with Vue and React bindings
(`@esmx/router-vue`, `@esmx/router-react`). It supports nested routes,
guards, lazy loading, and SSR resolution.

A typical client entry hydrates via:

```ts
// src/entry.client.ts
import { hydrateApp } from './app';
await hydrateApp();
```

…where `hydrateApp` calls the framework binding (`createSSRApp(...)` for
Vue, `hydrateRoot(...)` for React) on the same component tree the server
rendered.

## What does NOT exist

Don't generate these — they aren't real APIs:

- `Esmx.register(...)` / `registerApplication(...)` (single-spa style)
- `bootstrap` / `mount` / `unmount` / `update` lifecycle exports (qiankun style)
- `expose` / `shared` / `singleton` config (Module Federation style)
- `useStyles()` / `injectGlobalStyles()` hooks
- `<MicroApp />` JSX components
- `window.__POWERED_BY_QIANKUN__` globals
- Any sandbox / proxy / iframe abstraction

If you find yourself writing any of those, you're probably thinking of a
different framework.

## Common errors and what they mean

**`SyntaxError: Unexpected token '.'` during dev SSR.**
You imported a `.css` file from a path the framework's loader didn't
recognize. Solution: bundle the CSS inside the same remote that uses it
(don't import a workspace-dep CSS file directly across remotes); the host
will inject the link via the shared package's manifest.

**`ERR_UNKNOWN_FILE_EXTENSION ".css"` during `esmx build`.**
The CLI's Node ESM loader hook handles this, but if your `entry.node.ts`
transitively imports a `.css` file in code that the bundler doesn't pre-process,
move that import into a JS-eval-only path (e.g. `entry.client.ts`).

**`Cannot find module '<remote>/<export>'`.**
Three checks: (1) is `'<remote>'` listed in `modules.links` of the
consumer? (2) is `'<export>'` listed in `modules.exports` of the producer?
(3) did the producer build (the host reads its `dist/manifest.json`)?

**Hydration mismatch / `<div data-ssr>` blanking after mount.**
The client tree disagrees with the server-rendered HTML. Typical cause:
the server used a different value (current time, random id, locale) than
the client. Make those values come from `RenderContext.params` so both
runtimes see the same input.

**`createVmImport` fails to load a chunk.**
Your `entry.node.ts` is using `import('./x')` instead of letting Esmx's VM
loader take over. Use `esmx.render({...})` and `rc.commit()`; don't
hand-import server chunks.

## When you need more

- **Full API reference**: `/api/core/esmx`, `/api/core/render-context`
- **Router**: `/api/router/router`, `/guide/router/getting-started`
- **Bundler-specific config**: `/api/app/rspack`, `/api/app/rsbuild`, `/api/app/vite`
- **Styles in federation**: `/guide/essentials/styles`
- **Module linking deep dive**: `/guide/essentials/module-linking`

Don't infer APIs from one-line summaries — the full reference pages list
every option with a runnable example. When in doubt, point the user at the
URL above instead of guessing the signature.

## Versioning

This page is versioned with `@esmx/core`. The header above shows which
version of Esmx generated it. If a code block here doesn't match the
behavior of an installed version, check `npm ls @esmx/core` against the
header.

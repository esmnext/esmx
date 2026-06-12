---
titleSuffix: "Using Esmx with an AI assistant"
description: "Single-file briefing on the Esmx framework for LLMs: the package.json esmx module protocol, validate/migrate CLI loop, and legacy syntax. Feed this page to Claude/Cursor/Copilot/Gemini before asking them to write Esmx code."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx,LLM,AI assistant,Claude,Cursor,Copilot,Gemini,module protocol"
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
5. **One `package.json` field** (`esmx`) declares your remote's entries,
   exports, and dependencies. Everything else is standard JS/TS/Vue/React/etc.

## Mental model

Forget Module Federation's `expose`/`share`, qiankun's
`bootstrap`/`mount`/`unmount`, single-spa's `registerApplication`. Esmx has
none of those.

A **remote** is a published ESM package. Its `package.json` declares what it
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

## The module protocol: declare in `package.json` `esmx`

All protocol facts live in **one `package.json` field**, `esmx`, with
exactly **four optional sub-fields**. `entry.node.ts` keeps only
*behavior* (`devApp`, `server`, `postBuild`) — protocol facts placed
there are an error (`E_PROTOCOL_IN_BEHAVIOR`).

| Field | Meaning |
|---|---|
| `entry` | The framework entries (`client` / `server`), declared like any other export. Library-only modules simply omit it. |
| `exports` | Subpath map with **logical names**: keys are `./<name>`, values are relative source files or `{ client, server }` forks (`false` disables a side). Consumers never see your physical paths. |
| `provides` | Plain array of third-party packages this module re-exports for consumers (e.g. `["vue"]`). The provided version is your **resolved installed version**, captured into the manifest at build time. |
| `uses` | Plain array of **module names** you consume from. Not specifiers, not versions — just names. **Array order is load-bearing** (see the merge rule below). |

A module's declaration is strictly **local knowledge**: you can write it —
human or agent — knowing nothing about any other module. Three roles cover
every project:

### Role 1 — provider (a shared platform package)

```json
{
    "name": "shared",
    "version": "3.2.1",
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": {
            "./ui": "./src/ui/index.ts",
            "./store": {
                "client": "./src/store.client.ts",
                "server": "./src/store.server.ts"
            }
        },
        "provides": ["vue", "@esmx/router"]
    }
}
```

Consumers import `'shared/ui'` — a logical name. Renaming
`src/ui/index.ts` is no longer a breaking change.

### Role 2 — consumer + provider (a feature remote)

```json
{
    "name": "cart",
    "version": "1.8.0",
    "dependencies": { "shared": "^3.0.0" },
    "peerDependencies": { "vue": "^3.4.0", "@esmx/router": "^3.0.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": { "./widget": "./src/cart-widget.ts" },
        "uses": ["shared"]
    }
}
```

Note what is **absent**: no `imports` map, no per-specifier wiring, no
version field inside `esmx`. The version range lives where npm already
puts it — `dependencies` (∪ `peerDependencies`) — and is validated at
build time against the mounted artifact's actual version.

### Role 3 — composer (the host)

```json
{
    "name": "host",
    "version": "2.0.0",
    "dependencies": { "shared": "^3.0.0", "cart": "^1.5.0" },
    "peerDependencies": { "vue": "^3.4.0", "@esmx/router": "^3.0.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "uses": ["shared", "cart"]
    }
}
```

`uses` is **transitive**: if `cart` uses `shared`, a host that uses `cart`
gets `shared`'s supply through the chain. Business apps declare one line
and stay ignorant of the chain's depth.

### How wiring is derived (you never write it)

Two rules replace every hand-written mapping:

**The merge rule** — one sentence:
`supply(M) = merge(supply(uses[0]), …, supply(uses[n]), M.provides)` —
later entries override earlier ones, the module's own `provides` is the
implicit last element, so **the order of the `uses` array decides who
wins** when two modules provide the same package (list generic-to-specific;
the specific layer wins, same convention family as `Object.assign`).

**The lookup rule** — applied per specifier as the bundler traverses your
code, no pre-pass, no declaration:

```
bare specifier found in my merged supply table → externalized, wired to the winner
found nowhere                                  → my own bundled copy, isolated by
                                                 per-module import-map scopes
```

Single-instance sharing is therefore inherent (one winner per package, the
entire closure rewired to it), and multi-version coexistence needs zero
vocabulary — a module that bundles its own copy is scope-isolated
automatically. Type-only imports (`import type`) never produce wiring.

### Diagnostics: the complete taxonomy

Every failure is **build-time**, machine-readable, and carries
*what / why / fix* — and every fix is an edit to a declaration that
already exists, never a new concept.

| Code | Kind | What it means | Typical fix |
|---|---|---|---|
| `E_NOT_LINKED` | error | A name in `uses` is absent from the mount table. | `npm install` the module (npm packages auto-mount at `node_modules/<name>/dist`) or add a `links` override. |
| `E_NOT_BUILT` | error | Mounted, but no built artifact yet. Blocks only manifest-dependent checks, not declaration wiring. | Build the listed modules first. |
| `E_CYCLE` | error | The `uses` chain (or mount walk) revisits a module. | Architecture error — break the cycle; it is never silently ignored. |
| `E_VERSION` | error | Either *intent* (the winner's version violates a layer's `dependencies`/`peerDependencies` range) or *substitution safety* (a losing provider's chunks were built against an incompatible version — same-major minimum). Names the layer and which check failed. | Align the named layer's range, or upgrade/rebuild the provider. |
| `E_NOT_USED` | error | You imported `'mod/export'` but `mod` is not in your `uses` chain. | Add `"mod"` to `uses` (and `dependencies`). |
| `E_NO_EXPORT` | error | The export name is absent from the provider's declaration. Message lists the module's actual exports. | Fix the import specifier, or add the export to the provider's `esmx.exports`. |
| `E_PROTOCOL` | error | A mounted manifest's `protocol` is newer than this linker supports. | Upgrade `@esmx/core`. |
| `E_PROTOCOL_IN_BEHAVIOR` | error | Protocol facts (a `modules` config) found in `entry.node.ts`. | Move them to `package.json` `esmx` — `esmx migrate` does this for you. |
| `W_MULTI_CANDIDATE` | warning | A package had multiple providers in the merge chain. Reports winner, losers, and rewired layers. | Expected for layered bases; reorder `uses` if the wrong layer won. |
| `W_NO_RANGE` | warning | A layer consumes a provided package without declaring any version range. | Add the package to `dependencies` or `peerDependencies`. |
| `W_TYPE_DRIFT` | warning | Your `devDependencies` types copy diverges from the elected winner's resolved version (the version your code actually runs on). | Align the `devDependencies` version. |

### The verification loop: `esmx validate --json`

`esmx validate` is a **build-free dry run** of the whole resolution: mount
walk, version checks, supply merge, export checks. Run it after every
declaration edit; the judge of a correct declaration is its exit status,
not human reading. With `--json` it emits a structured envelope — errors
AND warnings:

```json
{
    "diagnostics": [
        {
            "code": "E_VERSION",
            "check": "substitution-safety",
            "module": "base",
            "package": "vue",
            "found": "3.0.2",
            "required": "built against 3.4.21 (same major)",
            "message": "what happened and why",
            "fix": "the declaration edit to make"
        }
    ]
}
```

`check` appears on `E_VERSION` entries and is either `"intent"` or
`"substitution-safety"`. An empty `diagnostics` array means the
declarations fully determine a valid wiring.

### Adopting on an existing project: `esmx migrate`

`esmx migrate` is a codemod: it lifts a legacy `entry.node.ts` `modules`
config (`pkg:`/`root:` exports, `imports`) into the `package.json` `esmx`
declaration and rewrites consumer import sites to logical names, emitting
a machine-readable report of every change. Run `esmx validate --json`
afterwards.

## A minimal Rspack remote

Three files plus the client entry. Copy-paste runnable.

**`package.json`** — protocol facts live here:

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
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": {
            "./app": "./src/app.ts"
        }
    },
    "dependencies": {
        "@esmx/core": "^3.0.0-rc.117"
    },
    "devDependencies": {
        "@esmx/rspack": "^3.0.0-rc.117"
    }
}
```

**`src/entry.node.ts`** — behavior only (dev server + Node HTTP server),
no protocol facts:

```ts
import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
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

**`src/entry.client.ts`** — client entry (hydration bootstrap):

```ts
console.log('hydrated');
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

## Consuming another remote

Add it to `dependencies` and `uses` — that's the whole wiring:

```json
{
    "dependencies": { "my-remote": "^0.1.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "uses": ["my-remote"]
    }
}
```

Then in your code, import by **logical export name**:

```ts
import { App } from 'my-remote/app';
```

Modules installed via npm **auto-mount** at `node_modules/<name>/dist` —
no path configuration. For monorepo siblings or deploy directories, a
`links` entry (an *environment* fact, kept in `entry.node.ts`'s `modules`
block today) overrides the mount point:

```ts
modules: {
    links: {
        'my-remote': '../my-remote/dist'
    }
}
```

The consumer builds an import map from the mounted module's manifest and
injects it into every SSR HTML response. The browser resolves it natively
— no client-side loader.

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

## Legacy syntax (deprecated — removed in the next major)

> **For NEW code, always use the `package.json` `esmx` declaration above.**
> The syntax below still works during the transition and you WILL see it in
> existing projects — recognize it, maintain it, and offer `esmx migrate`
> when asked to modernize. Do not generate it for new modules.

Legacy projects keep all protocol facts in `entry.node.ts` under a
`modules` key with four fields:

```ts
// entry.node.ts (LEGACY)
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // Where mounted modules live (hand-written relative dist paths).
        links: {
            'shared': '../shared/dist'
        },
        // Manual specifier → provider wiring (replaced by the supply merge).
        imports: {
            'vue': 'shared/vue'
        },
        // String-prefix DSL:
        //   'pkg:vue'           → re-export the npm package "vue"
        //                         (new protocol: provides: ["vue"])
        //   'root:src/index.ts' → expose a source file; the PUBLIC name IS
        //                         the source path ("shared/src/index")
        //                         (new protocol: exports: {"./ui": "./src/ui/index.ts"})
        exports: [
            'pkg:vue',
            'root:src/index.ts'
        ]
    },
    async devApp(esmx) { /* ... */ },
    async server(esmx) { /* ... */ }
} satisfies EsmxOptions;
```

Key differences from the new protocol — these are the legacy traps:

- **Public export names equal source paths.** A legacy consumer writes
  `import { x } from 'shared/src/index'` — the provider's directory layout
  is the API, and renaming a source file breaks every consumer. Under the
  new protocol, only logical names (`'shared/ui'`) are public; there is no
  `./src/*` passthrough.
- **Wiring is manual.** Every consumer hand-writes `imports` lines that
  the new protocol derives from declarations.
- **Nothing is validated until runtime.** No version checks, no export
  checks, no structured diagnostics.

`esmx migrate` converts all of this mechanically. Per RFC 0001 the legacy
syntax is removed entirely in a later phase — there is no long-term dual
syntax.

## What does NOT exist

Don't generate these — they aren't real APIs:

- `Esmx.register(...)` / `registerApplication(...)` (single-spa style)
- `bootstrap` / `mount` / `unmount` / `update` lifecycle exports (qiankun style)
- `expose` / `shared` / `singleton` / `optional` / `resolutions` / `sealed`
  config (Module Federation style). Esmx needs **no sharing-arbitration
  vocabulary at all**: composition is a static merge resolved at build
  time — single-instance sharing is inherent (one winner per package,
  whole closure rewired), and multi-instance coexistence is just a module
  bundling its own scope-isolated copy.
- A resolution lockfile (`esmx.resolution.json` or similar). **The import
  map emitted into `dist` IS the resolution result**; declarations alone
  fully determine it. Diagnostics live in `esmx validate` and the build
  log, not in a committed artifact.
- A specifier-level needs map inside `esmx.uses` — `uses` is a plain array
  of module names; the bundler discovers specifiers itself.
- `useStyles()` / `injectGlobalStyles()` hooks
- `<MicroApp />` JSX components
- `window.__POWERED_BY_QIANKUN__` globals
- Any sandbox / proxy / iframe abstraction

If you find yourself writing any of those, you're probably thinking of a
different framework.

## Common errors and what they mean

**First reflex: run `esmx validate --json`.** Most wiring mistakes surface
there as a structured diagnostic (see the taxonomy above) with the fix
spelled out.

**`SyntaxError: Unexpected token '.'` during dev SSR.**
You imported a `.css` file from a path the framework's loader didn't
recognize. Solution: bundle the CSS inside the same remote that uses it
(don't import a workspace-dep CSS file directly across remotes); the host
will inject the link via the shared package's manifest.

**`ERR_UNKNOWN_FILE_EXTENSION ".css"` during `esmx build`.**
The CLI's Node ESM loader hook handles this, but if your `entry.node.ts`
transitively imports a `.css` file in code that the bundler doesn't pre-process,
move that import into a JS-eval-only path (e.g. `entry.client.ts`).

**`Cannot find module '<remote>/<export>'` at runtime.**
On the new protocol this is almost always caught earlier as `E_NOT_LINKED`
(remote not mounted), `E_NOT_USED` (remote missing from your `uses`),
`E_NO_EXPORT` (export not declared), or `E_NOT_BUILT` (no artifact yet) —
run `esmx validate`. On a legacy project, check: (1) is `'<remote>'` in the
consumer's `modules.links`? (2) is the export in the producer's
`modules.exports`? (3) did the producer build (`dist/manifest.json` exists)?

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

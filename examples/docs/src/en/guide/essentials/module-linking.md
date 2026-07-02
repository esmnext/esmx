---
titleSuffix: "Zero-Runtime Code Sharing"
description: "Esmx Module Linking: Zero-runtime Micro-Frontend code sharing solution based on ESM standards"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, module linking, ESM, code sharing, Micro-Frontend"
---

# Module Linking

Module Linking is the **cross-application code sharing solution** provided by Esmx. It is based on browser-native ESM (ECMAScript Modules) standards, letting multiple applications share code modules without any additional runtime library.

## Core Advantages

- **Zero Runtime Overhead**: Uses the browser-native ESM loader directly, with no proxy or wrapper layer.
- **Efficient Sharing**: Dependencies are resolved at build time through Import Maps; modules load directly at runtime.
- **Version Isolation**: Different applications can use different versions of the same package, with coexisting majors isolated automatically.
- **Simple to Use**: Declarative configuration that stays fully compatible with native ESM syntax.

In short, module linking is a "module sharing manager" that lets different applications share code as safely and easily as using local modules.

## The model: declare in `package.json` `esmx`

All protocol facts live in **one `package.json` field**, `esmx`, with exactly **four optional sub-fields**. `entry.node.ts` keeps only *behavior* (`devApp`, `server`, `postBuild`) plus environment links — putting protocol facts there is an error (`E_PROTOCOL_IN_BEHAVIOR`).

| Field | Meaning |
|---|---|
| `entry` | The framework entries (`client` / `server`), each a `./`-relative source path or `false` to disable that side. Omit it for library-only modules. |
| `exports` | Subpath map with **logical names**: keys are `./<name>`, values are `./`-relative source files or a `{ client, server }` fork (`false` disables a side). Consumers never see your physical paths. |
| `provides` | Plain array of third-party packages this module re-exports for consumers (e.g. `["vue"]`). The provided version is your **resolved installed version**, captured into the manifest at build time. |
| `uses` | Plain array of **module names** you consume from. Not specifiers, not versions — just names. **Array order is load-bearing** (see the merge rule below). |

A module's declaration is strictly **local knowledge**: you can write it knowing nothing about any other module. Three roles cover every project.

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

Consumers import `'shared/ui'` — a logical name. Renaming `src/ui/index.ts` is no longer a breaking change.

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

Note what is **absent**: no `imports` map, no per-specifier wiring, no version field inside `esmx`. The version range lives where npm already puts it — `dependencies` (∪ `peerDependencies`) — and is validated at build time against the mounted artifact's actual version.

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

`uses` is **transitive**: if `cart` uses `shared`, a host that uses `cart` gets `shared`'s supply through the chain. Business apps declare one line and stay ignorant of the chain's depth.

## How wiring is derived (you never write it)

Two rules replace every hand-written mapping.

**The merge rule** — one sentence:
`supply(M) = merge(supply(uses[0]), …, supply(uses[n]), M.provides)` — later entries override earlier ones, the module's own `provides` is the implicit last element, so **the order of the `uses` array decides who wins** when two modules provide the same package (list generic-to-specific; the specific layer wins, same convention family as `Object.assign`). Elections are **per major version** — coexisting majors (e.g. vue 2 and vue 3) are isolated islands, each with its own winner, and every consumer wires to the major satisfying its own declared range.

**The lookup rule** — applied per specifier as the bundler traverses your code, no pre-pass, no declaration:

```
bare specifier found in my merged supply table → externalized, wired to the winner
found nowhere                                  → my own bundled copy, isolated by
                                                 per-module import-map scopes
```

Single-instance sharing is therefore inherent (one winner per package, the entire closure rewired to it), and multi-version coexistence needs zero extra vocabulary — a module that bundles its own copy is scope-isolated automatically. Type-only imports (`import type`) never produce wiring.

## Mounting: where artifacts come from

Any module resolvable through `node_modules` **auto-mounts** at `node_modules/<name>/dist` — no path configuration. This covers registry installs *and* monorepo siblings: a pnpm `workspace:*` dependency symlink is followed and realpath'd, so a normal `dependencies` entry plus the `uses` name is the whole story.

Only for artifact directories that are **not** npm-resolvable (deploy paths, remotely fetched artifacts) do you add an explicit `links` entry. `links` is an **environment fact**, not a protocol fact, so it is the one `modules` key still allowed in `entry.node.ts`:

```ts
// host/entry.node.ts — environment links only, no protocol facts
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        links: {
            'my-remote': '/srv/deploy/my-remote/dist'
        }
    },
    async devApp(esmx) { /* ... */ },
    async server(esmx) { /* ... */ }
} satisfies EsmxOptions;
```

## Importing shared code

Once a module is in your `dependencies` and `uses`, import its exports by **logical name**:

```typescript
// host/src/api/orders.ts
import { App } from 'shared/ui';        // a logical export name
import axios from 'axios';              // a provided package — wired to the winner

export async function fetchOrders() {
    const response = await axios.get('/api/orders');
    return response.data;
}
```

`axios` resolves to whatever module *provides* it (via `provides: ["axios"]`) in your merged supply table; `shared/ui` resolves to the logical export the `shared` module declared. You never name a physical path or write an import map by hand.

## Verify your wiring: `esmx validate`

`esmx validate` is a **build-free dry run** of the whole resolution — mount walk, version checks, supply merge, export checks. Run it after every declaration edit:

```bash
esmx validate          # human-readable report
esmx validate --json   # machine-readable envelope (CI / agents)
```

It exits non-zero only when an error-severity diagnostic is found; warnings alone exit 0. A package without an `esmx` field reports `protocol: "legacy"` and exits 0. The full diagnostic taxonomy (`E_NOT_LINKED`, `E_VERSION`, `E_SCHEMA`, `W_MULTI_CANDIDATE`, …) is documented in the [LLM briefing](/llms.md#diagnostics-the-complete-taxonomy).

## Complete example: multi-version coexistence

A shared base provides two majors of Vue side by side; each business app wires to the one its declared range satisfies — no manual `imports` anywhere.

### Shared base (`shared`)

```json
{
    "name": "shared",
    "version": "1.0.0",
    "dependencies": {
        "vue": "^3.5.0",
        "vue2": "npm:vue@^2.7.0",
        "@esmx/router": "^3.0.0"
    },
    "esmx": {
        "provides": ["vue", "vue2", "@esmx/router"]
    }
}
```

### Vue 3 application (`vue3-app`)

```json
{
    "name": "vue3-app",
    "version": "1.0.0",
    "dependencies": { "shared": "workspace:*" },
    "peerDependencies": { "vue": "^3.5.0", "@esmx/router": "^3.0.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": { "./routes": "./src/routes.ts" },
        "uses": ["shared"]
    }
}
```

### Vue 2 application (`vue2-app`)

```json
{
    "name": "vue2-app",
    "version": "1.0.0",
    "dependencies": { "shared": "workspace:*", "vue": "npm:vue@^2.7.0" },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "exports": { "./routes": "./src/routes.ts" },
        "uses": ["shared"]
    }
}
```

### Aggregation host (`host`)

```json
{
    "name": "host",
    "version": "1.0.0",
    "dependencies": {
        "shared": "workspace:*",
        "vue2-app": "workspace:*",
        "vue3-app": "workspace:*"
    },
    "esmx": {
        "entry": {
            "client": "./src/entry.client.ts",
            "server": "./src/entry.server.ts"
        },
        "uses": ["shared", "vue2-app", "vue3-app"]
    }
}
```

This shows:

- **Shared base**: provides multi-version framework support; version isolation comes from npm aliases (`npm:vue@^2.7.0`) plus the `provides` declaration — each major is an isolated election group.
- **Vue 3 / Vue 2 applications**: each declares its own Vue range and only exports its route config; the resolver wires each to the matching major automatically.
- **Aggregation host**: a single entry that composes the sub-applications — one `uses` line per child, no manual import map.

Run `esmx validate --json` after building the children to confirm the whole graph resolves.

## Legacy syntax (removed in the next major)

> **For NEW code, always use the `package.json` `esmx` declaration above.** The syntax below still works during the transition and you WILL see it in existing projects — recognize it, maintain it, and rewrite it to the new declaration to modernize. Do not write it for new modules.

Legacy projects keep all protocol facts in `entry.node.ts` under a `modules` key:

```ts
// entry.node.ts (LEGACY)
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        // Where mounted modules live (hand-written relative dist paths).
        links: { 'shared': '../shared/dist' },
        // Manual specifier → provider wiring (replaced by the supply merge).
        imports: { 'vue': 'shared/vue' },
        // String-prefix DSL:
        //   'pkg:vue'           → re-export the npm package "vue"
        //                         (new protocol: provides: ["vue"])
        //   'root:src/index.ts' → expose a source file; the PUBLIC name IS
        //                         the source path ("shared/src/index")
        //                         (new protocol: exports: { "./ui": "./src/ui/index.ts" })
        exports: ['pkg:vue', 'root:src/index.ts']
    },
    async devApp(esmx) { /* ... */ },
    async server(esmx) { /* ... */ }
} satisfies EsmxOptions;
```

The legacy traps the new protocol removes:

- **Public export names equal source paths.** A legacy consumer writes `import { x } from 'shared/src/index'` — the directory layout is the API, and renaming a source file breaks every consumer. Under the new protocol only logical names (`'shared/ui'`) are public.
- **Wiring is manual.** Every consumer hand-writes `imports` lines that the new protocol derives from declarations.
- **Nothing is validated until runtime.** No version checks, no export checks, no structured diagnostics.

Converting all of this is a mechanical rewrite (codemod-able, but there is no shipped command). Per RFC 0001 the legacy syntax is removed entirely in a later phase — there is no long-term dual syntax.

## Module Linking vs Module Federation

Both share code across independently built apps, but the mechanism differs:

| | Esmx Module Linking | Module Federation |
|---|---|---|
| Runtime | Native ESM + Import Maps (browser-native) | Webpack/Rspack runtime container |
| Overhead | Zero extra runtime | Federation runtime + shared-scope negotiation |
| SSR | First-class, SEO-friendly | Extra setup, historically fragile |
| Lock-in | Standard `import`, any bundler | Bundler-specific plugin + config |
| Versioning | Explicit provider, one owner per package | Runtime shared-scope negotiation |

Because linking rides on the browser's own module system, there is no sandbox, no proprietary loader, and nothing extra to ship at runtime — the same `import` works in the browser, in SSR, and in tests.

## Related

- [Alias](/guide/essentials/alias) — how cross-service imports between linked modules are resolved
- [Styles](/guide/essentials/styles) — how linked remotes own and share their CSS

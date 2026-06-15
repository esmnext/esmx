# Esmx Architecture (contributor notes)

> Internal documentation for maintainers and AI assistants working on this
> repository. End-user documentation lives at https://esmx.dev (sources in
> `examples/docs/`).
>
> **Citation convention:** reference code by file path and symbol name
> (`` `getLinks` in `module-config.ts` ``), never by line number. Line
> numbers rot on the next edit and nobody maintains their accuracy; a
> symbol name is greppable and stays valid. Do not reintroduce `:NNN`.

## 1. Overview

Esmx is a module-federation framework with **zero runtime**. Its entire
pipeline is build-time: each module's build emits a **manifest**
(`dist/<env>/manifest.json`), a composing host folds the manifests of all
linked modules into a standard **import map**, and from there the
**native ESM resolver** — the browser on the client, Node's loader hooks
on the server — does all module resolution. There is no runtime container,
no shared-scope negotiation, no sandbox: the import map *is* the
resolution result.

The pipeline, end to end:

**declaration → internal module config → bundler adapter → manifest →
import map → native ESM resolution**

Two configuration surfaces feed the front of that pipeline today:

- **Legacy**: the `modules` field of the `EsmxOptions` object exported by
  `src/entry.node.ts` (`packages/core/src/core.ts`). This is the
  historical public API.
- **New (RFC 0001)**: the `esmx` field of `package.json`, read by the
  declaration subsystem in `packages/core/src/declaration/` and **lowered
  to the legacy shape**. The legacy `modules` config is therefore now the
  *lowering target* of the declaration layer, an internal IR — and it is
  slated for removal as a public API per
  `docs/rfc/0001-module-protocol.md`.

Key files:

- `packages/core/src/core.ts` — the `Esmx` instance: lifecycle
  (`init`/`build`/`server`/`postBuild`), import-map generation, caching.
- `packages/core/src/module-config.ts` — parses module wiring into the
  internal `ParsedModuleConfig` IR consumed by everything downstream.
- `packages/core/src/manifest-json.ts` — the `ManifestJson` build
  artifact each module emits.
- `packages/core/src/utils/import-map.ts` — composes mounted manifests
  into the final client/server import maps.
- `packages/core/src/render-context.ts` — SSR HTML assembly.
- `packages/core/src/declaration/` — the RFC 0001 declaration subsystem.
- `packages/rspack`, `packages/rsbuild`, `packages/vite` — bundler
  adapters.
- `packages/import` — Node-side ESM loading (prod loader hook, dev vm
  sandbox).
- `packages/pkg-wrapper` — static named-export enumeration for `pkg:`
  federation entries.

## 2. Data-flow pipeline

```
  src/entry.node.ts                      package.json "esmx" field
  (EsmxOptions: modules?, devApp,        (declaration: entry/exports/
   server, postBuild)                     provides/uses — RFC 0001)
        │                                       │
        │                  resolveModuleOptions (declaration/index.ts)
        │                  reader → resolver → lowerDeclaration
        └───────────────┬───────────────────────┘
                        ▼
              Esmx.init(command)            core.ts
              parseModuleConfig → ParsedModuleConfig (internal IR)
                        │
                        ▼
              bundler adapter App           devApp() in dev/build,
              (@esmx/rspack | rsbuild |     createApp() in start
               vite)
                        │  builds 3 targets: client / server / node
                        ▼
       dist/client/manifest.json   dist/server/manifest.json
       dist/node/src/entry.node.mjs   dist/index.mjs (bootstrap)
                        │
                        ▼
              getManifestList(env)          manifest-json.ts
              one manifest per entry in moduleConfig.links
                        │
                        ▼
              getImportMap(env)             core.ts
              client: createClientImportMap (3-pass, §3.3)
              server: createImportMap + realpathSync file:// URLs
                        │
                        ▼
              RenderContext (SSR)           render-context.ts
              entry.server renders → rc.commit() collects chunks/CSS
              rc.importmap() + rc.moduleEntry() injected into HTML
                        │
                        ▼
              browser: <script type="importmap"> → native ESM
              import "<name>/src/entry.client" → hydration
```

Concrete lifecycle (`Esmx.init`, `packages/core/src/core.ts`):

1. Read the project `package.json`; the package `name` becomes the module
   name (and `/${name}/` its asset base path).
2. `resolveModuleOptions(root, packageJson, options.modules)` decides
   between the legacy and declaration paths (§4).
3. `parseModuleConfig(name, root, config)` produces the
   `ParsedModuleConfig` IR.
4. For `dev`/`build` the user's `devApp()` factory creates the bundler
   adapter `App`; for `start`/`preview` `createApp()`
   (`packages/core/src/app.ts`) wires the production middleware and
   the loader-based renderer.
5. `dev`/`start` call the user's `server()` hook; `build` runs the
   adapter's `build()`.

**Production bootstrap.** Every adapter's build writes an identical
`dist/index.mjs` (e.g. `packages/vite/src/vite/app.ts`,
`packages/rspack/src/rspack/app.ts`): it imports the compiled
`./node/src/entry.node.mjs` options and calls
`new Esmx(options).init(COMMAND.start)`. Production deployment is
`NODE_ENV=production node dist/index.mjs` — `@esmx/core` is the only
runtime dependency; the bundler adapters are build-time only. The `esmx`
CLI (`packages/core/src/cli/cli.ts`) covers `dev` (loads
`src/entry.node.ts` via its own TS-friendly `module.register` hook,
which also shims style-asset imports to no-op modules), `build`,
`preview`, and `start`.

**Composition example.** `examples/micro-app/ssr-micro-hub` is the
canonical host: its `package.json` declares sixteen sibling modules as
`workspace:*` dependencies plus `esmx.uses` entries, and the declaration
resolver auto-mounts each one through Node resolution
(`node_modules/<name>/dist`, symlinks realpath'd) — rspack-, rsbuild-,
and vite-built remotes composing into one import map — then statically
renders every route in `postBuild`. Explicit `modules.links` in
`entry.node.ts` remains only as an escape hatch for artifact directories
that are not npm-resolvable (deploy paths, remotely fetched artifacts).

## 3. Key data structures

### 3.1 `ModuleConfig` → `ParsedModuleConfig` (packages/core/src/module-config.ts)

```ts
interface ModuleConfig {
    lib?: boolean;                                  // library mode: no entry targets
    entry?: ModuleConfigEntry;                      // per-side framework entry override
    links?: Record<string, string>;                 // module name → artifact dir
    imports?: ModuleConfigImportMapping;            // bare specifier → provider path
    exports?: ModuleConfigExportExports;            // 'pkg:'/'root:' DSL or objects
    suppress?: ModuleConfigSuppress[];              // internal IR: Phase 4 loser-copy plan
}
```

There is no user-authored `scopes` field — directory-scope remapping was
removed (RFC 0001 §4). The only import-map scope is the derived `''` root
scope (supply wiring + the module's own pkg-exports); multi-version
coexistence is isolated automatically per module, never hand-mapped.

Field semantics, as implemented:

- **`lib`** (`module-config.ts`, `parseEntryConfig`): when true, the
  resolved entry targets are both `null`, so no implicit
  `src/entry.client`/`src/entry.server` exports are created, and adapters
  skip the `node` target and bootstrap (`packages/vite/src/vite/app.ts`).
- **`links`** (`getLinks`, `module-config.ts`): module name →
  artifact directory. The module **always self-links**:
  `{ [name]: path.resolve(root, 'dist'), ...config.links }`, so the
  composer's own manifest participates in the merge. Each link is parsed
  into `ParsedModuleConfigLink` with precomputed `client`/`server`
  subdirectories and manifest paths.
- **`imports`** (`getEnvironmentImports`): consumer-side wiring of a
  bare specifier to another module's export
  (`'vue': 'shared/vue'`). Values may fork per environment
  (`{ client: ..., server: ... }`); an absent side drops the mapping for
  that environment. In `getEnvironments` imports are
  **merged into the `''` scope** (`scopes['']`), i.e. they apply to the
  module's own files.
- **`exports`**: an array of strings or objects. The string prefix DSL
  (`parsedExportValue`):
  - `pkg:react` → `{ name: 'react', pkg: true, file: 'react' }` — a
    whole npm package re-exported as a federation chunk;
  - `root:src/foo.ts` → `{ name: 'src/foo', pkg: false, file: './src/foo.ts' }`
    — a project source file, extension stripped from the name;
  - plain strings pass through as both name and file.
  Object form maps export name → string or per-environment fork.
  **Client/server forks** resolve through `resolveExportFile`:
  `true` means "use the export name as the file", a string overrides the
  path, `false`/absent yields `''` which downstream code treats as
  "no artifact for this environment" (filtered out of bundler entries).
- **`addPackageExportsToScopes`**: every `pkg: true` export
  also injects `scopes[''][exportName] = '<moduleName>/<exportName>'`
  into the module's own scope, so the providing module's *own code*
  importing `react` resolves to its federated chunk rather than
  node_modules.

`ParsedModuleConfig` is name ≠ path throughout
(`ParsedModuleConfigExport.name` vs `.file`); identifiers derive from
`name`. Framework entries are no longer welded to physical names: RFC
0001 Phase 2 threads them through the config. `parseEntryConfig`
resolves `config.entry.{client,server}` (or `lib: true` →
`null`), falling back to `DEFAULT_MODULE_ENTRY`
(`src/entry.client` / `src/entry.server`) only when a side is unset;
`getEntryChunkId` derives the `<name>@<file>` chunk id from
the resolved target. Every downstream consumer reads the resolved entry
(`getClientEntry` in `render-context.ts`, `entry.server` in
`app.ts`) rather than a literal — so a module can rename its
entries.

### 3.2 `ManifestJson` (packages/core/src/manifest-json.ts)

Each build target emits one manifest:

```ts
interface ManifestJson {
    name: string;                       // overwritten by the link name on read
    scopes: Record<string, Record<string, string>>; // scope → specifier → identifier
    exports: ManifestJsonExports;       // export name → { name, pkg, file, identifier }
    files: string[];
    chunks: ManifestJsonChunks;         // chunk id → { name, js, css[], resources[] }
    integrity?: Record<string, string>; // SRI hashes, prod only
}
```

- An export's `identifier` is `<moduleName>/<exportName>`
  (`packages/rspack/src/module-link/parse.ts`) — the global key in the
  composed import map.
- **Chunk identifier scheme**: chunks are keyed by a stable, root-relative
  `<remote>@<source-path>` identifier (e.g.
  `ssr-micro-vue3@src/views/home.vue`), computed in
  `packages/rspack/src/module-link/manifest-plugin.ts`.
- **`import.meta.chunkName`**: when `injectChunkName` is enabled (server
  builds), the manifest plugin prepends
  `import.meta.chunkName = import.meta.chunkName ?? "<chunk-id>";` to each
  emitted server chunk (`manifest-plugin.ts`). During SSR, rendering
  frameworks add `import.meta` objects to `rc.importMetaSet`;
  `RenderContext.commit()` (`render-context.ts`) reads
  `chunkName` off each one and uses the client manifest's `chunks` table
  to emit exactly the JS/CSS/resources of the chunks that actually
  rendered.
- `getManifestList` (`manifest-json.ts`) reads one manifest per
  `links` entry and **throws** if any is missing/unreadable — a host
  cannot start with an unbuilt remote.

### 3.3 The three-pass client import map (packages/core/src/utils/import-map.ts)

`createClientImportMap` composes manifests in passes:

1. **Base map** (`createImportMap`): `imports` maps every export
   identifier to its URL (`/<name>/<file>`); `createScopesMap` maps each
   manifest scope to URL-prefixed scope keys, resolving identifier values
   through `imports` first. `pathWithoutIndex` adds `/index`-less
   aliases.
2. **`fixImportMapNestedScopes`**: works around a
   cross-browser bug where nested scopes (`/shared/` vs `/shared/vue2/`)
   are not applied most-specific-first (see
   es-module-shims#529, crbug 453147451). It sorts scopes shallow→deep
   and rewrites each prefix scope into **concrete per-file scopes** keyed
   by the import URLs it covers, deleting the prefix scopes.
3. **`compressImportMap`**: dominance promotion. For each
   specifier appearing in scopes (and not already in global `imports`),
   it counts target frequencies; a target with a **strict majority over
   the runner-up** is promoted to global `imports`, and scope entries that
   now duplicate a global mapping are dropped. Ties promote nothing
   (multi-version deps like vue2/vue3 stay scoped).
4. **`addCodeSplitChunkScopes`**: runs *after* compression
   so it cannot skew the promotion heuristic. Code-split chunk files
   (Vite/Rollup facade splits) are not exports, so pass 2's per-file
   scopes miss them — yet they still import bare externals. This adds
   each chunk file's URL as a scope carrying the module's `''`-scope
   mappings (minus ones already satisfied globally). A no-op for
   rspack's all-in-one output.

Finally, manifest `integrity` entries (relative paths) are rewritten to
absolute URL keys and attached to the map.

### 3.4 Server import map and `realpathSync`

`Esmx.getImportMap('server')` (`core.ts`) builds `file://` URLs
from each link's `server` directory — but **through `fs.realpathSync`**.
Links are frequently symlinks (pnpm workspaces, deploy layouts); Node's
loader reports real paths at runtime, so scope keys built on symlink
paths would never match and resolution would silently fall through.
Real-pathing both `getScope` and `getFile` keeps generation and runtime
consistent.

The client map's HTML form (`getImportMapClientInfo`, `core.ts`)
supports `inline` (a `<script type="importmap">`) and `js` mode (a
content-hashed `dist/client/importmap/<hash>.final.mjs` that rebuilds the
map in the browser and prepends the runtime `data-base` — this is how the
`[[[___ESMX_DYNAMIC_BASE___]]]` placeholder supports deploying one build
to any base path).

## 4. Declaration subsystem (module protocol v2)

Authoritative spec: **`docs/rfc/0001-module-protocol.md`**. Implemented
on this branch in `packages/core/src/declaration/`. The RFC is at
release-candidate: Phases 1–7 are landed (declaration subsystem,
entry-identifier threading, manifest `protocol`/`version`/`provides`
fields, `validate`/`migrate` CLI, `reinit()`). Outstanding before
release are RFC Gate 2 (single-owner / cross-major fixture end-to-end
through a code-splitting build) and Gate 5 (the agent one-shot harness);
see the RFC header for the authoritative status.

Protocol facts move out of `entry.node.ts` (which keeps only behavior:
`devApp`, `server`, `postBuild`) into the `package.json` `esmx` field
with exactly four sub-fields (`declaration/types.ts`,
JSON Schema in `declaration/schema.ts`):

```jsonc
{
  "esmx": {
    "entry":    { "client": "./src/entry.client.ts", "server": "./src/entry.server.ts" },
    "exports":  { "./widget": "./src/widget.ts",
                  "./store":  { "client": "./src/store.client.ts", "server": false } },
    "provides": ["vue", "pinia"],     // bare packages this module federates
    "uses":     ["shared-base"]       // modules consumed; ORDER IS MERGE PRECEDENCE
  }
}
```

The subsystem is a translation layer in `@esmx/core`:

```
package.json "esmx"           reader.ts (readDeclaration) +
        │                     schema.ts structural validation (E_SCHEMA;
        │                     invalid pieces dropped, valid rest kept)
        ▼
recursive supply merge        resolver.ts (resolveMounts):
        │                     supply(M) = merge(...uses.map(supply), M.provides)
        │                     later overrides earlier, self last (RFC §7);
        │                     memoized, cycle-detected (E_CYCLE)
        ▼
validation                    diagnostic taxonomy below; all build-time
        │
        ▼
lowering → ModuleConfig       lower.ts (lowerDeclaration): the §3.1
                              internal IR; existing pipeline (adapters,
                              manifest, import map) unchanged
```

Integration point: `resolveModuleOptions` (`declaration/index.ts`),
called from `Esmx.init` (`core.ts`). Decision logic:

- No `esmx` field → legacy path, `options.modules` untouched.
- `esmx` present **and** `options.modules` carries protocol facts
  (`lib`/`imports`/`exports`) → throws
  `E_PROTOCOL_IN_BEHAVIOR`.
- `options.modules.links` alone is an **environment fact** and is passed
  to the resolver as explicit mount overrides (`envLinks`).
- Any error-severity diagnostic aborts `init`; warnings print and
  continue.

Lowering rules (`lower.ts`): no `entry` → `lib: true`; resolved
mounts → `links`; the merged supply table → `imports`
(`<provider>/<package>`, self-provided entries skipped); `provides` →
`pkg:` exports; `exports`/custom entries → `root:`-prefixed object
exports with `false` for disabled sides. Entries are lowered by
`lowerEntry` (`lower.ts`): a side equal to the default
(`./src/entry.client.ts`/`.server.ts`) is **omitted** so it rides on
`parseEntryConfig`'s fallback to `DEFAULT_MODULE_ENTRY`; only
custom or disabled (`false`) sides flow through to `config.entry`.

Resolver facts worth knowing (`resolver.ts`):

- npm-installed modules **auto-mount** via Node-style `node_modules`
  walk from the *declaring* module's own location, `realpathSync`'d,
  with `<root>/dist` as artifact dir; explicit `envLinks`
  only override the mount point (monorepo siblings, deploy paths). The
  mount walk is transitive over `uses`.
- **Inputs are declarations, never emitted manifests** — cold starts and
  parallel builds must not deadlock; a mounted-but-unbuilt module
  degrades to `E_NOT_BUILT` (manifest-dependent checks skipped) rather
  than blocking wiring. The substitution-safety check activates only
  when a loser's manifest carries built-against `provides` versions
  (RFC Phase 3; `readManifestInfo`).
- **`uses` order is load-bearing** — it is the merge precedence; every
  multi-candidate merge is reported (`W_MULTI_CANDIDATE`, with winner,
  losers, and the rewired closure).
- **Election is keyed by (package, major)** — coexisting majors (the
  hub's vue2 + vue3) are isolated groups, each with its own winner
  (`W_MULTI_MAJOR`, informational); rewiring and substitution-safety
  operate only within a group, and each module wires to the group
  satisfying its own `dependencies ∪ peerDependencies` range
  (`selectSupplyGroup`).
- Version gates use the in-tree semver subset (`declaration/semver.ts`);
  `workspace:`/`file:`/`link:`/`portal:` ranges and private packages skip
  the gate (RFC §11).
- **No resolution artifact** — the import map emitted into `dist` IS the
  resolution result; diagnostics belong to tooling output only.

### Diagnostic taxonomy

Structured, machine-readable (`Diagnostic` in `declaration/types.ts`,
envelope shape per RFC §7), emitted by the build and by
`esmx validate --json` (the RFC Phase 5 CLI surface, implemented; see
below):

| Code | Kind | Meaning |
|---|---|---|
| `E_NOT_LINKED` | error | used module absent from the mount table |
| `E_NOT_BUILT` | error | mounted but no artifact; blocks manifest-dependent checks only |
| `E_CYCLE` | error | `uses` chain (or mount walk) revisits a module |
| `E_VERSION` | error | intent (range) or substitution-safety (built-against major) violation |
| `E_NOT_USED` | error | module-export import from a module outside the uses chain |
| `E_NO_EXPORT` | error | export absent; lists the module's actual exports |
| `E_PROTOCOL` | error | manifest `protocol` higher than the linker supports |
| `E_PROTOCOL_IN_BEHAVIOR` | error | protocol facts found in `entry.node.ts` |
| `E_SCHEMA` | error | declaration shape violation (added beyond the RFC, which assigns schema failures no code) |
| `W_MULTI_CANDIDATE` | warning | multiple providers within one (package, major) group; reports winner, losers, rewired layers |
| `W_MULTI_MAJOR` | warning | coexisting major-version groups for one package; informational, cross-major rewiring is impossible |
| `W_NO_RANGE` | warning | consumes a supplied package without any declared range |
| `W_TYPE_DRIFT` | warning | local devDependencies types copy diverges from the elected winner's version |

`E_NOT_USED` and `E_NO_EXPORT` are defined in the taxonomy but have no
emitting check yet — they land with import-site validation in a later
phase. (`E_PROTOCOL` is emitted: `resolver.ts` rejects a mounted
manifest whose `protocol` exceeds the linker's.)

### CLI surface (implemented)

- `esmx validate [--json]` (`src/cli/validate.ts`) — build-free dry run
  of the resolution (mount walk → merge → validation). `--json` emits
  the RFC §7 envelope: `diagnostics`, `supply`, `mounts`, `elections`;
  stdout is pure JSON. Exit is non-zero iff any error-severity
  diagnostic; warnings alone exit 0. A module without an `esmx` field
  reports `protocol: "legacy"` and exits 0. This is the agent
  verification loop; exit status is the judge.

Migrating a legacy config (`pkg:`/`root:` exports, `imports`, `modules`
in `entry.node.ts`) to the `package.json` declaration is a mechanical
rewrite — codemod-able, but there is no shipped command. Public export
names map across exactly (renaming a `./src/*` passthrough to a logical
name is a human decision, not an automatic one), and providers must be
rewritten before consumers since derived imports need the provider's
declaration. Pre-release there are no legacy adopters, so the codemod is
deferred until one appears.

The legacy syntax keeps working during the transition; full removal is a
later phase per RFC 0001 — there is no long-term dual syntax. The
user-facing teaching content is `examples/docs/src/{en,zh}/llms.md`, kept
in lockstep with the RFC (Phase 6, Gate 5).

## 5. Bundler adapter contract

An adapter produces an `App` (`packages/core/src/app.ts`):

```ts
interface App {
    middleware: Middleware;                                    // static assets (+HMR in dev)
    render: (options?: RenderContextOptions) => Promise<RenderContext>;
    build?: () => Promise<boolean>;
    destroy?: () => Promise<boolean>;
}
```

`createApp` (`app.ts`) supplies the production implementation
(static-file middleware + loader-based render); adapters override
`middleware`/`render` in dev and `build` in build mode.

Every adapter owes the same five obligations:

1. **Manifest plugin** — emit `manifest.json` per target with
   exports/scopes/chunks/files (+SRI in prod), and inject
   `import.meta.chunkName` into server chunks.
2. **Externals predicate** — leave federated specifiers as bare imports.
   In all three adapters this is a **per-request membership test over a
   static set** assembled from the parsed config (exports identifiers,
   `imports` keys, scope keys, linked module names); no runtime
   negotiation. The `node` target additionally externalizes all bare
   specifiers (`nodeExternals`-style).
3. **Virtual pkg entries** — each `pkg:` export becomes a virtual module
   whose source statically re-exports the real package (§6), and the
   federation entry points at it. The wrapper's own inner import must be
   *excluded* from externalization (issuer check / resolved-id check) or
   it would route back to itself and cycle.
4. **Self-alias** — `resolve.alias { [esmx.name]: esmx.root }` so a
   module's own `import '<name>/src/x'` specifiers resolve into the
   project source.
5. **Bootstrap** — build the `node` target (compiled `entry.node`) and
   write `dist/index.mjs` (§2).

Comparison:

| Concern | rspack (`packages/rspack/src/`) | rsbuild (`packages/rsbuild/src/`) | vite (`packages/vite/src/vite/`) |
|---|---|---|---|
| Externals mechanism | `externals` function returning `module-import <id>`; resolves request paths through the compiler resolver and matches an identifier map (`module-link/config.ts`) | reuses the rspack approach inside rsbuild config; `externalsType = 'module'` + `nodeExternals` for node target (`rsbuild/config.ts`) | Rollup `external` predicate `createExternalPredicate` (`vite/config.ts`): pure string/prefix tests, no resolver round-trip |
| Manifest plugin | `module-link/manifest-plugin.ts` (rspack stats-based) | `rsbuild/manifest-plugin.ts` (same logic, rsbuild API) | `vite/manifest-plugin.ts` (Rollup bundle-based) |
| pkg entry realization | `@esmx/pkg-wrapper` wrapper installed via `rspack-plugin-virtual-module` under `node_modules/.esmx-virtual/<remote>/` (`rspack/chain-config.ts`) | same, `buildPkgWrapper` + virtual module plugin (`rsbuild/config.ts`) | in-plugin `esmxPkgReexportPlugin` with `\0esmx-pkg-reexport:` virtual ids; names enumerated by **runtime `require()` + `Object.keys`** (`vite/config.ts`) |
| Dev SSR | `createVmImport` sandbox over dist output (`rspack/app.ts`) | `createVmImport` (rspack underneath; webpack-hot-middleware HMR) | `server.ssrLoadModule` from source — true module HMR, synthesized dev manifests (`vite/dev.ts`) |
| Extra patching | — | — | `esmxExternalRequirePlugin` (`external-require-plugin.ts`): rewrites Rolldown's `__require("<external>")` shim calls to real ESM imports and patches the `__toESM` interop helper to always set `.default` |

**Known trade-off (Vite name enumeration):** Vite's
`resolvePkgNames` loads the package in Node and enumerates
`Object.keys(require(pkg))` — a *runtime* view — whereas pkg-wrapper
lexes *statically*. Runtime enumeration can surface dev-only dynamic
properties (e.g. react's `act`) that a bundler's static analysis would
reject, and conversely misses nothing the lexer would find; Vite
tolerates this because its re-export shape is
`export const x = __m["x"]` (property reads, never validated against the
source module's static export list), unlike the wrapper's
`export { x } from 'spec'` which rspack statically checks. The two
enumeration strategies are intentionally different and may diverge;
failures degrade loudly to default-only re-export in both.

The Vite SSR config also sets `ssr: { noExternal: true }`
(`vite/config.ts`): Vite would otherwise externalize deps to
node_modules and load a *second* react/vue beside the federated copy,
splitting framework singletons. Bundling everything and externalizing
only the federation set keeps one instance.

## 6. pkg-wrapper (packages/pkg-wrapper/src/index.ts)

**Problem.** Pointing a bundler's federation entry directly at a
CommonJS package (react, vue's CJS build) yields a chunk that, in
development mode, exposes no usable ESM named exports —
`import { useState } from 'react'` resolves to `undefined` and SSR/CSR
crash. The fix is a generated wrapper module with **static named
re-exports**: `export { useState, ... } from 'react'; export { default } from 'react';`
(`generatePkgWrapperSource`). The wrapper imports by the
original bare specifier so user `resolve.alias` (e.g. `vue$` → runtime
build) still applies.

**Dual lexer.** `inspectPkg` enumerates names with the same
lexers bundlers use internally — `cjs-module-lexer` for CJS,
`es-module-lexer` for ESM (`detectModuleKind`, decides per
file). It deliberately does **not** execute the module: runtime
evaluation surfaces dynamic properties the bundler's static lexer can't
see, producing "export not found" build failures.

- **Conditional-branch intersection** (`lexCJS`): for
  pure-reexport CJS files with conditional branches (the canonical
  `NODE_ENV === 'production' ? require('./prod') : require('./dev')`
  pattern of react and friends), cjs-module-lexer reports only one
  branch. A regex scan finds every relative `require()`, each branch is
  lexed with an independently forked `seen` set (so branch B isn't
  emptied by branch A's cycle guard), and the result is the
  **intersection** of names across branches — guaranteed valid whichever
  branch the bundler picks.
- **`export *` recursion** (`lexESMRecursive`): many ESM
  entries are pure proxies (vue's `index.mjs` is
  `export * from './index.js'`). `export *` statements are detected by
  source slicing (es-module-lexer reports them only as imports) and
  followed recursively, switching parser per target kind; `default` is
  not propagated through `export *` per spec.
- **Subpath exports-map resolution** (`resolveFromRoot` →
  `pickEntry`/`selectExportsTarget`): resolves bare
  specifiers via Node 24's `findPackageJSON` plus an in-tree
  `exports`-map walker — exact key, then single-`*` patterns with
  longest-prefix precedence and wildcard substitution; condition
  precedence `node` → `import` → `module` → `default`, nested condition
  maps walked recursively. `module`/`main` fallbacks apply to the root
  subpath only. Fallbacks: `require.resolve`, then
  `import.meta.resolve`.
- **Unlexable-bundle fallback** (commit `b58912665`): deep subpaths like
  `pkg:vue/dist/vue.runtime.esm-browser.prod.js` can resolve to minified
  bundles es-module-lexer cannot parse; `inspectPkg` retries with the
  bare package root (`bareSpecOf`), whose entry declares the same (or a
  superset of the) named surface — the bundler still resolves the deep
  path itself via the host's import-map alias.
- **Failure degradation**: if everything fails, a loud `console.warn`
  and `{ names: [], hasDefault: false }` — the wrapper degrades to
  default-only rather than aborting the build.

See also `packages/pkg-wrapper/README.md`.

## 7. SSR pipeline

### RenderContext lifecycle (packages/core/src/render-context.ts)

1. `esmx.render(options)` constructs a `RenderContext` (`base`,
   `entryName` default `'default'`, `params`, `importmapMode` default
   `'inline'`) and invokes the loaded `entry.server` export named
   `entryName` with it.
2. The user's render function renders the app, passing
   `rc.importMetaSet` so the framework integration can register each
   rendered module's `import.meta`.
3. `await rc.commit()`: resolves the client entry via
   `getClientEntry(esmx)` (the config-threaded target with the
   legacy default as fallback), seeds the chunk set with
   `getEntryChunkId(esmx.name, clientEntry)`, adds every
   collected `import.meta.chunkName`, then walks the client manifests'
   `chunks` tables to fill `rc.files` (js/css/resources); module preloads
   come from statically lexing the entry's import graph
   (`esmx.getStaticImportPaths('client', '<name>/<clientEntry.name>')`); finally fetches the import-map HTML info.
4. The render function assembles `rc.html` from the injection helpers,
   in this order: `rc.preload()` and `rc.css()` in `<head>`;
   `rc.importmap()` then `rc.moduleEntry()` then `rc.modulePreload()` at
   the end of `<body>`. `moduleEntry` emits
   `<script type="module">import "<name>/<clientEntry.name>";</script>`,
   again via `getClientEntry`. `modulePreload` attaches SRI `integrity`
   when available. Setting `rc.html` replaces every base-path placeholder
   with `rc.base`.

### Server-side module loading (packages/import/src/)

- **Production — `createLoaderImport`** (`import-loader.ts`):
  registers this very file as a Node loader via
  `module.register(import.meta.url, { parentURL: baseURL, data })`. The
  loader's `resolve` hook consults an import-map resolver
  (`import-map-resolve.ts`) before delegating; thereafter plain dynamic
  `import()` of `<name>/src/entry.server` resolves through the server
  import map. Registration is a **per-process singleton**: a second call
  with a different import map throws (no hot swap — §8).
- **Development — `createVmImport`** (`import-vm.ts`): a
  `node:vm` `SourceTextModule` sandbox per render-environment. It
  resolves through the same import-map resolver, synthesizes modules for
  Node builtins, materializes style-asset imports (`.css` etc.) as
  synthetic modules exposing only the asset URL (CSS reaches the browser
  via manifest-driven `<link>` tags, never server evaluation), caches
  per-context, and supports dynamic import. Used by the rspack and
  rsbuild dev apps against their watch-built dist output.
- **Vite dev** bypasses both: `server.ssrLoadModule(entry.server)`
  straight from source (`packages/vite/src/vite/dev.ts`), with
  synthesized minimal manifests so core's import map points the browser
  at Vite-served, HMR-enabled source modules.

## 8. Design decisions & trade-offs

- **Manifest shape rationale.** The manifest is the minimal contract
  between any bundler and the composer: exports (identifier ↔ file),
  scopes (the module's own bare-specifier wiring), chunks (SSR
  CSS/asset collection), integrity. It deliberately contains no version
  or dependency semantics today — RFC 0001 Phase 3 adds `protocol`,
  `version`, resolved `provides`, and per-chunk provenance, which is what
  upgrades `W_MULTI_CANDIDATE` substitution-safety from "skip silently"
  to a real gate.
- **Virtual modules over build-time transform.** `pkg:` exports are
  realized as virtual wrapper modules rather than rewriting the
  package's own output: the bundler's resolver and user aliases keep
  working, and the wrapper is pure additive plumbing. The cost is the
  wrapper/externals interaction (the wrapper file must be exempt from
  externalization in every adapter).
- **No streaming SSR.** `RenderContext` produces a complete HTML string
  (`rc.html`); resource collection (`commit()`) inherently runs after
  rendering finishes, since chunk-accurate CSS injection depends on the
  full `importMetaSet`. Streaming would require speculative resource
  emission and is not implemented.
- **Manifest logic is triplicated.** Each adapter carries its own
  manifest plugin (`rspack/src/module-link/manifest-plugin.ts`,
  `rsbuild/src/rsbuild/manifest-plugin.ts`,
  `vite/src/vite/manifest-plugin.ts`) emitting the same `ManifestJson`.
  They drift in implementation detail (stats-based vs bundle-based) and
  must be changed in lockstep when the manifest shape changes — accepted
  cost; RFC Phase 3's field additions touch all three.
- **Loader singleton, no hot swap.** `createLoaderImport` registers the
  resolve hook once per process; in-process remotes are *not*
  hot-swappable by design (RFC §9). A remote update requires composer
  re-linking: the planned operational path is atomic **generational
  reinit** (`Esmx.reinit()`, RFC Phase 7 — new-generation import map +
  loader, graceful traffic switch) or a rolling restart. Live per-module
  hot swap is a non-goal: it would reintroduce the runtime complexity
  (shared-scope negotiation, sandbox lifecycles) whose absence is esmx's
  core value.
- **Config-threaded entry identifiers (RFC 0001 Phase 2, done).**
  Framework entries used to be welded to physical names in three places;
  Phase 2 replaced those literals with a single resolved
  `moduleConfig.entry` produced by `parseEntryConfig`
  (`module-config.ts`). Every former weld now reads the resolved
  target: the chunk seed via `getEntryChunkId`
  (`render-context.ts`), the preload graph and `moduleEntry` via
  `getClientEntry` (`render-context.ts,1060,1292`), and the server
  render via `entry.server` (`app.ts`). `DEFAULT_MODULE_ENTRY`
  (`src/entry.client` / `src/entry.server`) is now only a fallback for
  unset sides, so a module can rename its entries via `esmx.entry`.
- **Static dev resolution.** Declaration resolution is computed at
  `init`; a dev-mode change to any closure member's `provides` can flip
  a merge winner and rewire other modules, so it requires a consumer
  dev-server restart (documented in RFC §10; cross-compiler watch
  invalidation is future work).

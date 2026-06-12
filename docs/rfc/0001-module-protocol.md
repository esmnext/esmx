# RFC 0001: Esmx Module Protocol v2

| | |
|---|---|
| **Status** | Accepted — pending implementation |
| **Date** | 2026-06-13 |
| **Breaking** | Yes — intentionally. Correctness over compatibility. |
| **Reviewed by** | Three independent expert reviews (module resolution / TypeScript, bundler internals, micro-frontend architecture), each verified against this codebase. Findings and dispositions in §11. |
| **Supersedes** | The `modules: { links, imports, exports, scopes }` configuration in `entry.node.ts`, including the `pkg:` / `root:` prefix syntax. |

## 1. Summary

Esmx's runtime architecture (build-time manifest → import map → native ESM
resolution, zero runtime) is correct and unchanged by this RFC. What changes
is the **protocol layer**: how a module declares itself, what the build
artifact carries, and how linking resolves at mount time.

The current configuration conflates the protocol with hand-written wiring:
consumers manually map shared specifiers to providers, export names are
welded to physical file paths (because TypeScript resolution free-rides on
path identity), and a string-prefix micro-DSL (`pkg:` / `root:`) encodes
what should be structured data. This RFC replaces all of it with:

1. **Declaration** in the `package.json` `esmx` field — strictly local
   knowledge: a module declares only facts about itself.
2. **Manifest** as the deployment contract — gains `protocol`, `version`,
   and `uses` transcriptions.
3. **Deterministic link-time resolution** — auto-wiring from declarations,
   hard build-time errors whose fixes always live in existing
   declarations, an emitted audit artifact.
4. **Standard TypeScript integration** — `exports` + `types` conditions
   derived from the declaration; no path leakage, no hand-written shims.

Everything that already works is delegated, not reinvented: distribution,
versioning, transport and pinning stay with npm (pack → tgz → registry /
static hosting / deploy paths); type resolution stays with TypeScript's
own subpath mechanism; runtime isolation stays with import map scopes.

## 2. Motivation — the real pains

> Review note: an earlier draft claimed "O(deps × consumers) imports
> boilerplate". The architecture review refuted this against the 16-module
> hub (which has exactly one hand-written `imports` line) and the
> motivation was re-anchored on the pains below, which the codebase does
> exhibit.

1. **Physical paths are the public contract.** Consumers import
   `'ssr-micro-shared/src/index'` — the provider's directory layout is the
   API. This is not an oversight: under `moduleResolution: "node"` the
   specifier doubles as a real file path inside the npm-linked package,
   which is the only reason types resolve today. Renaming a source file is
   a breaking change for every consumer. The type system is holding the
   naming scheme hostage.
2. **Version drift is silent.** Inter-module versions live in npm
   (`dependencies` + lockfile), but esmx never consumes that fact: install
   `other-app@2.0` against code written for `1.x` and the failure surfaces
   as a runtime import error, not a build-time contract violation.
3. **Wiring is manual and unvalidated.** `imports: { vue: 'shared/vue' }`
   duplicates information already present in the provider's declaration;
   nothing checks the mapping target exists until runtime.
4. **The prefix DSL is a private dialect.** `pkg:` / `root:` cram two
   orthogonal facts (source kind, export name) into strings that no type
   system or schema can validate, in a framework whose selling point is
   "no proprietary API". For both humans and coding agents this is the
   single largest source of one-shot configuration failure.
5. **`links` path sprawl.** The hub hand-writes 16 relative dist paths
   that the package manager already knows.

## 3. Design principles

- **P1 Delegate to standards.** npm owns distribution/versioning/pinning.
  TypeScript owns type resolution. Import maps own runtime isolation.
  Esmx defines only: declaration, manifest, link-time resolution.
- **P2 Local knowledge only.** A module's declaration must be writable —
  by a human or an agent — knowing nothing about any other module. Global
  knowledge exists only in the resolver's output.
- **P3 Build-time determinism.** Same declarations → same wiring,
  always. Every failure is a build-time error with
  what/why/fix. No runtime negotiation, no silent fallback.
- **P4 Static declarations.** Protocol facts must be readable without
  executing code. Behavior (dev server, build hooks) stays in code;
  facts live in JSON.
- **P5 Correctness over compatibility.** This is a breaking release.
  No dual syntax, no deprecation coexistence. Migration is a codemod.

## 4. Declaration layer

All protocol facts live in `package.json` under `esmx`. The
`entry.node.ts` file keeps only behavior (`devApp`, `server`,
`postBuild`); it must not contain protocol information — the loader
errors if it does.

```jsonc
// provider: shared/package.json
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

```jsonc
// consumer + provider: cart/package.json
{
  "name": "cart",
  "version": "1.8.0",
  "dependencies": { "shared": "^3.0.0" },
  "esmx": {
    "entry": { "client": "./src/entry.client.ts", "server": "./src/entry.server.ts" },
    "exports": { "./widget": "./src/cart-widget.ts" },
    "uses": ["shared"]
  }
}
```

```jsonc
// composer: host/package.json
{
  "name": "host",
  "version": "2.0.0",
  "dependencies": { "shared": "^3.0.0", "cart": "^1.5.0" },
  "esmx": {
    "entry": { "client": "./src/entry.client.ts", "server": "./src/entry.server.ts" },
    "uses": ["shared", "cart"]
  }
}
```

The division of labor: `links` (the mount table, §6) answers *where
supply lives*; `uses` answers *which mounted modules I consume from*;
the consumer's own source imports — statically lexed, an existing
mechanism — answer *what exactly is needed*. The real external-dependency
graph is **generated by lookup**, never declared by hand:

```
for each bare specifier S lexed from my source:
  S found in a used module's provides/exports → externalize, wire to it
  S found nowhere                             → bundle my own copy
```

### 4.1 Field semantics

- **`entry`** — the framework entries, declared like any other export.
  There are no reserved names: `RenderContext` receives the resolved
  client-entry identifier from configuration instead of hard-coding
  `<name>/src/entry.client` (today: `render-context.ts` `moduleEntry()` /
  `commit()`). Library modules (`lib: true` today) simply omit `entry`.
- **`exports`** — subpath map with logical names. Keys must be `./<name>`
  subpaths; values are relative source files or `{ client, server }`
  forks (`false` disables a side). The physical path never appears in any
  consumer. Replaces `root:` strings and object exports.
- **`provides`** — third-party packages this module re-exports for
  consumers (replaces `pkg:`). A plain array: providing is a deliberate
  infrastructure decision, not a negotiated runtime fact, so it carries
  no per-entry options. The provided version is the provider's
  **resolved installed version**, captured into the manifest at build
  time (a concrete version, never a range — range-vs-range satisfaction
  is ill-defined and explicitly rejected).
- **`uses`** — a plain array of module names: *which mounted modules I
  consume from*. Each entry must resolve against the mount table
  (`E_NOT_LINKED` otherwise). Granularity is deliberately the **module**,
  not the specifier — mirroring npm, where you depend on a package, not
  on its individual exports:
  - Specifier-level needs are NOT declared: they are lexed from the
    consumer's own source imports (an existing mechanism — the bundler
    lexes them anyway to decide externalization). A bare specifier found
    in a used module's `provides` is externalized and wired to it; a
    specifier found nowhere is bundled as the consumer's own copy,
    isolated by per-module import-map scopes (this is how the hub's
    vue2/vue3 coexistence already works, with zero protocol vocabulary).
  - Version ranges are NOT declared here: the `dependencies` range is
    the single source of truth, validated against the mounted artifact's
    transcribed version (`E_VERSION` on mismatch). Bare-package version
    expectations are validated against the consumer's own
    devDependencies copy (the types copy), with drift warnings.
  - `uses` is transitive: a base module may itself use another base
    (`ssr-vue-base` uses `ssr-base`), forming layered platform chains;
    resolution walks the chain with cycle detection. Business apps
    declare one line and stay ignorant of the chain's depth.
  - Overlapping supply across the chain is **merged with deterministic
    precedence**, not rejected: layered bases legitimately override
    lower layers (a vue-base lays a vue-specific layer over a generic
    base). Precedence: **own `provides` > nearer chain layer > later
    entry in the `uses` array** (generic-to-specific listing, the
    specific layer wins — `Object.assign` semantics). Own-provides
    priority is forced by instance consistency: a module that provides
    `vue` downstream must itself run on the copy it provides.

There is deliberately **no arbitration field** (no `resolutions`, no
`singleton`/`optional` flags) and **no specifier-level needs map**.
Module Federation needs arbitration because its sharing is negotiated at
runtime; esmx composition is static and declared: every wiring decision
is derived from declaration structure (chain distance and array order),
and the remaining failure modes are architecture errors whose fixes live
in declarations that already exist. Because election (§7) picks exactly
one winner per bare package and rewires the whole closure to it,
single-instance sharing is an inherent property of the model, not a
flag. Multi-instance coexistence happens only when a module bundles its
own copy — today's natural, scope-isolated behavior.

### 4.2 What is deleted

`pkg:` / `root:` prefixes, hand-written `imports`, public `ModuleConfig`
(it becomes an internal IR), `modules` in `entry.node.ts`, and the
implicit "public name == source path" convention. Existing consumer
import sites (`'shared/src/index'` → `'shared/ui'`) migrate via codemod;
there is no `./src/*` passthrough.

## 5. Manifest layer

Additive changes to `dist/<env>/manifest.json`:

```jsonc
{
  "protocol": 2,                    // NEW: int; linker rejects higher-than-self
  "name": "cart",
  "version": "1.8.0",               // NEW: transcribed from package.json
  "exports": { "widget": { "name": "widget", "pkg": false, "file": "...", "identifier": "cart/widget" } },
  "provides": { "vue": "3.4.21" },  // NEW: resolved versions captured at build
  "uses": ["shared"],               // NEW: transcribed consumption edges
  "scopes": {}, "files": [], "chunks": {}, "integrity": {}
}
```

Export keys become logical names. The internal data model already
supports name ≠ path everywhere (`ParsedModuleConfigExport.name` vs
`.file`; identifiers derive uniformly from `name`); the only places that
weld name to path are the prefix parser and two framework-entry
hard-codes in `render-context.ts` — both removed by this RFC.

The manifest is the deployment contract: any compliant builder that emits
it participates in the ecosystem.

## 6. Mounting layer (`links`)

`links` keeps its current semantics — a mount point mapping module name →
artifact directory. Distribution is delegated (P1): pack produces a
standard npm tgz consumed via registry install, static hosting +
`@esmx/fetch`, or deploy paths.

New convention: **modules installed via npm auto-mount at
`node_modules/<name>/dist`**; explicit `links` (which stays in
`entry.node.ts`'s environment side or a dedicated env file — it is an
environment fact, not a protocol fact) only overrides for monorepo
siblings and deploy paths. The auto-mount resolver:

- realpaths the mount point **once** before deriving link root and
  manifest paths, feeding the same realpath into both client and server
  import-map generation (today only the server side realpaths;
  pnpm symlink asymmetry is a verified hazard);
- resolves through the consumer's actual dependency tree rather than a
  flat name → dir convention, so hoisted/nested duplicates are seen
  (legitimate multi-version) instead of silently picking the hoisted copy;
- explicitly bypasses the package's `exports` encapsulation: the linker
  reads `dist/` as a filesystem artifact, and the `exports` field exists
  for TypeScript and Node consumers only. This asymmetry is intentional
  and documented, not accidental.

## 7. Resolution layer

Runs at config/build time. **Inputs are declarations
(`package.json esmx` of mounted modules), never emitted manifests** — a
load-bearing distinction from the review: declarations exist before any
build, so cold starts and parallel builds cannot deadlock. Manifests are
consulted only for what genuinely requires a build: resolved `provides`
versions and artifact-version validation, which degrade to
`E_NOT_BUILT` (with "build these first" guidance) rather than blocking
declaration-level wiring.

```
phase 1 — consumption graph:
  for each name in my uses[] (transitively, with cycle detection):
    name ∉ mount table              → E_NOT_LINKED (distinguishes "not
                                      declared" from "declared but not
                                      built" — different fixes)
    artifact version ∉ dependencies range → E_VERSION

phase 2 — supply election (per bare package P in the closure):
  candidates = every module in the closure declaring P in provides
  winner W   = highest precedence candidate:
               own provides > nearer chain layer > later uses[] entry
  rewire     = EVERY layer's P — including losing providers' own
               internal chunks — points at W. Import maps make this a
               link-time rewiring of the scope table; no artifact is
               touched. Losing copies are dropped from the map
               (reported as unused in the audit artifact).
  validate   = W's resolved version must satisfy every layer's
               dependencies range for P → E_VERSION naming the
               incompatible layer. A layer never silently "falls back"
               to its own copy — that would split instances.

phase 3 — wiring by lookup (per specifier lexed from my source):
  module-export form ("shared/ui"):
    exporter ∉ my uses chain        → E_NOT_USED
    export absent from declaration  → E_NO_EXPORT (lists actual exports)
    else                            → externalize, wire to identifier
  bare package ("vue"):
    elected in phase 2              → externalize, wire to winner
    no candidate anywhere           → bundle own copy (scope-isolated)

all failures are build-time; every error carries what / why / fix —
and every fix is an edit to an existing declaration, never a new concept
```

Election is the link-time, deterministic analogue of Module Federation's
runtime share-scope negotiation — same problem, solved statically: the
composer's import map is the single late-binding point, so overlapping
supply resolves to one winner per package with the entire closure
rewired to it, before anything ships. The one-sentence rule: **nearest
wins, self first, the whole chain follows the winner.**

Multi-version coexistence needs no resolver vocabulary: modules that
bundle their own copy are isolated by per-module import map scopes
(machinery that exists and already carries the hub's vue2/vue3 split).

**Output: `esmx.resolution.json`** — an emitted audit artifact recording
every wiring decision, provider versions, and integrity hashes, useful
for review and diffing. With no arbitration input, declarations alone
fully determine the wiring, so this file is derived output — not a
lockfile, and reproducibility does not depend on committing it (npm's
lockfile owns version pinning).

## 8. TypeScript integration

Hard constraints (compiler physics, not compatibility):
`allowImportingTsExtensions` forbids declaration emit, and a `default`
condition pointing at `.ts` breaks every non-bundler consumer. Therefore:

- **`types` always points at generated `.d.ts`** (`dist/src/*.d.ts`),
  in both workspace and published forms. The `exports` block of
  `package.json` is **derived** from `esmx.exports` by `esmx sync`
  (build/pack hook, CI-checked for drift) — single source of truth,
  never hand-maintained. Pack rewrites into a staging dir, never
  mutating the source `package.json`; output is validated with
  publint/arethetypeswrong-class checks.
- **Editor-speed feedback in workspaces** comes from **derived**
  tsconfig `paths` (generated from sibling declarations into an
  extendable `tsconfig.esmx.json`) — never hand-written, replacing the
  hub's hand-rolled `sibling-routes.d.ts` shim. TS project references
  (+ declaration maps) are the candidate upgrade once vue-tsc/composite
  compatibility is verified.
- **Consumers set `moduleResolution: "bundler"`.** That is the entire
  consumer-side configuration.
- **Env-forked exports** type against the server fork; the sync step
  asserts client/server signature equality (a free contract check).
  Genuinely divergent signatures may use `customConditions` per-target
  tsconfigs.
- **`provides` types** resolve via the consumer's own devDependencies;
  the resolver warns when the local types copy diverges from the
  provider's resolved version.

**Type-visibility rule:** types resolve for any module visible to Node
resolution (`node_modules`, whether workspace-linked or installed from
registry/tgz). Arbitrary-path mounts (deploy dirs, raw fetch output) are
a runtime-only capability and are **typeless by design** — install the
tgz if you want types. This is a stated trade-off, not a gap.

| Consumption topology | Types | Condition |
|---|---|---|
| npm/tgz install | ✅ native | none |
| workspace sibling | ✅ | provider built once, or derived `paths` |
| `provides` bare package | ✅ | devDeps copy; drift warned |
| env-forked export | ✅ | signature equality enforced |
| arbitrary-path mount | ❌ by design | install into node_modules for types |

## 9. Runtime model decision

**In-process remotes are not hot-swappable. This is a design decision,
not a limitation backlog item.** The production server import map is
constructed at `Esmx.init` and the loader hook is a per-process
singleton; a remote update therefore requires composer re-linking. The
alternative — hot-swapping server module graphs — reintroduces exactly
the class of runtime complexity (shared-scope negotiation, sandbox
lifecycles) whose absence is esmx's core value.

The correct operational path is **atomic generational relink**: remote
publishes → composer performs `Esmx.reinit()` (new-generation import map
+ loader, graceful traffic switch) or a rolling restart. Canary/A-B of a
single remote operates at process-generation granularity. This is the
immutable-infrastructure stance, consistent with P3. `reinit()` is in
scope for the implementation; live per-module hot swap is a non-goal.

## 10. Implementation plan

The decisive feasibility finding: the pipeline is already name ≠ path
internally, so the protocol lands as a **translation layer in
`@esmx/core`** (new declaration reader + resolution engine lowering to
the internal IR), with **zero bundler-adapter changes**.

| Phase | Work | Scope |
|---|---|---|
| 1 | Declaration reader (`package.json esmx`) + resolver + errors + `esmx.resolution.json`; lower to internal `ModuleConfig` | core — the one new subsystem |
| 2 | Thread entry identifiers through `RenderContext` (removes `src/entry.client` hard-codes) | core, small, mandatory |
| 3 | Manifest fields (`protocol`, `version`, `provides` resolved versions, `uses`) | 3 manifest plugins, small each |
| 4 | `esmx sync`: derived `exports`/types + derived workspace `paths`; pack staging rewrite | new, isolated |
| 5 | Codemod (`pkg:`/`root:`/`imports` → declarations; consumer import sites to logical names) + migrate all examples incl. the 16-module hub | examples + tool |
| 6 | `Esmx.reinit()` generational relink | core |

v1 resolution is **static**: dev-mode changes to a provider's `provides`
set require consumer dev-server restart (documented; the cross-compiler
watch-invalidation machinery across three dev paths is future work).

### Acceptance gates (must pass before release)

1. **Multi-version fixture**: 3 consumers where 2 share a provided
   package and 1 bundles its own copy, through the full client map
   pipeline (`fixImportMapNestedScopes` → `compressImportMap` →
   `addCodeSplitChunkScopes`) — own-copy isolation creates the
   multi-version case the compression heuristic guards against.
2. **Hub migration green**: the 16-module hub fully migrated to the new
   protocol, smoke + visual CI passing. It is the realistic stress test.
3. **`provides`/`uses` semantics tests**: election precedence (own >
   nearer > later array entry), whole-closure rewiring incl. losing
   providers' internal chunks, per-layer `E_VERSION` guidance quality,
   own-copy scope isolation, version-drift warnings.

## 11. Expert review record

Three independent reviews, each grounded in the source. Dispositions:

| Finding | Source | Disposition |
|---|---|---|
| `types` → `.ts` collides with `allowImportingTsExtensions`/emit; dev `default` → `.ts` breaks Node | TS review (blocking) | **Adopted**: always-generated `.d.ts` + derived workspace paths (§8) |
| Resolution must read declarations, not emitted manifests (cold-start deadlock) | Bundler review (blocking) | **Adopted** (§7) |
| `src/entry.client` hard-codes break under logical names | Bundler review (blocking) | **Adopted, upgraded**: explicit `entry` declaration instead of reserved names (§4.1) |
| `provides` weaker than MF shared (consume-only/singleton/optional) | Architecture review (blocking) | **Adopted, then reversed on maintainer challenge**: an early draft imported MF vocabulary (`singleton`, `optional`, `resolutions`) wholesale — rebuilding the runtime-negotiation model esmx exists to avoid. Final: static composition makes single-instance inherent, consume-only is `uses` by definition, own-copy bundling covers the rest; conflicts are architecture errors fixed in existing declarations (§4.1, §7) |
| Runtime remote update story silent | Architecture review (blocking) | **Decided**: non-goal + generational `reinit()` (§9) |
| "O(deps×consumers)" motivation overstated | Architecture review | **Adopted**: motivation re-anchored (§2) |
| resolution.json "not a lockfile" misleading | Architecture review | **Resolved by simplification**: with no arbitration input, declarations fully determine wiring; the file reverts to a derived audit artifact (§7) |
| Range-vs-range semver ill-defined; private workspace versions are placeholders | TS review | **Adopted**: resolved-version transcription; no semver gate for private workspace modules (§4.1) |
| pnpm realpath asymmetry client vs server | TS review | **Adopted** (§6) |
| Logical rename is a breaking codemod, not a config flip (~30 sites) | TS review | **Accepted** under P5; no passthrough (§4.2) |
| Multi-version scopes fight `compressImportMap` heuristic | Bundler review | **Gate 1** (§10); narrowed to own-copy isolation after the arbitration field was removed |
| Dev-watch staleness of auto-wiring | Bundler review | **Scoped out of v1**, documented (§10) |
| `exports` encapsulation vs raw dist mount | TS review | **Documented as intentional** (§6) |
| Pack-time package.json rewrite reliability | TS review | **Adopted**: staging dir + publint-class validation (§8) |
| Specifier-level `uses` map duplicates facts that already exist (source imports declare needs; `dependencies` declares ranges) | Maintainer | **Adopted**: `uses` reduced to a module-name array referencing the mount table; the external-dependency graph is generated by lookup (lexed specifiers × used modules' supply), never hand-declared (§4.1, §7) |
| Overlapping supply in layered base chains (base and vue-base both provide vue) is the normal case, not an error — merge semantics needed | Maintainer | **Adopted**: `E_MULTIPLE_PROVIDERS` replaced by deterministic election (own > nearer > later array entry) with whole-closure rewiring and per-layer version validation — MF's runtime share-scope negotiation solved statically at link time (§4.1, §7) |

## 12. Non-goals / future work

- Live per-module hot swap in the composer process (see §9).
- Dev-mode dynamic re-resolution across compilers.
- Cross-module CSS dedup contract; manifest signing / cross-team trust
  chain; shared i18n catalog ownership — production-platform questions
  acknowledged and deferred to follow-up RFCs.
- TS project references as the workspace mechanism (pending
  vue-tsc/composite verification).
- Unifying Vite's runtime export enumeration with the pkg-wrapper static
  lexer path (pre-existing divergence, tracked separately).

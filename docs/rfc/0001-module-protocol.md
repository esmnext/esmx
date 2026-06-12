# RFC 0001: Esmx Module Protocol v2

| | |
|---|---|
| **Status** | Accepted — Phase 1 implemented (declaration subsystem, `esmx validate`, `esmx migrate`); Phases 2–4, 6–7 pending |
| **Date** | 2026-06-13 |
| **Breaking** | Yes — intentionally. Correctness over compatibility. |
| **Reviewed by** | Two rounds of independent expert review — round 1: module resolution / TypeScript, bundler internals, micro-frontend architecture; round 2: agent-era survivability, resolution/TS re-review, bundler feasibility re-review, platform governance — each verified against this codebase. Findings and dispositions in §11. |
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
   declarations. The resolved import map in `dist` IS the resolution
   result; diagnostics are tooling output, not a protocol artifact.
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
  "peerDependencies": { "vue": "^3.4.0", "@esmx/router": "^3.0.0" },
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
  "peerDependencies": { "vue": "^3.4.0", "@esmx/router": "^3.0.0" },
  "esmx": {
    "entry": { "client": "./src/entry.client.ts", "server": "./src/entry.server.ts" },
    "uses": ["shared", "cart"]
  }
}
```

The division of labor: `links` (the mount table, §6) answers *where
supply lives*; `uses` answers *which mounted modules I consume from*;
the specifiers the bundler encounters while traversing my module graph
answer *what exactly is needed*. The real external-dependency graph is
**generated by lookup**, never declared by hand:

```
for each specifier S the bundler resolves while building me:
  S found in my merged supply table (§7) → externalize, wire to it
  S found nowhere                        → bundle my own copy
```

Implementation note (review-verified): esmx performs **no source
pre-pass**. The supply table is fully static after the merge (§7), and
all three adapters already implement externalization as a per-request
predicate the bundler calls for each specifier during its own traversal
— a pure membership test. The predicate is request-keyed, not
issuer-keyed: a `vue` import inside the consumer's bundled node_modules
dependencies is also externalized onto the elected copy. That is
intentional — it is what preserves single-instance sharing against the
classic transitive-dependency hole. Type-only imports (`import type`)
are elided by the TS transform before the predicate ever sees them and
never produce wiring (a guaranteed invariant, fixtured in Gate 3).

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
  - Specifier-level needs are NOT declared: the bundler encounters them
    during its normal traversal and asks the externalization predicate
    per specifier (see §4 implementation note). A bare specifier found
    in the merged supply table is externalized and wired; a specifier
    found nowhere is bundled as the consumer's own copy, isolated by
    per-module import-map scopes (this is how the hub's vue2/vue3
    coexistence already works, with zero protocol vocabulary).
  - Version ranges are NOT declared here: the consumer's
    `dependencies` ∪ `peerDependencies` ranges are the single source of
    truth, validated against the mounted artifact's transcribed version
    (`E_VERSION` on mismatch). A layer that consumes a provided package
    without declaring any range gets a build-time warning, not a silent
    pass and not a hard error. Bare-package types are validated against
    the consumer's own devDependencies copy, with drift warnings.
  - `uses` is transitive: a base module may itself use another base
    (`ssr-vue-base` uses `ssr-base`), forming layered platform chains;
    resolution walks the chain with cycle detection. Business apps
    declare one line and stay ignorant of the chain's depth.
  - Overlapping supply across the chain is **merged**, not rejected:
    layered bases legitimately override lower layers. The entire
    precedence model is one recursive line — `uses` plus the module
    itself form a merge chain in which later entries override earlier
    ones and self is the implicit last element:

    ```
    supply(M) = merge( supply(uses[0]), ..., supply(uses[n]), M.provides )
    ```

    This single definition is total (diamond topologies resolve
    deterministically: a later `uses` entry's whole subtree overrides an
    earlier entry's), subsumes "nearer layer wins" (recursion makes it
    emergent), and subsumes "own provides wins" (self is last) — which
    is also forced by instance consistency: a module that provides `vue`
    downstream must itself run on the copy it provides. **`uses` array
    order is therefore load-bearing**: list generic-to-specific, the
    specific layer wins. This is a documented convention (same family as
    `Object.assign` and CSS cascade order); the build log prints every
    multi-candidate merge with its winner, so an order change that flips
    a winner is visible in build output.

There is deliberately **no arbitration field** (no `resolutions`, no
`singleton`/`optional` flags) and **no specifier-level needs map**.
Module Federation needs arbitration because its sharing is negotiated at
runtime; esmx composition is static and declared: every wiring decision
is derived from the merge-chain structure, and the remaining failure
modes are architecture errors whose fixes live in declarations that
already exist. Because the merge yields exactly one winner per bare
package and the whole closure is rewired to it (§7), single-instance
sharing is an inherent property of the model, not a flag. Multi-instance
coexistence happens only when a module bundles its own copy — today's
natural, scope-isolated behavior.

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
  "provides": {},                   // NEW: resolved versions captured at build
                                    // (cart provides nothing; shared's
                                    // manifest would carry e.g. {"vue":"3.4.21"})
  "uses": ["shared"],               // NEW: transcribed consumption edges
  "scopes": {}, "files": [], "chunks": {}, "integrity": {}
}
```

One further field is required by §7's loser suppression: **per-chunk
provenance** — the manifest must associate each provided package with
the specific emitted chunk file(s) that carry its copy, so the composer
can drop a losing provider's copy from scopes, SRI integrity, preload,
and the file list. Today the `''` scope says `{"vue": "<self>/vue"}` but
nothing links that to the chunk file; without the association,
suppression is unimplementable (review-verified).

Export keys become logical names. The internal data model already
supports name ≠ path everywhere (`ParsedModuleConfigExport.name` vs
`.file`; identifiers derive uniformly from `name`); the only places that
weld name to path are the prefix parser and the framework-entry
hard-codes — `render-context.ts` (`moduleEntry()`, `commit()`'s chunk
seed and static-import path), `app.ts`'s server-entry load, and the
`createDefaultExports` reserved-name table in `module-config.ts` — all
removed by this RFC.

The manifest is the deployment contract: any compliant builder that emits
it participates in the ecosystem.

## 6. Mounting layer (`links`)

`links` keeps its current semantics — a mount point mapping module name →
artifact directory. Distribution is delegated (P1): pack produces a
standard npm tgz consumed via registry install, static hosting +
`@esmx/fetch`, or deploy paths.

New convention: **modules installed via npm auto-mount at
`node_modules/<name>/dist`**; explicit `links` only overrides for
monorepo siblings and deploy paths. `links` is an environment fact, not
a protocol fact, so it is the one `modules` key still permitted in
`entry.node.ts`: `E_PROTOCOL_IN_BEHAVIOR` (§4) carves out
`modules.links` explicitly and fires only when `entry.node.ts` carries
protocol fields (`exports`/`provides`/`uses`/`imports`/`scopes`). The
auto-mount resolver:

- realpaths the mount point **once** before deriving link root and
  manifest paths, feeding the same realpath into both client and server
  import-map generation (today only the server side realpaths;
  pnpm symlink asymmetry is a verified hazard);
- resolves through the consumer's actual dependency tree rather than a
  flat name → dir convention, so hoisted/nested duplicates are seen
  (legitimate multi-version) instead of silently picking the hoisted copy;
- walks **transitive** `uses`: today's link table is flat and local
  (`getLinks` merges only self + own `links`), so "business apps declare
  one line" requires net-new machinery — when mounting a used module,
  read its declaration's `uses` and recursively mount each entry,
  resolving through the *declaring* module's own location (Node
  resolution semantics, hoisting-aware), with cycle detection;
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
  for each name in my uses[] (transitively):
    name ∉ mount table              → E_NOT_LINKED
    name linked, artifact absent    → E_NOT_BUILT ("build these first";
                                      blocks only manifest-dependent
                                      checks, not declaration wiring)
    artifact version ∉ dependencies range → E_VERSION
    uses chain revisits a module    → E_CYCLE (a uses cycle is an
                                      architecture error, consistent
                                      with P3 — never silently broken
                                      into an empty back-edge); the
                                      same code applies to the §6
                                      transitive mount walk

phase 2 — supply merge (the §4.1 recursive definition):
  supply(M) = merge( supply(uses[0]), ..., supply(uses[n]), M.provides )
  → exactly one winner W per bare package P; total, including diamonds

  rewire   = EVERY layer's P — including losing providers' own internal
             chunks — points at W. Bundler outputs are untouched (chunks
             import the bare name; the composer's map decides the
             target), but the composition layer must actively SUPPRESS
             the losing copy on BOTH map paths: the client pipeline
             (scopes, SRI integrity table, modulepreload set, file list)
             AND the server import map feeding the in-process SSR loader
             — a missed server suppression duplicates a stateful dep in
             Node, the more dangerous failure. Requires the §5 per-chunk
             provenance field; provenance is chunk-SET-valued, since a
             provided package's copy may span multiple chunks under
             code-splitting bundlers. The build log prints every
             multi-candidate merge: winner, losers, rewired layers
             (structured warning W_MULTI_CANDIDATE, see below).
  validate = two checks, both build-time:
             (a) intent — W's resolved version satisfies each consuming
                 layer's dependencies ∪ peerDependencies range for P;
                 a layer with no declared range gets a warning.
             (b) substitution safety — for every LOSING provider whose
                 chunks are rewired onto W, W's resolved version must be
                 compatible with the version that provider was BUILT
                 against (same major at minimum): range satisfaction
                 alone does not guarantee a chunk compiled against 3.4
                 runs on 3.0. → E_VERSION naming the layer.
             A layer never silently "falls back" to its own copy — that
             would split instances.

phase 3 — wiring (per specifier the bundler resolves, lazily):
  module-export form ("shared/ui"):
    exporter ∉ my uses chain        → E_NOT_USED
    export absent from declaration  → E_NO_EXPORT (lists actual exports)
    else                            → externalize, wire to identifier
  bare package ("vue"):
    in merged supply table          → externalize, wire to winner
    not in table                    → bundle own copy (scope-isolated)

all failures are build-time; every error carries what / why / fix —
and every fix is an edit to an existing declaration, never a new concept
```

The merge is the link-time, deterministic analogue of Module
Federation's runtime share-scope negotiation — same problem, solved
statically: the composer's import map is the single late-binding point,
so overlapping supply resolves to one winner per package with the entire
closure rewired to it, before anything ships. The one-sentence rule:
**the merge chain is `[...uses, self]`, later overrides earlier, and the
whole closure follows the winner.**

Multi-version coexistence needs no resolver vocabulary: modules that
bundle their own copy are isolated by per-module import map scopes
(machinery that exists and already carries the hub's vue2/vue3 split).

There is **no resolution artifact**: the import map emitted into `dist`
IS the resolution result, and declarations alone fully determine it
(P3). Diagnostics — which package had multiple candidates, who won, who
was rewired — belong to tooling (`esmx validate`, build log), not to the
protocol.

**Complete diagnostic taxonomy** (every entry machine-readable — agents
must be able to detect warnings, not just errors; "visible in build
output" means *structured* visibility):

| Code | Kind | Meaning |
|---|---|---|
| `E_NOT_LINKED` | error | used module absent from the mount table |
| `E_NOT_BUILT` | error | mounted but no artifact. Scoped error: it fails only the manifest-dependent checks (resolved versions, substitution safety) while declaration-level wiring proceeds — so a cold workspace can still resolve, and the fix ("build these first") is unambiguous |
| `E_CYCLE` | error | `uses` chain (or mount walk) revisits a module |
| `E_VERSION` | error | intent (range) or substitution-safety (built-against) violation; names the layer and which check failed |
| `E_NOT_USED` | error | module-export import from a module outside the uses chain |
| `E_NO_EXPORT` | error | export absent; lists the module's actual exports |
| `E_PROTOCOL` | error | manifest `protocol` higher than the linker supports |
| `E_PROTOCOL_IN_BEHAVIOR` | error | protocol facts found in `entry.node.ts` (§4) |
| `W_MULTI_CANDIDATE` | warning | a package had multiple providers; reports winner, losers, rewired layers |
| `W_NO_RANGE` | warning | a layer consumes a provided package without any declared range |
| `W_TYPE_DRIFT` | warning | consumer's devDependencies types copy diverges from the **elected winner's** resolved version (the version code actually runs on) |

`esmx validate --json` emits errors AND warnings as structured entries:

```jsonc
{ "diagnostics": [ {
    "code": "E_VERSION",
    "check": "substitution-safety",        // or "intent"
    "module": "base", "package": "vue",
    "found": "3.0.2", "required": "built against 3.4.21 (same major)",
    "message": "...",                       // what / why
    "fix": "..."                            // the declaration edit to make
} ] }
```

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
  the resolver warns (`W_TYPE_DRIFT`) when the local types copy diverges
  from the **elected merge winner's** resolved version — the version the
  code actually runs on, which under a layered merge may differ from the
  nearest provider's. Substitution safety (§7) bounds the skew to the
  same major.

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
| 1 | Declaration reader (`package.json esmx`) + JSON Schema + merge resolver + errors; lower to internal `ModuleConfig` | core — the one new subsystem |
| 2 | Thread entry identifiers through configuration (removes the hard-codes in `render-context.ts`, `app.ts`, and `createDefaultExports`) | core, small, mandatory |
| 3 | Manifest fields (`protocol`, `version`, `provides` resolved versions, `uses`, per-chunk provenance) | 3 manifest plugins, small each |
| 4 | Loser-copy suppression in composition (`import-map.ts` scopes/SRI + `commit()` preload/files) + transitive auto-mount walk in link resolution | core, medium — the two pieces the "zero adapter changes" framing did not cover |
| 5 | `esmx validate --json` (build-free dry-run of phases 1–3 with full error output) + `esmx sync`: derived `exports`/types + derived workspace `paths`; pack staging rewrite | new, isolated — the agent verification loop |
| 6 | Codemod (`pkg:`/`root:`/`imports` → declarations; consumer import sites to logical names) + migrate all examples incl. the 16-module hub + **rewrite `llms.md` against this RFC in lockstep** (it currently teaches the deleted syntax and would train agents on removed APIs the day this ships) | examples + docs + tool |
| 7 | `Esmx.reinit()` generational relink | core |

Bundler adapters need **zero externalization-logic changes**
(review-verified twice): the predicates already take a static set and
decide per-request; the merge only changes how that set is populated,
inside `@esmx/core`. The adapters' manifest plugins do gain the Phase 3
field emission (additive output, no logic).

v1 resolution is **static**: a dev-mode change to ANY closure member's
`provides` can flip a merge winner and rewire other modules, so it
requires a consumer dev-server restart (documented; cross-compiler
watch invalidation across three dev paths is future work).

### Acceptance gates (must pass before release)

1. **Multi-version fixture**: 3 consumers where 2 share a provided
   package and 1 bundles its own copy, through the full client map
   pipeline (`fixImportMapNestedScopes` → `compressImportMap` →
   `addCodeSplitChunkScopes`) — own-copy isolation creates the
   multi-version case the compression heuristic guards against. Assert:
   the merge winner is globally promoted, the own copy stays scoped.
2. **Layered-merge fixture** (Gate 3, the hub, is a star topology and
   would pass without ever exercising a merge — hence this dedicated
   fixture): `base` provides vue@3.4, `vue-base` uses base and provides
   vue@3.5, `app` uses vue-base. Assert: vue-base's copy wins; base's
   own internal chunks run on vue-base's instance; base's losing chunk
   is absent from client scopes/SRI/preload/files **and from the server
   import map** (SSR resolves a single in-process instance — the
   stateful-duplication failure no visual gate would catch); a
   cross-major variant fails with the substitution-safety `E_VERSION`.
   Run on both rspack **and a code-splitting bundler (vite/rsbuild)** —
   chunk-set-valued provenance is only exercised under splitting.
3. **Hub migration green**: the 16-module hub fully migrated to the new
   protocol, smoke + visual CI passing. It is the realistic stress test.
4. **Semantics tests**: merge-chain order (incl. a diamond), per-layer
   `E_VERSION`/warning guidance quality, own-copy scope isolation,
   version-drift warnings, and the type-only-import invariant (a
   consumer with only `import type` from a provided package produces no
   wiring).
5. **Agent one-shot test** (machine-judged, falsifiable): at least two
   current frontier models, given only the JSON Schema + the rewritten
   `llms.md`, each run 10 trials per role (provider / consumer+provider
   / composer). Pass bar: ≥9/10 trials per role produce a declaration
   that `esmx validate --json` accepts on the first attempt; for every
   code in the diagnostic taxonomy, an induced failure is repaired from
   the structured message alone within one follow-up in ≥8/10 trials.
   The judge is `esmx validate --json` exit status, never human reading.

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
| resolution.json "not a lockfile" misleading | Architecture review | **Resolved by removal** (round 2): the artifact was a lockfile-era residue and is gone entirely — see the round-2 row below (§1, §7) |
| Range-vs-range semver ill-defined; private workspace versions are placeholders | TS review | **Adopted**: resolved-version transcription; no semver gate for private workspace modules (§4.1) |
| pnpm realpath asymmetry client vs server | TS review | **Adopted** (§6) |
| Logical rename is a breaking codemod, not a config flip (~30 sites) | TS review | **Accepted** under P5; no passthrough (§4.2) |
| Multi-version scopes fight `compressImportMap` heuristic | Bundler review | **Gate 1** (§10); narrowed to own-copy isolation after the arbitration field was removed |
| Dev-watch staleness of auto-wiring | Bundler review | **Scoped out of v1**, documented (§10) |
| `exports` encapsulation vs raw dist mount | TS review | **Documented as intentional** (§6) |
| Pack-time package.json rewrite reliability | TS review | **Adopted**: staging dir + publint-class validation (§8) |
| Specifier-level `uses` map duplicates facts that already exist (source imports declare needs; `dependencies` declares ranges) | Maintainer | **Adopted**: `uses` reduced to a module-name array referencing the mount table; the external-dependency graph is generated by lookup (lexed specifiers × used modules' supply), never hand-declared (§4.1, §7) |
| Overlapping supply in layered base chains (base and vue-base both provide vue) is the normal case, not an error — merge semantics needed | Maintainer | **Adopted**: `E_MULTIPLE_PROVIDERS` replaced by deterministic merge with whole-closure rewiring and per-layer version validation — MF's runtime share-scope negotiation solved statically at link time (§4.1, §7) |
| "Lexed from my source" framing is wrong — all three adapters externalize via a per-request predicate over a static set; a source pre-pass is neither needed nor sustainable; the predicate is request-keyed (transitive node_modules imports also externalize) | Bundler + resolution re-reviews (blocking) | **Adopted**: §4/§7 rewritten — static supply table, lazy per-specifier lookup, bundler owns lexing; request-keyed behavior documented as intentional; `import type` invariant added (§4, Gate 4) |
| "Nearer chain layer" precedence is not total under diamond topologies; three-level precedence + array order is fragile | Resolution re-review (blocking) + governance review | **Resolved by maintainer's recursive-merge framing**: `supply(M) = merge(...uses.map(supply), M.provides)` — one total definition; self-last and nearer-wins become emergent, diamonds resolve by subtree order; order documented as load-bearing, multi-candidate merges printed in build log (§4.1, §7) |
| Loser-chunk suppression (scopes/SRI/preload/files) is net-new composition work and needs a manifest per-chunk provenance field | Bundler re-review (blocking) | **Adopted**: §5 provenance field, §7 explicit suppression, Phase 4 (§10) |
| Transitive `uses` not backed by today's flat `getLinks` | Bundler re-review (blocking) | **Adopted**: transitive auto-mount walk specified (§6), Phase 4 (§10) |
| Range satisfaction ≠ substitution safety: a losing provider's chunks were built against a specific version | Resolution re-review + governance review | **Adopted**: two-part validation — intent (range) + substitution safety (built-against compatibility, same-major minimum) (§7) |
| Layers consuming a provided package without declaring a range; `peerDependencies` ignored | Resolution re-review | **Adopted**: range source is `dependencies ∪ peerDependencies`; absent range → warning (§4.1, §7) |
| `provides` needs an authorization model (`sealed`) against silent supply takeover | Governance review (blocking) | **Rejected by maintainer**: governance is an organizational concern, not a protocol concern — compositions are explicit, declarations are reviewable in PRs, and orgs enforce policy in CI/lint; baking authorization into the protocol invites who-can-seal spirals. The protocol's contribution is visibility: every multi-candidate merge is printed in build output |
| `esmx.resolution.json` should be committed/CI-gated | Governance + agent reviews | **Rejected by maintainer, artifact removed entirely**: the dist import map IS the resolution result; a second artifact restating it was a lockfile-era residue. Diagnostics live in `esmx validate` and build logs (§1, §7) |
| Silent merge-winner flips (array reorder, added provides) invisible to agents and reviewers | Agent + governance reviews (blocking) | **Partially adopted**: build log prints every multi-candidate merge; `esmx validate --json` gives agents a build-free check; order semantics documented as load-bearing. Committed-artifact gating rejected (see above) — orgs that want PR-time gating can diff `esmx validate` output in CI |
| No JSON Schema, no build-free validate, stale `llms.md` — agent verification loop missing | Agent review (blocking) | **Adopted**: JSON Schema ships with Phase 1, `esmx validate --json` is Phase 5, `llms.md` lockstep rewrite is Phase 6, agent one-shot test is Gate 5 (§10) |
| Election has zero in-repo instances; hub is a star and would pass gates without exercising a merge | Governance review (blocking) | **Adopted**: layered-merge fixture added as Gate 2 (§10) |
| Final round (4 reviewers, all APPROVE-WITH-MINOR-EDITS, zero rejects): cycle back-edge undefined (`E_CYCLE`); unnamed error codes; server import map missed as suppression site; chunk-set provenance under code splitting; entry hard-code inventory incomplete (`app.ts`, `createDefaultExports`); "zero adapter changes" overstated vs manifest-plugin emission; Gate 5 unfalsifiable without a numeric bar; `validate --json` schema unspecified; warnings must be structured (`W_*`) or the silent-flip case is human-visible but not agent-detectable; drift warning ambiguous under multi-layer merge | Final review round | **All adopted** in this revision: `E_CYCLE`/`E_PROTOCOL`/`E_PROTOCOL_IN_BEHAVIOR` added, full diagnostic taxonomy table + `--json` envelope specified (§7), server-map suppression + chunk-set provenance (§5, §7, Gate 2), hard-code inventory corrected (§5, Phase 2), wording fixed (§10), Gate 5 quantified with machine judge (§10), `W_TYPE_DRIFT` re-anchored to the elected winner (§8) |

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

# RFC 0001: Esmx Module Protocol v2

| | |
|---|---|
| **Status** | Accepted — implemented. Phases 1–7 done (declaration subsystem, `esmx validate`, entry-identifier threading, manifest fields, single-owner enforcement incl. server map, source-resolution TS integration, `reinit()`). **Gate 2** met — the SSR smoke run asserts single-owner chunk-graph + cross-major isolation end-to-end across all three real bundlers (`scripts/smoke.mjs`). **Gate 5** met — the agent one-shot harness (`scripts/gate5.mjs`, `pnpm gate5`) judges authoring + repair by `esmx validate --json` exit status; a real frontier model (kimi) scored authoring 30/30 across the three roles and repair 49/50 across the five declaration-repairable codes, clearing the ≥9/10 and ≥8/10 bars (corroborating with a second frontier model is the remaining strengthening step). `validate` runs resolution phases 1–2 and guarantees *resolution validity*, not *buildability* — see §8/§10. |
| **Date** | 2026-06-15 |
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
- **P2 Locally valid, globally resolved.** A module's declaration is
  written knowing only facts about itself, and is *valid* in isolation
  (the schema and a module's own `entry`/`exports`/`provides` need no
  sibling knowledge). Ownership is a **purely local fact**: a `(package,
  major)` is owned by exactly the one module that lists it in `provides`,
  and that fact is greppable in a single `package.json` — no array order,
  no winner-election, no closure-wide view needed to author it correctly.
  The only thing that is globally resolved is *consistency*: whether two
  modules in a closure claim ownership of the same `(package, major)` —
  a duplicate that the resolver rejects with `E_DUP_PROVIDER` (§7). An
  agent can author a single module's declaration correctly without any
  closure view; a conflict, if one exists, is reported by `esmx validate`
  with both owners named.
- **P3 Build-time determinism.** Same declarations → same wiring,
  always. Every failure is a build-time error with
  what/why/fix. No runtime negotiation, no silent fallback.
- **P4 Static declarations.** Protocol facts must be readable without
  executing code. Behavior (dev server, build hooks) stays in code;
  facts live in JSON.
- **P5 Correctness over compatibility.** This is a breaking release.
  No dual syntax, no deprecation coexistence. Migration from legacy is a
  mechanical rewrite (codemod-able), not a shipped command — there are no
  legacy users pre-release.

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
dependencies is also externalized onto the owner's copy. That is
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
  - **Single owner per `(package, major)`.** Each shared package, at each
    major version, has exactly **one provider (owner)** in a composition
    closure: the one module whose `provides` lists it. The closure's
    supply table is the union of every reachable module's `provides`;
    `uses` array order is **not** load-bearing — it only determines which
    modules are reachable, never who wins, because there is no election.
    If two distinct modules in the same closure provide the same
    `(package, major)`, that is a **hard error** `E_DUP_PROVIDER` (§7):

    > a shared dependency must have a single owner; consolidate into one
    > shared module, or give one copy a distinct package identity via npm
    > alias for intentional same-major coexistence.

    There is no recursive merge, no later-wins precedence, no
    winner/loser distinction: a layered base chain either supplies a
    package from exactly one layer (fine) or duplicates it (error the
    author resolves by deleting one `provides` entry or aliasing).

There is deliberately **no arbitration field** (no `resolutions`, no
`singleton`/`optional` flags) and **no specifier-level needs map**.
Module Federation needs arbitration because its sharing is negotiated at
runtime; esmx composition is static and declared: every wiring decision
is derived from the single owner of each `(package, major)`, and the
remaining failure modes are architecture errors whose fixes live in
declarations that already exist. Because each `(package, major)` has
exactly one owner and the whole closure is wired to it (§7),
single-instance sharing is an inherent property of the model, not a
flag. Multi-instance coexistence happens only when a module bundles its
own copy — today's natural, scope-isolated behavior.

**Cross-major coexistence is retained and free.** Ownership is keyed by
`(package, major)` (§7), so different majors coexist as isolated islands,
each with its own single owner (the hub's vue2/vue3) — reported by
`W_MULTI_MAJOR` (informational). What is *rejected* is two owners of the
**same** `(package, major)`.

**Deliberate same-major coexistence is an architecture act, not an
override.** When two copies of the *same* major must coexist (e.g. a
module pinned to vue@3.4 while another supplies 3.5), the intended copy
is given a **distinct package identity** — an npm alias provided under
its own name (`"vue34": "npm:vue@3.4"` → `provides: ["vue34"]`), exactly
the mechanism the hub already uses for `vue2`. Consumers address the copy
they want by its name (`import 'vue34'` vs `import 'vue'`); distinct names
are distinct ownership keys, so each has its own single owner and neither
collides. A load-bearing precision: **splitting into separate module
services is not sufficient on its own** — two modules that both provide
the bare `vue` at major 3 are an `E_DUP_PROVIDER`, because the ownership
key is the package name, not the providing module. The distinct identity
(the alias), not the service split, is what separates them.

There is therefore **no winner-override or own-copy opt-out field**, and
none is needed: forced same-major coexistence is resolved by giving the
copy its own identity in a declaration, which stays reviewable and local.
The single case with no in-protocol expression is a module the composer
**does not control** (a third-party published artifact whose source
imports the bare name) that must be pinned to a non-owning same-major
copy — out of scope (§12); the fix is to align versions or vendor the
module, never a runtime arbitration flag.

### 4.2 What is deleted

`pkg:` / `root:` prefixes, hand-written `imports`, public `ModuleConfig`
(it becomes an internal IR), `modules` in `entry.node.ts`, and the
implicit "public name == source path" convention. Existing consumer
import sites (`'shared/src/index'` → `'shared/ui'`) are a mechanical
rewrite (codemod-able, no shipped command); there is no `./src/*`
passthrough.

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

`provides[pkg]` is **version-only** — the resolved installed version of
each provided package, captured at build time. There is no per-chunk
provenance: under single-owner there are no losing copies to suppress, so
the manifest never needs to associate a provided package with the
specific chunk file(s) carrying it. (An earlier draft carried
chunk-set-valued provenance to drive loser-copy suppression; that
subsystem is deleted — see §7.)

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

New convention: **any module resolvable through `node_modules` auto-mounts
at `node_modules/<name>/dist`** — registry installs and workspace siblings
alike (pnpm `workspace:*` symlinks are followed and realpath'd, so a
monorepo sibling needs nothing beyond a normal dependency entry). Explicit
`links` remains **only** for artifact directories that are not
npm-resolvable: deploy paths, `@esmx/fetch` output and similar
out-of-tree drops. `links` is an environment fact, not
a protocol fact, so it is the one `modules` key still permitted in
`entry.node.ts`: `E_PROTOCOL_IN_BEHAVIOR` (§4) carves out
`modules.links` explicitly and fires only when `entry.node.ts` carries
protocol fields (`lib`/`imports`/`exports`). The
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
                                      with P3). HARD-STOP: a cyclic walk
                                      produces an order-dependent supply
                                      (reachability depends on which
                                      member is entered first), so
                                      resolution WITHHOLDS the supply table
                                      entirely and emits only the E_CYCLE
                                      error — never an arbitrary-but-usable
                                      artifact alongside the error. The
                                      same code applies to the §6
                                      transitive mount walk

phase 2 — supply table (single owner per (package, major)):
  the closure's supply table is the UNION of every reachable module's
  provides; each entry P is grouped by the MAJOR of its resolved provided
  version (unresolvable version → its own 'unknown' group)
  → exactly one OWNER per (package P, major) group; uses array order is
    NOT load-bearing — it only fixes reachability, never ownership
  → two distinct modules providing the same (P, major) → E_DUP_PROVIDER
    (names both owners): "a shared dependency must have a single owner;
    consolidate into one shared module, or give one copy a distinct
    package identity via npm alias for intentional same-major
    coexistence"
  → coexisting majors are isolated islands (W_MULTI_MAJOR, informational)

  wire     = EVERY consuming layer's P points at that group's single
             owner. Bundler outputs are untouched (chunks import the bare
             name; the composer's map decides the target); there are no
             losing copies, so there is NOTHING to suppress on either map
             path. Both the client pipeline (scopes, SRI, modulepreload,
             file list) and the server import map carry exactly the one
             owner's copy.
  validate = ONE check, build-time:
             intent — the owner's resolved version satisfies each
             consuming layer's dependencies ∪ peerDependencies range for
             P; a layer with no declared range gets a warning (W_NO_RANGE).
             → E_VERSION naming the layer on mismatch.
             A layer never silently "falls back" to its own copy — that
             would split instances.

per-major key (governance review R4 foresaw it; the flagship hub's
vue2 + vue3 coexistence is the in-repo counterexample): **ownership is
keyed by (package, major)** because semver majors are effectively
different packages. E_DUP_PROVIDER, the intent check, and W_MULTI_MAJOR
all operate strictly WITHIN a group — cross-major collisions never happen
because cross-major ownership keys are distinct. Consumer-side wiring is
deterministic and local: for a package with owners at multiple majors,
each module M wires to the group whose owner satisfies M's own
dependencies ∪ peerDependencies range (a module that itself provides the
package wires to its own group — instance consistency); no range →
highest major group plus the existing W_NO_RANGE; multiple satisfying
groups → highest satisfying major; none satisfying → E_VERSION (intent).
The intent check likewise validates each layer against the group it would
wire to, never an unrelated major.

phase 3 — wiring (per specifier the bundler resolves, lazily):
  module-export form ("shared/ui"):
    exporter ∉ my uses chain        → E_NOT_USED
    export absent from declaration  → E_NO_EXPORT (lists actual exports)
    else                            → externalize, wire to identifier
  bare package ("vue"):
    in supply table                 → externalize, wire to the owner
    not in table                    → bundle own copy (scope-isolated)

all failures are build-time; every error carries what / why / fix —
and every fix is an edit to an existing declaration, never a new concept
```

Single owner is the link-time, deterministic analogue of Module
Federation's runtime share-scope negotiation — same problem, solved
statically and without arbitration: each `(package, major)` has one owner
named in one `provides` array, the whole closure wires to it, and a
duplicate claim is rejected at validate time before anything ships. The
one-sentence rule: **one owner per `(package, major)`; the whole closure
follows it; a second owner is `E_DUP_PROVIDER`.**

Multi-version coexistence needs no resolver vocabulary: modules that
bundle their own copy are isolated by per-module import map scopes
(machinery that exists and already carries the hub's vue2/vue3 split).
Same-major coexistence is expressed by giving the second copy a distinct
package identity (npm alias, §4.1) — a distinct ownership key, not an
override.

There is **no resolution artifact**: the import map emitted into `dist`
IS the resolution result, and declarations alone fully determine it
(P3). Diagnostics — which package each owner provides, any duplicate
claim — belong to tooling (`esmx validate`, build log), not to the
protocol.

**Complete diagnostic taxonomy** (every entry machine-readable — agents
must be able to detect warnings, not just errors; "visible in build
output" means *structured* visibility):

| Code | Kind | Meaning |
|---|---|---|
| `E_NOT_LINKED` | error | used module absent from the mount table |
| `E_NOT_BUILT` | error | mounted but no artifact. Scoped error: it fails only the manifest-dependent checks (resolved versions, intent) while declaration-level wiring proceeds — so a cold workspace can still resolve, and the fix ("build these first") is unambiguous |
| `E_CYCLE` | error | `uses` chain (or mount walk) revisits a module; hard-stops resolution (supply withheld) so no order-dependent wiring is emitted |
| `E_DUP_PROVIDER` | error | two distinct modules own the same (package, major); names both owners. Fix: consolidate into one shared module, or give one copy a distinct package identity via npm alias for intentional same-major coexistence (§4.1) |
| `E_VERSION` | error | intent violation — the owner's resolved version does not satisfy a consuming layer's `dependencies` ∪ `peerDependencies` range; names the layer |
| `E_TARGET_MISSING` | error | a declared `entry`/`exports` target file does not exist on disk; **root-module check** (mounted deps ship `dist`, not `src`, so only the root's declared targets are verified). Emitted by `esmx validate` |
| `E_NOT_USED` | error | module-export import from a module outside the uses chain. **Build-time / bundler-emitted** — a phase-3 wiring fact, NOT emitted by build-free `esmx validate` (validate never lexes source) |
| `E_NO_EXPORT` | error | export absent; lists the module's actual exports. **Build-time / bundler-emitted** — a phase-3 wiring fact, NOT emitted by build-free `esmx validate` |
| `E_PROTOCOL` | error | manifest `protocol` higher than the linker supports |
| `E_PROTOCOL_IN_BEHAVIOR` | error | protocol facts found in `entry.node.ts` (§4) |
| `E_SCHEMA` | error | the `esmx` declaration is structurally invalid (wrong type, unknown key, non-`./` path); the most common authoring error |
| `W_MULTI_MAJOR` | warning | a package has coexisting major-version groups; reports each group's owner — informational visibility, cross-major collision is structurally impossible |
| `W_NO_RANGE` | warning | a layer consumes a provided package without any declared range |
| `W_TYPE_DRIFT` | warning | consumer's devDependencies types copy diverges from the **owner's** resolved version (the version code actually runs on) |

`esmx validate --json` emits a three-key envelope: `diagnostics` (errors
AND warnings as structured entries), `supply` (the per-major owner table)
and `mounts` (the resolved mount table):

```jsonc
{
  "diagnostics": [ {
    "code": "E_VERSION",
    "check": "intent",                      // present on E_VERSION
    "module": "base", "package": "vue",
    "found": "3.0.2", "required": "^3.4.0",
    "message": "...",                       // what / why
    "fix": "..."                            // the declaration edit to make
  } ],
  "supply": {                               // bare package → per-major owners
    "vue": { "groups": [
      { "major": 3, "provider": "ssr-vue-host", "version": "3.5.13" }
    ] }
  },
  "mounts": {                               // module name → mounted artifact
    "ssr-vue-host": {
      "name": "ssr-vue-host",
      "root": "/abs/path/to/ssr-vue-host",
      "artifactDir": "/abs/path/to/ssr-vue-host/dist",
      "built": true
    }
  }
}
```

A package without an `esmx` field instead emits the legacy sentinel
`{ "protocol": "legacy", "diagnostics": [] }`.

**Coverage boundary — what `esmx validate` does and does NOT guarantee.**
`validate` is a build-free dry-run of resolution **phases 1–2** (mount
walk, transitive `uses`, version checks, supply table, single-owner /
`E_DUP_PROVIDER` enforcement). It therefore guarantees **resolution
validity**, not **buildability**:

- It does NOT emit the **phase-3** codes `E_NOT_USED` / `E_NO_EXPORT` —
  those are per-specifier wiring facts the **bundler** discovers lazily
  during its traversal (§4 implementation note); `validate` never lexes
  source, so they surface at build time, not in `validate`. The taxonomy
  lists them as build-time / bundler-emitted errors; an agent must not
  assume a green `validate` has ruled them out.
- It validates the `esmx` field's **shape** (`E_SCHEMA`) **and** now
  checks that the **root module's** declared `entry`/`exports` **target
  files exist** on disk (`E_TARGET_MISSING`) — a typo'd path in the root
  declaration is caught build-free. This is root-only: mounted deps ship
  `dist` (not `src`), so only the root's declared targets are verified.
- It reads **only** the `esmx` field. The standard `exports` wildcard and
  the framework-boundary `.d.ts` contracts (§8) are an adjacent surface
  `validate` does not see; keeping them consistent is a `tsc`/publish
  concern, not part of this loop.

The honest agent loop is therefore `esmx validate` **then** a build /
`tsc` pass — `validate` is the fast, sound first gate, not the whole
oracle. Gate 5 (§10) is judged on `validate --json` exit status and is
scoped accordingly.

## 8. TypeScript integration

The workspace type story is **source resolution through the standard
`exports` field** — no generated `.d.ts` on the dev path, no `esmx sync`,
no derived `tsconfig.esmx.json` (all removed; the standard field is the
single source of truth that npm, the bundler, the IDE, and the linker all
already read):

- **Workspace dev = source, via one uniform wildcard.** Every module's
  standard `package.json` `exports` is the **identical single block**
  `"./*": { "types": "./src/*.d.ts", "default": "./src/*.ts" }` — no
  per-export entries, byte-for-byte the same in all modules. The
  `types`/`default` asymmetry is load-bearing and relies on TypeScript's
  **condition fallback**: resolving `pkg/foo`, the resolver first tries
  the `types` condition (`./src/foo.d.ts`); if that file is absent it
  falls back to `default` (`./src/foo.ts`, the real source). So a plain-TS
  module — which ships no `.d.ts` — resolves every subpath to live source
  and gets real types with **no build and no per-consumer config** beyond
  `moduleResolution: "bundler"`. Adding a source file needs no declaration
  edit. (Verified under both `bundler` and `node16` resolution: the
  `types`-miss-then-`default`-fallback is reliable, and a deliberate
  signature mismatch errors — types genuinely flow, not silently `any`.)
- **Cross-framework boundaries ship a co-located neutral `.d.ts` — no
  exports entry.** Compiler physics: a plain `tsc` consumer cannot read a
  JSX provider's source (one program cannot host react `jsx:react-jsx` +
  solid `jsx:preserve`, and the global `JSX` namespace collides across
  react/preact). So a JSX provider commits a framework-neutral contract
  **`src/routes.d.ts`** (`export declare const routes: RouteConfig[]`)
  next to `src/routes.ts`. The uniform wildcard then does the rest with
  **zero special-casing in `package.json`**: its `types` condition picks
  up `src/routes.d.ts` when present (JSX source never loaded by the
  consumer), and falls back to source for every module that ships no such
  file. Pure-TS / Vue / htm providers need nothing extra. (An ambient
  `declare module '*.tsx'` does **not** work — `.tsx` is a TS-native
  extension that always resolves to and parses the real file; ambient
  module wildcards only catch specifiers that don't otherwise resolve.)
  One workspace-wide ambient (`declare module '*.vue'/'*.svelte'` → `any`)
  lets a consumer read a Vue/Svelte provider's source, treating the SFC as
  an opaque value at the type-erased federation boundary.
- **Publish = compiled.** A pack step rewrites the uniform `exports`
  `types`/`default` from `./src/*.d.ts` / `./src/*.ts` to
  `./dist/types/*.d.ts` / `./dist/*.mjs`
  (compiler physics: `allowImportingTsExtensions` forbids declaration
  emit, and a published `default` pointing at `.ts` breaks every
  non-bundler consumer). The rewrite happens in a staging dir, never
  mutating the source `package.json`. **The load-bearing check is a
  bespoke guard that fails if any published `default` still points at
  `.ts`/`./src`** — `publint`/`arethetypeswrong` are run too but, verified
  empirically, both are largely **blind to a `./*` wildcard**: attw
  reports "(wildcard)" and finds no problem even when `default` points
  straight at `.ts`, and publint passes the same. (publint *does* catch
  one thing they share: `types`-condition mis-ordering.) So the custom
  guard is not belt-and-suspenders — it is the belt; it must be a hard,
  tested gate. Two further publish-time checks are warranted: (i)
  regenerate each module's compiled `.d.ts` (per-framework — `vue-tsc`
  for Vue, `tsc` for the rest) and **fail if it disagrees with the
  committed `src/routes.d.ts` contract** (the dev path shadows the `.ts`
  with the `.d.ts`, so contract⇄implementation drift is otherwise a
  clean-compile / runtime-explosion); (ii) a lint forbidding stray
  `.d.ts` files that are not registered framework-boundary contracts (a
  stray `.d.ts` silently shadows correct source). All publish-time, off
  the dev hot path.
- **Consumers set `moduleResolution: "bundler"`.** That is the entire
  consumer-side configuration.
- **Env-forked exports** map to standard `exports` conditions
  (`browser`/`node`). Genuinely divergent signatures may use
  `customConditions` per-target tsconfigs.
- **`provides` types** resolve via the consumer's own devDependencies;
  the resolver warns (`W_TYPE_DRIFT`) when the local types copy diverges
  from the **owner's** resolved version — the version the code actually
  runs on. With a single owner per `(package, major)` there is no longer
  any merge-winner ambiguity: the version the closure runs on is exactly
  the one owner's resolved version.

**Type-visibility rule:** types resolve for any module visible to Node
resolution (`node_modules`, whether workspace-linked or installed from
registry/tgz). Arbitrary-path mounts (deploy dirs, raw fetch output) are
a runtime-only capability and are **typeless by design** — install the
tgz if you want types. This is a stated trade-off, not a gap.

| Consumption topology | Types | Condition |
|---|---|---|
| npm/tgz install | ✅ native | none |
| workspace sibling | ✅ | one uniform `exports` wildcard (`types→src/*.d.ts`, `default→src/*.ts`); `types`-condition falls back to source when no `.d.ts`, picks up a provider's co-located neutral `.d.ts` at framework boundaries |
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
| 3 | Manifest fields (`protocol`, `version`, `provides` resolved versions — version-only, `uses`) | 3 manifest plugins, small each |
| 4 | Single-owner / `E_DUP_PROVIDER` enforcement in composition (`import-map.ts` scopes/SRI + `commit()` preload/files carry the one owner's copy) + transitive auto-mount walk in link resolution | core, medium — the two pieces the "zero adapter changes" framing did not cover |
| 5 | `esmx validate --json` (build-free dry-run of phases 1–3 with full error output). Workspace types resolve from source via the standard `exports` field (no `esmx sync`, no derived `tsconfig.esmx.json` — superseded by §8 source resolution); compiled-type emit + the `exports` src→dist pack rewrite are publish-time work | new, isolated — the agent verification loop |
| 6 | Author all examples (incl. the 16-module hub) directly on v2 declarations + **rewrite `llms.md` against this RFC in lockstep** (it currently teaches the deleted syntax and would train agents on removed APIs the day this ships). Legacy→v2 migration is a mechanical rewrite (codemod-able) but ships no command — pre-release there are no legacy configs to convert | examples + docs |
| 7 | `Esmx.reinit()` generational relink | core |

Bundler adapters need **zero externalization-logic changes**
(review-verified twice): the predicates already take a static set and
decide per-request; the merge only changes how that set is populated,
inside `@esmx/core`. The adapters' manifest plugins do gain the Phase 3
field emission (additive output, no logic).

v1 resolution is **static**: a dev-mode change to ANY closure member's
`provides` can change the supply table (add/remove an owner, or introduce
an `E_DUP_PROVIDER`), so it requires a consumer dev-server restart
(documented; cross-compiler watch invalidation across three dev paths is
future work).

### Acceptance gates (must pass before release)

1. **Single-owner sharing fixture**: 3 consumers where 2 share a
   provided package (one owner) and 1 bundles its own copy, through the
   full client map pipeline (`fixImportMapNestedScopes` →
   `compressImportMap` → `addCodeSplitChunkScopes`) — own-copy isolation
   creates the multi-version case the compression heuristic guards
   against. Assert: the single owner is globally promoted and both
   sharers wire to it, the own copy stays scoped.
2. **Single-owner enforcement + cross-major fixture** (Gate 3, the hub,
   is a star topology and would pass without ever exercising the
   enforcement — hence this dedicated fixture): `base` provides vue@3.4
   and `vue-base` uses base; assert (a) when `vue-base` ALSO provides
   vue@3.5 the closure fails with `E_DUP_PROVIDER` naming both owners;
   (b) when only `base` provides vue, the whole chain (`app` → `vue-base`
   → `base`) wires to base's single copy on **both** the client map
   (scopes/SRI/preload/files) **and the server import map** (SSR resolves
   a single in-process instance — the stateful-duplication failure no
   visual gate would catch); (c) a cross-major variant (`base` provides
   vue@2, another module provides vue@3 under a distinct alias identity)
   coexists as isolated islands with `W_MULTI_MAJOR` and no error.
   Run on both rspack **and a code-splitting bundler (vite/rsbuild)** to
   confirm the single owner's copy spans chunks correctly under splitting.
3. **Hub green**: the 16-module hub fully authored on the new
   protocol, smoke + visual CI passing. It is the realistic stress test.
4. **Semantics tests**: single-owner resolution across a transitive
   chain (incl. a diamond — two paths reaching one owner resolve to that
   same owner, not a duplicate), `E_DUP_PROVIDER` on a same-major
   double-claim, per-layer `E_VERSION`/warning guidance quality,
   own-copy scope isolation, version-drift warnings, and the
   type-only-import invariant (a consumer with only `import type` from a
   provided package produces no wiring).
5. **Agent one-shot test** (machine-judged, falsifiable): at least two
   current frontier models, given only the JSON Schema + the rewritten
   `llms.md`, each run 10 trials per role (provider / consumer+provider
   / composer). Pass bar: ≥9/10 trials per role produce a declaration
   that `esmx validate --json` accepts on the first attempt; for every
   **validate-emitted** code in the diagnostic taxonomy, an induced
   failure is repaired from the structured message alone within one
   follow-up in ≥8/10 trials. The build-time / bundler-emitted codes
   `E_NOT_USED` / `E_NO_EXPORT` are judged at the build/`tsc` pass, not
   by the validate oracle, so they sit outside this `validate --json`
   bar. The judge is `esmx validate --json` exit status, never human
   reading.

## 11. Expert review record

Three independent reviews, each grounded in the source. Dispositions:

| Finding | Source | Disposition |
|---|---|---|
| `types` → `.ts` collides with `allowImportingTsExtensions`/emit; dev `default` → `.ts` breaks Node | TS review (blocking) | **Adopted, then refined**: original answer was always-generated `.d.ts` + `esmx sync`-derived workspace paths; superseded by §8 **source resolution through standard `exports`** (dev `types`/`default` → `./src` under `moduleResolution: bundler`; pack rewrites to `./dist/types` for publish so non-bundler consumers never see `.ts`). Kills `esmx sync` and the dev-path `.d.ts` build-ordering footgun |
| Resolution must read declarations, not emitted manifests (cold-start deadlock) | Bundler review (blocking) | **Adopted** (§7) |
| `src/entry.client` hard-codes break under logical names | Bundler review (blocking) | **Adopted, upgraded**: explicit `entry` declaration instead of reserved names (§4.1) |
| `provides` weaker than MF shared (consume-only/singleton/optional) | Architecture review (blocking) | **Adopted, then reversed on maintainer challenge**: an early draft imported MF vocabulary (`singleton`, `optional`, `resolutions`) wholesale — rebuilding the runtime-negotiation model esmx exists to avoid. Final: static composition makes single-instance inherent, consume-only is `uses` by definition, own-copy bundling covers the rest; conflicts are architecture errors fixed in existing declarations (§4.1, §7) |
| Runtime remote update story silent | Architecture review (blocking) | **Decided**: non-goal + generational `reinit()` (§9) |
| "O(deps×consumers)" motivation overstated | Architecture review | **Adopted**: motivation re-anchored (§2) |
| resolution.json "not a lockfile" misleading | Architecture review | **Resolved by removal** (round 2): the artifact was a lockfile-era residue and is gone entirely — see the round-2 row below (§1, §7) |
| Range-vs-range semver ill-defined; private workspace versions are placeholders | TS review | **Adopted**: resolved-version transcription; no semver gate for private workspace modules (§4.1) |
| pnpm realpath asymmetry client vs server | TS review | **Adopted** (§6) |
| Logical rename is a breaking mechanical rewrite, not a config flip (~30 sites) | TS review | **Accepted** under P5; no passthrough (§4.2) |
| Multi-version scopes fight `compressImportMap` heuristic | Bundler review | **Gate 1** (§10); narrowed to own-copy isolation after the arbitration field was removed |
| Dev-watch staleness of auto-wiring | Bundler review | **Scoped out of v1**, documented (§10) |
| `exports` encapsulation vs raw dist mount | TS review | **Documented as intentional** (§6) |
| Pack-time package.json rewrite reliability | TS review | **Adopted**: staging dir + publint-class validation (§8) |
| Specifier-level `uses` map duplicates facts that already exist (source imports declare needs; `dependencies` declares ranges) | Maintainer | **Adopted**: `uses` reduced to a module-name array referencing the mount table; the external-dependency graph is generated by lookup (lexed specifiers × used modules' supply), never hand-declared (§4.1, §7) |
| Overlapping supply in layered base chains (base and vue-base both provide vue) is the normal case, not an error — merge semantics needed | Maintainer | **Adopted, then reversed** — see the single-owner row below (§11). The round-2 answer was a deterministic recursive merge with whole-closure rewiring; that was reversed to **single owner per `(package, major)`** with `E_DUP_PROVIDER` on a duplicate claim. Overlapping same-major supply is now treated as the architecture error it is, not silently merged (§4.1, §7) |
| "Lexed from my source" framing is wrong — all three adapters externalize via a per-request predicate over a static set; a source pre-pass is neither needed nor sustainable; the predicate is request-keyed (transitive node_modules imports also externalize) | Bundler + resolution re-reviews (blocking) | **Adopted**: §4/§7 rewritten — static supply table, lazy per-specifier lookup, bundler owns lexing; request-keyed behavior documented as intentional; `import type` invariant added (§4, Gate 4) |
| "Nearer chain layer" precedence is not total under diamond topologies; three-level precedence + array order is fragile | Resolution re-review (blocking) + governance review | **Resolved, then superseded** — see the single-owner row below. The round-2 fix was a recursive merge (`supply(M) = merge(...uses.map(supply), M.provides)`) with load-bearing array order; the single-owner reversal removes precedence and array-order load-bearing entirely — a diamond now simply resolves to the one owner both paths reach, and a same-major duplicate is `E_DUP_PROVIDER` (§4.1, §7) |
| Loser-chunk suppression (scopes/SRI/preload/files) is net-new composition work and needs a manifest per-chunk provenance field | Bundler re-review (blocking) | **Adopted, then deleted** — see the single-owner row below. With single owner there are no loser copies to suppress, so the suppression subsystem and the per-chunk provenance field are both removed; the manifest `provides[pkg]` is version-only (§5, §7) |
| Transitive `uses` not backed by today's flat `getLinks` | Bundler re-review (blocking) | **Adopted**: transitive auto-mount walk specified (§6), Phase 4 (§10) |
| Range satisfaction ≠ substitution safety: a losing provider's chunks were built against a specific version | Resolution re-review + governance review | **Adopted, then moot** — see the single-owner row below. Substitution safety existed to bound the skew between a winner and the *losers* it displaced; under single owner there are no losers (a same-major duplicate is `E_DUP_PROVIDER`), so the substitution-safety check is deleted and only the intent (range) check remains (§7) |
| Layers consuming a provided package without declaring a range; `peerDependencies` ignored | Resolution re-review | **Adopted**: range source is `dependencies ∪ peerDependencies`; absent range → warning (§4.1, §7) |
| `provides` needs an authorization model (`sealed`) against silent supply takeover | Governance review (blocking) | **Rejected by maintainer**: governance is an organizational concern, not a protocol concern — compositions are explicit, declarations are reviewable in PRs, and orgs enforce policy in CI/lint; baking authorization into the protocol invites who-can-seal spirals. The protocol's contribution is visibility: every multi-candidate merge is printed in build output |
| `esmx.resolution.json` should be committed/CI-gated | Governance + agent reviews | **Rejected by maintainer, artifact removed entirely**: the dist import map IS the resolution result; a second artifact restating it was a lockfile-era residue. Diagnostics live in `esmx validate` and build logs (§1, §7) |
| Silent merge-winner flips (array reorder, added provides) invisible to agents and reviewers | Agent + governance reviews (blocking) | **Resolved by removal** — see the single-owner row below. There is no winner to flip: ownership is a single local `provides` fact, array order is not load-bearing, and a duplicate claim is the hard error `E_DUP_PROVIDER` rather than a silently-resolved merge. `esmx validate --json` still gives agents a build-free check |
| No JSON Schema, no build-free validate, stale `llms.md` — agent verification loop missing | Agent review (blocking) | **Adopted**: JSON Schema ships with Phase 1, `esmx validate --json` is Phase 5, `llms.md` lockstep rewrite is Phase 6, agent one-shot test is Gate 5 (§10) |
| Election has zero in-repo instances; hub is a star and would pass gates without exercising a merge | Governance review (blocking) | **Adopted, recast**: the dedicated fixture became Gate 2, now testing single-owner enforcement (`E_DUP_PROVIDER`) + cross-major coexistence rather than a merge (§10) |
| Same-name multi-major coexistence inexpressible (governance review R4 warned; flagship hub vue2+vue3 is the counterexample) | Final regression | **Adopted**: election keyed by (package, major); cross-major rewiring structurally impossible; consumer wiring selects its satisfying major group (§7) |
| No override / escape hatch for a forced same-major rewire (a module pinned to a non-winning same-major copy); the just-removed directory `scopes` was one such lever | Strategic / AI-era review | **Rejected — resolved by architecture (§4.1)**: same-major coexistence is expressed by giving the copy a distinct package identity (an npm alias provided under its own name, as the hub's `vue2` already does), not by a runtime override; the module-service split alone is insufficient because election keys by `(package, major)`. The only residual — a composer-uncontrolled third-party artifact needing a non-winning same-major pin — is a non-goal (§12; align versions or vendor it). Adding a winner-override/`resolutions`/`singleton` field would reintroduce exactly the arbitration vocabulary §4.1 deletes, for a case first-party monorepos express in declarations |
| **Recursive merge / election has no single owner — a shared-dep bugfix has no clear package to republish; and array-order winners are non-local, un-authorable by an agent** | Strategic / AI-era review (blocking) | **Adopted — full reversal to single owner per `(package, major)`**: the earlier rounds' deterministic recursive merge (elected winner by `uses` array order, with whole-closure rewiring, loser-copy suppression, substitution-safety, `W_MULTI_CANDIDATE`, per-chunk provenance) is **deleted**. Motivation: under election the shared copy had no single owner, so a vue bugfix had no clear package to rebuild/republish; and the winner was a non-local fact (array order across the closure) that an agent could not author or verify from one declaration. Single owner makes the owner an explicit, **greppable** fact — one package's `provides` — so you always know what to rebuild, and the only consistency question (is there a duplicate?) is a sound, build-free `E_DUP_PROVIDER` check `esmx validate` answers locally. Cross-major coexistence, `W_MULTI_MAJOR`, the intent (range) `E_VERSION` check, `E_CYCLE`, `E_NOT_LINKED`, `E_NOT_BUILT`, `W_NO_RANGE`, `W_TYPE_DRIFT`, and all declaration fields are unchanged (§3 P2, §4.1, §5, §7, §10, §12) |
| Final round (4 reviewers, all APPROVE-WITH-MINOR-EDITS, zero rejects): cycle back-edge undefined (`E_CYCLE`); unnamed error codes; server import map missed as suppression site; chunk-set provenance under code splitting; entry hard-code inventory incomplete (`app.ts`, `createDefaultExports`); "zero adapter changes" overstated vs manifest-plugin emission; Gate 5 unfalsifiable without a numeric bar; `validate --json` schema unspecified; warnings must be structured (`W_*`) or the silent-flip case is human-visible but not agent-detectable; drift warning ambiguous under multi-layer merge | Final review round | **All adopted** in this revision: `E_CYCLE`/`E_PROTOCOL`/`E_PROTOCOL_IN_BEHAVIOR` added, full diagnostic taxonomy table + `--json` envelope specified (§7), the server map carries the one owner's copy on both paths (§7, Gate 2), hard-code inventory corrected (§5, Phase 2), wording fixed (§10), Gate 5 quantified with machine judge (§10), `W_TYPE_DRIFT` re-anchored to the owner (§8). (The suppression / chunk-set-provenance items from this round were later mooted by the single-owner reversal — see the row below) |

## 12. Non-goals / future work

- Live per-module hot swap in the composer process (see §9).
- Pinning a composer-uncontrolled third-party module to a non-owning
  *same-major* copy. No winner-override/arbitration field (§4.1); the fix
  is to align versions or vendor the module. First-party same-major
  coexistence is expressed by distinct package identity (npm alias, §4.1).
- Dev-mode dynamic re-resolution across compilers.
- Cross-module CSS dedup contract; manifest signing / cross-team trust
  chain; shared i18n catalog ownership — production-platform questions
  acknowledged and deferred to follow-up RFCs.
- TS project references as the workspace mechanism (pending
  vue-tsc/composite verification).
- Unifying Vite's runtime export enumeration with the pkg-wrapper static
  lexer path (pre-existing divergence, tracked separately).

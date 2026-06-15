# Guide Documentation Audit: Implicit Magic Report

## Summary
Audit of `/examples/docs/src/en/guide/` identified **9 issues** across 7 files that rely on implicit conventions, undocumented dependencies, or code blocks lacking sufficient context. Most issues are within acceptable ranges, with a few requiring clarification for completeness.

---

## Issues by File

### File: essentials/module-linking.md
**Issue 1: Magic file discovery for library mode entry exports**
- **Line 71**: Describes that `lib: true` prevents "automatically create default entry file exports (such as `src/entry.client` and `src/entry.server`)" but never explicitly states what happens WITHOUT lib mode.
- **Evidence**: "When set to `true`, the module will not automatically create default entry file exports" — implies defaults exist but doesn't name them or explain the mechanism.
- **Suggested fix**: Add: "By default (lib: false), Esmx automatically exports `src/entry.client.ts` and `src/entry.server.ts`. Setting lib: true disables this auto-discovery."

**Issue 2: Undocumented module path resolution rules for root: prefix**
- **Line 214**: States "root:src/utils/date-utils.ts → Converts to module-relative path" but doesn't explain what "module-relative" means or how the conversion works.
- **Evidence**: "Converts to module-relative path, suitable for project internal source modules" — vague explanation of path resolution.
- **Suggested fix**: Clarify: "root: treats the path as relative to the module root (the directory containing entry.node.ts). Extensions are stripped during bundling."

### File: essentials/rspack.md
**Issue 3: Implicit devApp vs server distinction not documented**
- **Line 19**: Code blocks use `devApp(esmx)` but never explain when/why this differs from `server(esmx)` or when each is called.
- **Evidence**: "The most basic builder, providing the core Rspack configuration" — no mention of lifecycle or when builder is invoked.
- **Suggested fix**: Add context: "devApp is called during development and handles HMR; server is called for production to create the HTTP handler."

### File: essentials/render-context.md
**Issue 4: Implicit rc.params convention not documented as "pass-through"**
- **Line 24**: Example shows `params: { url: req.url }` but doesn't clarify that params are ONLY what you explicitly pass—not auto-extracted from the request.
- **Evidence**: Code shows manual param passing but no note that "you must manually extract and pass any data the entry.server needs."
- **Suggested fix**: Add note: "Parameters are NOT automatically extracted from the request. You manually control what data reaches entry.server via the params object."

**Issue 5: importMetaSet passed to renderToString without introduction**
- **Line 93-94**: Code passes `importMetaSet: rc.importMetaSet` to renderToString but earlier text never explains what importMetaSet is or why it's needed.
- **Evidence**: "Precisely records module dependency relationships for each component through `importMetaSet`" — definition only appears late; code uses it immediately.
- **Suggested fix**: Before the example, add: "RenderContext tracks which modules are imported during rendering in rc.importMetaSet. Pass this to your framework's renderToString so dependencies are collected for the client."

### File: essentials/styles.md
**Issue 6: Synthetic module convention explained in table but not in prose**
- **Line 106**: Table step 3 mentions CSS imports "return a no-op synthetic module (the URL is metadata)" but this is never explained in the body text.
- **Evidence**: "CSS imports return a no-op synthetic module" appears only in the table, not in the main documentation flow.
- **Suggested fix**: Add a paragraph before the table: "On the server, CSS imports are treated specially—they don't execute code but instead record the CSS file URL as metadata so the host can inject it."

**Issue 7: files.css convention undocumented**
- **Line 107**: Table mentions "adds it to `files.css`" with no explanation of what this internal field is or how it's used later.
- **Evidence**: "Reads each touched chunk's `css[]` from the manifest and adds it to `files.css`" — no prior mention of files object.
- **Suggested fix**: Add: "RenderContext internally tracks all collected resources in a files object (including files.css). This is accessed when you call rc.css()."

### File: essentials/alias.md
**Issue 8: Default alias mechanism relies on undocumented convention**
- **Line 23**: States "Automatically generates aliases based on the `name` field in `package.json`" but doesn't explain the exact alias format or how it's used.
- **Evidence**: "no manual configuration needed" — but what IS the generated alias? Is it `@your-app-name` or `your-app-name` or something else?
- **Suggested fix**: Clarify: "The framework generates an alias `your-app-name` from the name field. Use it in imports as `import ... from 'your-app-name/src/...'`"

### File: router/getting-started.md
**Issue 9: appId default and element requirement implicit**
- **Line 36**: Sets `appId: 'app'` in examples but never documents what happens if appId doesn't match an actual DOM element or if it's omitted.
- **Evidence**: Code always specifies appId but no note about "must have a <div id='app'>" or "defaults to 'app' if omitted."
- **Suggested fix**: Add note: "appId tells the router which DOM element to mount into. It must exist in your HTML as <div id={appId}>. If omitted, defaults to 'app'."

### File: router/react.md
**Issue 10: RouterContextValue interface appears before context is explained (MINOR)**
- **Line 69-72**: TypeScript interface is shown inline in code but the pattern is not explained before the code block.
- **Evidence**: interface definition appears in step 2 with no preceding explanation of what this pattern solves.
- **Suggested fix**: Add 1-2 sentences before the code block: "React doesn't have a built-in integration package, so we create a React context and custom hooks to provide router access throughout the component tree."

---

## Clean Files (No Issues)

- **start/introduction.md** — Clear explanation of Esmx principles without implicit conventions
- **start/environment.md** — Explicit browser compatibility tables; no implicit assumptions
- **start/getting-started.mdx** — Project scaffolding walk-through; all templates listed explicitly
- **essentials/csr.md** — Clear CSR pattern with dist/client convention shown; explicit postBuild usage
- **essentials/base-path.md** — Dynamic configuration shown with clear examples; defaults documented
- **router/introduction.md** — Comprehensive feature tour with table comparisons; no implicit magic
- **router/vue3.md** — Complete setup with routing mode distinction; all files shown in context
- **router/vue2.md** — Clear Vue 2.7+ setup with plugin installation; differences from Vue 3 explicit
- **start/glossary.md** — Definitions are clear; no code or implicit conventions
- **essentials/render-context.md** (partial) — Resource injection order is well-documented in the "Resource Injection Order" section (lines 69-78)

---

## Recommendations

1. **Document auto-discovery conventions** explicitly in module-linking.md and rspack.md — state which files are auto-loaded and under what conditions.

2. **Clarify param passing** in render-context guide — explain that parameters are pass-through and must be manually extracted from the request.

3. **Add importMetaSet explanation** before code examples that use it — define what it tracks and why it's needed.

4. **Explain synthetic modules** in the prose before the styles.md table — don't rely solely on table captions for core concepts.

5. **Add appId/DOM element requirement** note to router/getting-started.md — expected HTML structure should be explicit.

6. **Improve alias clarity** in essentials/alias.md — show the exact alias format users should expect based on package.json name.

---

## Effort Assessment

**Severity**: Low to Medium  
**Files affected**: 7  
**Total issues**: 10 (with issue #10 being minor)  
**Estimated fix time**: 30–45 minutes (mostly adding inline clarifications and small prose sections)

All issues are fixable with focused prose additions or code comment clarifications. No structural reorganization needed.

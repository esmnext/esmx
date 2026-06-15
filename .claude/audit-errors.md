# E5 — Error Message Audit

Date: 2026-06-12. Scope: `packages/{core,router,router-vue,router-react,rsbuild,rspack,vite,import,class-state}/src/`.
Total error/warning sites surveyed: ~46. **21 GOOD · 8 WEAK · 9 BAD**.

Agent-friendly bar (the user's coding agent must, without leaving the terminal, identify cause + fix):
1. Name the API / config key / file involved
2. State what was wrong AND what was expected
3. Hint at the fix when a common cause exists
4. Stable wording so LLMs can match patterns

## Top 10 worst offenders (fixed this round)

| # | File:line | Old | New |
|---|-----------|-----|-----|
| 1 | core/src/core.ts:635 | bare `console.error(e)` | `console.error('[@esmx/core] postBuild hook failed:', e)` |
| 2 | router/src/router.ts:388 | bare `console.error(e)` | `console.error('[@esmx/router] SSR render failed:', e)` |
| 3 | router/src/micro-app.ts:92 | `'MicroApp unmount failed:'` | adds framework-unmount hint |
| 4 | import/src/import-loader.ts:23 | "can only be created once and cannot be created repeatedly" | references singleton + dedup hint |
| 5 | import/src/import-loader.ts:31 | `Failed to import '${specifier}'` | chains original error + importMap hint |
| 6 | class-state/src/connect.ts:198 | "agreed commit function" (vague) | references commit fn + example |
| 7 | class-state/src/connect.ts:280 | "No state context found" | references provider boundary |
| 8 | core/src/app.ts:140 | "only available in production" | adds `esmx build` instruction |
| 9 | rsbuild/src/manifest-plugin.ts:170 | `missing entrypoint "${exp.name}"` | references modules.exports config |
| 10 | vite/src/manifest-plugin.ts:147 | `missing output chunk for export "${exp.name}"` | references modules.exports config |

## Backlog (WEAK sites, follow-up)

- core/src/core.ts:396 — "Cannot be initialized repeatedly" → name the API (`esmx.init`)
- core/src/core.ts:1134 — "'devApp' function not set" → reference EsmxOptions.devApp
- router/src/route-transition.ts:70 — async component error needs expected-export shape
- router/src/route-transition.ts:435 + micro-app.ts:31 — "X has been destroyed" → reference lifecycle methods
- router/src/util.ts:149,178 — duplicate "exactly one root HTML element" → add tip on single-root wrapper
- router/src/micro-app.ts:58 — "hydration function not provided" → reference `app.hydration()`
- rsbuild/src/app.ts:159 — watch error → include target value
- rsbuild/src/manifest-plugin.ts:179 — "no .mjs output" → reference bundler format
- rspack/src/utils/rsbuild.ts:5 — bare red `console.error` → require caller prefix
- vite/src/manifest-plugin.ts:147 — same backlog as fixed but for other export shapes

## Pattern to enforce

```
[package-namespace] <what-went-wrong>: <what-was-expected>.
<config-key-or-file>: <example-or-hint>
Original error: <chained-error-if-applicable>
```

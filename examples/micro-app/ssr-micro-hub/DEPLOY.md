# Single-domain deployment: landing + docs

The micro-app hub (this package) and the documentation site (`examples/docs`, an
Rspress build) ship from **one domain** as a single static directory. The hub's
landing page is the site home; the docs provide the content pages. There is no
runtime gateway — the split is baked into the build output.

## How the merged output is assembled

The root build (`build/tasks/artifacts.mjs`, run by `pnpm build`) produces
`dist/` in this order:

1. Every example with a `dist/client` is copied to `dist/<package-name>/` — this
   is how each module's client assets land under `/ssr-micro-<name>/`.
2. The docs (`examples/docs/dist/client`) are copied to the `dist/` root,
   providing `/guide`, `/api`, `/blog`, `/static`, and the root files
   (`favicon.ico`, `robots.txt`, `llms.txt`, …). **The docs no longer emit a
   home page** (`src/en/index.md` and `src/zh/index.md` were removed), so they
   contribute no `/index.html`.
3. The hub's `dist/client` is overlaid on the `dist/` root, adding the landing at
   `/` and `/zh`, plus the demo and per-framework pages (`/demo/`, `/vue3/`, …).

## Resulting URL map

```
/                          → hub landing (English)
/zh                        → hub landing (Chinese)
/demo/ /zh/demo/           → hub demo dashboard
/html/ /lit/ /vue2/ /vue3/ /react/ /preact/ /preact-htm/ /solid/ /svelte/
  (and /zh/...)            → hub per-framework pages
/guide/... /api/... /blog/... (and /zh/...) → docs
/static/... root files     → docs
/ssr-micro-<name>/...      → all client assets (chunks, importmap, runtime)
```

## Why it works without collisions

- The hub renders at the **root base** (`__ESMX_BASE__='/'`), set in
  `entry.node.ts`'s `postBuild`, so the landing functions when served at `/` —
  hydration and SPA navigation use the correct base.
- Client assets are namespaced by **module name** (`/ssr-micro-<name>/`),
  independent of the render base, so they never collide with the docs' `/static/`
  or content trees.
- The only paths both builds would emit are `/` and `/zh`. The docs no longer
  emit a home, and the hub overlay is applied last, so the landing wins
  unambiguously — this is the "replace the home page with the micro-app" intent.
- The landing's cross-app links to the docs are plain `<a href>` (not the SPA
  `data-to`), so clicking **Docs** is a full-page navigation the static host
  serves from the docs tree, not an in-app router push.

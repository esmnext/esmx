---
titleSuffix: "Styles in Esmx Federation"
description: "How CSS travels through Esmx's federation manifest: write import './x.css' and the host injects a real <link rel=\"stylesheet\"> for every touched chunk."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx,CSS,federation,stylesheet,import maps,SSR,manifest"
---

# Styles

Esmx treats CSS as a **first-class federation resource** — every remote bundles
its own styles, declares them in its manifest, and the host injects a
`<link rel="stylesheet">` for each touched chunk. You write the standard
`import './x.css'` you'd write anywhere else; no Esmx-specific API.

## Authoring

Inside any remote, import CSS from a TypeScript or framework entry the way
your bundler already understands:

```ts
// src/entry.client.ts
import './styles/globals.css';
import { hydrateApp } from './app';

hydrateApp();
```

Or inside a Vue/React/Svelte component file:

```vue
<script setup lang="ts">
import './card.css';
</script>
```

```tsx
import './card.css';
export const Card = (props) => <div className="card">{props.children}</div>;
```

There is no `useStyles()` hook, no `injectGlobalStyles()` helper, no
proprietary file naming convention. The CSS import is what triggers the
contract.

## What Esmx does for you

Each remote's bundler (Rspack, Rsbuild, or Vite) extracts your CSS imports
into real `.css` files. The remote's `manifest.json` lists them per chunk:

```json
{
    "name": "my-remote",
    "chunks": {
        "my-remote@src/entry.client.ts": {
            "js": "src/entry.client.aaa.mjs",
            "css": ["src/entry.client.bbb.css"],
            "resources": []
        }
    }
}
```

When the host SSR-renders a page that touches `my-remote`'s chunk, the
`RenderContext` collects the chunk's CSS URLs and `rc.css()` emits:

```html
<link rel="stylesheet" href="/my-remote/src/entry.client.bbb.css">
```

…plus a matching `<link rel="preload" as="style">` in front of it so the
browser starts loading before HTML parsing finishes. No FOUC.

## Sharing styles between remotes

Because each remote owns its CSS, the canonical way to share a design
system is to put it in a federated dependency that all remotes already
load. A typical pattern:

```ts
// shared-host/src/index.ts
import './styles/tokens.css';      // colour/typography variables
import './styles/components.css';  // shared `.btn`, `.card`, etc.

export { renderHost, hydrateHost } from './host';
```

Every consuming remote imports something from `shared-host` (the layout,
the router context, …). The shared chunk's CSS travels with it through the
federation manifest, so the host emits the `<link>` automatically — no
remote has to `import` the shared CSS itself.

::: tip
The shared CSS file lives **once**. Each remote keeps its own
framework-native components but consumes the same class names
(`.btn`, `.card`, …) and the same CSS variables.
:::

## How it works internally

| Step | Component | What happens |
|------|-----------|--------------|
| 1 | Your remote | `import './x.css'` declares a side effect on the chunk |
| 2 | Bundler (Rspack/Rsbuild/Vite) | Extracts the import into a `.css` asset, lists it in the chunk's `css[]` in `manifest.json` |
| 3 | `@esmx/import` (server) | Loads the remote module via VM; CSS imports return a no-op synthetic module (the URL is metadata) |
| 4 | `RenderContext.commit()` | Reads each touched chunk's `css[]` from the manifest and adds it to `files.css` |
| 5 | `rc.css()` / `rc.preload()` | Emit `<link>` tags into the SSR HTML |
| 6 | Browser | Loads the CSS via the URL declared in the manifest |

All three official bundler integrations (`@esmx/rspack`, `@esmx/rsbuild`,
`@esmx/vite`) implement step 2 the same way — `chunks[*].css[]` is part
of the manifest contract, not a bundler-specific extension.

## FAQ

**Does this work in dev mode?**
Yes. The dev manifest is updated on rebuild and the host follows the same
`<link>` injection path. No HMR-specific CSS plumbing for you to maintain.

**What about CSS Modules / Tailwind / PostCSS / Sass?**
Each bundler runs its own pre-processor. Esmx only cares about the final
`.css` URLs in the manifest. Your `app.module.css`, `@apply`, `scss`, etc.
work as the bundler documents.

**Can I `import` a sibling remote's CSS directly?**
You shouldn't need to — see the "sharing styles" section above. If you do
try, library-mode bundlers may handle workspace-dep CSS inconsistently.
Always own your styles in the remote that produces them.

**Subresource Integrity (SRI)?**
In production, every emitted CSS chunk gets a `sha384-…` integrity hash
that flows into the `<link rel="stylesheet" integrity="…" crossorigin>`
attribute. Browsers refuse to apply tampered stylesheets.

## Reference

- [Render context — `rc.css()` / `rc.preload()`](/api/core/render-context)
- Each bundler's manifest format includes the `chunks[*].css[]` array
  documented above.

## Related

- [Render Context](/guide/essentials/render-context) — `rc.css()` / `rc.preload()` emit the collected stylesheet links
- [Module Linking](/guide/essentials/module-linking) — how remotes own and share their styles

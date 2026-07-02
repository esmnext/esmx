---
titleSuffix: "Native ESM Micro-Frontend Framework"
description: "Native ESM micro-frontends: compose apps with Import Maps and standard imports — no Module Federation, no sandbox, first-class SSR. How Esmx does it and how it compares."
head:
  - - "meta"
    - name: "keywords"
      content: "native esm micro frontend, esm micro frontend, micro-frontend framework, micro frontend without module federation, module federation alternative, import maps micro frontend, ssr micro frontend, framework agnostic"
---

# Native ESM Micro-Frontends

A **native ESM micro-frontend** is a micro-frontend composed with the browser's own module system — [ECMAScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) and [Import Maps](https://github.com/WICG/import-maps) — instead of a bundler runtime, a JavaScript sandbox, or a proprietary loader.

Esmx is built on this model: apps import each other with plain `import` statements, dependencies are shared through Import Maps, and nothing extra ships at runtime. The result is a micro-frontend framework with **zero runtime overhead**, **first-class SSR**, and true **multi-framework** support.

## Why native ESM

Most micro-frontend solutions add a layer on top of the platform: a bundler-specific runtime, a `window`-patching sandbox, or a custom module registry. Each layer adds overhead, edge cases, and lock-in.

Native ESM removes the layer. The browser already resolves modules, dedupes them, and loads them on demand. Import Maps already let you pin and share versions. Esmx uses these directly, so:

- **Zero runtime overhead** — there is no federation container or sandbox to download and execute.
- **No lock-in** — a linked module is imported with a standard `import`; the same code runs in the browser, in SSR, and in tests.
- **SEO-friendly SSR** — pages render to complete, crawlable HTML because rendering does not depend on a client-side orchestration runtime.
- **Framework-agnostic** — Vue 3, Vue 2, React, Preact, Solid, Svelte, and Lit micro-apps coexist in one page.

## Native ESM vs Module Federation

Module Federation shares code through a Webpack/Rspack runtime container. It works, but it couples you to the bundler, adds a federation runtime plus shared-scope negotiation, and has historically been awkward for SSR.

With native ESM the sharing mechanism *is* the platform: Import Maps resolve shared dependencies, and [Module Linking](/guide/essentials/module-linking) gives each package a single explicit owner instead of runtime version negotiation. See the [side-by-side comparison](/guide/essentials/module-linking#module-linking-vs-module-federation).

## Native ESM vs sandbox micro-frontends

Sandbox-based frameworks (qiankun, wujie, micro-app and similar) isolate apps by emulating or proxying the browser environment. That isolation carries a runtime cost and a long tail of compatibility quirks.

Esmx does not sandbox. Isolation comes from the module graph itself — each micro-app owns its scope through standard modules — so there is no `window` proxying, no style-scoping hacks, and no per-app runtime tax.

## SSR and SEO

SSR is a core design goal, not an add-on. Because composition happens through native modules, the server renders every micro-app to full HTML that search engines can crawl without executing a client orchestration layer. If SEO-safe server rendering across independently built apps is your requirement, native ESM is the shortest path to it.

## Multi-framework by default

One Esmx application can mount micro-apps written in different frameworks at once. A shell in one framework can host views in another, and shared dependencies are linked — not duplicated — across them.

## FAQ

### Is a native ESM micro-frontend the same as Module Federation?

No. Module Federation shares code through a bundler runtime container; a native ESM approach shares it through the browser's own module system and Import Maps, with zero extra runtime and no bundler lock-in.

### Can I do micro-frontends without Module Federation?

Yes. Esmx composes apps with standard `import` statements and Import Maps, so you get dependency sharing and independent deployment without Module Federation or a sandbox.

### Are native ESM micro-frontends SEO-friendly?

Yes. Rendering does not depend on a client-side orchestration runtime, so the server produces complete, crawlable HTML — which is why SSR is a first-class feature in Esmx.

### Does it support mixing frameworks?

Yes. Vue 3, Vue 2, React, Preact, Solid, Svelte, and Lit micro-apps can run in the same application.

## Related

- [Introduction](/guide/start/introduction) — Esmx core concepts and design
- [Module Linking](/guide/essentials/module-linking) — zero-runtime dependency sharing
- [Getting Started](/guide/start/getting-started) — build your first Esmx app

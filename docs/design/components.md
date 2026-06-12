# Esmx Component Primitives — Internal Contributor Doc

> Internal reference. Esmx demos run in 7 frameworks (Vue 2/3, React 19,
> Preact, Solid, Svelte, Lit, plain HTML) — components don't cross those
> boundaries, so **we don't ship "shared components"**. What we ship is a
> shared **CSS-class contract**: classes like `.esmx-btn` and `.esmx-card`
> defined once in
> [`ssr-micro-shared/src/styles/components.css`](../../examples/micro-app/ssr-micro-shared/src/styles/components.css),
> and each demo writes a tiny framework-native wrapper (Button.vue /
> Button.tsx / Button.svelte / …) that just attaches the class.
>
> Each demo composes from these — don't reinvent button styles inside a remote.

All values below reference tokens from `tokens.css`; nothing should be
hard-coded in a component's CSS.

---

## Button

| Variant   | Background          | Border                  | Text                      |
|-----------|---------------------|-------------------------|---------------------------|
| Default (ghost) | `transparent` (hover: `--esmx-bg-subtle`) | `1px solid --esmx-border` | `--esmx-text-primary` |
| Primary   | `--esmx-brand` (hover: `--esmx-brand-hover`) | none | `--esmx-text-inverse` |
| Danger    | `--esmx-danger` (hover: darker) | none | `--esmx-text-inverse` |
| Subtle    | `--esmx-bg-subtle` | none | `--esmx-text-primary` |
| Icon      | `transparent` (hover: `--esmx-bg-subtle`) | none | `--esmx-text-primary`, 32×32 |

Shared:
- `font-size: var(--esmx-fs-sm)` (14 px) · `font-weight: var(--esmx-fw-medium)`
- `padding: 8px 14px` · `border-radius: var(--esmx-radius-md)` (6 px)
- Large CTA on landing: `font-size: var(--esmx-fs-base)` + `padding: 10px 18px`

## Card

- `background: var(--esmx-bg-paper)`
- `border: 1px solid var(--esmx-border)` · `border-radius: var(--esmx-radius-lg)` (8 px)
- `padding: var(--esmx-space-6)` (24 px)
- **No shadow by default.** Hover: `border-color: var(--esmx-border-strong)` + `box-shadow: var(--esmx-shadow-sm)`
- No gradient backgrounds. No 64-px icons.

## Code block

- `background: var(--esmx-bg-subtle)` · no border
- `padding: var(--esmx-space-4) var(--esmx-space-5)` (16 px / 20 px)
- `border-radius: var(--esmx-radius-md)` (6 px)
- `font-family: var(--esmx-font-mono)` · `font-size: var(--esmx-fs-sm)` (14 px)
- `line-height: 1.55`
- Syntax highlighting: shiki, themes `github-light` + `github-dark`
- Optional file header: thin `--esmx-bg-paper` strip on top, monospace `path/file.ts` left-aligned

## Stat (counter, framework version, etc.)

Two-line layout — eyebrow above, value below.

```
COUNT
7
```

- Eyebrow: `font-size: var(--esmx-fs-xs)` · `text-transform: uppercase`
  · `letter-spacing: var(--esmx-tracking-eyebrow)` · `color: var(--esmx-text-muted)`
- Value: `font-size: var(--esmx-fs-2xl)` (32 px — **not** 48 px) ·
  `font-weight: var(--esmx-fw-semibold)` · `font-family: var(--esmx-font-mono)`
  · `color: var(--esmx-text-primary)`
- Container `padding: var(--esmx-space-4)`

## Tabs

- Underline style only — no pill backgrounds.
- `font-size: var(--esmx-fs-sm)` · default `color: var(--esmx-text-secondary)`
- Active: `color: var(--esmx-brand)` · `border-bottom: 2px solid var(--esmx-brand)`
- Container `border-bottom: 1px solid var(--esmx-border)`

## Badge / Tag

- `border-radius: var(--esmx-radius-pill)` · `padding: 2px 8px`
- `font-family: var(--esmx-font-mono)` · `font-size: var(--esmx-fs-xs)`
- Framework variant: `border: 1px solid var(--esmx-fw-X)` · `color: var(--esmx-fw-X)`
  · `background: transparent`
- Status variant: `background: var(--esmx-X-soft)` · `color: var(--esmx-X)`
  where X ∈ {success, warning, danger}
- Dot variant (used in tables and lists): 8 × 8 px `border-radius: var(--esmx-radius-pill)`
  · `background: var(--esmx-fw-X)` · no border

## Table

- Used in hub home (demo index) and matrix tables in docs.
- `font-size: var(--esmx-fs-sm)` · `padding: 8px 12px`
- Row divider: `border-bottom: 1px solid var(--esmx-border-subtle)`
- Header: `background: var(--esmx-bg-subtle)` · `font-weight: var(--esmx-fw-medium)`
  · uppercase + `letter-spacing: var(--esmx-tracking-eyebrow)` like an eyebrow
- Row hover: `background: var(--esmx-bg-subtle)`

---

## Composition reference

The B1 reference demo (`ssr-micro-vite-vue`) assembles these primitives like
this — left source pane is a Code block, right pane is a Card containing a
Stat + a horizontal group of Buttons:

```html
<article class="esmx-demo-card">
  <div class="esmx-demo-card__source">
    <!-- Code block: src/app.vue, shiki-highlighted -->
  </div>
  <div class="esmx-demo-card__rendered">
    <!-- Stat -->
    <!-- Button group: [+] [−] -->
    <!-- Framework dots: Vue 3 · Vite 8 · SSR -->
  </div>
</article>
```

A5 ships a single `ssr-micro-shared/src/styles/components.css` defining the
classes used above (`.esmx-card`, `.esmx-btn--primary`, `.esmx-code`,
`.esmx-stat`, etc.). No JS, no TS, no `import { Button }` — those would only
work in one framework. Each demo's framework-native wrapper attaches the
classes and handles its own event binding.

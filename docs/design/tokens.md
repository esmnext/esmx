# Esmx Design Tokens — Internal Contributor Doc

> Internal reference. Public surfaces consume these tokens; nothing here
> is shipped as user-facing API.

All tokens live in
[`examples/micro-app/ssr-micro-shared/src/styles/tokens.css`](../../examples/micro-app/ssr-micro-shared/src/styles/tokens.css).
That file is the only place these values exist. If you find a hard-coded
colour or magic number anywhere else in this repo, fix it — don't fork a
new token namespace.

## Importing

Every micro remote already imports it transitively through the shared host
layout. Standalone SSR demos and templates must import it directly:

```ts
import 'ssr-micro-shared/src/styles/tokens.css';
```

The docs site (`examples/docs/`) overrides Rspress's `--rp-*` tokens at
`:root` so the brand colour matches `--esmx-brand`.

## Brand

| Token              | Light     | Dark      | Use                              |
|--------------------|-----------|-----------|----------------------------------|
| `--esmx-brand`       | `#0091e2` | `#48b9ec` | Links, primary CTA, active state |
| `--esmx-brand-hover` | `#0079bd` | `#65c5f0` | Hover                            |
| `--esmx-brand-soft`  | `#e6f3fa` | `#0c2030` | Soft fill (badge bg, callout)    |

## Surfaces

| Token              | Light     | Dark      | Use                       |
|--------------------|-----------|-----------|---------------------------|
| `--esmx-bg-canvas` | `#fdfdfd` | `#0c1117` | Page background           |
| `--esmx-bg-paper`  | `#ffffff` | `#161b22` | Card, panel               |
| `--esmx-bg-subtle` | `#f5f7f9` | `#1c232c` | Code block, table header  |
| `--esmx-bg-overlay`| `rgba(13,17,23,0.5)` | `rgba(0,0,0,0.6)` | Mobile drawer overlay |

## Borders

| Token                   | Light     | Dark      |
|-------------------------|-----------|-----------|
| `--esmx-border`         | `#e5e9ed` | `#30363d` |
| `--esmx-border-strong`  | `#c9d1d9` | `#484f58` |
| `--esmx-border-subtle`  | `#eef1f3` | `#21262d` |

## Text

| Token                    | Light     | Dark      |
|--------------------------|-----------|-----------|
| `--esmx-text-primary`    | `#0c1117` | `#e6edf3` |
| `--esmx-text-secondary`  | `#5a6473` | `#8b949e` |
| `--esmx-text-muted`      | `#8b949e` | `#6e7681` |
| `--esmx-text-inverse`    | `#ffffff` | `#0c1117` |

## Status

| Token            | Value     | Use            |
|------------------|-----------|----------------|
| `--esmx-success` | `#22a06b` | live, pass     |
| `--esmx-warning` | `#d97706` | preview        |
| `--esmx-danger`  | `#dc3545` | fail, minus    |
| `--esmx-info`    | `#0091e2` | informational  |

## Framework colours — dots and labels only

Never used as fills or gradients. Eight-pixel circles in lists, or
`color`/`border-color` on monospace text labels.

| Token                | Value     |
|----------------------|-----------|
| `--esmx-fw-react`    | `#149eca` |
| `--esmx-fw-vue`      | `#41b883` |
| `--esmx-fw-preact`   | `#673ab8` |
| `--esmx-fw-solid`    | `#2c4f7c` |
| `--esmx-fw-svelte`   | `#ff3e00` |
| `--esmx-fw-lit`      | `#324fff` |
| `--esmx-fw-html`     | `#e34f26` |

## Typography

| Token              | Value     |
|--------------------|-----------|
| `--esmx-font-sans` | `'Inter Variable', system-ui, ...` |
| `--esmx-font-mono` | `'JetBrains Mono Variable', ui-monospace, ...` |
| `--esmx-fs-xs`     | `0.75rem`  |
| `--esmx-fs-sm`     | `0.875rem` |
| `--esmx-fs-base`   | `1rem`     |
| `--esmx-fs-md`     | `1.125rem` |
| `--esmx-fs-lg`     | `1.25rem`  |
| `--esmx-fs-xl`     | `1.5rem`   |
| `--esmx-fs-2xl`    | `2rem`     |
| `--esmx-fs-3xl`    | `2.5rem`   |
| `--esmx-fs-display`| `clamp(2.5rem, 4vw + 1rem, 3.5rem)` |
| `--esmx-leading-{tight,snug,normal,loose}` | `1.2` / `1.4` / `1.6` / `1.8` |
| `--esmx-fw-{regular,medium,semibold,bold}` | `400` / `500` / `600` / `700` |
| `--esmx-tracking-eyebrow` | `0.08em` |

## Spacing — 4 px base, t-shirt

`--esmx-space-{0,1,2,3,4,5,6,8,10,12,16,20}` resolve to
`0`, `4`, `8`, `12`, `16`, `20`, `24`, `32`, `40`, `48`, `64`, `80` (in px,
expressed as rem).

Card padding is `--esmx-space-6` (24 px). The 48-px padding used in older
demos has been retired.

## Radius

`--esmx-radius-{sm,md,lg,xl,pill}` → `4px`, `6px`, `8px`, `12px`, `9999px`.
Card radius is `--esmx-radius-lg` (8 px). 16-px radius retired.

## Shadow & motion

| Token             | Use                       |
|-------------------|---------------------------|
| `--esmx-shadow-sm` | Card hover lift          |
| `--esmx-shadow-md` | Popover                  |
| `--esmx-shadow-lg` | Modal                    |
| `--esmx-duration-instant` (100ms) | Colour, opacity |
| `--esmx-duration-fast` (150ms)    | Border, shadow  |
| `--esmx-duration-normal` (200ms)  | Transform, layout |
| `--esmx-ease-out` | `cubic-bezier(0.2,0.8,0.2,1)` |

## Dark mode

```html
<html data-theme="dark">       <!-- explicit user toggle -->
```

```css
@media (prefers-color-scheme: dark) { ... }   /* auto fallback */
```

The `:root:not([data-theme='light'])` selector in `tokens.css` handles the
auto path so an explicit `data-theme="light"` always overrides system
preference.

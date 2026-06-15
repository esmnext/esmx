# Esmx Design Principles — Internal Contributor Doc

> **Audience**: people maintaining Esmx's own demos, hub, docs site, and
> templates. Not Esmx end-users — they don't need to know any of this.
>
> **Public design rationale that we want to put in front of users** belongs
> in `examples/docs/src/{en,zh}/...` (rspress site). Everything here is the
> contract _we_ honour so the public surfaces stay coherent.

Source of truth for tokens: [`examples/micro-app/ssr-micro-shared/src/styles/tokens.css`](../../examples/micro-app/ssr-micro-shared/src/styles/tokens.css).
Source of truth for visual direction: [`.claude/design-direction.md`](../../.claude/design-direction.md).

## P1 — Standards over magic

Web-standard names win. `<dialog>`, `<details>`, CSS variables, plain `<table>`.
No bespoke abstractions when the standard already has a word for it.

## P2 — Self-contained code samples

Every code block in a README, every snippet in our docs, every demo source
file: copy-paste runnable on its own. No implicit imports, no assumed setup.
If a snippet needs context, the snippet shows the context.

## P3 — One source of truth per token

All colours, font sizes, spacing, radii, durations live exactly once: in
`tokens.css`. Demos, hub, docs site, templates all reference those tokens.
Hard-coded hex values, magic `px`/`rem` numbers, parallel token namespaces
get removed on sight.

## P4 — Agent-readable failures

When something breaks, the error tells the reader which file / which line /
what to change. Stack-trace dumps without diagnosis don't count. Emoji
decoration with no payload doesn't count.

## P5 — Code is the demo

Every demo card puts the **source code** in the visual primary, rendered
output in the visual secondary. Esmx's differentiator is "standard ESM
federation in any framework", and that's visible only when the visitor
can see the code that produced the page.

## P6 — Agent artifacts are user deliverables

`llms.md`, JSON schemas, error catalogues we ship "for AI" are products
**users** feed to their own assistants. They are versioned with Esmx,
published to esmx.dev, and CI-validated. They are not internal contributor
notes (i.e. **not this file** — this file _is_ an internal contributor note).

---

## Architectural decisions (non-negotiable inside this codebase)

| #  | Decision |
|----|----------|
| D1 | Demo cards: source code primary, rendered output secondary. No giant framework icons. |
| D2 | All demos use CSS classes. Remove inline `style=""` everywhere. |
| D3 | One `--esmx-*` token namespace. Docs site overrides Rspress `--rp-*` to map onto it. |
| D4 | Framework colours become 8-px dots and label text. Never fills or gradients. |
| D5 | Light mode default. Dark via `[data-theme='dark']` and `prefers-color-scheme`. |

Changing one of these requires updating `.claude/design-direction.md` first —
that file is the spec, this file is the principles-level summary.

## What to read next

- [`tokens.md`](./tokens.md) — full token catalogue.
- [`components.md`](./components.md) — the seven primitives every Esmx
  surface composes from.

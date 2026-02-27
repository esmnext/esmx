---
titleSuffix: "Scroll Behavior"
description: "Learn how @esmx/router handles scroll position — automatic scroll to top, scroll restoration on back/forward, keeping scroll position, and scrolling to elements."
head:
  - - "meta"
    - name: "keywords"
      content: "scroll behavior, scroll restoration, scroll position, keepScrollPosition, scroll to top, scroll to element, history scroll"
---

# Scroll Behavior

When navigating between routes, `@esmx/router` automatically manages scroll position to match user expectations. Pushing to a new page scrolls to the top; going back restores the previous scroll position. This mirrors how traditional multi-page websites behave.

## Default Behavior

The router handles scrolling differently based on the navigation type:

| Navigation Type | Scroll Behavior |
|----------------|----------------|
| `push` | Scrolls to top `(0, 0)` |
| `replace` | Scrolls to top `(0, 0)` |
| `back` | Restores saved scroll position |
| `forward` | Restores saved scroll position |
| `go(n)` | Restores saved scroll position |
| `pushWindow` | Handled by browser |
| `replaceWindow` | Handled by browser |

```ts
// Navigating forward → scroll to top
await router.push('/new-page'); // page scrolls to top

// Going back → scroll position is restored
await router.back(); // page scrolls to where you were before
```

This works out of the box with no configuration needed.

## How Scroll Positions Are Saved

When leaving a page (via `push`, `replace`, or history navigation), the router saves the current scroll position using two mechanisms:

1. **In-memory map**: A `Map<string, ScrollPosition>` keyed by the page's full URL
2. **History state**: The position is also stored in `history.state` under the `__scroll_position_key` property

```ts
// Internally, the router does something like:
const scrollPosition = { left: window.scrollX, top: window.scrollY };

// Save in memory
scrollPositions.set(currentUrl, scrollPosition);

// Save in history state
history.replaceState({
  ...history.state,
  __scroll_position_key: scrollPosition
}, '');
```

Storing in `history.state` means scroll positions survive page refreshes — when the user refreshes and then navigates back, the correct scroll position can still be restored.

## Manual Scroll Restoration

The router sets `history.scrollRestoration = 'manual'` automatically. This tells the browser not to attempt its own scroll restoration, leaving full control to the router.

This is configured during the `confirm` phase of navigation — you don't need to set it yourself.

## Keeping Scroll Position

Sometimes you don't want navigation to scroll to the top. For example, when switching tabs or filtering content, the user expects to stay where they are:

```ts
// Tab navigation — stay at current scroll position
await router.push({
  path: '/dashboard',
  query: { tab: 'settings' },
  keepScrollPosition: true
});
```

When `keepScrollPosition` is set to `true`:
- The page does **not** scroll to top
- The current scroll position is **not** saved (since we're staying at the same position)
- The `__keepScrollPosition` flag is stored in `history.state`

This flag is also checked during `back`/`forward` navigation — if the target history entry was created with `keepScrollPosition: true`, scroll restoration is skipped:

```ts
// If the user navigates back to an entry that was created with keepScrollPosition,
// the router won't attempt scroll restoration
```

## Scroll to Element

The scroll system supports scrolling to a specific element on the page using a CSS selector:

```ts
import { scrollToPosition } from '@esmx/router';

// Scroll to an element by CSS selector
scrollToPosition({ el: '#section-title' });

// Scroll to an element with offset
scrollToPosition({
  el: '#section-title',
  top: -80,    // offset for fixed header
  behavior: 'smooth'
});

// Scroll to an element by reference
const element = document.querySelector('.target');
scrollToPosition({ el: element });
```

The `el` property accepts:
- A CSS selector string (e.g., `'#my-id'`, `'.my-class'`, `'[data-section]'`)
- A DOM `Element` reference

:::tip
If you need to scroll to an element after navigation, use the `afterEach` hook:

```ts
router.afterEach((to) => {
  if (to.hash) {
    setTimeout(() => {
      scrollToPosition({ el: to.hash });
    }, 100); // wait for DOM to update
  }
});
```
:::

## Layer Routes and Scroll

Routes opened as [layers](./layer) (via `pushLayer` or `createLayer`) skip scroll handling entirely. Since layers render in an overlay on top of the current page, scrolling the background page would be disruptive:

```ts
// Layer navigation does NOT affect scroll position
await router.pushLayer('/confirm-dialog');
// The background page stays exactly where it is
```

This behavior is built into the router's confirm phase — scroll logic is skipped when `router.isLayer` is `true`.

## Scroll Position Flow

Here's the complete flow of how scroll is handled during different navigation types:

### push / replace

```
1. Save current scroll position for the current URL
2. Perform navigation (update history, mount component)
3. Scroll to (0, 0) — unless keepScrollPosition is true
```

### back / forward / go

```
1. Save current scroll position for the current URL
2. Perform navigation (history popstate fires)
3. Wait for DOM update (nextTick)
4. Check if history.state has __keepScrollPosition flag
   → If yes: skip scroll restoration
   → If no: restore saved scroll position for the new URL
     → Falls back to (0, 0) if no saved position exists
```

### Window Navigation (pushWindow / replaceWindow)

```
1. Full browser navigation — scroll handled by browser natively
```

## Summary

| Feature | Default | How to change |
|---------|---------|---------------|
| Scroll to top on push/replace | ✅ Enabled | Pass `keepScrollPosition: true` |
| Restore scroll on back/forward | ✅ Enabled | Automatic — uses saved positions |
| Browser scroll restoration | ❌ Disabled (`'manual'`) | Set automatically by router |
| Layer scroll handling | ❌ Skipped | Automatic for layer routes |
| Persist across page refresh | ✅ Via `history.state` | Automatic |

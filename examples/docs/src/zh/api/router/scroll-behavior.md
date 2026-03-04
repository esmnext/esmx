---
titleSuffix: "Scroll Behavior"
description: "Learn how @esmx/router handles scroll position — automatic scroll to top, scroll restoration on back/forward, keeping scroll position, and scrolling to elements."
head:
  - - "meta"
    - name: "keywords"
      content: "scroll behavior, scroll restoration, scroll position, keepScrollPosition, scroll to top, scroll to element, history scroll"
---

# 滚动行为

在路由之间导航时，`@esmx/router` 会自动管理滚动位置以符合用户预期。推送到新页面时滚动到顶部；返回时恢复之前的滚动位置。这与传统多页面网站的行为一致。

## 默认行为

Router 根据导航类型以不同方式处理滚动：

- `push`：滚动到顶部 `(0, 0)`
- `replace`：滚动到顶部 `(0, 0)`
- `back`：恢复保存的滚动位置
- `forward`：恢复保存的滚动位置
- `go(n)`：恢复保存的滚动位置
- `pushWindow`：由浏览器处理
- `replaceWindow`：由浏览器处理

```ts
await router.push('/new-page');

await router.back();
```

这开箱即用，无需任何配置。

## 滚动位置的保存方式

离开页面时（通过 `push`、`replace` 或历史记录导航），Router 会使用两种机制保存当前滚动位置：

1. **内存映射**：一个以页面完整 URL 为键的 `Map<string, ScrollPosition>`
2. **历史状态**：位置也会存储在 `history.state` 的 `__scroll_position_key` 属性中

```ts
const scrollPosition = { left: window.scrollX, top: window.scrollY };

scrollPositions.set(currentUrl, scrollPosition);

history.replaceState({
  ...history.state,
  __scroll_position_key: scrollPosition
}, '');
```

存储在 `history.state` 中意味着滚动位置在页面刷新后仍然有效——当用户刷新后再导航返回时，仍然可以恢复正确的滚动位置。

## 手动滚动恢复

Router 会自动设置 `history.scrollRestoration = 'manual'`。这告诉浏览器不要尝试自行进行滚动恢复，将完全控制权交给 Router。

这是在导航的 `confirm` 阶段配置的——你无需自行设置。

## 保持滚动位置

有时你不希望导航滚动到顶部。例如，在切换标签页或筛选内容时，用户希望保持在当前位置：

```ts
await router.push({
  path: '/dashboard',
  query: { tab: 'settings' },
  keepScrollPosition: true
});
```

当 `keepScrollPosition` 设置为 `true` 时：
- 页面**不会**滚动到顶部
- 当前滚动位置**不会**被保存（因为我们停留在同一位置）
- `__keepScrollPosition` 标志会存储在 `history.state` 中

在 `back`/`forward` 导航期间也会检查此标志——如果目标历史记录条目是使用 `keepScrollPosition: true` 创建的，则会跳过滚动恢复。

## 滚动到元素

滚动系统支持使用 CSS 选择器滚动到页面上的特定元素：

```ts
import { scrollToPosition } from '@esmx/router';

scrollToPosition({ el: '#section-title' });

scrollToPosition({
  el: '#section-title',
  top: -80,
  behavior: 'smooth'
});

const element = document.querySelector('.target');
scrollToPosition({ el: element });
```

`el` 属性接受：
- CSS 选择器字符串（例如 `'#my-id'`、`'.my-class'`、`'[data-section]'`）
- DOM `Element` 引用

:::tip
如果你需要在导航后滚动到某个元素，请使用 `afterEach` 钩子：

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

## 层路由与滚动

作为[层](./layer)打开的路由（通过 `pushLayer` 或 `createLayer`）会完全跳过滚动处理。由于层在当前页面之上以覆盖层的形式渲染，滚动背景页面会造成干扰：

```ts
await router.pushLayer('/confirm-dialog');
```

此行为内置于 Router 的 confirm 阶段——当 `router.isLayer` 为 `true` 时，会跳过滚动逻辑。

## 滚动位置流程

以下是不同导航类型中滚动处理的完整流程：

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

### 窗口导航 (pushWindow / replaceWindow)

```
1. Full browser navigation — scroll handled by browser natively
```

## 总结

- **push/replace 时滚动到顶部**：默认启用。传递 `keepScrollPosition: true` 可禁用。
- **back/forward 时恢复滚动**：默认启用。自动使用保存的位置。
- **浏览器滚动恢复**：已禁用（`'manual'`）。由 Router 自动设置。
- **层的滚动处理**：已跳过。对层路由自动生效。
- **跨页面刷新持久化**：通过 `history.state`。自动完成。

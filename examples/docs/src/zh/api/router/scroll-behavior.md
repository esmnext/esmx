---
titleSuffix: "滚动行为"
description: "了解 @esmx/router 如何处理滚动位置 —— 自动滚动到顶部、返回/前进时的滚动恢复、保持滚动位置以及滚动到指定元素。"
head:
  - - "meta"
    - name: "keywords"
      content: "滚动行为, 滚动恢复, 滚动位置, keepScrollPosition, 滚动到顶部, 滚动到元素, history 滚动"
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

滚动系统支持使用 CSS 选择器滚动到页面上的特定元素。你可以通过 `el` 属性指定目标：

- CSS 选择器字符串（例如 `'#my-id'`、`'.my-class'`、`'[data-section]'`）
- DOM `Element` 引用

:::tip
如果你需要在导航后滚动到某个元素，请使用 `afterEach` 钩子结合原生滚动 API：

```ts
router.afterEach((to) => {
  if (to.hash) {
    setTimeout(() => {
      const el = document.querySelector(to.hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // wait for DOM to update
  }
});
```
:::

## 层与滚动

通过[层路由](./layer)打开的路由（使用 `pushLayer` 或 `createLayer`）会完全跳过滚动处理。由于层在当前页面之上以覆盖层的形式渲染，滚动背景页面会造成干扰：

```ts
await router.pushLayer('/confirm-dialog');
```

此行为内置于 Router 的 confirm 阶段——当 `router.isLayer` 为 `true` 时，会跳过滚动逻辑。

## 滚动位置流程

以下是不同导航类型中滚动处理的完整流程：

### push / replace

```
1. 保存当前 URL 的滚动位置
2. 执行导航（更新历史记录，挂载组件）
3. 滚动到 (0, 0) — 除非 keepScrollPosition 为 true
```

### back / forward / go

```
1. 保存当前 URL 的滚动位置
2. 执行导航（history popstate 触发）
3. 等待 DOM 更新（nextTick）
4. 检查 history.state 是否有 __keepScrollPosition 标志
   → 如果有：跳过滚动恢复
   → 如果没有：恢复新 URL 的保存滚动位置
     → 如果没有保存的位置则回退到 (0, 0)
```

### 窗口导航 (pushWindow / replaceWindow)

```
1. 完整的浏览器导航 — 滚动由浏览器原生处理
```

## 总结

- **push/replace 时滚动到顶部**：默认启用。传递 `keepScrollPosition: true` 可禁用。
- **back/forward 时恢复滚动**：默认启用。自动使用保存的位置。
- **浏览器滚动恢复**：已禁用（`'manual'`）。由 Router 自动设置。
- **层的滚动处理**：已跳过。对层自动生效。
- **跨页面刷新持久化**：通过 `history.state`。自动完成。

---
titleSuffix: "Programmatic Navigation"
description: "Complete guide to programmatic navigation in @esmx/router — push, replace, window navigation, history traversal, resolve, and navigation options."
head:
  - - "meta"
    - name: "keywords"
      content: "programmatic navigation, router push, router replace, pushWindow, replaceWindow, history navigation, router.go, router.back, router resolve"
---

# 编程式导航

除了使用 `<RouterLink>` 创建锚标签进行声明式导航外，我们还可以使用 Router 的实例方法进行编程式导航。

## `router.push`

要导航到不同的 URL，使用 `router.push`。此方法会向历史记录栈添加一个新条目，因此当用户点击浏览器后退按钮时，会回到上一个 URL。

```ts
// String path
await router.push('/users/42');

// Object with path
await router.push({ path: '/users/42' });

// With query params
await router.push({ path: '/search', query: { q: 'vue', page: '1' } });

// With hash
await router.push({ path: '/docs/intro', hash: '#getting-started' });
```

该方法返回一个 `Promise<Route>`，在导航完成（包括所有守卫）后解析为新路由：

```ts
const route = await router.push('/about');
console.log(route.path); // '/about'
```

## `router.replace`

行为与 `router.push` 类似，但**不会**添加新的历史记录条目。它会替换当前条目：

```ts
// The current history entry is replaced — back button won't return here
await router.replace('/new-location');
```

当你想在不增加浏览器历史记录的情况下进行重定向时，这很有用——例如，在表单提交或登录之后：

```ts
async function handleLogin() {
  await performLogin();
  await router.replace('/dashboard');
}
```

## 使用对象导航

`push` 和 `replace` 都接受 `RouteLocationInput`，它可以是一个字符串或具有以下属性的对象：

- **`path`**: `string` — 目标路径
- **`query`**: `Record<string, string>` — 查询参数
- **`hash`**: `string` — 哈希片段（例如 `'#section'`）
- **`state`**: `Record<string, unknown>` — 存储在 `history.state` 中的状态（不显示在 URL 中）
- **`params`**: `Record<string, string>` — 动态段的值
- **`keepScrollPosition`**: `boolean` — 如果为 `true`，导航后不滚动到顶部
- **`statusCode`**: `number` — HTTP 状态码（对 SSR 有用）

```ts
await router.push({
  path: '/users/42',
  query: { tab: 'posts' },
  hash: '#latest',
  state: { fromDashboard: true },
  keepScrollPosition: true
});
```

### 使用 `params`

`params` 选项允许你传递动态段的值，这些值会应用到匹配路由的路径模式中：

```ts
// Route: /users/:userId/posts/:postId
await router.push({
  path: '/users/:userId/posts/:postId',
  params: { userId: '42', postId: '7' }
});
// Navigates to /users/42/posts/7
```

### 使用 `state`

`state` 属性将数据存储在 `history.state` 中。与查询参数不同，state 不会显示在 URL 中，并且在前进/后退导航中会被保留：

```ts
await router.push({
  path: '/checkout',
  state: { cartId: 'abc-123', step: 2 }
});

console.log(router.route.state.cartId); // 'abc-123'
```

## 窗口导航

标准的 `push`/`replace` 执行的是 **SPA 导航**——页面不会重新加载，只有路由内容会更改。窗口导航方法则会触发**完整的浏览器导航**。

### `router.pushWindow`

在新的浏览器标签页/窗口中打开目标（等同于 `window.open`）：

```ts
await router.pushWindow('/external-report');
```

### `router.replaceWindow`

在当前标签页中导航到新 URL（等同于 `window.location.replace`）：

```ts
await router.replaceWindow('/legacy-page');
```

### 何时使用窗口导航

- 在 SPA 内部导航：使用 `push` / `replace`
- 导航到不同的微前端：使用 `pushWindow` / `replaceWindow`
- 在新标签页中打开：使用 `pushWindow`
- 全页面刷新/重定向到外部 URL：使用 `replaceWindow`
- 导航到 Router 作用域之外的页面：使用 `pushWindow` / `replaceWindow`

### 守卫管道差异

窗口导航方法会跳过大部分守卫管道，因为浏览器会执行完整的导航：

| Stage | push/replace | pushWindow/replaceWindow |
|-------|-------------|------------------------|
| fallback | ✅ | ✅ |
| override | ✅ | ✅ |
| beforeLeave | ✅ | replaceWindow only |
| beforeEach | ✅ | ✅ |
| beforeUpdate | ✅ | ❌ |
| beforeEnter | ✅ | ❌ |
| asyncComponent | ✅ | ❌ |
| confirm | ✅ | ✅ |

## 历史记录导航

这些方法镜像了浏览器的原生历史记录导航：

### `router.back()`

后退一步。等同于 `router.go(-1)`：

```ts
await router.back();
```

返回 `Promise<Route | null>`。如果没有可以返回的历史记录（用户处于会话起始位置），则返回 `null`。

### `router.forward()`

前进一步。等同于 `router.go(1)`：

```ts
await router.forward();
```

返回 `Promise<Route | null>`。如果没有前进历史记录，则返回 `null`。

### `router.go(n)`

在历史记录中移动 `n` 步。正值前进，负值后退：

```ts
// Go back 2 pages
await router.go(-2);

// Go forward 3 pages
await router.go(3);
```

返回 `Promise<Route | null>`。如果目标位置不存在于历史记录中，则返回 `null`。注意 `router.go(0)` 会立即返回 `null` 而不执行任何操作（与 `location.reload()` 不同）。

## `router.restartApp`

在不更改 URL 的情况下重新挂载当前微应用。当你需要完全重置应用状态时，这很有用：

```ts
await router.restartApp();
```

你也可以传入一个新的路由位置：

```ts
await router.restartApp('/dashboard');
```

此方法会运行完整的守卫管道（不包括 `override`），卸载当前微应用，然后重新挂载。

## `router.resolve`

解析一个路由位置但不实际导航。这对于生成 URL、检查路由是否存在或检查导航的结果很有用：

```ts
const route = router.resolve('/users/42?tab=posts');

console.log(route.path);           // '/users/42'
console.log(route.params);         // { id: '42' }
console.log(route.query);          // { tab: 'posts' }
console.log(route.matched.length); // number of matched route configs
console.log(route.url.href);       // full URL string
```

使用它来生成链接 URL 而不触发导航：

```ts
const resolved = router.resolve('/some/path');
if (resolved.matched.length > 0) {
  console.log('Route exists!');
}

const href = router.resolve({ path: '/about', hash: '#team' }).url.href;
```

## `keepScrollPosition` 选项

默认情况下，`push` 和 `replace` 会将页面滚动到顶部。传递 `keepScrollPosition: true` 可以阻止这一行为：

```ts
await router.push({
  path: '/dashboard',
  query: { tab: 'analytics' },
  keepScrollPosition: true
});
```

有关滚动工作方式的完整详情，请参阅[滚动行为](./scroll-behavior)。

## 错误处理

所有导航方法都可能抛出错误。请始终正确处理它们：

```ts
import {
  RouteTaskCancelledError,
  RouteNavigationAbortedError
} from '@esmx/router';

try {
  await router.push('/protected');
} catch (error) {
  if (error instanceof RouteNavigationAbortedError) {
    console.log('Navigation was blocked by a guard');
  } else if (error instanceof RouteTaskCancelledError) {
    console.log('Navigation was superseded by a newer one');
  } else {
    throw error;
  }
}
```

更多详情请参阅[错误处理](/api/router/error-types)。

## 总结

| Method | History | Page Reload | Returns |
|--------|---------|-------------|---------|
| `push(to)` | Adds entry | No | `Promise<Route>` |
| `replace(to)` | Replaces current | No | `Promise<Route>` |
| `pushWindow(to)` | Browser handles | Yes (new tab) | `Promise<Route>` |
| `replaceWindow(to)` | Browser handles | Yes (same tab) | `Promise<Route>` |
| `back()` | Goes back 1 | No | `Promise<Route \| null>` |
| `forward()` | Goes forward 1 | No | `Promise<Route \| null>` |
| `go(n)` | Goes ±n | No | `Promise<Route \| null>` |
| `restartApp()` | Replaces current | No (remounts app) | `Promise<Route>` |
| `resolve(to)` | — | — | `Route` (sync) |

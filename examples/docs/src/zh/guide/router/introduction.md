---
titleSuffix: "Introduction to @esmx/router"
description: "A comprehensive introduction to @esmx/router — a framework-agnostic router for micro-frontend applications with SSR support, navigation guards, layer routing, and micro-app orchestration."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router, micro-frontend router, SSR router, framework-agnostic router, navigation guards, layer routing, micro-app routing"
---

# 介绍

`@esmx/router` 是一个为现代微前端应用构建的框架无关路由器。与绑定单一框架的传统路由器不同，`@esmx/router` 可以与 React、Vue 2、Vue 3、原生 JavaScript 或它们的任意组合协同工作——全部在同一个应用中。

## 为什么选择 @esmx/router？

现代 Web 应用面临着传统路由器无法解决的挑战：

- **一个应用中使用多个框架**：大型组织可能有团队分别使用 React、Vue 2 和 Vue 3。他们需要一个路由器来管理所有框架之间的导航。
- **随处可用的服务端渲染（SSR）**：相同的路由配置应该能够生成服务端渲染的 HTML，然后在客户端无缝水合——无论哪个框架渲染哪个路由。
- **在不销毁状态的情况下覆盖内容**：模态对话框、抽屉和滑入面板需要拥有自己独立的路由上下文，同时父页面在后台继续运行。
- **渐进式迁移**：从一个框架迁移到另一个框架应该逐路由进行，而不是一次性全部完成。

`@esmx/router` 从底层开始构建，以解决所有这些问题。

## 核心特性

### 框架无关

路由器不导入 React、Vue 或任何其他框架。路由声明一个**微应用**——一组回调（`mount`、`unmount`、`renderToString`），这些回调知道如何管理特定框架的组件树。这意味着不同的路由可以使用完全不同的框架进行渲染：

```ts
const router = new Router({
  routes: [
    { path: '/', app: 'react-app', component: HomePage },
    { path: '/dashboard', app: 'vue3-app', component: Dashboard }
  ],
  apps: {
    'react-app': () => ({ mount(el, comp) { /* ReactDOM */ }, unmount(el) { /* cleanup */ } }),
    'vue3-app': () => ({ mount(el, comp) { /* createApp */ }, unmount(el) { /* cleanup */ } })
  }
});
```

当用户从 `/` 导航到 `/dashboard` 时，路由器会卸载 React 应用，挂载 Vue 3 应用，并渲染正确的组件——所有这一切都无需整页刷新。

### 两种路由模式

- `RouterMode.history`：使用浏览器的 History API（`pushState`、`popstate`），适用于标准 Web 应用
- `RouterMode.memory`：将状态完全保存在内存中，不改变 URL，适用于 SSR、分层路由和测试

### 服务端渲染（SSR）

路由器原生支持 SSR。相同的路由配置在服务端和客户端都能工作。在服务端，使用 `RouterMode.memory` 并传入 `req`/`res` 对象：

```ts
const router = new Router({
  mode: RouterMode.memory,
  base: new URL(req.url, `http://${req.headers.host}`),
  req, res,
  routes: [/* same routes as client */]
});
const html = await router.renderToString();
```

### 丰富的路由配置

路由支持动态参数、嵌套子路由、懒加载、单路由守卫、重定向、微应用绑定等：

```ts
const routes = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },
      { path: 'users/:id', asyncComponent: () => import('./UserProfile') },
      { path: 'admin', app: 'admin-app', component: AdminPanel,
        beforeEnter: (to, from, router) => { if (!isAdmin()) return '/login'; }
      }
    ]
  }
];
```

### 完整的导航守卫管线

守卫在每个阶段拦截导航——从离开当前路由到进入新路由。管线按以下顺序执行：

1. **`fallback`** — 处理未匹配的路由
2. **`override`** — 路由级覆写（混合应用场景）
3. **`beforeLeave`** — 离开当前路由时的守卫
4. **`beforeEach`** — 全局守卫
5. **`beforeUpdate`** — 同一路由参数变化时的守卫
6. **`beforeEnter`** — 进入目标路由时的守卫
7. **`asyncComponent`** — 懒加载目标组件
8. **`confirm`** — 最终确认，DOM 更新，微应用挂载/卸载
9. **`afterEach`** — 导航后通知

守卫可以返回 `void`（允许）、`false`（取消）、字符串/对象（重定向）或函数（自定义逻辑）。

### 分层路由

分层是渲染在主页面之上的独立路由上下文——模态框、抽屉和滑入面板拥有自己的导航：

```ts
const result = await router.createLayer({
  routes: [
    { path: '/', component: ModalContent },
    { path: '/step-2', component: ModalStep2 }
  ]
});
// result.data contains data passed to closeLayer()
```

在分层内部，导航（`push`、`replace`、`back`）不会影响父页面的路由。

### RouterLink

一个框架无关的工具，用于构建导航链接。`router.resolveLink()` 返回属性、激活状态和事件处理器，任何框架都可以使用：

```ts
const link = router.resolveLink({ to: '/about', activeClass: 'nav-active' });
// link.attributes — { href, class }
// link.isActive — true/false
// link.navigate — click handler
```

框架特定的包装器（如 `@esmx/router-vue`）在此基础上构建自己的 `<RouterLink>` 组件。

### 滚动行为

路由器自动管理滚动位置：
- **`push`/`replace`** — 滚动到顶部（除非设置 `keepScrollPosition: true`）
- **`back`/`forward`/`go`** — 恢复保存的滚动位置
- 滚动位置按 URL 保存在 `history.state` 中

### 错误处理

四种错误类型为导航失败提供结构化的错误处理：
- `RouteTaskCancelledError` — 导航被更新的导航取代
- `RouteTaskExecutionError` — 守卫或异步组件抛出错误
- `RouteNavigationAbortedError` — 守卫返回了 `false`
- `RouteSelfRedirectionError` — 检测到无限重定向循环

## 与其他路由器的对比

| 特性 | @esmx/router | Vue Router | React Router |
|---------|-------------|------------|-------------|
| 框架无关 | ✅ | 仅 Vue | 仅 React |
| 多框架应用 | ✅ | ❌ | ❌ |
| SSR 支持 | ✅ 内置 | ✅ | ✅ |
| 导航守卫 | ✅ 完整管线 | ✅ | 有限 |
| 分层路由（模态框） | ✅ 内置 | ❌ | ❌ |
| 微应用生命周期 | ✅ | ❌ | ❌ |
| 内存模式 | ✅ | ✅ | ✅ |
| 滚动管理 | ✅ 自动 | ✅ 手动 | ❌ |
| TypeScript | ✅ 完整类型 | ✅ | ✅ |

## 下一步

- **[快速开始](./getting-started)** — 使用 Vue 2、Vue 3 或 React 的逐步设置指南
- **[动态路由匹配](./dynamic-matching)** — 路由参数、查询字符串、通配符路由
- **[嵌套路由](./nested-routes)** — 布局和子路由
- **[编程式导航](./programmatic-navigation)** — 所有导航方法的详细说明
- **[导航守卫](./navigation-guards)** — 拦截和控制导航
- **[滚动行为](./scroll-behavior)** — 自动滚动管理
- **[分层路由](./layer)** — 具有独立路由的模态框和抽屉
- **[微应用](./micro-app)** — 多框架应用编排
- **[错误处理](./error-handling)** — 结构化错误类型

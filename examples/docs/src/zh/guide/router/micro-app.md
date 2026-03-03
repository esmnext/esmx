---
titleSuffix: "MicroApp API Reference"
description: "Complete guide to @esmx/router MicroApp system — framework-agnostic micro-frontend lifecycle management with mount, unmount, and SSR support."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx micro-app, micro-frontend, mount unmount, renderToString, SSR micro-app, framework-agnostic"
---

# 微应用

微应用系统是 `@esmx/router` 管理框架无关的微前端的方式。每个微应用提供三个生命周期方法：`mount`、`unmount` 以及可选的 `renderToString`。Router 在导航过程中处理微应用之间的切换。

## RouterMicroAppOptions

每个微应用必须实现的接口。

- **类型定义**：
```ts
interface RouterMicroAppOptions {
  mount: (el: HTMLElement) => void;
  unmount: () => void;
  renderToString?: () => Awaitable<string>;
}
```

### mount

- **类型**: `(el: HTMLElement) => void`

将应用挂载到给定的 DOM 元素中。当 Router 导航到绑定此微应用的路由时调用。

- **参数**：
  - `el: HTMLElement` - 要挂载到的 DOM 元素（来自 [`RouterOptions.root`](./router#root)）

### unmount

- **类型**: `() => void`

清理并销毁应用。当导航离开当前路由到绑定不同微应用的路由时调用。

### renderToString

- **类型**: `() => Awaitable<string>`

返回应用当前状态的 SSR HTML 字符串。在服务端渲染期间由 [`router.renderToString()`](./router#rendertostring) 调用。

## RouterMicroAppCallback

创建微应用的工厂函数，接收 Router 实例。

- **类型定义**：
```ts
type RouterMicroAppCallback = (router: Router) => RouterMicroAppOptions;
```

## RouterMicroApp

[`RouterOptions`](./router#apps) 中的 `apps` 选项接受命名工厂的映射或单个工厂。

- **类型定义**：
```ts
type RouterMicroApp =
  | Record<string, RouterMicroAppCallback | undefined>
  | RouterMicroAppCallback;
```

## 使用方法

### 注册微应用

微应用通过 Router 的 `apps` 选项注册，并通过[路由配置](./route-config#app)中的 `app` 属性引用：

```ts
const router = new Router({
  root: '#app',
  routes: [
    {
      path: '/react',
      app: 'react',
      children: [
        { path: '', component: ReactHome },
        { path: 'about', component: ReactAbout }
      ]
    },
    {
      path: '/vue',
      app: 'vue',
      children: [
        { path: '', component: VueHome }
      ]
    }
  ],
  apps: {
    react: (router) => createReactApp(router),
    vue: (router) => createVueApp(router)
  }
});
```

### React 示例

```ts
import * as ReactDOM from 'react-dom/client';
import * as ReactDOMServer from 'react-dom/server';

function createReactApp(router: Router): RouterMicroAppOptions {
  let root: ReactDOM.Root | null = null;

  return {
    mount(el: HTMLElement) {
      root = ReactDOM.createRoot(el);
      root.render(<App router={router} />);
    },
    unmount() {
      root?.unmount();
      root = null;
    },
    async renderToString() {
      return ReactDOMServer.renderToString(<App router={router} />);
    }
  };
}
```

### Vue 3 示例

```ts
import { createApp, createSSRApp } from 'vue';
import { renderToString as vueRenderToString } from 'vue/server-renderer';

function createVueApp(router: Router): RouterMicroAppOptions {
  let app: VueApp | null = null;

  return {
    mount(el: HTMLElement) {
      app = createApp(App);
      app.provide('router', router);
      app.mount(el);
    },
    unmount() {
      app?.unmount();
      app = null;
    },
    async renderToString() {
      const ssrApp = createSSRApp(App);
      ssrApp.provide('router', router);
      return await vueRenderToString(ssrApp);
    }
  };
}
```

## 生命周期

### 应用选择

当路由被匹配时，Router 会确定使用哪个微应用：

1. 使用**第一个**带有 `app` 属性的匹配路由配置
2. 如果 `app` 是 `string`，则从 `router.options.apps` 中查找
3. 如果 `app` 是函数，则直接作为工厂调用

### 应用切换

在具有**不同** `app` 值的路由之间导航时：

```
1. New app factory is called → creates new RouterMicroAppOptions
2. new app.mount(rootElement) → mount into DOM
3. old app.unmount() → clean up previous app
```

在**同一个**应用内导航时（例如 `/react` → `/react/about`）：
- 不会发生 mount/unmount
- 应用通过自身的组件系统处理内部路由

### 强制重启

[`router.restartApp()`](./router#restartapp) 强制执行完整的 unmount → mount 循环，即使 app 键没有改变。

## SSR 流程

在服务端渲染期间：

```ts
// 1. Create router with request context
const router = new Router({
  base: new URL(`http://localhost${req.url}`),
  mode: RouterMode.memory,
  req,
  res,
  routes,
  apps
});

// 2. Navigate to the requested URL
await router.push(req.url);

// 3. Render the micro-app to HTML
const html = await router.renderToString();
```

## 根元素

`RouterOptions` 中的 [`root`](./router#root) 选项决定微应用挂载的位置：

- 如果元素在 DOM 中存在，则复用它
- 如果不存在，则创建一个 `<div>` 并追加到 `document.body`
- [层](./layer) Router 会创建自己带有覆盖层样式的根元素

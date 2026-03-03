---
titleSuffix: "RouterLink API Reference"
description: "Complete guide to @esmx/router RouterLink system — framework-agnostic link resolution with active states, event handling, and navigation types."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router link, RouterLink, navigation link, active class, link resolution, SPA navigation"
---

# RouterLink

`@esmx/router` 通过 [`router.resolveLink()`](./router#resolvelink) 提供了一个框架无关的链接解析系统。它生成构建任何框架链接组件所需的所有数据——包括 HTML 属性、激活状态、CSS 类和事件处理器。

## RouterLinkProps

- **类型定义**：
```ts
interface RouterLinkProps {
  to: RouteLocationInput;
  type?: RouterLinkType;
  exact?: RouteMatchType;
  activeClass?: string;
  event?: string | string[];
  tag?: string;
  layerOptions?: RouteLayerOptions;
  beforeNavigate?: (event: Event, eventName: string) => void;
}
```

### to

- **类型**：`RouteLocationInput`

**必填。** 目标路由。可以是字符串路径或路由位置对象。

```ts
router.resolveLink({ to: '/about' });
router.resolveLink({ to: { path: '/user', query: { id: '1' } } });
```

### type

- **类型**：`RouterLinkType`
- **默认值**：`'push'`

点击链接时使用的导航类型。

- `'push'`：添加到历史栈（默认）
- `'replace'`：替换当前历史条目
- `'pushWindow'`：在新窗口/标签页中打开
- `'replaceWindow'`：替换当前窗口
- `'pushLayer'`：作为[分层/模态框](./layer)打开

### exact

- **类型**：`RouteMatchType`
- **默认值**：`'include'`

如何判定链接的激活状态。

- `'include'`：当前路径以链接路径开头时激活
- `'exact'`：当前路径与链接路径完全匹配时激活
- `'route'`：匹配相同路由配置时激活

### activeClass

- **类型**：`string`
- **默认值**：`'router-link-active'`

链接激活时应用的 CSS 类。

### event

- **类型**：`string | string[]`
- **默认值**：`'click'`

触发导航的 DOM 事件。

### tag

- **类型**：`string`
- **默认值**：`'a'`

要渲染的 HTML 标签。

### layerOptions

- **类型**：`RouteLayerOptions`

当 `type` 为 `'pushLayer'` 时传递的分层选项。参见 [Layer](./layer#routelayeroptions)。

### beforeNavigate

- **类型**：`(event: Event, eventName: string) => void`

导航前调用的钩子。调用 `event.preventDefault()` 可取消导航。

```ts
router.resolveLink({
  to: '/page',
  beforeNavigate: (event, eventName) => {
    if (!confirm('Navigate away?')) {
      event.preventDefault();
    }
  }
});
```

## RouterLinkResolved

`resolveLink()` 的返回结果。

- **类型定义**：
```ts
interface RouterLinkResolved {
  route: Route;
  type: RouterLinkType;
  isActive: boolean;
  isExactActive: boolean;
  isExternal: boolean;
  tag: string;
  attributes: RouterLinkAttributes;
  navigate: (e: Event) => Promise<void>;
  createEventHandlers: (
    format?: (eventType: string) => string
  ) => Record<string, (e: Event) => Promise<void>>;
}
```

### route

目标的已解析 [Route](./route) 对象。

### isActive

如果当前路由与链接目标匹配（基于 `exact` 设置），则为 `true`。

### isExactActive

如果当前路由路径与链接目标路径完全匹配，则为 `true`。

### isExternal

如果链接指向不同的源（外部 URL），则为 `true`。

### attributes

链接元素的 HTML 属性：

- **类型定义**：
```ts
interface RouterLinkAttributes {
  href: string;
  class: string;
  target?: '_blank';
  rel?: string;
}
```

### navigate

- **类型**：`(e: Event) => Promise<void>`

用于编程式导航的函数。智能处理修饰键（Ctrl+点击打开新标签页等）。

### createEventHandlers

- **类型**：`(format?: (eventType: string) => string) => Record<string, (e: Event) => Promise<void>>`

使用框架特定的事件名称格式生成事件处理器。

```ts
// React（驼峰命名事件）
const handlers = linkData.createEventHandlers(
  name => `on${name.charAt(0).toUpperCase() + name.slice(1)}`
);
// → { onClick: (e) => ... }

// Vue / 原生（小写事件）
const handlers = linkData.createEventHandlers();
// → { click: (e) => ... }
```

## CSS 类

链接根据激活状态自动接收 CSS 类：

- `router-link`：始终应用
- `router-link-active`：当 `isActive` 为 `true` 时应用
- `router-link-exact-active`：当 `isExactActive` 为 `true` 时应用

## 框架示例

### 原生 JavaScript

```ts
function createLink(router: Router, to: string, text: string) {
  const { attributes, navigate } = router.resolveLink({ to });

  const a = document.createElement('a');
  a.href = attributes.href;
  a.className = attributes.class;
  a.textContent = text;
  a.addEventListener('click', navigate);

  return a;
}
```

### React

```tsx
function RouterLink({ to, children, type = 'push' }) {
  const linkData = router.resolveLink({ to, type });
  const handlers = linkData.createEventHandlers(
    name => `on${name.charAt(0).toUpperCase() + name.slice(1)}`
  );

  return (
    <a
      href={linkData.attributes.href}
      className={linkData.attributes.class}
      {...handlers}
    >
      {children}
    </a>
  );
}
```

### Vue 3

```vue
<template>
  <component :is="linkData.tag" v-bind="linkData.attributes" v-on="handlers">
    <slot />
  </component>
</template>

<script setup>
const props = defineProps(['to', 'type']);
const router = inject('router');
const linkData = router.resolveLink({ to: props.to, type: props.type });
const handlers = linkData.createEventHandlers();
</script>
```

## 智能导航

`navigate` 函数智能处理浏览器事件：

- **Ctrl+点击 / Cmd+点击**：在新标签页中打开（浏览器默认行为）
- **Shift+点击**：在新窗口中打开（浏览器默认行为）
- **中键点击**：在新标签页中打开（浏览器默认行为）
- **普通点击**：通过路由器进行 SPA 导航

这与用户对标准 `<a>` 标签期望的行为一致。

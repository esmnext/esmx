---
titleSuffix: "RouterLink API 参考"
description: "详细介绍 @esmx/router 链接解析的 API，包括 RouterLinkProps、RouterLinkResolved、链接属性和 React/Vue 事件处理。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, RouterLink, API, 导航链接, 活跃状态, 链接解析, React 路由, Vue 路由"
---

# RouterLink

## 简介

`@esmx/router` 包通过 `router.resolveLink()` 提供框架无关的链接解析系统。此方法生成创建导航链接所需的所有数据，包括 HTML 属性、活跃状态检测和事件处理器。

## 类型定义

### RouterLinkType

- **类型定义**：
```ts
type RouterLinkType =
    | 'push'
    | 'replace'
    | 'pushWindow'
    | 'replaceWindow'
    | 'pushLayer';
```

链接的导航类型：
- `push`：标准前进导航（添加历史记录）
- `replace`：替换当前历史记录
- `pushWindow`：在新浏览器窗口中打开
- `replaceWindow`：替换当前窗口位置
- `pushLayer`：作为图层覆盖层打开

### RouterLinkProps

- **类型定义**：
```ts
interface RouterLinkProps {
    to: RouteLocationInput;
    type?: RouterLinkType;
    replace?: boolean;
    exact?: RouteMatchType;
    activeClass?: string;
    event?: string | string[];
    tag?: string;
    layerOptions?: RouteLayerOptions;
    beforeNavigate?: (event: Event, eventName: string) => void;
}
```

链接配置属性：
- `to`：目标路由位置（字符串或 RouteLocation 对象）
- `type`：导航类型（默认：`'push'`）
- `replace`：_已弃用_ — 请使用 `type='replace'` 替代
- `exact`：活跃状态匹配策略（`'include'` | `'exact'` | `'route'`）
- `activeClass`：活跃状态的自定义 CSS 类名
- `event`：触发导航的事件（默认：`'click'`）
- `tag`：要渲染的 HTML 标签（默认：`'a'`）
- `layerOptions`：当 `type='pushLayer'` 时的图层配置
- `beforeNavigate`：导航前调用的钩子；调用 `event.preventDefault()` 可阻止导航

### RouterLinkResolved

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

解析后的链接数据：
- `route`：目标位置的已解析 Route 对象
- `type`：已解析的导航类型
- `isActive`：链接是否匹配当前路由（基于 `exact` 策略）
- `isExactActive`：链接是否精确匹配当前路由路径
- `isExternal`：链接是否指向外部源
- `tag`：要渲染的 HTML 标签
- `attributes`：HTML 属性对象（href、class、target、rel）
- `navigate`：导航处理函数（遵循修饰键，适当阻止默认行为）
- `createEventHandlers`：创建特定框架事件处理器的工厂方法

### RouterLinkAttributes

- **类型定义**：
```ts
interface RouterLinkAttributes {
    href: string;
    class: string;
    target?: '_blank';
    rel?: string;
}
```

为链接元素生成的 HTML 属性：
- `href`：完整的 href URL
- `class`：CSS 类，包含 `router-link`、`router-link-active` 和 `router-link-exact-active`
- `target`：对于 `pushWindow` 类型的链接设置为 `'_blank'`
- `rel`：新窗口链接设置为 `'noopener noreferrer'`，外部链接设置为 `'external nofollow'`

## 方法

### router.resolveLink()

- **参数**：
  - `props: RouterLinkProps` — 链接配置
- **返回值**：`RouterLinkResolved`

将链接属性解析为完整的链接数据。这是在任何框架中构建导航链接的主要方法。

```ts
const linkData = router.resolveLink({
    to: '/user/123',
    type: 'push',
    exact: 'include',
    activeClass: 'nav-active'
});
```

## CSS 类

链接根据当前路由自动获取 CSS 类：

- `router-link`：始终应用于所有路由链接
- `router-link-active`：当链接匹配当前路由时应用（基于 `exact` 策略）
- `router-link-exact-active`：当链接精确匹配当前路由路径时应用

## 使用示例

### Vue 用法

使用 `@esmx/router-vue`，可以使用 `RouterLink` 组件：

```vue
<template>
  <nav>
    <RouterLink to="/home">首页</RouterLink>
    <RouterLink to="/about" active-class="nav-active">关于</RouterLink>
    <RouterLink :to="{ path: '/user', query: { id: '1' } }">用户</RouterLink>
    <RouterLink to="/settings" type="replace">设置</RouterLink>
  </nav>
</template>
```

### React 手动用法

在 React 中，使用 `router.resolveLink()` 构建链接组件：

```tsx
function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
    const linkData = router.resolveLink({ to, type: 'push' });
    const handlers = linkData.createEventHandlers(
        (name) => `on${name.charAt(0).toUpperCase()}${name.slice(1)}`
    );

    return (
        <a {...linkData.attributes} {...handlers}>
            {children}
        </a>
    );
}
```

### 自定义事件处理

```ts
const linkData = router.resolveLink({
    to: '/dashboard',
    event: ['click', 'touchstart'],
    beforeNavigate: (event, eventName) => {
        // 导航前跟踪分析
        analytics.track('nav_click', { target: '/dashboard' });
    }
});

// 生成自定义命名的事件处理器
const handlers = linkData.createEventHandlers((type) => `on${type}`);
```

### 图层导航链接

```ts
const layerLink = router.resolveLink({
    to: '/select-item',
    type: 'pushLayer',
    layerOptions: {
        autoPush: true,
        keepAlive: 'exact'
    }
});
```

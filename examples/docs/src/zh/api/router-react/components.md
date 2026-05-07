---
titleSuffix: "@esmx/router-react — 组件"
description: "@esmx/router 的 React 组件 — Link 导航组件和 RouterView 用于渲染匹配路由。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-react, Link, RouterView, React 组件, 导航"
---

# 组件

## 简介

`@esmx/router-react` 为 React 应用提供了与 `@esmx/router` 集成的导航和路由渲染组件。本页文档介绍了 `RouterLink` 和 `RouterView` 的使用方法。

## RouterLink

导航链接组件，渲染带有适当导航行为和活跃状态管理的锚元素。等同于 `@esmx/router-vue` 中的 `RouterLink`。

**Props**：

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `to` | `RouteLocationInput` | _必填_ | 目标路由位置（字符串或对象） |
| `type` | `RouterLinkType` | `'push'` | 导航类型 |
| `replace` | `boolean` | — | _已弃用_ — 请使用 `type='replace'` |
| `exact` | `RouteMatchType` | `'include'` | 活跃状态匹配策略 |
| `activeClass` | `string` | — | 活跃状态的自定义 CSS 类 |
| `event` | `string \| string[]` | `'click'` | 触发导航的事件 |
| `tag` | `string` | `'a'` | 要渲染的 HTML 标签 |
| `layerOptions` | `RouteLayerOptions` | — | `type='pushLayer'` 时的层选项 |
| `beforeNavigate` | `Function` | — | 导航前的钩子 |
| `className` | `string` | — | 额外 CSS 类 |
| `style` | `CSSProperties` | — | 内联样式 |
| `children` | `ReactNode` | — | 链接内容 |

### 用法

```tsx
import { RouterLink } from '@esmx/router-react';

// 基础用法
<RouterLink to="/about">关于</RouterLink>

// 替换当前历史记录
<RouterLink to="/login" type="replace">登录</RouterLink>

// 在新窗口打开
<RouterLink to="/external" type="pushWindow">外部链接</RouterLink>

// 自定义标签和样式
<RouterLink to="/submit" tag="button" className="btn" style={{ color: 'red' }}>
    提交
</RouterLink>

// 层导航
<RouterLink to="/dialog" type="pushLayer" layerOptions={{ keepAlive: 'include' }}>
    打开弹层
</RouterLink>
```

## RouterView

在当前嵌套深度渲染匹配的路由组件。通过 React context 支持嵌套路由和自动深度跟踪。等同于 `@esmx/router-vue` 中的 `RouterView`。

### 实现

```tsx
import { createContext, useContext } from 'react';
import { useRoute } from './router-context';

// 嵌套 RouterView 的深度上下文
const DepthContext = createContext(0);

export function useRouterViewDepth(): number {
    return useContext(DepthContext);
}

export function RouterView() {
    const route = useRoute();
    const depth = useContext(DepthContext);

    const matched = route.matched[depth];
    if (!matched) return null;

    const Component = matched.component as React.ComponentType;

    return (
        <DepthContext.Provider value={depth + 1}>
            <Component />
        </DepthContext.Provider>
    );
}
```

### 用法

```tsx
// 根布局
function App({ router }: { router: Router }) {
    return (
        <RouterProvider router={router}>
            <RouterView />
        </RouterProvider>
    );
}

// 父级布局 — 嵌套的 RouterView 渲染子路由
function MainLayout() {
    return (
        <div>
            <nav>
                <RouterLink to="/">首页</RouterLink>
                <RouterLink to="/about">关于</RouterLink>
            </nav>
            <main>
                <RouterView />
            </main>
        </div>
    );
}
```

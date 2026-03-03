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

由于 React 没有专用的 `@esmx/router` 集成包，你需要使用 `router.resolveLink()` 实现导航链接，使用 `route.matched` 实现路由渲染。本页文档记录了推荐的实现模式。

## Link

导航链接组件，渲染带有适当导航行为和活跃状态管理的锚元素。等同于 `@esmx/router-vue` 中的 `RouterLink`。

**Props**：

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `to` | `string` | _必填_ | 目标路由位置 |
| `type` | `RouterLinkType` | `'push'` | 导航类型 |
| `exact` | `RouteMatchType` | `'include'` | 活跃状态匹配策略 |
| `activeClass` | `string` | — | 活跃状态的自定义 CSS 类 |
| `className` | `string` | — | 额外 CSS 类 |
| `children` | `ReactNode` | _必填_ | 链接内容 |

### 实现

```tsx
import type { ReactNode, MouseEvent } from 'react';
import { useRouter, useRoute } from './router-context';

interface LinkProps {
    to: string;
    type?: 'push' | 'replace' | 'pushWindow' | 'replaceWindow' | 'pushLayer';
    exact?: 'route' | 'exact' | 'include';
    activeClass?: string;
    className?: string;
    children: ReactNode;
}

export function Link({
    to,
    type = 'push',
    exact,
    activeClass,
    className,
    children
}: LinkProps) {
    const router = useRouter();
    // 路由变化时触发重新渲染以更新活跃状态
    useRoute();

    const link = router.resolveLink({ to, type, exact, activeClass });

    function handleClick(e: MouseEvent) {
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
        if (link.isExternal) return;

        e.preventDefault();
        link.navigate(e.nativeEvent);
    }

    return (
        <a
            href={link.attributes.href}
            className={[className, link.attributes.class].filter(Boolean).join(' ')}
            target={link.attributes.target}
            rel={link.attributes.rel}
            onClick={handleClick}
        >
            {children}
        </a>
    );
}
```

### 用法

```tsx
<Link to="/">首页</Link>
<Link to="/about" activeClass="nav-active">关于</Link>
<Link to="/docs" type="pushWindow">文档</Link>
<Link to="/dashboard" exact="exact">仪表盘</Link>
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
                <Link to="/">首页</Link>
                <Link to="/about">关于</Link>
            </nav>
            <main>
                <RouterView />
            </main>
        </div>
    );
}
```

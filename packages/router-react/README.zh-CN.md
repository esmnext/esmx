<div align="center">
  <img src="https://esmx.dev/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>@esmx/router-react</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/@esmx/router-react">
      <img src="https://img.shields.io/npm/v/@esmx/router-react.svg" alt="npm version" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="Build" />
    </a>
    <a href="https://esmx.dev/coverage/">
      <img src="https://img.shields.io/badge/coverage-live%20report-brightgreen" alt="Coverage Report" />
    </a>
    <a href="https://nodejs.org/">
      <img src="https://img.shields.io/node/v/@esmx/router-react.svg" alt="node version" />
    </a>
    <a href="https://bundlephobia.com/package/@esmx/router-react">
      <img src="https://img.shields.io/bundlephobia/minzip/@esmx/router-react" alt="size" />
    </a>
  </div>
  
  <p><a href="https://github.com/esmnext/esmx/tree/master/packages/router">@esmx/router</a> 的 React 集成 - 支持 React 18+ 的强大路由器，使用现代 hooks 和 context 模式。</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/router-react/README.md">English</a> | 中文
  </p>
</div>

## 🚀 特性

✨ **React 18+ 支持** - 专为 React 18 和 19 设计，支持 hooks 和并发特性
🎯 **Hooks 优先** - 现代化的基于 hooks 的 API，包含 `useRouter`、`useRoute`、`useLink`
🔗 **无缝集成** - 与 @esmx/router 核心库无缝协作
🚀 **TypeScript 就绪** - 完整的 TypeScript 支持，出色的开发体验
⚡ **高性能** - 使用 `useSyncExternalStore` 实现最优重渲染
🔄 **SSR 兼容** - 开箱即用的服务端渲染支持
📦 **轻量级** - 极小的包体积，零依赖（除 peer deps 外）
🔧 **纯 TypeScript** - 无需 JSX，使用 React.createElement 以获得最大兼容性

## 📦 安装

```bash
# npm
npm install @esmx/router @esmx/router-react

# pnpm
pnpm add @esmx/router @esmx/router-react

# yarn
yarn add @esmx/router @esmx/router-react
```

## 🚀 快速开始

```tsx
import { Router, RouterMode } from '@esmx/router';
import { RouterProvider, RouterView, RouterLink } from '@esmx/router-react';

// 定义路由
const routes = [
  { path: '/', component: () => import('./views/Home') },
  { path: '/about', component: () => import('./views/About') },
  { path: '/users/:id', component: () => import('./views/UserProfile') }
];

// 创建路由器实例
const router = new Router({ 
  routes,
  mode: RouterMode.history
});

// 使用 RouterProvider 包裹应用
function App() {
  return (
    <RouterProvider router={router}>
      <nav>
        <RouterLink to="/">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>
        <RouterLink to="/users/123">用户资料</RouterLink>
      </nav>
      
      <RouterView />
    </RouterProvider>
  );
}

export default App;
```

## 📚 API 参考

### 组件

#### RouterProvider

为 React 组件树提供路由器上下文。必须包裹应用组件。

```tsx
import { Router } from '@esmx/router';
import { RouterProvider } from '@esmx/router-react';

const router = new Router({ routes });

function App() {
  return (
    <RouterProvider router={router}>
      {/* 应用组件 */}
    </RouterProvider>
  );
}
```

**Props：**

| 属性 | 类型 | 必填 | 说明 |
|------|------|----------|-------------|
| `router` | `Router` | 是 | @esmx/router 的路由器实例 |
| `children` | `ReactNode` | 是 | 子组件 |

#### RouterView

渲染匹配的路由组件。支持嵌套路由，自动追踪深度。

```tsx
import { RouterView } from '@esmx/router-react';

function Layout() {
  return (
    <div>
      <header>我的应用</header>
      <RouterView />
      <footer>页脚</footer>
    </div>
  );
}
```

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `fallback` | `ReactNode \| ComponentType` | - | 无匹配路由时的回退内容 |

**嵌套路由示例：**

```tsx
// 路由配置
const routes = [
  {
    path: '/users',
    component: UsersLayout,
    children: [
      { path: '', component: UsersList },
      { path: ':id', component: UserProfile }
    ]
  }
];

// UsersLayout.tsx - 包含嵌套的 RouterView
function UsersLayout() {
  return (
    <div>
      <h1>用户管理</h1>
      <RouterView /> {/* 渲染 UsersList 或 UserProfile */}
    </div>
  );
}
```

#### RouterLink

创建导航链接的组件，支持激活状态管理。

```tsx
import { RouterLink } from '@esmx/router-react';

function Navigation() {
  return (
    <nav>
      {/* 基础链接 */}
      <RouterLink to="/home">首页</RouterLink>
      
      {/* 使用对象形式的位置 */}
      <RouterLink to={{ path: '/search', query: { q: 'react' } }}>
        搜索
      </RouterLink>
      
      {/* 替换导航 */}
      <RouterLink to="/login" type="replace">登录</RouterLink>
      
      {/* 在新窗口打开 */}
      <RouterLink to="/docs" type="pushWindow">文档 ↗</RouterLink>
      
      {/* 自定义激活样式 */}
      <RouterLink 
        to="/dashboard" 
        activeClass="nav-active"
        exact="exact"
      >
        仪表盘
      </RouterLink>
      
      {/* 自定义标签 */}
      <RouterLink to="/submit" tag="button" className="btn">
        提交
      </RouterLink>
    </nav>
  );
}
```

**Props：**

| 属性 | 类型 | 默认值 | 说明 |
|------|------|---------|-------------|
| `to` | `string \| RouteLocationInput` | - | 目标路由位置 |
| `type` | `RouterLinkType` | `'push'` | 导航类型 |
| `exact` | `RouteMatchType` | `'include'` | 激活匹配模式 |
| `activeClass` | `string` | - | 激活状态的 CSS 类 |
| `event` | `string \| string[]` | `'click'` | 触发导航的事件 |
| `tag` | `string` | `'a'` | 渲染的 HTML 标签 |
| `layerOptions` | `RouterLayerOptions` | - | 层级导航选项 |
| `beforeNavigate` | `function` | - | 导航前回调 |
| `children` | `ReactNode` | - | 链接内容 |
| `className` | `string` | - | 额外的 CSS 类 |
| `style` | `CSSProperties` | - | 内联样式 |

**导航类型：**

- `'push'` - 添加到历史记录栈（默认）
- `'replace'` - 替换当前历史记录
- `'pushWindow'` - 在新窗口/标签页打开
- `'replaceWindow'` - 替换当前窗口位置
- `'pushLayer'` - 在层级中打开（模态框/对话框路由）

### Hooks

#### useRouter()

获取路由器实例，用于编程式导航。

```tsx
import { useRouter } from '@esmx/router-react';

function NavigationControls() {
  const router = useRouter();

  const goHome = () => router.push('/');
  const goBack = () => router.back();
  const goForward = () => router.forward();

  const goToUser = (id: string) => {
    router.push({
      path: '/users/:id',
      params: { id }
    });
  };

  const replaceRoute = () => {
    router.replace('/login');
  };

  return (
    <div>
      <button onClick={goHome}>首页</button>
      <button onClick={goBack}>后退</button>
      <button onClick={goForward}>前进</button>
      <button onClick={() => goToUser('123')}>用户 123</button>
      <button onClick={replaceRoute}>登录（替换）</button>
    </div>
  );
}
```

#### useRoute()

获取当前路由信息（响应式）。

```tsx
import { useRoute } from '@esmx/router-react';
import { useEffect } from 'react';

function CurrentRoute() {
  const route = useRoute();

  useEffect(() => {
    console.log('路由变更:', route.path);
    document.title = route.meta?.title || '我的应用';
  }, [route.path, route.meta?.title]);

  return (
    <div>
      <p>路径: {route.path}</p>
      <p>参数: {JSON.stringify(route.params)}</p>
      <p>查询: {JSON.stringify(route.query)}</p>
      <p>哈希: {route.hash}</p>
      <p>元数据: {JSON.stringify(route.meta)}</p>
    </div>
  );
}
```

#### useLink()

创建响应式链接辅助函数，用于自定义导航组件。

```tsx
import { useLink } from '@esmx/router-react';

interface CustomNavButtonProps {
  to: string;
  children: React.ReactNode;
}

function CustomNavButton({ to, children }: CustomNavButtonProps) {
  const link = useLink({ to, type: 'push', exact: 'include' });

  return (
    <button
      onClick={(e) => link.navigate(e)}
      className={`nav-button ${link.isActive ? 'active' : ''}`}
      aria-current={link.isExactActive ? 'page' : undefined}
    >
      {children}
      {link.isExternal && <span>↗</span>}
    </button>
  );
}
```

**返回值 (`RouterLinkResolved`)：**

| 属性 | 类型 | 说明 |
|----------|------|-------------|
| `route` | `Route` | 解析后的路由对象 |
| `type` | `RouterLinkType` | 导航类型 |
| `isActive` | `boolean` | 链接是否匹配当前路由 |
| `isExactActive` | `boolean` | 链接是否精确匹配当前路由 |
| `isExternal` | `boolean` | 链接是否指向外部地址 |
| `tag` | `string` | HTML 标签 |
| `attributes` | `RouterLinkAttributes` | HTML 属性（href、class、target、rel） |
| `navigate` | `(e: Event) => Promise<void>` | 导航函数 |
| `createEventHandlers` | `function` | 生成事件处理函数 |

#### useRouterViewDepth()

获取当前 RouterView 深度（用于高级嵌套路由场景）。

```tsx
import { useRouterViewDepth } from '@esmx/router-react';

function DebugView() {
  const depth = useRouterViewDepth();
  
  return <div>当前深度: {depth}</div>;
}
```

### Context

#### RouterContext

直接访问路由器上下文（用于高级场景）。

```tsx
import { RouterContext } from '@esmx/router-react';
import { useContext } from 'react';

function CustomRouterConsumer() {
  const context = useContext(RouterContext);
  
  if (!context) {
    return <div>不在 RouterProvider 内部</div>;
  }
  
  const { router, route } = context;
  // 直接使用 router 和 route
}
```

## 高级用法

### 路由守卫

```tsx
import { useRouter, useRoute } from '@esmx/router-react';
import { useEffect } from 'react';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const route = useRoute();

  useEffect(() => {
    // 注册 beforeEach 守卫
    const unregister = router.beforeEach((to, from) => {
      if (to.meta?.requiresAuth && !isAuthenticated()) {
        return '/login';
      }
    });

    return () => unregister();
  }, [router]);

  return <>{children}</>;
}
```

### SSR 集成

```tsx
import { Router, RouterMode } from '@esmx/router';
import { RouterProvider, RouterView } from '@esmx/router-react';
import { renderToString } from 'react-dom/server';

async function renderApp(url: string) {
  const router = new Router({
    routes,
    mode: RouterMode.history,
    url // 传入请求 URL
  });

  // 等待路由解析
  await router.push(url);

  const html = renderToString(
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  );

  return html;
}
```

### 自定义链接组件

```tsx
import { useLink } from '@esmx/router-react';
import { forwardRef, type AnchorHTMLAttributes } from 'react';

interface NavLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  icon?: React.ReactNode;
  badge?: number;
}

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ to, icon, badge, children, className, ...props }, ref) => {
    const link = useLink({ to, exact: 'include' });

    return (
      <a
        ref={ref}
        href={link.attributes.href}
        onClick={(e) => {
          e.preventDefault();
          link.navigate(e);
        }}
        className={`nav-link ${link.isActive ? 'active' : ''} ${className || ''}`}
        aria-current={link.isExactActive ? 'page' : undefined}
        {...props}
      >
        {icon && <span className="nav-icon">{icon}</span>}
        <span className="nav-label">{children}</span>
        {badge !== undefined && badge > 0 && (
          <span className="nav-badge">{badge}</span>
        )}
      </a>
    );
  }
);

NavLink.displayName = 'NavLink';
```

## TypeScript 支持

本包提供完整的 TypeScript 支持。所有类型都已导出并正确文档化。

```tsx
import type {
  RouterContextValue,
  RouterProviderProps,
  RouterViewProps,
  RouterLinkComponentProps
} from '@esmx/router-react';

import type {
  Route,
  Router,
  RouterLinkProps,
  RouterLinkResolved,
  RouteLocationInput
} from '@esmx/router';
```

## 浏览器支持

- 支持 ES 模块（`import`/`export`）和 React 18+ 的现代浏览器
- Chrome 64+, Firefox 67+, Safari 11.1+, Edge 79+

## 贡献

欢迎贡献！请随时提交 issue 和 pull request。

## 📄 许可证

MIT © [Esmx Team](https://github.com/esmnext/esmx)

## 相关包

- [@esmx/router](https://github.com/esmnext/esmx/tree/master/packages/router) - 核心路由包
- [@esmx/router-vue](https://github.com/esmnext/esmx/tree/master/packages/router-vue) - Vue 集成
- [@esmx/core](https://github.com/esmnext/esmx/tree/master/packages/core) - Esmx 核心框架

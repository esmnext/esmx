---
titleSuffix: "Error Handling"
description: "Learn how to handle navigation errors in @esmx/router — error types, catching errors from push/replace, and best practices for guard error handling."
head:
  - - "meta"
    - name: "keywords"
      content: "route errors, navigation errors, RouteError, RouteTaskCancelledError, RouteNavigationAbortedError, RouteSelfRedirectionError, error handling"
---

# 错误处理

`@esmx/router` 中的导航可能由于多种原因失败——守卫阻止了过渡、异步组件加载失败，或者更新的导航取代了当前导航。Router 提供了结构化的错误层级，以便你能够恰当地处理每种情况。

## 错误类型

所有路由错误都继承自 `RouteError` 基类。每种错误类型都有一个特定的 `code` 来标识失败原因。

### RouteError（基类）

所有路由错误的基类。每个路由错误都具有以下属性：

```ts
class RouteError extends Error {
  readonly code: string;     // Error code identifier
  readonly to: Route;        // The target route of the failed navigation
  readonly from: Route | null; // The route we were navigating from
}
```

- **`message`**: `string` — 人类可读的错误描述
- **`code`**: `string` — 机器可读的错误代码
- **`to`**: `Route` — 正在导航到的目标路由
- **`from`**: `Route | null` — 正在离开的路由（初始导航时为 `null`）

### RouteTaskCancelledError

**代码:** `ROUTE_TASK_CANCELLED`

当导航因**更新的导航**在当前导航完成前启动而被取消时抛出。这在用户快速点击的应用中是正常和预期的：

```ts
// User clicks rapidly:
router.push('/page-1'); // → RouteTaskCancelledError (superseded)
router.push('/page-2'); // → RouteTaskCancelledError (superseded)
router.push('/page-3'); // → completes successfully
```

此错误有一个额外属性：

- **`taskName`**: `string` — 被取消时正在运行的守卫/任务名称

在大多数情况下，你可以安全地忽略此错误——它只是意味着用户改变了主意：

```ts
try {
  await router.push('/slow-page');
} catch (error) {
  if (error instanceof RouteTaskCancelledError) {
    return;
  }
  throw error;
}
```

### RouteTaskExecutionError

**代码:** `ROUTE_TASK_EXECUTION_ERROR`

当守卫或异步组件在执行期间**抛出错误**时触发：

```ts
// A guard that throws
router.beforeEach(async (to) => {
  const user = await fetchUser();
});

// An async component that fails to load
{
  path: '/dashboard',
  asyncComponent: () => import('./Dashboard')
}
```

此错误封装了原始错误并提供访问：

- **`taskName`**: `string` — 抛出错误的守卫/任务名称
- **`originalError`**: `Error` — 被抛出的原始错误

```ts
try {
  await router.push('/dashboard');
} catch (error) {
  if (error instanceof RouteTaskExecutionError) {
    console.error('Guard/component failed:', error.originalError.message);
    console.error('Failed during:', error.taskName);
  }
}
```

### RouteNavigationAbortedError

**代码:** `ROUTE_NAVIGATION_ABORTED`

当导航守卫明确**返回 `false`** 以阻止导航时抛出：

```ts
{
  path: '/editor',
  beforeLeave: (to, from, router) => {
    if (hasUnsavedChanges()) {
      const confirmed = confirm('Discard changes?');
      if (!confirmed) return false;
    }
  }
}
```

- **`taskName`**: `string` — 中止导航的守卫名称

```ts
try {
  await router.push('/other-page');
} catch (error) {
  if (error instanceof RouteNavigationAbortedError) {
    console.log('Navigation was blocked by:', error.taskName);
    // User chose not to navigate — stay on current page
  }
}
```

### RouteSelfRedirectionError

**代码:** `ROUTE_SELF_REDIRECTION`

当守卫导致**无限重定向循环**——重定向到正在导航的同一路由时抛出：

```ts
router.beforeEach((to) => {
  if (!isLoggedIn()) return '/login';
});
```

修复方法是在重定向前检查目标路由：

```ts
router.beforeEach((to) => {
  if (!isLoggedIn() && to.path !== '/login') {
    return '/login';
  }
});
```

## 捕获错误

### 从 `router.push` / `router.replace` 中捕获

每个导航方法都返回一个在出错时 reject 的 `Promise`：

```ts
try {
  await router.push('/protected-page');
} catch (error) {
  if (error instanceof RouteNavigationAbortedError) {
    showNotification('You need permission to access this page');
  } else if (error instanceof RouteTaskCancelledError) {
    // Another navigation started — ignore silently
  } else if (error instanceof RouteTaskExecutionError) {
    showError(`Navigation failed: ${error.originalError.message}`);
  } else if (error instanceof RouteSelfRedirectionError) {
    console.error('Redirect loop:', error.message);
  }
}
```

### 类型检查错误

你可以通过 `instanceof` 或 `code` 属性检查错误：

```ts
if (error instanceof RouteTaskCancelledError) { /* ... */ }

if (error instanceof RouteError && error.code === 'ROUTE_TASK_CANCELLED') { /* ... */ }
```

- `RouteTaskCancelledError`: `ROUTE_TASK_CANCELLED`
- `RouteTaskExecutionError`: `ROUTE_TASK_EXECUTION_ERROR`
- `RouteNavigationAbortedError`: `ROUTE_NAVIGATION_ABORTED`
- `RouteSelfRedirectionError`: `ROUTE_SELF_REDIRECTION`

## 最佳实践

### 1. 始终处理导航错误

不要在生产环境中对导航调用使用 fire-and-forget。未处理的来自失败导航的 Promise rejection 可能导致应用崩溃：

```ts
// ❌ Bad — unhandled rejection if guard blocks navigation
router.push('/admin');

// ✅ Good — handle the error
router.push('/admin').catch((error) => {
  if (error instanceof RouteNavigationAbortedError) {
    // Expected — guard blocked access
  } else {
    console.error('Unexpected navigation error:', error);
  }
});
```

### 2. 忽略取消错误

`RouteTaskCancelledError` 几乎总是无害的。创建一个辅助函数来过滤它：

```ts
async function safeNavigate(to: string) {
  try {
    return await router.push(to);
  } catch (error) {
    if (error instanceof RouteTaskCancelledError) {
      return null;
    }
    throw error;
  }
}
```

### 3. 守卫错误恢复

当守卫意外抛出错误时，捕获它并重定向到错误页面，而不是让用户卡住：

```ts
router.beforeEach(async (to) => {
  try {
    await validateAccess(to);
  } catch (error) {
    console.error('Access validation failed:', error);
    return { path: '/error', statusCode: 500 };
  }
});
```

### 4. 防止守卫中的自重定向

在重定向前始终检查目标路由，以避免无限循环：

```ts
// ❌ Bad — infinite loop when user navigates to /login
router.beforeEach((to) => {
  if (!isLoggedIn()) return '/login';
});

// ✅ Good — skip redirect when already heading to /login
router.beforeEach((to) => {
  if (!isLoggedIn() && to.path !== '/login') {
    return '/login';
  }
});
```

### 5. 包装异步组件加载

如果你的异步组件可能失败（网络问题、部署变更），请优雅地处理错误：

```ts
{
  path: '/dashboard',
  asyncComponent: async () => {
    try {
      return await import('./Dashboard.vue');
    } catch (error) {
      console.error('Failed to load Dashboard:', error);
      return import('./ErrorPage.vue');
    }
  }
}
```

## 完整示例

```ts
import {
  Router,
  RouterMode,
  RouteError,
  RouteTaskCancelledError,
  RouteTaskExecutionError,
  RouteNavigationAbortedError,
  RouteSelfRedirectionError
} from '@esmx/router';

const router = new Router({
  mode: RouterMode.history,
  routes: [
    { path: '/', component: Home },
    {
      path: '/admin',
      component: Admin,
      meta: { requiresAuth: true },
      beforeEnter: async (to) => {
        const user = await fetchUser();
        if (!user) return '/login';
        if (!user.isAdmin) return false;
      }
    },
    {
      path: '/reports',
      asyncComponent: () => import('./Reports.vue')
    },
    { path: '/login', component: Login }
  ]
});

// Global error-aware navigation helper
async function navigate(to: string): Promise<void> {
  try {
    await router.push(to);
  } catch (error) {
    if (error instanceof RouteTaskCancelledError) {
      return;
    }

    if (error instanceof RouteNavigationAbortedError) {
      showToast('Access denied');
      return;
    }

    if (error instanceof RouteTaskExecutionError) {
      showToast(`Navigation failed: ${error.originalError.message}`);
      await router.replace('/error').catch(() => {});
      return;
    }

    if (error instanceof RouteSelfRedirectionError) {
      console.warn('Redirect loop detected:', error.message);
      return;
    }

    // Unexpected error — rethrow
    throw error;
  }
}
```

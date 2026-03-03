---
titleSuffix: "Navigation Guards API Reference"
description: "Complete guide to @esmx/router navigation guards — global guards, per-route guards, and the full navigation pipeline that controls route transitions."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx navigation guards, route guards, beforeEach, afterEach, beforeEnter, beforeLeave, route transition pipeline"
---

# 导航守卫

导航守卫是拦截路由过渡的钩子。它们可以重定向、取消或允许导航。守卫按照严格的管线顺序执行，让你对每次路由变化都拥有细粒度的控制。

## 守卫类型

### RouteConfirmHook

可以修改导航流程的守卫钩子。

- **类型定义**：
```ts
type RouteConfirmHook = (
  to: Route,
  from: Route | null,
  router: Router
) => Awaitable<RouteConfirmHookResult>;
```

#### 返回值

- `void` / `undefined`：继续执行下一个守卫
- `false`：取消导航
- `string`：重定向到该路径
- `RouteLocationInput`：重定向到该位置
- `RouteHandleHook`：作为最终处理器执行

### RouteNotifyHook

导航后钩子。不能修改导航——仅用于副作用。

- **类型定义**：
```ts
type RouteNotifyHook = (
  to: Route,
  from: Route | null,
  router: Router
) => void;
```

## 全局守卫

### beforeEach

注册在路由器实例上。在每次导航之前运行。返回一个移除已注册守卫的函数。

```ts
// 认证守卫
const remove = router.beforeEach((to, from, router) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return '/login';
  }
});

// 之后移除守卫
remove();
```

### afterEach

在每次完成的导航之后运行。不能影响导航。

```ts
router.afterEach((to, from) => {
  document.title = to.meta.title || 'My App';
  analytics.pageView(to.path);
});
```

## 单路由守卫

直接定义在 [`RouteConfig`](./route-config) 上。

### beforeEnter

当**从不同路由**进入时调用。如果用户已在此路由上不会调用（参数变化时使用 `beforeUpdate`）。

```ts
{
  path: '/admin',
  beforeEnter: (to, from, router) => {
    if (!hasRole('admin')) {
      return { path: '/403', statusCode: 403 };
    }
  }
}
```

### beforeUpdate

当**相同路由**被复用但参数发生变化时调用。例如，从 `/user/1` 导航到 `/user/2`。

```ts
{
  path: '/user/:id',
  beforeUpdate: (to, from, router) => {
    console.log(`User changed: ${from?.params.id} → ${to.params.id}`);
  }
}
```

### beforeLeave

离开路由前调用。返回 `false` 可阻止导航。

```ts
{
  path: '/editor',
  beforeLeave: (to, from, router) => {
    if (hasUnsavedChanges()) {
      const confirmed = window.confirm('Discard changes?');
      if (!confirmed) return false;
    }
  }
}
```

## 导航管线

每次导航都经过严格的守卫序列。具体管线取决于导航类型。

### 标准导航（push / replace）

```
1. fallback        → 处理未匹配的路由（404）
2. override        → 路由覆写（混合应用桥接）
3. asyncComponent  → 加载懒加载组件
4. beforeLeave     → 单路由守卫：离开当前路由
5. beforeEnter     → 单路由守卫：进入新路由
6. beforeUpdate    → 单路由守卫：相同路由，不同参数
7. beforeEach      → 全局守卫：所有已注册的 beforeEach 守卫
8. confirm         → 执行导航（更新历史 + 挂载应用）
   └─ afterEach    → 全局钩子：导航后钩子
```

### 窗口导航（pushWindow / replaceWindow）

```
1. fallback
2. override
3. beforeEach
4. confirm → 委托给 fallback 处理器
```

### 分层导航（pushLayer）

```
1. fallback
2. override
3. beforeEach
4. confirm → 创建分层路由器
```

### 重启应用（restartApp）

```
1. fallback
2. beforeLeave
3. beforeEach
4. beforeUpdate
5. beforeEnter
6. asyncComponent
7. confirm → 强制重新挂载微应用
```

## 管线行为

### 短路

任何守卫返回非 void 结果都会**停止管线**。剩余的守卫将被跳过。

```ts
router.beforeEach((to) => {
  if (to.path === '/forbidden') {
    return false; // 管线在此停止
  }
  // 返回 void → 继续下一个守卫
});
```

### 重定向链

当守卫返回重定向时，整个管线会为新目标**重新启动**：

```ts
router.beforeEach((to) => {
  if (to.path === '/old') return '/new';
  // 导航到 /old → 管线为 /new 重新启动
});
```

### 异步守卫

所有守卫支持 `async`/`Promise`。管线在继续之前会等待每个守卫完成。

```ts
router.beforeEach(async (to) => {
  const user = await fetchCurrentUser();
  if (!user && to.meta.requiresAuth) {
    return '/login';
  }
});
```

### 任务取消

如果在守卫仍在运行时启动新的导航，前一个导航会通过内部的 `RouteTaskController` **自动取消**。被取消的导航会抛出 `RouteTaskCancelledError`。

```ts
// 用户快速点击：
router.push('/page-1'); // 已启动，然后被取消
router.push('/page-2'); // 已启动，然后被取消
router.push('/page-3'); // 这个会完成
```

## 完整示例

```ts
const router = new Router({
  routes: [
    {
      path: '/',
      component: Home
    },
    {
      path: '/dashboard',
      meta: { requiresAuth: true },
      beforeEnter: async (to) => {
        const perms = await fetchPermissions();
        if (!perms.canViewDashboard) return '/unauthorized';
      },
      children: [
        { path: '', component: DashboardHome },
        {
          path: 'settings',
          component: Settings,
          beforeLeave: () => {
            if (hasUnsavedChanges()) return false;
          }
        }
      ]
    },
    {
      path: '/user/:id',
      component: UserProfile,
      beforeUpdate: (to, from) => {
        store.loadUser(to.params.id);
      }
    }
  ]
});

// 全局守卫
router.beforeEach((to) => {
  if (to.meta.requiresAuth && !isLoggedIn()) {
    return '/login';
  }
});

router.afterEach((to) => {
  document.title = `${to.meta.title || 'App'} | My Site`;
});
```

---
titleSuffix: "导航守卫 API 参考"
description: "详细介绍 @esmx/router 导航守卫的 API，包括守卫类型、生命周期钩子、守卫执行顺序和使用示例。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 导航守卫, API, 路由钩子, beforeEach, afterEach, beforeEnter, 路由生命周期"
---

# 导航守卫

## 简介

`@esmx/router` 中的导航守卫提供了路由过渡过程中的钩子，允许你控制导航、执行检查、重定向用户或在路由变更的不同阶段执行副作用。

## 类型定义

### RouteConfirmHook

- **类型定义**：
```ts
type RouteConfirmHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<RouteConfirmHookResult>;
```

确认守卫，可以批准、拒绝或重定向导航。用于 `beforeEach()` 和 `beforeEnter`。

### RouteConfirmHookResult

- **类型定义**：
```ts
type RouteConfirmHookResult =
    | void
    | false
    | RouteLocationInput
    | RouteHandleHook;
```

确认守卫的返回值：
- `void` 或 `undefined`：允许导航继续
- `false`：取消导航
- `RouteLocationInput`：重定向到不同位置
- `RouteHandleHook`：为路由提供自定义处理函数

### RouteNotifyHook

- **类型定义**：
```ts
type RouteNotifyHook = (
    to: Route,
    from: Route | null,
    router: Router
) => void;
```

导航完成后调用的通知钩子。不能取消或重定向导航。用于 `afterEach()`。

### RouteVerifyHook

- **类型定义**：
```ts
type RouteVerifyHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<boolean>;
```

返回布尔值的验证钩子。用于图层的保活逻辑。

### RouteHandleHook

- **类型定义**：
```ts
type RouteHandleHook = (
    to: Route,
    from: Route | null,
    router: Router
) => Awaitable<RouteHandleResult>;
```

用于自定义路由处理逻辑的处理钩子。每次导航只能调用一次。

### RouteHandleResult

- **类型定义**：
```ts
type RouteHandleResult = unknown | null | void;
```

处理钩子的返回类型。结果可通过 `route.handleResult` 访问。

## 全局守卫

### router.beforeEach()

- **参数**：
  - `guard: RouteConfirmHook` — 守卫函数
- **返回值**：`() => void` — 取消注册函数

注册全局前置守卫，在每次导航前调用。守卫按注册顺序调用。如果任何守卫取消或重定向，后续守卫将被跳过。

```ts
// 认证守卫
const unregister = router.beforeEach((to, from, router) => {
    if (to.meta.requiresAuth && !isAuthenticated()) {
        return '/login';
    }
});

// 权限守卫
router.beforeEach((to, from, router) => {
    if (to.meta.role && !hasRole(to.meta.role)) {
        return false; // 取消导航
    }
});
```

### router.afterEach()

- **参数**：
  - `guard: RouteNotifyHook` — 钩子函数
- **返回值**：`() => void` — 取消注册函数

注册全局后置钩子，在每次导航完成后调用。后置钩子不能影响导航——它们纯粹用于副作用，如分析、标题更新或日志记录。

```ts
router.afterEach((to, from, router) => {
    // 更新页面标题
    document.title = to.meta.title || '我的应用';

    // 跟踪页面浏览
    analytics.pageView(to.path);
});
```

## 路由级守卫

### beforeEnter

- **类型**：`RouteConfirmHook`

进入特定路由前调用的守卫。在路由配置中定义。

```ts
const routes = [
    {
        path: '/admin',
        component: AdminPanel,
        beforeEnter: (to, from, router) => {
            if (!isAdmin()) {
                return '/unauthorized';
            }
        }
    }
];
```

### beforeUpdate

- **类型**：`RouteConfirmHook`

当路由被复用但参数改变时调用的守卫（例如从 `/user/1` 导航到 `/user/2`）。

```ts
{
    path: '/user/:id',
    component: UserDetail,
    beforeUpdate: (to, from, router) => {
        // 当 :id 改变时调用
        console.log('用户从', from?.params.id, '变为', to.params.id);
    }
}
```

### beforeLeave

- **类型**：`RouteConfirmHook`

离开特定路由前调用的守卫。适用于在有未保存更改时阻止导航。

```ts
{
    path: '/editor',
    component: Editor,
    beforeLeave: (to, from, router) => {
        if (hasUnsavedChanges()) {
            const confirmed = window.confirm('你有未保存的更改。确定离开吗？');
            if (!confirmed) return false;
        }
    }
}
```

## 守卫执行顺序

当导航发生时，守卫按以下顺序执行：

1. 正在离开的路由上的 **beforeLeave** 守卫
2. **全局 beforeEach** 守卫（按注册顺序）
3. 复用路由上的 **beforeUpdate** 守卫
4. 目标路由配置上的 **beforeEnter** 守卫
5. 导航执行
6. **全局 afterEach** 钩子（按注册顺序）

```ts
// 展示执行顺序的示例
const router = new Router({
    routes: [
        {
            path: '/a',
            component: A,
            beforeLeave: () => console.log('1. beforeLeave /a'),
            beforeEnter: () => console.log('4. beforeEnter /a')
        },
        {
            path: '/b',
            component: B,
            beforeEnter: () => console.log('4. beforeEnter /b')
        }
    ]
});

router.beforeEach(() => console.log('2-3. 全局 beforeEach'));
router.afterEach(() => console.log('6. 全局 afterEach'));

// 从 /a 导航到 /b：
// 1. beforeLeave /a
// 2-3. 全局 beforeEach
// 4. beforeEnter /b
// （导航执行）
// 6. 全局 afterEach
```

## 守卫清理

所有守卫注册方法都返回一个取消注册函数。调用它可以移除守卫：

```ts
const unregister = router.beforeEach((to) => {
    // 守卫逻辑
});

// 稍后移除守卫
unregister();
```

这在基于组件的框架中尤为重要，在组件生命周期钩子中注册的守卫应在组件卸载时清理。

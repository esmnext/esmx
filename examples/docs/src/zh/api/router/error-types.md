---
titleSuffix: "错误类型 API 参考"
description: "详细介绍 @esmx/router 错误类型的 API，包括 RouteError、任务取消、执行错误、导航中止和自重定向错误。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, RouteError, API, 错误处理, 导航错误, 路由错误, 任务取消"
---

# 错误类型

## 简介

`@esmx/router` 为不同的路由失败场景提供了一组错误类层次结构。所有路由错误都继承自基类 `RouteError`，便于捕获和处理特定的错误类型。

## 类型定义

### RouteError

- **类型定义**：
```ts
class RouteError extends Error {
    public readonly code: string;
    public readonly to: Route;
    public readonly from: Route | null;

    constructor(
        message: string,
        code: string,
        to: Route,
        from: Route | null
    );
}
```

所有路由相关错误的基类。

**属性**：
- `name`：`'RouteError'`
- `code`：标识错误类型的错误码字符串
- `to`：错误发生时的目标 Route 对象
- `from`：来源 Route 对象（初始导航时可能为 `null`）
- `message`：人类可读的错误描述

```ts
import { RouteError } from '@esmx/router';

try {
    await router.push('/target');
} catch (error) {
    if (error instanceof RouteError) {
        console.log('路由错误：', error.code);
        console.log('目标：', error.to.path);
        console.log('来源：', error.from?.path);
    }
}
```

### RouteTaskCancelledError

- **类型定义**：
```ts
class RouteTaskCancelledError extends RouteError {
    public readonly taskName: string;

    constructor(
        taskName: string,
        to: Route,
        from: Route | null
    );
}
```

当路由任务被取消时抛出，通常是因为在当前导航完成前触发了新的导航。

**属性**：
- `name`：`'RouteTaskCancelledError'`
- `code`：`'ROUTE_TASK_CANCELLED'`
- `taskName`：被取消的任务名称

```ts
import { RouteTaskCancelledError } from '@esmx/router';

try {
    await router.push('/slow-page');
} catch (error) {
    if (error instanceof RouteTaskCancelledError) {
        console.log(`任务 "${error.taskName}" 已被取消`);
        // 这是正常的 — 另一个导航替换了这个
    }
}
```

### RouteTaskExecutionError

- **类型定义**：
```ts
class RouteTaskExecutionError extends RouteError {
    public readonly taskName: string;
    public readonly originalError: Error;

    constructor(
        taskName: string,
        to: Route,
        from: Route | null,
        originalError?: unknown
    );
}
```

当路由任务（如守卫或处理钩子）在执行过程中抛出错误时抛出。

**属性**：
- `name`：`'RouteTaskExecutionError'`
- `code`：`'ROUTE_TASK_EXECUTION_ERROR'`
- `taskName`：失败的任务名称
- `originalError`：导致失败的原始错误

```ts
import { RouteTaskExecutionError } from '@esmx/router';

try {
    await router.push('/page');
} catch (error) {
    if (error instanceof RouteTaskExecutionError) {
        console.error(
            `任务 "${error.taskName}" 执行失败：`,
            error.originalError.message
        );
    }
}
```

### RouteNavigationAbortedError

- **类型定义**：
```ts
class RouteNavigationAbortedError extends RouteError {
    public readonly taskName: string;

    constructor(
        taskName: string,
        to: Route,
        from: Route | null
    );
}
```

当导航被守卫返回 `false` 明确中止时抛出。

**属性**：
- `name`：`'RouteNavigationAbortedError'`
- `code`：`'ROUTE_NAVIGATION_ABORTED'`
- `taskName`：中止导航的守卫名称

```ts
import { RouteNavigationAbortedError } from '@esmx/router';

router.beforeEach((to) => {
    if (to.meta.restricted) {
        return false; // 这将导致 RouteNavigationAbortedError
    }
});

try {
    await router.push('/restricted');
} catch (error) {
    if (error instanceof RouteNavigationAbortedError) {
        console.log(`导航被中止：${error.taskName}`);
    }
}
```

### RouteSelfRedirectionError

- **类型定义**：
```ts
class RouteSelfRedirectionError extends RouteError {
    constructor(
        fullPath: string,
        to: Route,
        from: Route | null
    );
}
```

当重定向导致无限循环（重定向到相同路径）时抛出。

**属性**：
- `name`：`'RouteSelfRedirectionError'`
- `code`：`'ROUTE_SELF_REDIRECTION'`

```ts
import { RouteSelfRedirectionError } from '@esmx/router';

// 此配置会导致自重定向错误：
// { path: '/loop', redirect: '/loop' }

try {
    await router.push('/loop');
} catch (error) {
    if (error instanceof RouteSelfRedirectionError) {
        console.error('检测到重定向循环：', error.message);
    }
}
```

## 错误层次结构

所有错误类继承自 `RouteError`，`RouteError` 继承自标准 `Error` 类：

```
Error
└── RouteError
    ├── RouteTaskCancelledError
    ├── RouteTaskExecutionError
    ├── RouteNavigationAbortedError
    └── RouteSelfRedirectionError
```

## 错误处理模式

### 捕获所有路由错误

```ts
import { RouteError } from '@esmx/router';

try {
    await router.push('/target');
} catch (error) {
    if (error instanceof RouteError) {
        switch (error.code) {
            case 'ROUTE_TASK_CANCELLED':
                // 导航被替换 — 通常可以安全忽略
                break;
            case 'ROUTE_NAVIGATION_ABORTED':
                // 守卫拒绝了导航
                showNotification('导航被阻止');
                break;
            case 'ROUTE_TASK_EXECUTION_ERROR':
                // 守卫或处理器抛出了错误
                reportError(error);
                break;
            case 'ROUTE_SELF_REDIRECTION':
                // 检测到重定向循环
                console.error('配置错误：', error.message);
                break;
        }
    }
}
```

### 忽略取消错误

取消错误在快速导航期间很常见（例如用户快速点击多个链接）。通常可以安全忽略：

```ts
import { RouteTaskCancelledError } from '@esmx/router';

try {
    await router.push('/target');
} catch (error) {
    if (error instanceof RouteTaskCancelledError) {
        return; // 可以安全忽略
    }
    throw error; // 重新抛出意外错误
}
```

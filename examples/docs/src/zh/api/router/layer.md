---
titleSuffix: "图层路由 API 参考"
description: "详细介绍 @esmx/router 图层路由的 API，包括图层选项、图层结果、创建和生命周期管理。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 图层, API, 模态路由, 覆盖路由, 对话框路由, 图层导航"
---

# 图层路由

## 简介

`@esmx/router` 中的图层路由提供了一种创建隔离路由上下文的机制，该上下文覆盖在主应用之上。图层通常用于模态对话框、向导或任何需要自己导航栈同时视觉上覆盖主内容的 UI。

## 类型定义

### RouteLayerOptions

- **类型定义**：
```ts
interface RouteLayerOptions {
    zIndex?: number;
    keepAlive?: 'exact' | 'include' | RouteVerifyHook;
    shouldClose?: RouteVerifyHook;
    autoPush?: boolean;
    push?: boolean;
    routerOptions?: RouterLayerOptions;
}
```

图层创建的配置选项：

#### zIndex

- **类型**：`number`

图层的自定义 z-index 值。如未设置，使用基础 z-index（10000）加上自增值。

#### keepAlive

- **类型**：`'exact' | 'include' | RouteVerifyHook`
- **默认值**：`'exact'`

控制导航期间图层何时保持打开：
- `'exact'`：仅当导航到完全相同的初始路径时保持图层打开（默认）
- `'include'`：当导航到以初始路径开头的路径时保持图层打开
- `function`：自定义逻辑，返回 `true` 保持打开，`false` 关闭

```ts
// 默认 - 仅在路径精确匹配时保持
keepAlive: 'exact'

// 在任何子路径上保持打开
keepAlive: 'include'

// 自定义逻辑
keepAlive: (to, from, router) => {
    return to.query.keepLayer === 'true';
}
```

#### autoPush

- **类型**：`boolean`
- **默认值**：`true`

当图层因导航推入而关闭时，是否自动将图层的退出路由推入父路由器。

#### push

- **类型**：`boolean`
- **默认值**：`true`

是否为图层打开记录历史条目。为 `true` 时，按浏览器后退按钮将关闭图层。

#### routerOptions

- **类型**：`RouterLayerOptions`

图层内部路由器实例的附加路由器选项。与父路由器的配置合并。

### RouterLayerOptions

- **类型定义**：
```ts
type RouterLayerOptions = Omit<
    RouterOptions,
    'handleBackBoundary' | 'handleLayerClose' | 'layer'
>;
```

图层创建的路由器选项。与 `RouterOptions` 相同，但排除了内部管理的处理函数和 `layer` 标志。

### RouteLayerResult

- **类型定义**：
```ts
type RouteLayerResult =
    | { type: 'close'; route: Route }
    | { type: 'push'; route: Route }
    | { type: 'success'; route: Route; data?: any };
```

图层关闭时返回的结果：
- `close`：图层通过 `router.closeLayer()` 无数据关闭，或通过后退导航关闭
- `push`：图层因导航超出图层范围而关闭
- `success`：图层通过 `router.closeLayer(data)` 携带数据关闭

## 方法

### router.createLayer()

- **参数**：
  - `toInput: RouteLocationInput` — 图层的目标路由
- **返回值**：`Promise<{ promise: Promise<RouteLayerResult>; router: Router }>`

创建图层路由实例。返回图层的路由器和一个在图层关闭时解析的 Promise。

```ts
const { promise, router: layerRouter } = await router.createLayer({
    path: '/select-user',
    layer: {
        keepAlive: 'include',
        autoPush: true,
        push: true
    }
});

// 等待图层关闭
const result = await promise;

switch (result.type) {
    case 'success':
        console.log('用户已选择：', result.data);
        break;
    case 'close':
        console.log('图层已关闭');
        break;
    case 'push':
        console.log('导航离开了图层');
        break;
}
```

### router.pushLayer()

- **参数**：
  - `toInput: RouteLocationInput` — 目标路由位置
- **返回值**：`Promise<RouteLayerResult>`

创建图层并等待其结果的简写方式。以图层方式导航到路由。

```ts
const result = await router.pushLayer({
    path: '/confirm-action',
    layer: {
        keepAlive: 'exact'
    }
});

if (result.type === 'success') {
    // 用户已确认
    performAction(result.data);
}
```

### router.closeLayer()

- **参数**：
  - `data?: any` — 返回给父级的可选数据
- **返回值**：`void`

关闭当前图层。仅当路由器为图层实例时有效（`router.isLayer === true`）。

```ts
// 不携带数据关闭（result.type === 'close'）
router.closeLayer();

// 携带数据关闭（result.type === 'success'）
router.closeLayer({ selectedId: 42, confirmed: true });
```

## 图层生命周期

1. **创建**：`createLayer()` 或 `pushLayer()` 以 `memory` 模式创建新的 Router 实例
2. **挂载**：图层的根元素以覆盖样式追加到 document body
3. **导航**：图层拥有自己隔离的导航栈
4. **关闭**：图层在以下情况下关闭：
   - 调用 `closeLayer()`
   - 用户后退且没有更多历史记录
   - 导航超出图层的 `keepAlive` 范围
5. **清理**：自动调用 `destroy()`，移除 DOM 元素并清理资源

## 完整示例

```ts
// 父组件 - 打开选择对话框
async function selectUser() {
    const result = await router.pushLayer({
        path: '/users/select',
        layer: {
            keepAlive: 'include',  // 允许在 /users/* 内导航
            autoPush: true,        // 自动推入退出路由
            push: true,            // 添加浏览器历史记录
            routerOptions: {
                routes: dialogRoutes  // 图层的自定义路由
            }
        }
    });

    if (result.type === 'success') {
        setSelectedUser(result.data);
    }
}

// 图层组件内部
function onUserSelected(user: User) {
    // 关闭图层并返回选中的用户
    router.closeLayer(user);
}

function onCancel() {
    // 不携带数据关闭图层
    router.closeLayer();
}
```

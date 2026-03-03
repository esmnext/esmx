---
titleSuffix: "Layer System API Reference"
description: "Complete guide to @esmx/router Layer system — overlay/modal routing with its own navigation stack, data return, and lifecycle control."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router layer, modal routing, overlay navigation, pushLayer, closeLayer, route layer"
---

# 层

层系统允许创建具有独立导航栈的覆盖层/模态框路由。层是一个独立的 Router 实例，渲染在主内容之上，内置支持数据返回、keep-alive 行为和自动清理。

## API 方法

### createLayer()

- **参数**：
  - `to: RouteLocationInput` - 目标路由（可包含 `layer` 选项）
- **返回值**: `Promise<{ promise: Promise<RouteLayerResult>; router: Router }>`

创建一个层 Router 并导航到给定路由。返回层 Router 实例和一个在层关闭时解析的 Promise。

返回一个包含以下内容的对象：
- `router` — 层 Router 实例
- `promise` — 当层关闭时解析为 [`RouteLayerResult`](#routelayerresult)

```ts
const { promise, router: layerRouter } = await router.createLayer({
  path: '/preview/123',
  layer: {
    zIndex: 2000,
    keepAlive: 'exact'
  }
});

const result = await promise;
```

### pushLayer()

- **参数**：
  - `to: RouteLocationInput` - 目标路由（可包含 `layer` 选项）
- **返回值**: `Promise<RouteLayerResult>`

创建层并直接返回结果的简写方法。

```ts
const result = await router.pushLayer('/modal/confirm');

if (result.type === 'success') {
  console.log('User confirmed:', result.data);
} else if (result.type === 'close') {
  console.log('User dismissed the modal');
}
```

### closeLayer()

- **参数**：
  - `data: any` - 返回给父级的可选数据。提供时，结果类型为 `'success'`

关闭当前层。仅在 `router.isLayer` 为 `true` 时有效。

```ts
// Inside a layer route component:
router.closeLayer({ confirmed: true, selectedItem: item });

// Close without data (result type will be 'close'):
router.closeLayer();
```

## RouteLayerOptions

通过 `RouteLocationInput` 的 `layer` 属性配置层的行为。

- **类型定义**：
```ts
interface RouteLayerOptions {
  zIndex?: number;
  keepAlive?: 'exact' | 'include' | RouteVerifyHook;
  autoPush?: boolean;
  push?: boolean;
  routerOptions?: RouterLayerOptions;
}
```

### zIndex

- **类型**: `number`
- **默认值**: 从 `1000` 自动递增

层覆盖层的 CSS z-index。

### keepAlive

- **类型**: `'exact' | 'include' | RouteVerifyHook`
- **默认值**: `'exact'`

控制层在内部导航时何时保持打开。

- `'exact'`：仅在导航到初始路径时层保持打开
- `'include'`：在初始路径的所有子路径中层保持打开
- `function`：自定义逻辑，返回 `true` 保持活跃，返回 `false` 关闭

```ts
// Keep alive for sub-paths
await router.pushLayer({
  path: '/wizard/step-1',
  layer: { keepAlive: 'include' }
});
// Layer stays open when navigating to /wizard/step-2, /wizard/step-3, etc.

// Custom logic
await router.pushLayer({
  path: '/editor',
  layer: {
    keepAlive: (to, from, router) => {
      return to.query.keepOpen === 'true';
    }
  }
});
```

### autoPush

- **类型**: `boolean`
- **默认值**: `true`

当层由于 `push` 类型的结果（导航到非层路由）而关闭时，自动在父 Router 上推送该路由。

### push

- **类型**: `boolean`
- **默认值**: `true`

层打开时是否添加历史记录条目。当为 `true` 时，按浏览器后退按钮会关闭该层。

### routerOptions

- **类型**: `RouterLayerOptions`

传递给层内部 Router 构造函数的附加选项。允许自定义层上下文的路由、模式和其他 Router 设置。

## RouteLayerResult

层关闭时的结果。

- **类型定义**：
```ts
type RouteLayerResult =
  | { type: 'close'; route: Route }
  | { type: 'push'; route: Route }
  | { type: 'success'; route: Route; data?: any };
```

- `close`：层被关闭（后退按钮、不带数据的 `closeLayer()`）
- `push`：层因用户导航到非层路由而关闭
- `success`：层通过 `closeLayer(data)` 携带数据关闭

## 层路由

路由可以在其[配置](./route-config#layer)中标记为仅限层：

```ts
{
  path: '/preview/:id',
  component: PreviewModal,
  layer: true  // Only matches in pushLayer() context
}
```

## 完整示例

```ts
// Route configuration
const routes = [
  { path: '/', component: Home },
  { path: '/products', component: ProductList },
  {
    path: '/product/:id',
    component: ProductDetail,
    layer: true
  }
];

// Open product detail as modal
const result = await router.pushLayer({
  path: '/product/42',
  layer: {
    zIndex: 2000,
    keepAlive: 'exact',
    push: true
  }
});

if (result.type === 'success') {
  cart.add(result.data.product);
}

// Inside the ProductDetail component:
function onAddToCart(product) {
  router.closeLayer({ product });
}

function onDismiss() {
  router.closeLayer();
}
```

## 内部工作原理

1. `createLayer()` 创建一个新的 Router 实例，使用 `mode: memory` 和 `layer: true`
2. 创建一个新的根 `<div>` 并追加到 `document.body`，应用覆盖层样式：
   ```ts
   {
     position: 'fixed',
     top: '0',
     left: '0',
     width: '100%',
     height: '100%',
     zIndex: String(zIndex),
     background: 'rgba(0,0,0,.6)',
     display: 'flex',
     alignItems: 'center',
     justifyContent: 'center'
   }
   ```
3. 层 Router 使用 `replace()` 导航到目标路由
4. `afterEach` 钩子监控导航——如果用户导航超出 `keepAlive` 范围，层会自动关闭
5. 关闭时调用 `destroy()`：卸载微应用、移除 DOM 元素、清理监听器
6. `Promise<RouteLayerResult>` 解析为关闭原因和可选数据

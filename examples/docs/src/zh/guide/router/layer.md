---
titleSuffix: "Layer System API Reference"
description: "Complete guide to @esmx/router Layer system — overlay/modal routing with its own navigation stack, data return, and lifecycle control."
head:
  - - "meta"
    - name: "keywords"
      content: "esmx router layer, modal routing, overlay navigation, pushLayer, closeLayer, route layer"
---

# Layer

The Layer system allows creating overlay/modal routes with their own navigation stack. A layer is a separate Router instance rendered on top of the main content, with built-in support for data return, keep-alive behavior, and automatic cleanup.

## API Methods

### createLayer {#createlayer}

```ts
createLayer(to: RouteLocationInput): Promise<{
  promise: Promise<RouteLayerResult>;
  router: Router;
}>;
```

Create a layer router and navigate to the given route. Returns both the layer router instance and a promise that resolves when the layer closes.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| to | `RouteLocationInput` | Target route (can include `layer` options) |

#### Returns

An object with:
- `router` — The layer Router instance
- `promise` — Resolves to [`RouteLayerResult`](#routelayerresult) when the layer closes

#### Example

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

### pushLayer {#pushlayer}

```ts
pushLayer(to: RouteLocationInput): Promise<RouteLayerResult>;
```

Shorthand that creates a layer and returns its result directly.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| to | `RouteLocationInput` | Target route (can include `layer` options) |

#### Returns

`Promise<RouteLayerResult>`

#### Example

```ts
const result = await router.pushLayer('/modal/confirm');

if (result.type === 'success') {
  console.log('User confirmed:', result.data);
} else if (result.type === 'close') {
  console.log('User dismissed the modal');
}
```

### closeLayer {#closelayer}

```ts
closeLayer(data?: any): void;
```

Close the current layer. Only works when `router.isLayer` is `true`.

#### Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| data | `any` | Optional data returned to the parent. When provided, result type is `'success'` |

#### Example

```ts
// Inside a layer route component:
router.closeLayer({ confirmed: true, selectedItem: item });

// Close without data (result type will be 'close'):
router.closeLayer();
```

## RouteLayerOptions {#routelayeroptions}

Configure layer behavior via the `layer` property of `RouteLocationInput`.

```ts
interface RouteLayerOptions {
  zIndex?: number;
  keepAlive?: 'exact' | 'include' | RouteVerifyHook;
  autoPush?: boolean;
  push?: boolean;
  routerOptions?: RouterLayerOptions;
}
```

### zIndex {#zindex}

```ts
optional zIndex: number;
```

CSS z-index for the layer overlay.

#### Default Value

Auto-incremented from `1000`

### keepAlive {#keepalive}

```ts
optional keepAlive: 'exact' | 'include' | RouteVerifyHook;
```

Controls when the layer stays open during internal navigation.

| Value | Behavior |
|-------|----------|
| `'exact'` | Layer stays open only when navigating to its initial path |
| `'include'` | Layer stays open for all sub-paths of the initial path |
| `function` | Custom logic returning `true` to keep alive, `false` to close |

#### Default Value

`'exact'`

#### Example

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

### autoPush {#autopush}

```ts
optional autoPush: boolean;
```

When the layer closes due to a `push`-type result (navigation to a non-layer route), automatically push that route on the parent router.

#### Default Value

`true`

### push {#push}

```ts
optional push: boolean;
```

Whether to add a history entry when the layer opens. When `true`, pressing the browser back button will close the layer.

#### Default Value

`true`

### routerOptions {#routeroptions}

```ts
optional routerOptions: RouterLayerOptions;
```

Additional options passed to the layer's internal Router constructor. Allows customizing routes, mode, and other router settings for the layer context.

## RouteLayerResult {#routelayerresult}

The result when a layer closes.

```ts
type RouteLayerResult =
  | { type: 'close'; route: Route }
  | { type: 'push'; route: Route }
  | { type: 'success'; route: Route; data?: any };
```

| Type | Description |
|------|-------------|
| `close` | Layer was dismissed (back button, `closeLayer()` without data) |
| `push` | Layer closed because user navigated to a non-layer route |
| `success` | Layer was closed with data via `closeLayer(data)` |

## Layer Routes {#layer-routes}

Routes can be marked as layer-only in their [config](./route-config#layer):

```ts
{
  path: '/preview/:id',
  component: PreviewModal,
  layer: true  // Only matches in pushLayer() context
}
```

## Complete Example

```ts
// Route configuration
const routes = [
  { path: '/', component: Home },
  { path: '/products', component: ProductList },
  {
    path: '/product/:id',
    component: ProductDetail,
    layer: true  // Can be opened as overlay
  }
];

// Open product detail as modal
const result = await router.pushLayer({
  path: '/product/42',
  layer: {
    zIndex: 2000,
    keepAlive: 'exact',
    push: true // Back button closes the modal
  }
});

if (result.type === 'success') {
  cart.add(result.data.product);
}

// Inside the ProductDetail component:
function onAddToCart(product) {
  router.closeLayer({ product }); // Returns data to parent
}

function onDismiss() {
  router.closeLayer(); // result.type === 'close'
}
```

## How It Works Internally {#internals}

1. `createLayer()` creates a new Router instance with `mode: memory` and `layer: true`
2. A new root `<div>` is created and appended to `document.body` with overlay styling:
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
3. The layer router navigates to the target route using `replace()`
4. `afterEach` hook monitors navigation — if the user navigates outside `keepAlive` bounds, the layer auto-closes
5. When closed, `destroy()` is called: unmount micro-app, remove DOM element, clean up listeners
6. The `Promise<RouteLayerResult>` resolves with the close reason and optional data

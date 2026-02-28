---
titleSuffix: "Layer Routing API Reference"
description: "Detailed API reference for @esmx/router layer routing, including layer options, layer results, creation, and lifecycle management."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, Layer, API, modal routing, overlay routing, dialog routing, layer navigation"
---

# Layer Routing

## Introduction

Layer routing in `@esmx/router` provides a mechanism for creating isolated routing contexts that overlay the main application. Layers are commonly used for modal dialogs, wizards, or any UI that needs its own navigation stack while visually overlaying the main content.

## Type Definitions

### RouteLayerOptions

- **Type Definition**:
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

Configuration options for layer creation:

#### zIndex

- **Type**: `number`

Custom z-index value for the layer. If not set, uses the base z-index (10000) plus an auto-incremented value.

#### keepAlive

- **Type**: `'exact' | 'include' | RouteVerifyHook`
- **Default**: `'exact'`

Controls when the layer remains open during navigation:
- `'exact'`: Keep layer alive only when navigating to the exact initial path (default)
- `'include'`: Keep layer alive when navigating to paths that start with the initial path
- `function`: Custom logic returning `true` to keep alive, `false` to close

```ts
// Default - keep only on exact path match
keepAlive: 'exact'

// Keep alive on any sub-path
keepAlive: 'include'

// Custom logic
keepAlive: (to, from, router) => {
    return to.query.keepLayer === 'true';
}
```

#### autoPush

- **Type**: `boolean`
- **Default**: `true`

Whether to automatically push the layer's exit route to the parent router when the layer closes due to a navigation push.

#### push

- **Type**: `boolean`
- **Default**: `true`

Whether to record a history entry for the layer opening. When `true`, pressing the browser back button will close the layer.

#### routerOptions

- **Type**: `RouterLayerOptions`

Additional router options for the layer's internal router instance. Merged with the parent router's configuration.

### RouterLayerOptions

- **Type Definition**:
```ts
type RouterLayerOptions = Omit<
    RouterOptions,
    'handleBackBoundary' | 'handleLayerClose' | 'layer'
>;
```

Router options for layer creation. Same as `RouterOptions` but excludes handler functions and the `layer` flag which are managed internally.

### RouteLayerResult

- **Type Definition**:
```ts
type RouteLayerResult =
    | { type: 'close'; route: Route }
    | { type: 'push'; route: Route }
    | { type: 'success'; route: Route; data?: any };
```

Result returned when a layer closes:
- `close`: Layer was closed via `router.closeLayer()` without data, or by navigating back
- `push`: Layer was closed because navigation exited the layer's scope
- `success`: Layer was closed via `router.closeLayer(data)` with data

## Methods

### router.createLayer()

- **Parameters**:
  - `toInput: RouteLocationInput` — Target route for the layer
- **Returns**: `Promise<{ promise: Promise<RouteLayerResult>; router: Router }>`

Creates a layer routing instance. Returns both the layer's router and a promise that resolves when the layer closes.

```ts
const { promise, router: layerRouter } = await router.createLayer({
    path: '/select-user',
    layer: {
        keepAlive: 'include',
        autoPush: true,
        push: true
    }
});

// Wait for layer to close
const result = await promise;

switch (result.type) {
    case 'success':
        console.log('User selected:', result.data);
        break;
    case 'close':
        console.log('Layer dismissed');
        break;
    case 'push':
        console.log('Navigation left layer');
        break;
}
```

### router.pushLayer()

- **Parameters**:
  - `toInput: RouteLocationInput` — Target route location
- **Returns**: `Promise<RouteLayerResult>`

Shorthand for creating a layer and waiting for its result. Navigates to the route as a layer.

```ts
const result = await router.pushLayer({
    path: '/confirm-action',
    layer: {
        keepAlive: 'exact'
    }
});

if (result.type === 'success') {
    // User confirmed
    performAction(result.data);
}
```

### router.closeLayer()

- **Parameters**:
  - `data?: any` — Optional data to return to the parent
- **Returns**: `void`

Closes the current layer. Only effective when the router is a layer instance (`router.isLayer === true`).

```ts
// Close without data (result.type === 'close')
router.closeLayer();

// Close with data (result.type === 'success')
router.closeLayer({ selectedId: 42, confirmed: true });
```

## Layer Lifecycle

1. **Creation**: `createLayer()` or `pushLayer()` creates a new Router instance in `memory` mode
2. **Mounting**: The layer's root element is appended to the document body with overlay styling
3. **Navigation**: The layer has its own isolated navigation stack
4. **Closing**: The layer closes when:
   - `closeLayer()` is called
   - The user navigates back with no history left
   - Navigation exits the layer's `keepAlive` scope
5. **Cleanup**: `destroy()` is called automatically, removing the DOM element and cleaning up resources

## Complete Example

```ts
// Parent component - open a selection dialog
async function selectUser() {
    const result = await router.pushLayer({
        path: '/users/select',
        layer: {
            keepAlive: 'include',  // Allow navigation within /users/*
            autoPush: true,        // Auto-push exit route
            push: true,            // Add browser history entry
            routerOptions: {
                routes: dialogRoutes  // Custom routes for the layer
            }
        }
    });

    if (result.type === 'success') {
        setSelectedUser(result.data);
    }
}

// Inside the layer component
function onUserSelected(user: User) {
    // Close layer and return selected user
    router.closeLayer(user);
}

function onCancel() {
    // Close layer without data
    router.closeLayer();
}
```

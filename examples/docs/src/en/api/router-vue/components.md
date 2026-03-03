---
titleSuffix: "@esmx/router-vue — Components"
description: "RouterView and RouterLink components for @esmx/router-vue — rendering matched routes and navigation links."
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-vue, RouterView, RouterLink, components, nested routing, navigation"
---

# Components

## Introduction

`@esmx/router-vue` provides two built-in Vue components: `RouterView` for rendering matched route components, and `RouterLink` for declarative navigation. Both are registered globally when using the `RouterPlugin`.

## RouterView

- **Component Name**: `RouterView`

Renders the matched route component at the current depth. Supports nested routing with automatic depth tracking via Vue's provide/inject mechanism.

```vue
<template>
    <div id="app">
        <nav>
            <RouterLink to="/">Home</RouterLink>
            <RouterLink to="/about">About</RouterLink>
        </nav>

        <!-- Route components render here -->
        <RouterView />
    </div>
</template>
```

**Nested Routing**:
```vue
<!-- Parent layout component -->
<template>
    <div class="layout">
        <aside>
            <RouterLink to="/user/profile">Profile</RouterLink>
            <RouterLink to="/user/settings">Settings</RouterLink>
        </aside>
        <main>
            <!-- Nested route components render here -->
            <RouterView />
        </main>
    </div>
</template>
```

## RouterLink

- **Component Name**: `RouterLink`

Navigation link component that renders an anchor element with proper navigation behavior and active state management.

**Props**:

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `to` | `RouteLocationInput` | _required_ | Target route location |
| `type` | `RouterLinkType` | `'push'` | Navigation type |
| `replace` | `boolean` | `false` | _Deprecated_ — Use `type="replace"` |
| `exact` | `RouteMatchType` | `'include'` | Active state matching strategy |
| `activeClass` | `string` | — | Custom CSS class for active state |
| `event` | `string \| string[]` | `'click'` | Event(s) triggering navigation |
| `tag` | `string` | `'a'` | HTML tag to render |
| `layerOptions` | `RouteLayerOptions` | — | Layer options for `type='pushLayer'` |
| `beforeNavigate` | `Function` | — | Hook before navigation |

```vue
<template>
    <nav>
        <!-- Basic navigation -->
        <RouterLink to="/home">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>

        <!-- With custom styling -->
        <RouterLink to="/dashboard" active-class="nav-active">
            Dashboard
        </RouterLink>

        <!-- Replace navigation -->
        <RouterLink to="/login" type="replace">Login</RouterLink>

        <!-- Exact matching with custom tag -->
        <RouterLink to="/contact" exact="exact" tag="button">
            Contact
        </RouterLink>

        <!-- Open in new window -->
        <RouterLink to="/docs" type="pushWindow">
            Documentation
        </RouterLink>
    </nav>
</template>
```

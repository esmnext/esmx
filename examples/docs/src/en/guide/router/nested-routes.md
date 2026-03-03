---
titleSuffix: "Nested Routes"
description: "Learn how to use nested routes in @esmx/router to build layouts with child components, understand RouterView depth, and structure complex UIs."
head:
  - - "meta"
    - name: "keywords"
      content: "nested routes, children routes, RouterView, layout routes, route nesting, Vue RouterView, router view depth"
---

# Nested Routes

Real-world application UIs are usually composed of components that are nested multiple levels deep. It's very common to have a layout that wraps page content, or a page that has its own sub-pages. `@esmx/router` uses nested route configurations and the `RouterView` component to express this relationship naturally.

## Basic Nesting

Consider a layout with a navigation bar and a content area where different pages render:

```
┌──────────────────────────────────┐
│  Navigation Bar                  │
├──────────────────────────────────┤
│                                  │
│  <RouterView />                  │
│  (renders Home, About, etc.)     │
│                                  │
└──────────────────────────────────┘
```

This is expressed using `children` in the route configuration:

```ts
import type { RouteConfig } from '@esmx/router';

const routes: RouteConfig[] = [
  {
    path: '/',
    component: Layout,
    children: [
      { path: '', component: Home },         // matches /
      { path: 'about', component: About },   // matches /about
      { path: 'contact', component: Contact } // matches /contact
    ]
  }
];
```

The `Layout` component uses `RouterView` to render whichever child route is matched:

```vue title="src/Layout.vue"
<template>
  <div class="layout">
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/contact">Contact</RouterLink>
    </nav>

    <main>
      <RouterView />
    </main>
  </div>
</template>
```

When the user navigates to `/about`, the `Layout` component stays mounted and only the `RouterView` content swaps from `Home` to `About`.

:::tip
Note that a child route with an **empty path** (`''`) acts as the default child. It matches when the parent's path is matched exactly — in this case, `/`.
:::

## How Matched Works

When a URL is matched against nested routes, the `route.matched` array contains all matched route configurations from **parent to child** in order:

```ts
// Route config
{
  path: '/',          // index 0 in matched[]
  component: Layout,
  children: [
    {
      path: 'users/:id',   // index 1 in matched[]
      component: UserProfile
    }
  ]
}

// When URL is /users/42:
route.matched[0]  // → Layout route config
route.matched[1]  // → UserProfile route config
route.matched.length  // 2
```

Each `RouterView` component uses its depth in the component tree to pick the correct entry from `matched[]`. The root `RouterView` renders `matched[0]`, a nested `RouterView` renders `matched[1]`, and so on.

## RouterView Component

`RouterView` is imported from `@esmx/router-vue`. It renders the component at the current depth in the route tree:

```ts
import { RouterView } from '@esmx/router-vue';
```

Or register it globally via the plugin:

```ts
import { RouterPlugin } from '@esmx/router-vue';
app.use(RouterPlugin); // registers both RouterView and RouterLink globally
```

`RouterView` automatically tracks its nesting depth. You don't need to pass any props — it knows which matched route config to render based on where it sits in the component hierarchy.

## Multiple Levels of Nesting

Routes can be nested to any depth. Each level of nesting corresponds to a `RouterView` in the component tree:

```ts
const routes: RouteConfig[] = [
  {
    path: '/',
    component: AppLayout,           // depth 0
    children: [
      {
        path: 'users',
        component: UsersLayout,      // depth 1
        children: [
          { path: '', component: UserList },         // depth 2
          {
            path: ':id',
            component: UserDetailLayout,              // depth 2
            children: [
              { path: '', component: UserProfile },   // depth 3
              { path: 'posts', component: UserPosts } // depth 3
            ]
          }
        ]
      }
    ]
  }
];
```

The component tree for `/users/42/posts` looks like:

```
AppLayout                      ← matched[0], rendered by RouterView at depth 0
└── UsersLayout                ← matched[1], rendered by RouterView at depth 1
    └── UserDetailLayout       ← matched[2], rendered by RouterView at depth 2
        └── UserPosts          ← matched[3], rendered by RouterView at depth 3
```

Each layout component contains a `RouterView` that renders the next level:

```vue title="src/UsersLayout.vue"
<template>
  <div class="users-layout">
    <h1>Users</h1>
    <RouterView />
  </div>
</template>
```

```vue title="src/UserDetailLayout.vue"
<template>
  <div class="user-detail">
    <UserSidebar />
    <RouterView />
  </div>
</template>
```

## RouterView Depth

Each `RouterView` maintains a depth counter internally. The root-level `RouterView` is at depth 0, and each nested `RouterView` increments the depth by 1. This depth determines which entry in the `route.matched` array to render.

You can access the current depth using `useRouterViewDepth()`:

```vue
<script setup lang="ts">
import { useRouterViewDepth } from '@esmx/router-vue';

const depth = useRouterViewDepth();
console.log('Current RouterView depth:', depth); // 0, 1, 2, etc.
</script>
```

- Depth `0`: Renders `route.matched[0].component` (root layout)
- Depth `1`: Renders `route.matched[1].component` (section layout)
- Depth `2`: Renders `route.matched[2].component` (page component)
- Depth `3`: Renders `route.matched[3].component` (sub-page component)

This is handled automatically — you rarely need to interact with depth directly. It's exposed mainly for advanced use cases like building custom `RouterView` implementations.

## Complete Example

Here's a full example with a three-level layout structure:

### Route Configuration

```ts title="src/routes.ts"
import type { RouteConfig } from '@esmx/router';

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: '', component: HomePage },
      { path: 'about', component: AboutPage },
      {
        path: 'users',
        component: UsersSection,
        children: [
          { path: '', component: UserList },
          {
            path: ':id',
            component: UserProfile,
            children: [
              { path: '', component: UserOverview },
              { path: 'settings', component: UserSettings }
            ]
          }
        ]
      }
    ]
  }
];
```

### Layout Components

```vue title="src/MainLayout.vue"
<template>
  <div class="app">
    <header>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/about">About</RouterLink>
      <RouterLink to="/users">Users</RouterLink>
    </header>

    <RouterView />

    <footer>© 2024</footer>
  </div>
</template>
```

```vue title="src/UsersSection.vue"
<template>
  <div class="users-section">
    <aside>
      <h2>Users</h2>
      <UserNavigation />
    </aside>

    <div class="users-content">
      <RouterView />
    </div>
  </div>
</template>
```

```vue title="src/UserProfile.vue"
<template>
  <div class="user-profile">
    <h2>User {{ route.params.id }}</h2>
    <nav>
      <RouterLink :to="`/users/${route.params.id}`">Overview</RouterLink>
      <RouterLink :to="`/users/${route.params.id}/settings`">Settings</RouterLink>
    </nav>

    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { useRoute } from '@esmx/router-vue';
const route = useRoute();
</script>
```

### Resulting Navigation

| URL | Rendered Components |
|-----|-------------------|
| `/` | MainLayout → HomePage |
| `/about` | MainLayout → AboutPage |
| `/users` | MainLayout → UsersSection → UserList |
| `/users/42` | MainLayout → UsersSection → UserProfile → UserOverview |
| `/users/42/settings` | MainLayout → UsersSection → UserProfile → UserSettings |

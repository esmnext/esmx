---
titleSuffix: "Dynamic Route Matching"
description: "Learn how to use dynamic segments, optional parameters, wildcards, query strings, and hash fragments in @esmx/router route patterns."
head:
  - - "meta"
    - name: "keywords"
      content: "dynamic routes, route params, route parameters, path-to-regexp, wildcard routes, catch-all routes, query params, optional params"
---

# 动态路由匹配

很多时候，我们需要将给定模式的路由映射到同一个组件。例如，我们可能有一个 `UserProfile` 组件，它需要为所有用户渲染，但使用不同的用户 ID。在 `@esmx/router` 中，我们可以在路径中使用动态段来实现这一点。

## 路由参数

动态段以冒号 `:` 开头。当路由被匹配时，动态段的值将通过 `route.params` 暴露：

```ts
const routes: RouteConfig[] = [
  // dynamic segment starts with a colon
  { path: '/users/:id', component: UserProfile }
];
```

现在，类似 `/users/42` 和 `/users/alice` 的 URL 都会映射到同一条路由：

```ts
// When the URL is /users/42
console.log(route.params.id); // '42'

// When the URL is /users/alice
console.log(route.params.id); // 'alice'
```

:::tip
所有参数值都是字符串。即使 URL 包含 `/users/42`，`route.params.id` 也会是字符串 `'42'`，而不是数字 `42`。
:::

## 多个参数

你可以在同一条路由中使用多个动态段，它们会映射到 `route.params` 上的对应字段：

```ts
const routes: RouteConfig[] = [
  { path: '/users/:userId/posts/:postId', component: UserPost }
];
```

| Pattern | Matched Path | params |
|---------|-------------|--------|
| `/users/:userId/posts/:postId` | `/users/alice/posts/123` | `{ userId: 'alice', postId: '123' }` |
| `/blog/:year/:month/:slug` | `/blog/2024/01/hello-world` | `{ year: '2024', month: '01', slug: 'hello-world' }` |
| `/:lang/docs/:page` | `/en/docs/intro` | `{ lang: 'en', page: 'intro' }` |

## 可选参数

你可以在参数后面添加 `?` 使其成为可选参数。可选参数可以匹配有或没有该段的路由：

```ts
const routes: RouteConfig[] = [
  { path: '/search/:query?', component: SearchPage }
];
```

| URL | params |
|-----|--------|
| `/search` | `{ query: '' }` |
| `/search/vue-router` | `{ query: 'vue-router' }` |

当可选参数不存在于 URL 中时，其值为空字符串 `''`。

## 捕获所有 / 404 路由

通配符模式可以匹配所有路径——适用于 404 页面或兜底路由。使用 `(.*)` 模式（或 `(.*)*` 将值作为数组捕获）：

```ts
const routes: RouteConfig[] = [
  { path: '/', component: Home },
  { path: '/about', component: About },

  // This will match everything that didn't match above
  { path: '/:pathMatch(.*)*', component: NotFound }
];
```

```ts
// When the URL is /non-existing-page
console.log(route.params.pathMatch); // 'non-existing-page'

// When the URL is /files/a/b/c
console.log(route.params.pathMatch);      // 'a' (first segment)
console.log(route.paramsArray.pathMatch);  // ['a', 'b', 'c']
```

:::warning
请确保将捕获所有路由放在路由数组的**最后**。由于路由是按顺序匹配的，放在顶部的捕获所有路由会匹配每个 URL，导致特定路由永远无法被匹配到。
:::

## 访问参数

### `route.params`

一个包含动态段键/值对的对象。每个值都是**字符串**。对于重复参数（如 `(.*)*`），只提供第一个匹配项：

```ts
// Route: /files/:path*
// URL: /files/a/b/c
route.params.path  // 'a'
```

### `route.paramsArray`

一个包含键/值对的对象，其中每个值都是**字符串数组**。这对于重复参数很有用，确保你始终能获取所有匹配值：

```ts
// Route: /files/:path*
// URL: /files/a/b/c
route.paramsArray.path  // ['a', 'b', 'c']

// Route: /users/:id
// URL: /users/42
route.paramsArray.id    // ['42']
```

## 查询参数

查询参数是 URL 中 `?` 后面的键/值对。它们不需要在路由模式中定义——它们始终可用：

```ts
// URL: /search?q=vue&sort=date&tag=frontend&tag=ssr
route.query.q       // 'vue'
route.query.sort    // 'date'
route.query.tag     // 'frontend' (first value only)
```

### `route.queryArray`

对于出现多次的查询参数，使用 `queryArray` 获取所有值：

```ts
// URL: /search?tag=frontend&tag=ssr
route.query.tag           // 'frontend'
route.queryArray.tag      // ['frontend', 'ssr']
```

- **`route.query`**: `Record<string, string | undefined>` — 每个查询键的第一个值
- **`route.queryArray`**: `Record<string, string[] | undefined>` — 每个查询键的所有值

## Hash

哈希片段（URL 中 `#` 后面的所有内容）通过 `route.hash` 获取：

```ts
// URL: /about#team
route.hash  // '#team'
```

哈希始终包含 `#` 前缀。如果 URL 中没有哈希，`route.hash` 为空字符串。

## 使用 path-to-regexp 进行模式匹配

在底层，`@esmx/router` 使用 [`path-to-regexp`](https://github.com/pillarjs/path-to-regexp) 库进行模式匹配。这使你可以使用高级匹配特性：

| Pattern | Description | Example Match |
|---------|-------------|---------------|
| `:id` | 命名参数 | `/users/42` |
| `:id?` | 可选参数 | `/users` or `/users/42` |
| `:path*` | 零个或多个段 | `/files` or `/files/a/b` |
| `:path+` | 一个或多个段 | `/files/a` or `/files/a/b` |
| `:id(\\\\d+)` | 带正则约束的参数 | `/users/42` (not `/users/alice`) |
| `(.*)*` | 捕获所有通配符 | Anything |

### 自定义正则约束

你可以使用内联正则表达式来限制参数的匹配范围：

```ts
const routes: RouteConfig[] = [
  // Only matches numeric IDs
  { path: '/users/:id(\\\\d+)', component: UserProfile },

  // Only matches specific values
  { path: '/:lang(en|fr|de)/docs', component: Docs }
];
```

## URL 编码

路由路径应使用 URL 编码。Router 会自动处理编码和解码——当你定义路由和访问参数时，使用的是解码后的值：

```ts
const routes: RouteConfig[] = [
  // Define with encoded path if the literal path contains special chars
  { path: '/docs/:page', component: DocsPage }
];

// URL: /docs/getting%20started
route.params.page  // 'getting started' (decoded)
```

在编程式导航时，你可以传递编码或解码后的路径：

```ts
router.push('/docs/getting started');   // works — encoded automatically
router.push('/docs/getting%20started'); // also works
```

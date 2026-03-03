---
titleSuffix: "@esmx/router-vue — 组件"
description: "@esmx/router-vue 的 RouterView 和 RouterLink 组件 — 渲染匹配路由和导航链接。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, router-vue, RouterView, RouterLink, 组件, 嵌套路由, 导航"
---

# 组件

## 简介

`@esmx/router-vue` 提供两个内置 Vue 组件：`RouterView` 用于渲染匹配的路由组件，`RouterLink` 用于声明式导航。使用 `RouterPlugin` 时，两者都会被全局注册。

## RouterView

- **组件名称**：`RouterView`

在当前深度渲染匹配的路由组件。通过 Vue 的 provide/inject 机制支持嵌套路由和自动深度跟踪。

```vue
<template>
    <div id="app">
        <nav>
            <RouterLink to="/">首页</RouterLink>
            <RouterLink to="/about">关于</RouterLink>
        </nav>

        <!-- 路由组件在此渲染 -->
        <RouterView />
    </div>
</template>
```

**嵌套路由**：
```vue
<!-- 父级布局组件 -->
<template>
    <div class="layout">
        <aside>
            <RouterLink to="/user/profile">个人资料</RouterLink>
            <RouterLink to="/user/settings">设置</RouterLink>
        </aside>
        <main>
            <!-- 嵌套路由组件在此渲染 -->
            <RouterView />
        </main>
    </div>
</template>
```

## RouterLink

- **组件名称**：`RouterLink`

导航链接组件，渲染带有适当导航行为和活跃状态管理的锚元素。

**Props**：

| 属性 | 类型 | 默认值 | 描述 |
|------|------|--------|------|
| `to` | `RouteLocationInput` | _必填_ | 目标路由位置 |
| `type` | `RouterLinkType` | `'push'` | 导航类型 |
| `replace` | `boolean` | `false` | _已弃用_ — 使用 `type="replace"` |
| `exact` | `RouteMatchType` | `'include'` | 活跃状态匹配策略 |
| `activeClass` | `string` | — | 活跃状态的自定义 CSS 类 |
| `event` | `string \| string[]` | `'click'` | 触发导航的事件 |
| `tag` | `string` | `'a'` | 要渲染的 HTML 标签 |
| `layerOptions` | `RouteLayerOptions` | — | `type='pushLayer'` 时的图层选项 |
| `beforeNavigate` | `Function` | — | 导航前的钩子 |

```vue
<template>
    <nav>
        <!-- 基本导航 -->
        <RouterLink to="/home">首页</RouterLink>
        <RouterLink to="/about">关于</RouterLink>

        <!-- 自定义样式 -->
        <RouterLink to="/dashboard" active-class="nav-active">
            仪表盘
        </RouterLink>

        <!-- 替换导航 -->
        <RouterLink to="/login" type="replace">登录</RouterLink>

        <!-- 精确匹配和自定义标签 -->
        <RouterLink to="/contact" exact="exact" tag="button">
            联系我们
        </RouterLink>

        <!-- 在新窗口打开 -->
        <RouterLink to="/docs" type="pushWindow">
            文档
        </RouterLink>
    </nav>
</template>
```

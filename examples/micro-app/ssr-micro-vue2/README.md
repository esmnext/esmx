# ssr-micro-vue2

Vue 2 子应用，使用 Vue 2.7 + Composition API 构建。

## 说明

本包演示了如何在微前端架构中集成 Vue 2.7 应用，通过 `@esmx/router-vue` 提供的 `RouterPlugin` 和 `useProvideRouter` 实现与 Esmx Router 的集成。

## 文件结构

- `src/app.ts` - 应用工厂函数，创建 Vue 实例
- `src/app.vue` - Vue 根组件
- `src/routes.ts` - 路由配置
- `src/entry.node.ts` - Node.js 入口配置

## 路由

- `/vue2` - Vue 2 微应用页面

# ssr-micro-vue3

Vue 3 子应用，使用 Vue 3.5 + SSR 构建。

## 说明

本包演示了如何在微前端架构中集成 Vue 3 应用，使用 `createSSRApp` 和 `@vue/server-renderer` 实现服务端渲染。

## 文件结构

- `src/app.ts` - 应用工厂函数，创建 SSR Vue 实例
- `src/app.vue` - Vue 根组件
- `src/routes.ts` - 路由配置
- `src/entry.node.ts` - Node.js 入口配置

## 路由

- `/vue3` - Vue 3 微应用页面

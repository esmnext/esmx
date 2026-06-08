# ssr-micro-react

React 子应用，使用 React 18 + Hooks 构建。

## 说明

本包演示了如何在微前端架构中集成 React 18 应用，通过 `@esmx/router-react` 提供的 `RouterProvider` 和 `RouterView` 实现与 Esmx Router 的集成。

## 文件结构

- `src/app.ts` - 应用工厂函数，创建 React 应用实例
- `src/routes.ts` - 路由配置
- `src/entry.node.ts` - Node.js 入口配置

## 路由

- `/react` - React 微应用页面

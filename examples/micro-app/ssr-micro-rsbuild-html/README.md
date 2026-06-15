# ssr-micro-html

HTML 子应用，使用原生 HTML + TypeScript 构建。

## 说明

本包演示了如何创建一个无框架依赖的纯 HTML 微应用，通过 `@esmx/router` 的 `RouterMicroAppOptions` 接口实现 `mount`、`unmount` 和 `renderToString` 方法。

## 文件结构

- `src/app.ts` - 应用工厂函数，返回 `RouterMicroAppOptions`
- `src/routes.ts` - 路由配置
- `src/entry.node.ts` - Node.js 入口配置

## 路由

- `/html` - HTML 微应用页面

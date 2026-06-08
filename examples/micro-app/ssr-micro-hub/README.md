# ssr-micro-hub

微前端 Hub 应用，聚合所有子应用路由。

## 说明

本包作为微前端架构的入口，负责：

1. 链接所有子应用（`ssr-micro-html`、`ssr-micro-vue2`、`ssr-micro-vue3`、`ssr-micro-react`）
2. 合并所有子应用的路由配置
3. 提供首页导航
4. 通过 Esmx Import Map 实现运行时模块共享

## 文件结构

- `src/entry.node.ts` - Node.js 入口配置，链接所有子应用
- `src/entry.server.ts` - 服务端渲染入口
- `src/entry.client.ts` - 客户端入口
- `src/routes.ts` - 合并所有子应用路由
- `src/home.ts` - 首页组件

## 路由

- `/` - 首页（导航卡片）
- `/html` - HTML 子应用
- `/vue2` - Vue 2 子应用
- `/vue3` - Vue 3 子应用
- `/react` - React 子应用

## 启动

```bash
pnpm start
```

访问 http://localhost:3000

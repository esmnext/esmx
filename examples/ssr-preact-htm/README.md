# Esmx SSR Preact HTM

一个基于 Preact 和 HTM 的服务端渲染示例，展示了如何使用 Esmx 构建现代化的组件化应用。HTM (Hyperscript Tagged Markup) 提供了一种不需要编译器的 JSX 替代方案。

## 特点

- **高性能** - 基于 Preact 的轻量级虚拟 DOM 实现
- **零配置** - HTM 提供了无需编译的模板语法
- **组件化** - 完整的组件化开发体验
- **体积小** - 运行时仅 4KB，适合性能敏感场景

## 快速开始

1. 克隆仓库
```bash
git clone https://github.com/js-esm/esmx.git
cd esmx/examples/ssr-preact-htm
```

2. 安装 pnpm（如果未安装）
```bash
npm install -g pnpm
```

3. 安装依赖
```bash
pnpm install
```

4. 启动开发服务器
```bash
pnpm dev
```

## 项目结构

```
src/
├── app.ts             # 应用根组件
├── style.css          # 全局样式
├── entry.client.ts    # 客户端入口
├── entry.server.ts    # 服务端入口
├── entry.node.ts      # Node 环境入口
└── file.d.ts          # 类型声明文件
```

## 在线预览

访问 [在线示例](https://js-esm.github.io/esmx/ssr-preact-htm/) 查看运行效果。

## 相关链接

- [项目文档](https://js-esm.github.io/esmx/)
- [GitHub 仓库](https://github.com/js-esm/esmx)

## 许可证

MIT
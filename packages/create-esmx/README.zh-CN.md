<div align="center">
  <img src="https://www.esmnext.com/logo.svg?t=2025" width="120" alt="Esmx Logo" />
  <h1>create-esmx</h1>
  
  <div>
    <a href="https://www.npmjs.com/package/create-esmx">
      <img src="https://img.shields.io/npm/v/create-esmx.svg" alt="npm 版本" />
    </a>
    <a href="https://github.com/esmnext/esmx/actions/workflows/build.yml">
      <img src="https://github.com/esmnext/esmx/actions/workflows/build.yml/badge.svg" alt="构建状态" />
    </a>
  </div>
  
  <p>用于创建 Esmx 项目的脚手架工具</p>
  
  <p>
    <a href="https://github.com/esmnext/esmx/blob/master/packages/create-esmx/README.md">English</a> | 中文
  </p>
</div>

## 功能特性

- 交互式命令行界面
- 支持多种项目模板
- 完整的 TypeScript 支持
- 自动配置项目结构

## 安装使用

```bash
# 使用 npm
npm create esmx@latest my-project

# 使用 yarn
yarn create esmx my-project

# 使用 pnpm
pnpm create esmx my-project
```

## 命令选项

```
用法:
  create-esmx [项目名称] [选项]

选项:
  -t, --template <模板>    使用的模板 (默认: vue2)
  -f, --force              强制覆盖现有目录
  -h, --help               显示帮助信息
  -v, --version            显示版本号
```

## 支持的模板

目前支持以下模板:

- `vue2` - Vue 2 项目模板

## 许可证

MIT © Esmx Team 
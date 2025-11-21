---
titleSuffix: "基础路径与静态资源管理"
description: "详细介绍 Esmx 框架的基础路径配置，包括多环境部署、CDN 分发和资源访问路径设置，帮助开发者实现灵活的静态资源管理。"
head:
  - - "meta"
    - name: "keywords"
      content: "Esmx, 基础路径, Base Path, CDN, 静态资源, 多环境部署, 资源管理"
---

# 基础路径

基础路径（Base Path）是指应用程序中静态资源（如 JavaScript、CSS、图片等）的访问路径前缀。在 Esmx 中，合理配置基础路径对于以下场景至关重要：

- **多环境部署**：支持开发环境、测试环境、生产环境等不同环境的资源访问
- **多区域部署**：适配不同地区或国家的集群部署需求
- **CDN 分发**：实现静态资源的全球分发和加速

## 默认路径机制

Esmx 采用基于服务名的自动路径生成机制。默认情况下，框架会读取项目 `package.json` 中的 `name` 字段来生成静态资源的基础路径：`/your-app-name/`。

```json title="package.json"
{
    "name": "your-app-name"
}
```

这种约定优于配置的设计具有以下优势：

- **一致性**：确保所有静态资源使用统一的访问路径
- **可预测性**：通过 `package.json` 的 `name` 字段即可推断出资源的访问路径
- **可维护性**：无需额外配置，降低维护成本

## 动态路径配置

在实际项目中，我们经常需要将同一套代码部署到不同的环境或区域。Esmx 提供了动态基础路径的支持，使得应用程序能够适应不同的部署场景。

### 使用场景

#### 二级目录部署
```
- example.com      -> 默认主站
- example.com/cn/  -> 中文站点
- example.com/en/  -> 英文站点
```

#### 独立域名部署
```
- example.com    -> 默认主站
- cn.example.com -> 中文站点
- en.example.com -> 英文站点
```

### 配置方法

通过 `esmx.render()` 方法的 `base` 参数，你可以根据请求上下文动态设置基础路径：

```ts
const render = await esmx.render({
    base: '/cn',
    params: {
        url: req.url
    }
});
```

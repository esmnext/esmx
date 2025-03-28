---
titleSuffix: Esmx 框架服务端渲染核心机制
description: 详细介绍 Esmx 框架的渲染上下文（RenderContext）机制，包括资源管理、HTML 生成和 ESM 模块系统，帮助开发者理解和使用服务端渲染功能。
head:
  - - meta
    - property: keywords
      content: Esmx, 渲染上下文, RenderContext, SSR, 服务端渲染, ESM, 资源管理
---

# 渲染上下文

RenderContext 是 Esmx 框架中的一个核心类，主要负责服务端渲染（SSR）过程中的资源管理和 HTML 生成。它具有以下核心特点：

1. **基于 ESM 的模块系统**
   - 采用现代的 ECMAScript Modules 标准
   - 支持原生的模块导入导出
   - 实现了更好的代码分割和按需加载

2. **智能依赖收集**
   - 基于实际渲染路径动态收集依赖
   - 避免不必要的资源加载
   - 支持异步组件和动态导入

3. **精确的资源注入**
   - 严格控制资源加载顺序
   - 优化首屏加载性能
   - 确保客户端激活（Hydration）的可靠性

4. **灵活的配置机制**
   - 支持动态基础路径配置
   - 提供多种导入映射模式
   - 适应不同的部署场景

## 使用方式

在 Esmx 框架中，开发者通常不需要直接创建 RenderContext 实例，而是通过 `esmx.render()` 方法来获取实例：

```ts title="src/entry.node.ts"
async server(esmx) {
    const server = http.createServer((req, res) => {
        // 静态文件处理
        esmx.middleware(req, res, async () => {
            // 通过 esmx.render() 获取 RenderContext 实例
            const rc = await esmx.render({
                params: {
                    url: req.url
                }
            });
            // 响应 HTML 内容
            res.end(rc.html);
        });
    });
}
```

## 主要功能

### 依赖收集

RenderContext 实现了一套智能的依赖收集机制，它基于实际渲染的组件来动态收集依赖，而不是简单地预加载所有可能用到的资源：

#### 按需收集
- 在组件实际渲染过程中自动追踪和记录模块依赖
- 只收集当前页面渲染时真正使用到的 CSS、JavaScript 等资源
- 通过 `importMetaSet` 精确记录每个组件的模块依赖关系
- 支持异步组件和动态导入的依赖收集

#### 自动化处理
- 开发者无需手动管理依赖收集过程
- 框架自动在组件渲染时收集依赖信息
- 通过 `commit()` 方法统一处理所有收集到的资源
- 自动处理循环依赖和重复依赖的问题

#### 性能优化
- 避免加载未使用的模块，显著减少首屏加载时间
- 精确控制资源加载顺序，优化页面渲染性能
- 自动生成最优的导入映射（Import Map）
- 支持资源预加载和按需加载策略

### 资源注入

RenderContext 提供了多个方法来注入不同类型的资源，每个方法都经过精心设计以优化资源加载性能：

- `preload()`：预加载 CSS 和 JS 资源，支持优先级配置
- `css()`：注入首屏样式表，支持关键 CSS 提取
- `importmap()`：注入模块导入映射，支持动态路径解析
- `moduleEntry()`：注入客户端入口模块，支持多入口配置
- `modulePreload()`：预加载模块依赖，支持按需加载策略

### 资源注入顺序

RenderContext 严格控制资源注入顺序，这种顺序设计是基于浏览器的工作原理和性能优化考虑：

1. head 部分：
   - `preload()`：预加载 CSS 和 JS 资源，让浏览器尽早发现并开始加载这些资源
   - `css()`：注入首屏样式表，确保页面样式在内容渲染时就位

2. body 部分：
   - `importmap()`：注入模块导入映射，定义 ESM 模块的路径解析规则
   - `moduleEntry()`：注入客户端入口模块，必须在 importmap 之后执行
   - `modulePreload()`：预加载模块依赖，必须在 importmap 之后执行

## 完整渲染流程

一个典型的 RenderContext 使用流程如下：

```ts title="src/entry.server.ts"
export default async (rc: RenderContext) => {
    // 1. 渲染页面内容并收集依赖
    const app = createApp();
    const html = await renderToString(app, {
       importMetaSet: rc.importMetaSet
    });

    // 2. 提交依赖收集
    await rc.commit();
    
    // 3. 生成完整 HTML
    rc.html = `
        <!DOCTYPE html>
        <html>
        <head>
            ${rc.preload()}
            ${rc.css()}
        </head>
        <body>
            ${html}
            ${rc.importmap()}
            ${rc.moduleEntry()}
            ${rc.modulePreload()}
        </body>
        </html>
    `;
};
```

## 高级特性

### 基础路径配置

RenderContext 提供了一个灵活的动态基础路径配置机制，支持在运行时动态设置静态资源的基础路径：

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    base: '/esmx',  // 设置基础路径
    params: {
        url: req.url
    }
});
```

这种机制特别适用于以下场景：

1. **多语言站点部署**
   ```
   主域名.com      → 默认语言
   主域名.com/cn/  → 中文站点
   主域名.com/en/  → 英文站点
   ```

2. **微前端应用**
   - 支持子应用在不同路径下灵活部署
   - 便于集成到不同的主应用中

### 导入映射模式

RenderContext 提供了两种导入映射（Import Map）模式：

1. **Inline 模式**（默认）
   - 将导入映射直接内联到 HTML 中
   - 适合小型应用，减少额外的网络请求
   - 页面加载时立即可用

2. **JS 模式**
   - 通过外部 JavaScript 文件加载导入映射
   - 适合大型应用，可以利用浏览器缓存机制
   - 支持动态更新映射内容

可以通过配置选择合适的模式：

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    importmapMode: 'js',  // 'inline' | 'js'
    params: {
        url: req.url
    }
});
```

### 入口函数配置

RenderContext 支持通过 `entryName` 配置来指定服务端渲染的入口函数：

```ts title="src/entry.node.ts"
const rc = await esmx.render({
    entryName: 'mobile',  // 指定使用移动端入口函数
    params: {
        url: req.url
    }
});
```

这种机制特别适用于以下场景：

1. **多模板渲染**
   ```ts title="src/entry.server.ts"
   // 移动端入口函数
   export const mobile = async (rc: RenderContext) => {
       // 移动端特定的渲染逻辑
   };

   // 桌面端入口函数
   export const desktop = async (rc: RenderContext) => {
       // 桌面端特定的渲染逻辑
   };
   ```

2. **A/B 测试**
   - 支持同一页面使用不同的渲染逻辑
   - 便于进行用户体验实验
   - 灵活切换不同的渲染策略

3. **特殊渲染需求**
   - 支持某些页面使用自定义的渲染流程
   - 适应不同场景的性能优化需求
   - 实现更精细的渲染控制

## 最佳实践

1. **获取 RenderContext 实例**
   - 始终通过 `esmx.render()` 方法获取实例
   - 根据需要传入适当的参数
   - 避免手动创建实例

2. **依赖收集**
   - 确保所有模块都正确调用 `importMetaSet.add(import.meta)`
   - 在渲染完成后立即调用 `commit()` 方法
   - 合理使用异步组件和动态导入优化首屏加载

3. **资源注入**
   - 严格遵循资源注入顺序
   - 不要在 body 中注入 CSS
   - 确保 importmap 在 moduleEntry 之前

4. **性能优化**
   - 使用 preload 预加载关键资源
   - 合理使用 modulePreload 优化模块加载
   - 避免不必要的资源加载
   - 利用浏览器缓存机制优化加载性能

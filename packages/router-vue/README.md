# @esmx/router-vue

Vue 2/3 统一的路由组件库。

## 安装

```bash
npm install @esmx/router-vue
```

## 使用

### RouterLink 组件

RouterLink 组件提供了统一的路由导航功能，同时支持 Vue 2 和 Vue 3。

#### 基础用法

```vue
<template>
  <!-- 基础页面跳转 -->
  <router-link to="/home">首页</router-link>

  <!-- 替换当前历史记录 -->
  <router-link to="/about" type="replace">关于</router-link>

  <!-- 向后兼容写法（会显示废弃警告） -->
  <router-link to="/about" replace>关于</router-link>
</template>
```

#### 高级用法

```vue
<template>
  <!-- 窗口级导航 -->
  <router-link to="/external" type="pushWindow">新窗口打开</router-link>

  <!-- 弹层导航 -->
  <router-link 
    to="/modal" 
    type="pushLayer"
    :layer-options="{ zIndex: 1000, autoPush: false }"
  >
    打开弹层
  </router-link>

  <!-- 自定义事件和样式 -->
  <router-link 
    to="/news" 
    :event="['click', 'mouseenter']"
    active-class="nav-active"
    exact="route"
  >
    新闻
  </router-link>

  <!-- 自定义标签 -->
  <router-link to="/submit" tag="button" class="btn btn-primary">
    提交
  </router-link>
</template>
```

#### API

##### Props

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `to` | `RouteLocationRaw` | - | 前往的路由路径（必需） |
| `type` | `RouterLinkNavigationType` | `'push'` | 路由跳转方式 |
| `replace` | `boolean` | `false` | **已废弃** 请使用 `type="replace"` |
| `tag` | `string` | `'a'` | 节点使用的标签名 |
| `exact` | `RouteMatchType` | `'include'` | 路径激活匹配规则 |
| `activeClass` | `string` | `'router-link-active'` | 路由激活时的CSS类名 |
| `event` | `string \| string[]` | `'click'` | 触发路由跳转的事件类型 |
| `layerOptions` | `Partial<RouterLayerOptions>` | - | 弹层导航选项（仅 `type="pushLayer"` 时有效） |

##### 类型定义

```typescript
type RouterLinkNavigationType = 
  | 'push' 
  | 'replace' 
  | 'pushWindow' 
  | 'replaceWindow' 
  | 'pushLayer';

type RouteMatchType = 'route' | 'exact' | 'include';
```

#### 匹配规则说明

- `'include'`: 路径包含即激活（如：当前路由 `/news/list`，链接 `/news` 也会激活）
- `'route'`: 路由匹配才激活（需要路由树一致）
- `'exact'`: 完全匹配才激活（路由树和参数都需匹配）

#### 跳转类型说明

- `'push'`: 添加新的历史记录
- `'replace'`: 替换当前历史记录
- `'pushWindow'`: 新窗口打开
- `'replaceWindow'`: 替换窗口
- `'pushLayer'`: 弹层模式

### 组合式API

```typescript
import { useRouter, useRoute, useProvideRouter } from '@esmx/router-vue';

export default {
  setup() {
    const router = useRouter();
    const route = useRoute();
    
    // 编程式导航
    const goHome = () => {
      router.push('/home');
    };
    
    return {
      router,
      route,
      goHome
    };
  }
};
```

## 兼容性

- ✅ Vue 2.6+
- ✅ Vue 3.0+
- ✅ TypeScript 支持
- ✅ 服务端渲染 (SSR)

## 迁移指南

### 从旧版本迁移

如果你使用了 `replace` 属性，请迁移到 `type` 属性：

```vue
<!-- 旧写法（会显示废弃警告） -->
<router-link to="/about" replace>关于</router-link>

<!-- 新写法 -->
<router-link to="/about" type="replace">关于</router-link>
``` 
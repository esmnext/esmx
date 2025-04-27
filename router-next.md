# Esmx 路由库设计

## 接口设计
```ts
export interface RouterOptions {
    /**
     * 基础URL配置，用于处理多语言、多区域等场景的路由前缀。
     * 必须是一个URL对象，例如：new URL('/zh-CN', window.location.origin)
     */
    baseURL?: URL;

    /**
     * URL规范化函数，用于实现跨区域无刷新导航。此函数可以将不同格式的区域URL（包括子域名和路径格式）
     * 统一转换为标准的内部路由格式，从而实现统一的路由管理和无缝的用户体验。
     */
    normalizeURL?: (url: URL, baseURL: URL) => URL;
}
```

## 跨站点URL转换

### 问题背景

在全球化业务场景中，用户可能通过不同区域站点(国际站、中国站、印尼站)访问相同内容。这带来以下挑战：
1. **跨区域访问体验不一致**：用户在不同区域站点间切换时，应用状态无法保持
2. **内容分享障碍**：用户生成的内容(如分享链接)在不同区域站点展示时无法自动适配
3. **导航体验差**：区域切换通常需要页面重载，影响用户体验

### 解决方案

通过URL转换功能实现：
1. **多区域站点统一访问**：支持国际站(www.esmx.com)、中国站(www.esmx.cn)、印尼站(www.esmx.co.id)
2. **智能URL转换**：自动将跨区域URL转换为当前站点的相对路径
3. **无刷新导航**：保持单页应用状态，提升用户体验

### 实现示例

```ts
/**
 * URL转换配置
 * 功能：将支持的跨区域URL转换为当前站点的相对路径
 */
const router = new Router({
  baseURL: new URL('https://www.esmx.cn'),
  normalizeURL(url: URL, baseURL: URL) {
    // 支持的域名列表（国际站、中国站、印尼站）
    const supportedDomains = [
      'www.esmx.com',   // 国际站
      'www.esmx.cn',    // 中国站
      'www.esmx.co.id'  // 印尼站
    ];
    
    // 仅转换支持的域名
    if (supportedDomains.includes(url.hostname)) {
      /**
       * 转换逻辑：
       * 1. 保留原始路径和查询参数
       * 2. 使用当前站点域名重建URL
       * 3. 保持单页应用的无刷新体验
       */
      return new URL(url.pathname + url.search + url.hash, baseURL);
    }
    
    // 非支持域名（如第三方链接）保持原样
    return url;
  }
});
```

### 实际应用价值

1. **内容分享**：国际站产品链接在中国站自动转换
   - 转换前：`https://www.esmx.com/products?id=123`
   - 转换后：`https://www.esmx.cn/products?id=123`

2. **内容管理**：印尼站关于页面在中国站自动适配
   - 转换前：`https://www.esmx.co.id/about`
   - 转换后：`https://www.esmx.cn/about`

3. **外部链接保护**：第三方链接保持不变
   - 如：`https://www.google.com` → 保持不变


## 微前端场景

在大型前端应用开发中，不同业务团队可能使用不同的技术栈。一个团队可能偏好Vue，而另一个团队可能更熟悉React。微前端路由支持可以让这些不同技术栈的应用无缝集成，使用户体验保持一致。

```ts
// 路由应用注册器
interface RouterRegisterApp {
    // 应用挂载函数
    mount: () => void;
    // 应用销毁函数
    unmount: () => void;
    // 服务端渲染时的渲染函数
    renderToString: () => string;
}

const router = new Router({
    initUrl: '/',
    routes: [
        {
            path: '/',
            appType: 'vue2',
            component: Home
        },
        {
            path: '/about',
            appType: 'vue2',
            component: About
        }
    ]
});

// 初始化路由
await router.init();
// 更新路由
await router.push('/about');
// 服务端渲染时调用
await router.renderToString();
```

## 站外URL场景
一般的路由库，总是支持应用内路由跳转，但是对于外站跳转，需要额外的处理逻辑，并不走路由库的控制。我们希望能有这样的一个路由库，它能帮我们处理外站跳转，并且支持应用内路由跳转。

```ts
const router = new Router({
    // ...
    validateOutside(target: URL) {
        return !['www.esmx.com', 'www.esmx.cn'].includes(target.hostname);
    },
    handleOutside () {

    }
});
// 站内跳转
router.push('/about');
// 站外跳转
router.push('https://www.google.com');
```
import type { RouteRecord } from '../types';

/**
 * 判断是否是同一个路由
 */
export function isSameRoute(from: RouteRecord, to: RouteRecord) {
    return (
        from.matched.length === to.matched.length &&
        from.matched.every((record, i) => record === to.matched[i])
    );
}

/**
 * 判断是否是全等的路由: 路径完全相同
 */
export function isEqualRoute(from: RouteRecord, to: RouteRecord) {
    return (
        // 这里不仅仅判断了前后的path是否一致
        // 同时判断了匹配路由对象的个数
        // 这是因为在首次初始化时 this.current 的值为 { path:'/',matched:[] }
        // 假如我们打开页面同样为 / 路径时，此时如果单纯判断path那么就会造成无法渲染
        from.fullPath === to.fullPath &&
        from.matched.length === to.matched.length
    );
}

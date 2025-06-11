import type { Route, RouteConfirmHookResult, RouteMatchType } from './types';
export const isBrowser = typeof window === 'object';

export function isNotNullish(value: unknown): boolean {
    return (
        value !== undefined &&
        value !== null &&
        !Number.isNaN(
            value instanceof Number
                ? value.valueOf() // 对于 new Number() 的情况
                : value
        )
    );
}

export function isPlainObject(o: unknown): o is Record<string, any> {
    return (
        o?.constructor === Object ||
        Object.prototype.toString.call(o) === '[object Object]'
    );
}

/**
 * 检查值是否是一个有效的非空普通对象
 * 只检查可枚举的字符串键，确保是真正的普通对象
 * @param value 要检查的值
 * @returns 如果是有效的非空普通对象则返回 true
 */
export function isNonEmptyPlainObject(
    value: unknown
): value is Record<string, any> {
    if (!isPlainObject(value)) {
        return false;
    }
    // 只检查可枚举的字符串键，确保是普通对象的有效属性
    return Object.keys(value as Record<string, any>).length > 0;
}

export const removeFromArray = <T>(arr: T[], ele: T) => {
    if (!Array.isArray(arr) || arr.length === 0) return;
    const i = Number.isNaN(ele)
        ? // 如果 ele 是 NaN，使用 findIndex 查找 NaN，因为 NaN !== NaN，所以不能直接用 indexOf
          arr.findIndex((item) => Number.isNaN(item))
        : arr.indexOf(ele);
    if (i === -1) return;
    arr.splice(i, 1);
};

export function isValidConfirmHookResult(
    result: unknown
): result is Exclude<RouteConfirmHookResult, void> {
    return (
        result === false ||
        typeof result === 'function' ||
        typeof result === 'string' ||
        isPlainObject(result)
    );
}

export function isUrlEqual(url1: URL, url2?: URL | null): boolean {
    // 如果 url2 不存在，返回 false
    if (!url2) {
        return false;
    }

    // 如果是同一个对象引用，直接返回 true
    if (url1 === url2) {
        return true;
    }

    // 拷贝一份并排序 query
    (url1 = new URL(url1)).searchParams.sort();
    (url2 = new URL(url2)).searchParams.sort();
    // 避免空 hash 带来的尾随井号影响
    // biome-ignore lint/correctness/noSelfAssign:
    url1.hash = url1.hash;
    // biome-ignore lint/correctness/noSelfAssign:
    url2.hash = url2.hash;
    return url1.href === url2.href;
}

/**
 * 比较两个路由是否匹配
 *
 * @param route1 第一个路由对象
 * @param route2 第二个路由对象，可能为 null
 * @param matchType 匹配类型
 * - 'route': 路由级匹配，比较路由配置是否相同
 * - 'exact': 完全匹配，比较完整路径是否相同
 * - 'include': 包含匹配，判断 route1 路径是否以 route2 路径开头
 * @returns 是否匹配
 */
export function isRouteMatched(
    route1: Route,
    route2: Route | null,
    matchType: RouteMatchType
): boolean {
    if (!route2) return false;

    switch (matchType) {
        case 'route':
            // 路由级匹配 - 比较路由配置
            return route1.config === route2.config;

        case 'exact':
            // 完全匹配 - 完整路径相同
            return route1.fullPath === route2.fullPath;

        case 'include':
            // 包含匹配 - route1 路径包含 route2 路径
            return route1.fullPath.startsWith(route2.fullPath);

        default:
            return false;
    }
}

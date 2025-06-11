import type { RouteConfirmHookResult } from './types';
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

export function isESModule(obj: any): boolean {
    return Boolean(obj?.__esModule) || obj?.[Symbol.toStringTag] === 'Module';
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

    // 比较协议、主机名、端口、路径名、哈希、用户名和密码
    if (
        url1.protocol !== url2.protocol ||
        url1.hostname !== url2.hostname ||
        url1.port !== url2.port ||
        url1.pathname !== url2.pathname ||
        url1.hash !== url2.hash ||
        url1.username !== url2.username ||
        url1.password !== url2.password
    ) {
        return false;
    }

    // 比较查询参数（忽略参数顺序，处理重复参数名）
    const params1 = url1.searchParams;
    const params2 = url2.searchParams;

    // 检查参数数量是否相同
    if (params1.size !== params2.size) {
        return false;
    }

    // 检查每个键名对应的所有值是否相同
    for (const key of new Set(params1.keys())) {
        // 获取所有同名参数的值并排序比较
        const values1 = params1.getAll(key).sort();
        const values2 = params2.getAll(key).sort();

        // 比较数组长度和内容
        if (
            values1.length !== values2.length ||
            !values1.every((value, index) => value === values2[index])
        ) {
            return false;
        }
    }

    return true;
}

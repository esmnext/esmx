/**
 * 是否在浏览器环境
 */
export const inBrowser = typeof window !== 'undefined';

/**
 *  Symbol 是否可用
 */
export const isSymbolAble =
    typeof Symbol === 'function' && typeof Symbol.toStringTag === 'symbol';

/**
 * 判断是否是 es module 对象
 */
export function isESModule(obj: any): boolean {
    return (
        Boolean(obj.__esModule) ||
        (isSymbolAble && obj[Symbol.toStringTag] === 'Module')
    );
}

/**
 * 判断是否是合法的值
 */
export function isValidValue(value: any): boolean {
    if (value === null) return false;
    if (value === undefined) return false;
    if (typeof value === 'number' && isNaN(value)) return false;
    return true;
}

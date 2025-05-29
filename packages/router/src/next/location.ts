/**
 * 路由位置处理模块
 * 提供URL标准化和路由位置解析功能
 */

import type { RouterRawLocation } from './types';
import { isNotNullish } from './util';

/**
 * 标准化URL字符串
 * 将各种格式的location字符串转换为标准的URL对象
 *
 * @param location - 位置字符串，可能是相对路径、绝对路径或协议相对路径
 * @param base - 基础URL，用于解析相对路径
 * @returns 标准化后的URL对象
 *
 * @example
 * ```typescript
 * const base = new URL('https://example.com');
 *
 * // 协议相对路径
 * normalizeURL('//cdn.example.com/path', base); // http://cdn.example.com/path
 *
 * // 空字符串返回基础URL
 * normalizeURL('', base); // https://example.com
 *
 * // 绝对URL
 * normalizeURL('https://other.com', base); // https://other.com
 *
 * // 相对路径
 * normalizeURL('/path', base); // https://example.com/path
 * ```
 */
export function normalizeURL(location: string, base: URL): URL {
    // 处理协议相对路径（以//开头）
    if (location.startsWith('//')) {
        return new URL(`http:${location}`);
    }

    // 空字符串返回基础URL的副本
    if (!location) {
        return new URL(base);
    }

    try {
        // 尝试作为绝对URL解析
        return new URL(location);
    } catch {
        // 解析失败则作为相对路径处理
        return new URL(location, base);
    }
}

/**
 * 解析路由位置对象
 * 将RouterRawLocation（字符串或对象）转换为完整的URL对象
 *
 * @param location - 路由位置，可以是字符串或包含路径、查询参数、hash等的对象
 * @param baseURL - 基础URL，用于解析相对路径
 * @returns 解析后的完整URL对象
 *
 * @example
 * ```typescript
 * const base = new URL('https://example.com');
 *
 * // 字符串类型
 * parseLocation('/users', base); // https://example.com/users
 *
 * // 对象类型
 * parseLocation({
 *   path: '/users',
 *   query: { page: '1', size: '10' },
 *   queryArray: { tags: ['vue', 'react'] },
 *   hash: 'section1'
 * }, base); // https://example.com/users?page=1&size=10&tags=vue&tags=react#section1
 * ```
 */
export function parseLocation(location: RouterRawLocation, baseURL: URL): URL {
    // 流程分支: 字符串类型直接标准化
    if (typeof location === 'string') {
        return normalizeURL(location, baseURL);
    }

    // 解构对象并设置默认值
    const { path = '/', query = {}, queryArray = {}, hash = '' } = location;
    const url = normalizeURL(path, baseURL);

    // 处理普通查询参数（键值对形式）
    Object.entries(query).forEach(([key, value]) => {
        if (isNotNullish(value)) {
            url.searchParams.set(key, String(value));
        }
    });

    // 处理数组查询参数（同一个键对应多个值）
    Object.entries(queryArray).forEach(([key, values]) => {
        values.forEach((value) => {
            if (isNotNullish(value)) {
                url.searchParams.append(key, value);
            }
        });
    });

    // 设置hash值（URL片段标识符）
    url.hash = hash;

    return url;
}

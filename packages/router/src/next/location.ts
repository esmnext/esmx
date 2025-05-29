import type { RouterRawLocation } from './types';
import { isNotNullish } from './util';

/**
 * URL标准化处理器
 *
 * 简化流程图：
 *
 *      输入 location + base
 *             |
 *             ↓
 *      location为空？
 *             |
 *      ┌------+------┐
 *      |             |
 *     YES            NO
 *      |             |
 *      ↓             ↓
 *  返回URL对象    检查路径类型
 *                    |
 *             ┌------+------┐
 *             |      |      |
 *          绝对路径  相对路径  完整URL
 *             |      |      |
 *             ↓      ↓      ↓
 *         添加前缀   直接    构建URL
 *          构建     构建   (失败回退)
 *             \      |      /
 *              \     |     /
 *               \    |    /
 *                \   |   /
 *                 \  |  /
 *                  \ | /
 *                   \|/
 *                    ↓
 *                返回URL对象
 *
 * 四种处理模式：
 * • 空值 → 返回基础URL
 * • /path → 添加前缀 + 基础URL
 * • ./path → 相对路径 + 基础URL
 * • http://... → 直接构建（失败则协议回退）
 *
 * @param {string} location - 需要标准化的URL字符串
 * @param {URL} base - 基础URL对象，用于相对路径解析
 * @returns {URL} 标准化后的URL对象
 */
export function normalizeURL(location: string, base: URL): URL {
    if (location.startsWith('//')) {
        return new URL(`http:${location}`);
    }
    if (!location) {
        return new URL(base);
    }
    try {
        return new URL(location);
    } catch {
        return new URL(location, base);
    }
}

/**
 * 解析路由位置对象为标准URL
 *
 * 处理流程：
 * 1. 判断输入类型：字符串直接标准化
 * 2. 对象类型则解构提取路径、查询参数和哈希值
 * 3. 标准化基础路径
 * 4. 处理普通查询参数（键值对）
 * 5. 处理数组类型查询参数（一键多值）
 * 6. 设置哈希值
 *
 * @param {RouterRawLocation} location - 路由位置对象或字符串
 * @param {URL} baseURL - 基础URL对象，用于相对路径解析
 * @returns {URL} 解析后的标准URL对象
 */
export function parseLocation(location: RouterRawLocation, baseURL: URL): URL {
    // 流程分支: 字符串类型直接标准化
    if (typeof location === 'string') {
        return normalizeURL(location, baseURL);
    }

    // 解构对象并设置默认值
    const { path = '/', query = {}, queryArray = {}, hash = '' } = location;
    const url = normalizeURL(path, baseURL);

    // 处理普通查询参数
    Object.entries(query).forEach(([key, value]) => {
        if (isNotNullish(value)) {
            url.searchParams.set(key, String(value));
        }
    });

    // 处理数组查询参数
    Object.entries(queryArray).forEach(([key, values]) => {
        values.forEach((value) => {
            if (isNotNullish(value)) {
                url.searchParams.append(key, value);
            }
        });
    });

    // 设置hash值
    url.hash = hash;

    return url;
}

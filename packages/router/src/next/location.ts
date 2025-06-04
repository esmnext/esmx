import type { RouteLocationRaw } from './types';
import { isNotNullish } from './util';

export function normalizeURL(url: string | URL, base: URL): URL {
    // 处理协议相对路径（以//开头）
    if (typeof url === 'string' && url.startsWith('//')) {
        return new URL(`http:${url}`);
    }
    return URL.parse(url) || new URL(url, base);
}

export function parseLocation(toRaw: RouteLocationRaw, baseURL: URL): URL {
    if (typeof toRaw === 'string') {
        return normalizeURL(toRaw, baseURL);
    }
    const url = normalizeURL(toRaw.path ?? toRaw.url ?? '', baseURL);
    const searchParams = url.searchParams;
    // 处理普通查询参数（键值对形式）
    if (toRaw.query) {
        Object.entries(toRaw.query).forEach(([key, value]) => {
            if (isNotNullish(value)) {
                searchParams.set(key, String(value));
            }
        });
    }

    // 处理数组查询参数（同一个键对应多个值）
    if (toRaw.queryArray) {
        Object.entries(toRaw.queryArray).forEach(([key, values]) => {
            values.forEach((value) => {
                if (
                    isNotNullish(value) &&
                    !searchParams.getAll(key).includes(value)
                ) {
                    searchParams.append(key, value);
                }
            });
        });
    }

    // 设置hash值（URL片段标识符）
    if (toRaw.hash) {
        url.hash = toRaw.hash;
    }

    return url;
}

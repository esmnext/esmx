import type { RouteLocationRaw } from './types';
import { isNotNullish } from './util';

export function normalizeURL(url: string | URL, base: URL): URL {
    if (typeof url === 'string') {
        // 处理协议相对路径（以//开头）
        if (url.startsWith('//')) {
            return new URL(`http:${url}`);
        }
        // 相对于根的路径（根为 base）
        if (url.startsWith('/')) {
            base = new URL('.', base);
            const parsed = new URL(url, base);
            parsed.pathname = base.pathname.slice(0, -1) + parsed.pathname; // 确保路径正确
            return parsed;
        }
    }
    return URL.parse(url) || new URL(url, base);
}

export function parseLocation(toRaw: RouteLocationRaw, baseURL: URL): URL {
    if (typeof toRaw === 'string') {
        return normalizeURL(toRaw, baseURL);
    }
    const url = normalizeURL(toRaw.path ?? toRaw.url ?? '', baseURL);
    const searchParams = url.searchParams;

    // 优先级 queryArray > query > path中的query
    Object.entries<string | (string | undefined)[]>(
        Object.assign({}, toRaw.query, toRaw.queryArray)
    ).forEach(([key, value]) => {
        searchParams.delete(key); // 清除之前的同名参数
        value = Array.isArray(value) ? value : [value];
        value.filter(isNotNullish).forEach((v) => {
            searchParams.append(key, String(v));
        });
    });

    // 设置hash值（URL片段标识符）
    if (toRaw.hash) {
        url.hash = toRaw.hash;
    }

    return url;
}

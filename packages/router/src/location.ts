import type { RouteLocationInput } from './types';
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

export function parseLocation(toInput: RouteLocationInput, baseURL: URL): URL {
    if (typeof toInput === 'string') {
        return normalizeURL(toInput, baseURL);
    }
    const url = normalizeURL(toInput.path ?? toInput.url ?? '', baseURL);
    const searchParams = url.searchParams;

    // 优先级 queryArray > query > path中的query
    Object.entries<string | (string | undefined)[]>(
        Object.assign({}, toInput.query, toInput.queryArray)
    ).forEach(([key, value]) => {
        searchParams.delete(key); // 清除之前的同名参数
        value = Array.isArray(value) ? value : [value];
        value.filter(isNotNullish).forEach((v) => {
            searchParams.append(key, String(v));
        });
    });

    // 设置hash值（URL片段标识符）
    if (toInput.hash) {
        url.hash = toInput.hash;
    }

    return url;
}

import type { RouterRawLocation } from './types';

export function normalizeURL(location: string, base: URL | string) {
    base = new URL(base);
    if (!location) {
        return new URL(base);
    } else if (location.startsWith('/') && !location.startsWith('//')) {
        return new URL(`.${location}`, base);
    } else if (/^\.\.?\//.test(location)) {
        return new URL(location, base);
    }
    try {
        return new URL(location);
    } catch {
        return new URL(`${base.protocol}//${location}`);
    }
}

export function parseLocation(
    location: RouterRawLocation,
    baseURL: URL | string
): URL {
    if (typeof location === 'string') {
        return normalizeURL(location, baseURL);
    }

    const { path = '/', query = {}, queryArray = {}, hash = '' } = location;
    const url = normalizeURL(path, baseURL);

    // 添加查询参数
    Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.set(key, String(value));
        }
    });

    // 添加数组查询参数
    Object.entries(queryArray).forEach(([key, values]) => {
        values.forEach((value) => {
            url.searchParams.append(key, value);
        });
    });

    url.hash = hash;

    return url;
}

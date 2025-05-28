import type { RouterRawLocation } from './types';

export function normalizeURL(location: string, base: URL) {
    if (!location) {
        return new URL(base);
    } else if (location.startsWith('/')) {
        return new URL(`.${location}`, base);
    } else if (location.startsWith('./')) {
        return new URL(location, base);
    }
    return new URL(`http://${location}`);
}

export function rawLocationToURL(
    location: RouterRawLocation,
    baseURL: URL
): URL {
    if (typeof location === 'string') {
        try {
            return new URL(location);
        } catch {
            return normalizeURL(location, baseURL);
        }
    }

    const { path = '/', query = {}, queryArray = {}, hash = '' } = location;
    const url = normalizeURL(path, baseURL);

    // 添加查询参数
    Object.entries(query).forEach(([key, value]) => {
        value && url.searchParams.set(key, value);
    });

    // 添加数组查询参数
    Object.entries(queryArray).forEach(([key, values]) => {
        values.forEach((value) => {
            url.searchParams.append(key, value);
        });
    });

    // 设置 hash
    if (hash) {
        url.hash = hash.startsWith('#') ? hash : `#${hash}`;
    }

    return url;
}

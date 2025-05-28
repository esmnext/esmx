import type { RouterRawLocation } from './types';

export function rawLocationToURL(
    location: RouterRawLocation,
    baseURL: URL
): URL {
    if (typeof location === 'string') {
        try {
            return new URL(location);
        } catch {
            if (!location) {
                return new URL(baseURL);
            }

            if (location.startsWith('/')) {
                return new URL(`.${location}`, baseURL);
            }
            if (location.startsWith('./')) {
                return new URL(location, baseURL);
            }
            return new URL(`http://${location}`);
        }
    }

    const { path = '/', query = {}, queryArray = {}, hash = '' } = location;
    const url = new URL(path, baseURL);

    // 添加查询参数
    Object.entries(query).forEach(([key, value]) => {
        if (typeof value === 'string') {
            url.searchParams.set(key, value);
        }
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

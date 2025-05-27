import type { RouterRawLocation } from './types';

export function rawLocationToURL(
    locationURL: RouterRawLocation,
    baseURL: URL
): URL {
    if (typeof locationURL === 'string') {
        try {
            return new URL(locationURL);
        } catch {
            if (locationURL && !locationURL.startsWith('/')) {
                return new URL(`http://${locationURL}`);
            }
            return new URL(locationURL, baseURL);
        }
    }

    const { path = '/', query = {}, queryArray = {}, hash = '' } = locationURL;
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

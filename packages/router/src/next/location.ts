import type { RouterRawLocation } from './types';

export function rawLocationToURL(location: RouterRawLocation, base: URL): URL {
    if (typeof location === 'string') {
        try {
            return new URL(location);
        } catch {
            if (location && !location.startsWith('/')) {
                return new URL(`http://${location}`);
            }
            return new URL(location, base);
        }
    }

    const { path = '/', query = {}, queryArray = {}, hash = '' } = location;
    const url = new URL(path, base);

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

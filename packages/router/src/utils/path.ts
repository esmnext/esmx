import normalizeUrl from 'normalize-url';
import URLParse from 'url-parse';

import type {
    HistoryState,
    Route,
    RouterBase,
    RouterLocation,
    RouterRawLocation
} from '../types';
import {
    decode,
    decodeQuery,
    encodeHash,
    encodeQueryKey,
    encodeQueryValue
} from './encoding';
import { isValidValue } from './utils';
import { assert, warn } from './warn';

/**
 * 判断路径是否以 http 或 https 开头 或者直接是域名开头
 */
export const regexDomain =
    /^(?:https?:\/\/|[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9](\/.*)?/i;

/**
 * 判断路径是否以 scheme 协议开头
 */
export const regexScheme = /^(?:[a-z][a-z\d+.-]*:.+)/i;

/**
 * 判断路径是否以 http(s) 协议开头
 */
export const regexHttpScheme = /^(http(s)?:\/\/)/;

/**
 * 去除URL路径中重复的斜杠，但不改变协议部分的双斜杠。
 *
 * @param url 需要处理的URL字符串。
 * @returns 处理后的URL，重复的斜杠被去除。
 */
function removeDuplicateSlashes(url: string): string {
    // 正则表达式匹配除了://之外的连续两个或以上斜杠，并替换为一个斜杠
    if (url.includes('://')) {
        const [base, path] = url.split('://');
        const result = path.replace(/\/{2,}/g, '/');
        return `${base}://${result}`;
    }

    const result = url.replace(/\/{2,}/g, '/');
    return result;
}

/**
 * 格式化路径 主要用于拼接嵌套路由的路径
 * 返回的格式化后的路径如果有协议则以协议开头，如果没有协议则以/开头
 */
export function normalizePath(path: string, parentPath?: string) {
    // 如果path以/开头 说明是绝对路径，不需要拼接路径
    // 按 Hanson 要求，不提供绝对路径
    // if (path.startsWith('/')) {
    //     return removeDuplicateSlashes(path);
    // }
    let normalizedPath = parentPath ? `${parentPath}/${path}` : `${path}`;

    // 当解析的路径不是以http 或 https 协议开头时，给开头加上/
    if (
        !regexHttpScheme.test(normalizedPath) &&
        !normalizedPath.startsWith('/')
    ) {
        normalizedPath = `/${normalizedPath}`;
    }

    return (
        // 只有存在父级路由才进行路由拼接
        removeDuplicateSlashes(normalizedPath) // 将多个斜杠 / 替换为单个斜杠 /
            .replace(/\/$/, '') || // 移除结尾的斜杠 /
        '/' // 为空字符串时至少返回单个 /
    );
}

/**
 * 路径解析方法
 * @example 输入 https://www.google.com/test1/test2?a=1&b=2#123 输出 { pathname: '/test1/test2', query: { a: '1', b: '2' }, queryArray: { a: ['1'], b: ['2'] }, hash: '123' }
 * 输入 /test1/test2?a=1&b=2#123 同样输出 { pathname: '/test1/test2', query: { a: '1', b: '2' }, queryArray: { a: ['1'], b: ['2'] }, hash: '123' }
 */
export function parsePath(path = ''): {
    pathname: string;
    query: Record<string, string>;
    queryArray: Record<string, string[]>;
    hash: string;
} {
    path = normalizePath(path);
    const { pathname, query, hash } = new URLParse(path || '/');
    const queryObj = {};
    const queryArray = {};
    if (query.length > 0) {
        query
            .slice(1)
            .split('&')
            .forEach((item) => {
                let [key = '', value = ''] = item.split('=');
                key = decode(key);
                value = decodeQuery(value);
                if (key) {
                    queryObj[key] = value;
                    queryArray[key] = (queryArray[key] || []).concat(value);
                }
                // queryArray[key] = [
                //     ...(queryArray[key] || []),
                //     ...(value !== undefined ? [value] : [])
                // ];
            });
    }
    return {
        pathname,
        query: queryObj,
        queryArray,
        hash: decode(hash)
    };
}

/**
 * 将path query hash合并为完整路径
 * @example stringifyPath({ pathname: '/news', query: { a: '1' }, hash: '123' }) 输出 '/news?a=1#123'
 */
export function stringifyPath(
    {
        pathname = '',
        query = {},
        queryArray = {},
        hash = ''
    }: {
        pathname: string;
        /* 按 Hanson 要求加入 undefined 类型 */
        query: Record<string, string | undefined>;
        queryArray: Record<string, string[]>;
        hash: string;
    } = {
        pathname: '',
        query: {},
        queryArray: {},
        hash: ''
    }
): string {
    const queryString = Object.entries(
        Object.assign({}, query, queryArray)
    ).reduce((acc, [key, value]) => {
        let query = '';
        const encodedKey = encodeQueryKey(key);

        if (Array.isArray(value)) {
            query = value.reduce((all, item) => {
                if (!isValidValue(item)) return all;
                const encodedValue = encodeQueryValue(item);
                if (encodedValue) {
                    all = all
                        ? `${all}&${encodedKey}=${encodedValue}`
                        : `${encodedKey}=${encodedValue}`;
                }
                return all;
            }, '');
        } else {
            const encodedValue = encodeQueryValue(value);
            if (isValidValue(value)) {
                query = `${encodedKey}=${encodedValue}`;
            }
        }

        if (query) {
            acc = acc ? `${acc}&${query}` : `?${query}`;
        }

        return acc;
    }, '');

    const hashContent = hash.startsWith('#') ? hash.replace(/^#/, '') : hash;
    const hashString = hashContent ? `#${encodeHash(hashContent)}` : '';
    return `${pathname}${queryString}${hashString}`;
}

/**
 * 标准化 RouterLocation 字段
 */
export function normalizeLocation(
    rawLocation: RouterRawLocation,
    base: RouterBase = ''
): RouterLocation & {
    path: string;
    base: string;
    queryArray: Record<string, string[]>;
} {
    let pathname = '';
    /* 按 Hanson 要求加入 undefined 类型 */
    let query: Record<string, string | undefined> = {};
    let queryArray: Record<string, string[]> = {};
    let hash = '';
    let params: Record<string, string> | undefined;
    let state: HistoryState = {};

    if (typeof rawLocation === 'object') {
        const parsedOption = parsePath(rawLocation.path);
        pathname = parsedOption.pathname;

        // 只有在rawLocation初始传入了 query 或 queryArray 时才使用 rawLocation
        if (rawLocation.query || rawLocation.queryArray) {
            queryArray = rawLocation.queryArray || {};
            query = rawLocation.query || {};
        } else {
            queryArray = parsedOption.queryArray;
            query = parsedOption.query;
        }

        hash = rawLocation.hash || parsedOption.hash;

        params = rawLocation.params; // params 不使用默认值
        state = rawLocation.state || {};
    } else {
        const parsedOption = parsePath(rawLocation);
        pathname = parsedOption.pathname;
        query = parsedOption.query;
        queryArray = parsedOption.queryArray;
        hash = parsedOption.hash;
    }

    const fullPath = stringifyPath({
        pathname,
        query,
        queryArray,
        hash
    });
    const baseString = normalizePath(
        typeof base === 'function'
            ? base({
                  fullPath,
                  query,
                  queryArray,
                  hash
              })
            : base
    );

    let path = pathname;
    // 如果 base 部分包含域名
    if (regexDomain.test(baseString)) {
        const { pathname } = new URLParse(baseString);
        path = normalizePath(path.replace(new RegExp(`^(${pathname})`), ''));
    }
    path = normalizePath(path.replace(new RegExp(`^(${baseString})`), ''));

    const { query: realQuery, queryArray: realQueryArray } =
        parsePath(fullPath);

    const res: RouterLocation & {
        path: string;
        base: string;
        queryArray: Record<string, string[]>;
    } = {
        base: baseString,
        path,
        query: realQuery,
        queryArray: realQueryArray,
        hash,
        state
    };
    if (params) res.params = params;
    return res;
}

/**
 * 判断路径是否以协议或域名开头
 */
export function isPathWithProtocolOrDomain(
    location: RouterRawLocation,
    base: RouterBase = ''
): {
    /**
     * 是否以协议或域名开头
     */
    flag: boolean;
    /**
     * 虚假的 route 信息，内部跳转时无法信任，只有外站跳转时使用
     */
    route: Route;
} {
    let url = '';
    let state = {};
    let baseString = '';
    if (typeof base === 'string') {
        baseString = base;
    } else {
        baseString = base({
            fullPath: '',
            query: {},
            queryArray: {},
            hash: ''
        });
    }

    if (typeof location === 'string') {
        url = location;
    } else {
        state = location.state || {};
        const {
            path,
            query = {},
            queryArray,
            hash = '',
            ...nLocation
        } = normalizeLocation(location);
        url = stringifyPath({
            ...nLocation,
            query,
            queryArray,
            pathname: path,
            hash
        });
    }

    try {
        url = normalizeUrl(url, {
            stripWWW: false,
            removeQueryParameters: false,
            sortQueryParameters: false
        });
    } catch (error) {
        try {
            url = new URL(url, baseString).href;
        } catch (error) {
            assert(false, `Invalid URL: ${url}`);
        }
    }

    // 如果以 scheme 协议开头 并且不是 http(s) 协议开头 则认为是外站跳转
    if (regexScheme.test(url) && !regexHttpScheme.test(url)) {
        const {
            hash,
            host,
            hostname,
            href,
            origin,
            pathname,
            port,
            protocol,
            search
        } = new URL(url);
        const route: Route = {
            hash,
            host,
            hostname,
            href,
            origin,
            pathname,
            port,
            protocol,
            search,
            params: {},
            query: {},
            queryArray: {},
            state,
            meta: {},
            path: pathname,
            fullPath: url,
            base: '',
            matched: []
        };
        return {
            flag: true,
            route
        };
    }

    const {
        hash,
        host,
        hostname,
        href,
        origin,
        pathname,
        port,
        protocol,
        query: search
    } = new URLParse(url);
    const { query = {}, queryArray } = normalizeLocation(url);
    const route: Route = {
        href,
        origin,
        host,
        protocol,
        hostname,
        port,
        pathname,
        search,
        hash,
        query,
        queryArray,
        params: {},
        state,
        meta: {},
        path: pathname,
        fullPath: `${pathname}${search}${hash}`,
        base: '',
        matched: []
    };

    if (regexDomain.test(url)) {
        return {
            flag: true,
            route
        };
    }

    return {
        flag: false,
        route
    };
}

import normalizeUrl from 'normalize-url';
import URLParse from 'url-parse';
import type {
    HistoryState,
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
import { getSubObj, isValidValue } from './utils';
import { assert } from './warn';

/**
 * 判断路径是否以 http 或 https 开头 或者直接是域名开头
 */
export const regexDomain =
    /^(?:https?:\/\/|[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z\d][a-z\d-]{0,61}[a-z\d](\/.*)?/i;

/**
 * 判断路径是否以 scheme 协议开头
 */
export const regexScheme = /^[a-z][a-z\d+.-]*:./i;

/**
 * 判断路径是否以 http(s) 协议开头
 */
export const regexHttpScheme = /^https?:\/\//;

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
 * @example
 * parsePath('https://www.google.com/test1/test2?a=1&b=2#123') === {
 *   pathname: '/test1/test2',
 *   query: { a: '1', b: '2' },
 *   queryArray: { a: ['1'], b: ['2'] },
 *   hash: '#123'
 * }
 * parsePath('/test1/test2?a=1&b=2#123') === {
 *   pathname: '/test1/test2',
 *   query: { a: '1', b: '2' },
 *   queryArray: { a: ['1'], b: ['2'] },
 *   hash: '#123'
 * }
 * parsePath('test1/test2/?a=&b=1&b=2&c#h') === {
 *  pathname: '/test1/test2/',
 *  query: { a: '', b: '1', c: '' },
 *  queryArray: { a: [''], b: ['1', '2'], c: [''] },
 *  hash: '#h'
 * }
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
                queryObj[key] = value;
                (queryArray[key] ||= []).push(value);
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
 * @example
 * stringifyPath({ pathname: '/news', query: { a: '1', b: void 0, c: NaN, d: null, e: '' }, hash: '123' }) === '/news?a=1&e=#123'
 * stringifyPath({ pathname: '/news', hash: '#123' }) === '/news#123'
 * stringifyPath({ pathname: '/news', query: { a: '1' }, queryArray: { a: ['2', '3'] } }) === '/news?a=2&a=3'
 */
export function stringifyPath({
    pathname = '',
    query = {},
    queryArray = {},
    hash = ''
}: {
    pathname?: string;
    /* 按 Hanson 要求加入 undefined 类型 */
    query?: Record<string, string | undefined>;
    queryArray?: Record<string, string[]>;
    hash?: string;
} = {}): string {
    const queryString = Object.entries(
        Object.assign({}, query, queryArray)
    ).reduce((acc, [key, value]) => {
        let query = '';
        const encodedKey = encodeQueryKey(key);

        if (Array.isArray(value)) {
            query = value.reduce((all, item) => {
                if (!isValidValue(item)) return all;
                const encodedValue = encodeQueryValue(item);
                all = all
                    ? `${all}&${encodedKey}=${encodedValue}`
                    : `${encodedKey}=${encodedValue}`;
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
 * 标准化 RouterLocation 字段。
 * * 如果 path 字段中有 query，同时有 query/queryArray 字段，则 path 中的 query 会被忽略。
 * @example
 * this._normLocation(location).fullPath 的输出：
 * * `` -> `/`
 * * `/xxx` -> `/xxx`
 * * `xxx` -> `/xxx`
 * * `./xxx` -> `/./xxx`
 * * `../xxx` -> `/../xxx`
 * * `//xxx` -> `/xxx`
 * * `.` -> `/.`
 * * `..` -> `/..`
 * * `https://xxx` -> `/`
 * * `/xxx?a=&b=1&b=2&c#h` -> `/xxx?a=&b=1&b=2&c=#h`
 * * `xxx?a=&b=1&b=2&c#h` -> `/xxx?a=&b=1&b=2&c=#h`
 * * `./xxx?a=&b=1&b=2&c#h` -> `/./xxx?a=&b=1&b=2&c=#h`
 * * `../xxx?a=&b=1&b=2&c#h` -> `/../xxx?a=&b=1&b=2&c=#h`
 * * `//xxx?a=&b=1&b=2&c#h` -> `/xxx?a=&b=1&b=2&c=#h`
 * * `?a=&b=1&b=2&c#h` -> `/?a=&b=1&b=2&c=#h`
 * * `.?a=&b=1&b=2&c#h` -> `/.?a=&b=1&b=2&c=#h`
 * * `..?a=&b=1&b=2&c#h` -> `/..?a=&b=1&b=2&c=#h`
 * * `./?a=&b=1&b=2&c#h` -> `/.?a=&b=1&b=2&c=#h`
 * * `../?a=&b=1&b=2&c#h` -> `/..?a=&b=1&b=2&c=#h`
 * * `./.?a=&b=1&b=2&c#h` -> `/./.?a=&b=1&b=2&c=#h`
 * * `../.?a=&b=1&b=2&c#h` -> `/../.?a=&b=1&b=2&c=#h`
 * * `././?a=&b=1&b=2&c#h` -> `/./.?a=&b=1&b=2&c=#h`
 * * `.././?a=&b=1&b=2&c#h` -> `/../.?a=&b=1&b=2&c=#h`
 * * `https://xxx?a=&b=1&b=2&c#h` -> `/?a=&b=1&b=2&c=#h`
 */
export function normalizeLocation(
    rawLocation: RouterRawLocation,
    base: RouterBase = '',
    defaultPath = ''
): RouterLocation & {
    path: string;
    base: string;
    queryArray: Record<string, string[]>;
    fullPath: string;
} {
    let pathname = '';
    /* 按 Hanson 要求加入 undefined 类型 */
    let query: Record<string, string | undefined> = {};
    let queryArray: Record<string, string[]> = {};
    let hash = '';
    let params: Record<string, string> | undefined;
    let state: HistoryState = {};

    if (typeof rawLocation === 'object') {
        const parsedOption = parsePath(rawLocation.path ?? defaultPath);
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
        ({ pathname, query, queryArray, hash } = parsePath(
            rawLocation ?? defaultPath
        ));
    }

    const fullPath = stringifyPath({ pathname, query, queryArray, hash });
    const baseString = normalizePath(new URL(base).href);

    let path = pathname;
    // 如果 base 部分包含域名
    if (regexDomain.test(baseString)) {
        const { pathname } = new URLParse(baseString);
        path = normalizePath(path.replace(new RegExp(`^(${pathname})`), ''));
    }
    path = normalizePath(path.replace(new RegExp(`^(${baseString})`), ''));

    const { query: realQuery, queryArray: realQueryArray } =
        parsePath(fullPath);

    return {
        base: baseString,
        path,
        query: realQuery,
        queryArray: realQueryArray,
        hash,
        state,
        fullPath: stringifyPath({
            pathname: path,
            query: realQuery,
            queryArray: realQueryArray,
            hash
        }),
        ...(params ? { params } : {})
    };
}

/**
 * 合并多个 URL 的路径、查询参数和哈希值。
 * * 后传递的路径会作为前传递的路径的base进行拼接。
 * * 查询参数会追加而不会覆盖。
 * * 哈希值的覆盖顺序是先传递的哈希值会覆盖后传递的哈希值。
 * @param url 需要合并的 URL数组
 * @returns 合并后的 URL，如果数组长度 <= 1，则返回 undefined
 * @example
 * mergeUrl(
 *   new URL('https://example.com/p1?q1=1&a=1&a=2#hash1'),
 *   new URL('https://example.com/p2?q2=2&a=10&a=20#hash2')
 * )  // === 'https://example.com/p2/p1?q1=1&a=1&a=2&q2=2&a=10&a=20#hash1'
 */
export function mergeUrl(...url: URL[]) {
    if (url.length <= 1) return;
    return url.slice(0, -1).reduceRight(
        (base, cur) => {
            cur = new URL(cur.href);
            cur.pathname =
                (base.pathname.endsWith('/')
                    ? base.pathname.slice(0, -1)
                    : base.pathname) + cur.pathname;
            base.searchParams.forEach((value, key) => {
                cur.searchParams.append(key, value);
            });
            if (!cur.hash) cur.hash = base.hash;
            return new URL(cur.href);
        },
        new URL(url.at(-1)!.href)
    );
}

/**
 * 从 url 中提取指定的属性值，并将其组合并转换为字符串。
 */
export function url2str(url: URL, keys: (keyof URL)[] = ['href']): string {
    if (keys.length === 0) return url.href;
    // [protocol://][[username][:password]@]hostname[:port][pathname][?query][#hash]
    if (keys.includes('origin')) keys.push('protocol', 'hostname', 'port');
    if (keys.includes('host')) keys.push('hostname', 'port');
    const obj = getSubObj(url, keys);
    const f = (k: keyof URL, suffix = '', prefix = '') =>
        obj[k] ? prefix + obj[k] + suffix : '';
    return `${f('protocol', '//')}${f(
        'username',
        'password' in obj ? '' : '@'
    )}${f('password', '@', ':')}${f('hostname')}${f('port', '', ':')}${f(
        'pathname'
    )}${f('search')}${f('hash')}`;
}

/**
 * 解析 URL
 * @param location 用户输入的路径
 * @param curFullPath 当前路径，用于解析相对路径
 */
export function routeLoc2URL(
    location: RouterRawLocation,
    curFullPath: string,
    base?: RouterBase
) {
    base = base ? new URL(base) : void 0;
    const path =
        typeof location === 'string'
            ? location
            : stringifyPath({ ...location, pathname: location.path });
    // 这里应该分为三种情况：带协议的、相对路径、绝对路径(相对于根的相对路径)
    const isWithProtocol = regexScheme.test(path) || path.startsWith('//');
    const isAbsolute = path.startsWith('/');
    // const isRelative = !isWithProtocol && !isAbsolute;
    let url = '';
    if (isWithProtocol) {
        // 通过 URL 来解析和规范化 URL，第二个参数是为了 '//' 开头的时候拼接协议
        url = new URL(path, 'http://localhost').href;
    } else if (base) {
        if (isAbsolute) {
            url = mergeUrl(new URL(path, base), base)!.href;
        } else {
            const currentUrl = mergeUrl(new URL(curFullPath, base), base)!;
            url = new URL(path, currentUrl).href;
        }
    } else {
        // 在没有 base 的时候的一些处理
        url = normalizeLocation(location, base, curFullPath).fullPath;
        try {
            url = normalizeUrl(url, {
                stripWWW: false,
                removeQueryParameters: false,
                sortQueryParameters: false
            });
        } catch (error) {
            try {
                url = new URL(url).href;
            } catch (error) {
                assert(false, `Invalid URL: ${url}`);
            }
        }
    }
    return new URL(url);
}

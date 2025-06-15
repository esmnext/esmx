import { createMatcher } from './matcher';
import { RouterMode } from './types';
import type { Route, RouterOptions, RouterParsedOptions } from './types';
import { isBrowser } from './util';

/**
 * 获取路由器的基础 URL 对象
 * @param options 路由器选项
 * @returns 处理后的 URL 对象
 */
function getBaseUrl(options: RouterOptions): URL {
    // 确定 URL 源
    let sourceUrl: string | URL;
    let context = '';

    if (options.base) {
        sourceUrl = options.base;
    } else if (isBrowser) {
        sourceUrl = location.origin;
    } else if (options.req) {
        // 服务端：尝试从 req 对象中获取
        const { req } = options;
        const protocol =
            req.headers['x-forwarded-proto'] ||
            req.headers['x-forwarded-protocol'] ||
            (req.socket && 'encrypted' in req.socket && req.socket.encrypted
                ? 'https'
                : 'http');
        const host =
            req.headers['x-forwarded-host'] ||
            req.headers.host ||
            req.headers['x-real-ip'] ||
            'localhost';
        const port = req.headers['x-forwarded-port'];
        const path = req.url || '';

        sourceUrl = `${protocol}://${host}${port ? `:${port}` : ''}${path}`;
        context = 'from request headers';
    } else {
        // 服务端环境且没有 req，或者其他未知情况
        sourceUrl = 'https://www.esmnext.com/';
        context = !isBrowser
            ? 'server environment without request context'
            : 'unknown context';
    }

    // 解析 URL（失败时回退到默认值）
    const base =
        URL.parse('.', sourceUrl) ??
        (() => {
            console.warn(
                `Failed to parse base URL ${context ? context + ' ' : ''}'${sourceUrl}', using default: https://www.esmnext.com/`
            );
            return new URL('https://www.esmnext.com/');
        })();

    // 清理并返回
    base.search = base.hash = '';
    return base;
}

export function parsedOptions(
    options: RouterOptions = {}
): RouterParsedOptions {
    const base = getBaseUrl(options);
    const routes = Array.from(options.routes ?? []);
    return Object.freeze<RouterParsedOptions>({
        rootStyle: options.rootStyle ? { ...options.rootStyle } : false,
        root: options.root || '#root',
        context: options.context ?? {},
        env: options.env || '',
        req: options.req || null,
        res: options.res || null,
        layer: options.layer ? { ...options.layer } : null,
        base,
        mode: isBrowser
            ? (options.mode ?? RouterMode.history)
            : RouterMode.memory,
        routes,
        apps:
            typeof options.apps === 'function'
                ? options.apps
                : Object.assign({}, options.apps),
        matcher: createMatcher(routes),
        normalizeURL: options.normalizeURL ?? ((url) => url),
        location: options.location ?? DEFAULT_LOCATION,
        onBackNoResponse: options.onBackNoResponse ?? (() => {})
    });
}

export function DEFAULT_LOCATION(
    to: Route,
    from: Route | null,
    context?: { res?: any }
) {
    const href = to.url.href;

    // 服务端环境：处理应用层重定向和状态码
    if (!isBrowser && context?.res) {
        // 确定状态码：优先使用路由指定的状态码，默认使用 302 临时重定向
        let statusCode = 302;

        // 验证重定向状态码有效性（3xx 系列）
        const validRedirectCodes = [300, 301, 302, 303, 304, 307, 308];
        if (to.statusCode && validRedirectCodes.includes(to.statusCode)) {
            statusCode = to.statusCode;
        } else if (to.statusCode) {
            console.warn(
                `Invalid redirect status code ${to.statusCode}, using default 302`
            );
        }

        // 设置重定向响应
        context.res.statusCode = statusCode;
        context.res.setHeader('Location', href);
        context.res.end();
        return;
    }

    // 客户端环境：处理浏览器导航
    if (isBrowser) {
        if (to.isPush) {
            try {
                const newWindow = window.open(href);
                if (!newWindow) {
                    location.href = href;
                } else {
                    newWindow.opener = null; // 解除新窗口与当前窗口的关系
                }
                return newWindow;
            } catch {}
        }
        location.href = href;
    }

    // 服务端环境且没有 res 上下文时，不做任何操作
}

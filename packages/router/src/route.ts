import type { IncomingMessage, ServerResponse } from 'node:http';
import { parseLocation } from './location';
import { parsedOptions } from './options';
import { RouteStatus } from './types';
import {
    type RouteHandleHook,
    type RouteHandleResult,
    type RouteLocationInput,
    type RouteMatchResult,
    type RouteMeta,
    type RouteOptions,
    type RouteParsedConfig,
    type RouteState,
    RouteType,
    type RouterParsedOptions
} from './types';
import { isNonEmptyPlainObject, isPlainObject } from './util';

/**
 * Route 类中不可枚举属性的配置
 * 这些属性在对象遍历、序列化等操作中会被隐藏
 */
export const NON_ENUMERABLE_PROPERTIES = [
    // 私有字段 - 内部实现细节
    '_handled',
    '_handle',
    '_handleResult',
    '_options',

    // SSR 专用属性 - 在客户端环境中无意义
    'req',
    'res',

    // 内部上下文 - 框架内部使用
    'context',

    // 状态码 - 内部状态信息
    'statusCode'
] satisfies string[];

/**
 * 创建默认的路由选项
 */
function createDefaultRouteOptions(): Required<RouteOptions> {
    return {
        options: parsedOptions(),
        toType: RouteType.none,
        toInput: '/',
        from: null
    };
}

/**
 * 将用户传入的参数拼接到URL路径中
 * @param match 路由匹配结果
 * @param toInput 用户传入的路由位置对象
 * @param base 基础URL
 * @param to 当前解析的URL对象
 */
export function applyRouteParams(
    match: RouteMatchResult,
    toInput: RouteLocationInput,
    base: URL,
    to: URL
): void {
    if (
        !isPlainObject(toInput) ||
        !isNonEmptyPlainObject(toInput.params) ||
        !match.matches.length
    ) {
        return;
    }

    // 获取最后匹配的路由配置
    const lastMatch = match.matches[match.matches.length - 1];

    // 分割当前路径
    const current = to.pathname.split('/');

    // 用用户参数编译新路径并分割
    const next = new URL(
        lastMatch.compile(toInput.params).substring(1),
        base
    ).pathname.split('/');

    // 用新路径片段替换当前路径片段
    next.forEach((item, index) => {
        current[index] = item || current[index];
    });

    // 更新URL路径
    to.pathname = current.join('/');

    // 合并参数到匹配结果中，用户参数优先
    Object.assign(match.params, toInput.params);
}

/**
 * Route 类提供完整的路由对象功能
 */
export class Route {
    // 私有字段用于 handle 验证
    private _handled = false;
    private _handle: RouteHandleHook | null = null;
    private _handleResult: RouteHandleResult | null = null;
    private readonly _options: RouterParsedOptions;

    // 公共属性
    public status: RouteStatus = RouteStatus.resolved;
    public statusCode: number | null = null;
    public readonly state: RouteState;
    public readonly keepScrollPosition: boolean;

    // 只读属性
    public readonly type: RouteType;
    public readonly isPush: boolean;
    public readonly req: IncomingMessage | null;
    public readonly res: ServerResponse | null;
    public readonly context: Record<string | symbol, any>;
    public readonly url: URL;
    public readonly path: string;
    public readonly fullPath: string;
    public readonly hash: string;
    public readonly params: Record<string, string> = {};
    public readonly query: Record<string, string | undefined>;
    public readonly queryArray: Record<string, string[] | undefined>;
    public readonly meta: RouteMeta;
    public readonly matched: readonly RouteParsedConfig[];
    public readonly config: RouteParsedConfig | null;

    constructor(routeOptions: Partial<RouteOptions> = {}) {
        // 合并默认选项
        const defaults = createDefaultRouteOptions();
        const finalOptions = { ...defaults, ...routeOptions };

        const { options, toType, toInput, from } = finalOptions;

        // 保存原始选项用于克隆
        this._options = options;
        this.type = toType;
        this.isPush = toType.startsWith('push');
        this.req = options.req;
        this.res = options.res;
        this.context = options.context;

        const base = options.base;
        const to = options.normalizeURL(parseLocation(toInput, base), from);
        const isSameOrigin = to.origin === base.origin;
        const isSameBase = to.pathname.startsWith(base.pathname);
        const match =
            isSameOrigin && isSameBase ? options.matcher(to, base) : null;

        this.url = to;
        this.path = match
            ? to.pathname.substring(base.pathname.length - 1)
            : to.pathname;
        this.fullPath = match
            ? `${this.path}${to.search}${to.hash}`
            : to.pathname + to.search + to.hash;
        this.matched = match ? match.matches : Object.freeze([]);
        this.keepScrollPosition = isPlainObject(toInput)
            ? Boolean(toInput.keepScrollPosition)
            : false;
        this.config =
            this.matched.length > 0
                ? this.matched[this.matched.length - 1]
                : null;
        this.meta = this.config?.meta || {};

        // 初始化状态对象 - 创建新的本地对象，合并外部传入的状态
        const state: RouteState = {};
        if (isPlainObject(toInput) && toInput.state) {
            Object.assign(state, toInput.state);
        }
        this.state = state;

        // 初始化查询参数对象
        const query: Record<string, string | undefined> = {};
        const queryArray: Record<string, string[] | undefined> = {};

        // 处理查询参数
        for (const key of new Set(to.searchParams.keys())) {
            query[key] = to.searchParams.get(key)!;
            queryArray[key] = to.searchParams.getAll(key);
        }
        this.query = query;
        this.queryArray = queryArray;
        this.hash = to.hash;

        // 应用用户传入的路由参数（如果匹配成功）
        if (match) {
            applyRouteParams(match, toInput, base, to);
            // 将匹配到的参数赋值给路由对象
            Object.assign(this.params, match.params);
        }

        // 设置状态码
        // 优先使用用户传入的statusCode
        if (isPlainObject(toInput) && typeof toInput.statusCode === 'number') {
            this.statusCode = toInput.statusCode;
        } else if (isPlainObject(toInput) && toInput.statusCode === null) {
            this.statusCode = null;
        }
        // 如果没有传入statusCode，保持默认的null值

        // 设置属性的可枚举性
        this._configureEnumerability();
    }

    // handle 相关的 getter/setter
    get handle(): RouteHandleHook | null {
        return this._handle;
    }

    set handle(val: RouteHandleHook | null) {
        this.setHandle(val);
    }

    get handleResult(): RouteHandleResult | null {
        return this._handleResult;
    }

    set handleResult(val: RouteHandleResult | null) {
        this._handleResult = val;
    }

    /**
     * 配置属性的可枚举性
     * 将内部实现细节设为不可枚举，保持用户常用属性可枚举
     */
    private _configureEnumerability(): void {
        // 根据配置将指定属性设为不可枚举
        for (const property of NON_ENUMERABLE_PROPERTIES) {
            Object.defineProperty(this, property, { enumerable: false });
        }
    }

    /**
     * 设置 handle 函数，包装验证逻辑
     */
    setHandle(val: RouteHandleHook | null): void {
        if (typeof val !== 'function') {
            this._handle = null;
            return;
        }
        const self = this;
        this._handle = function handle(
            this: Route,
            ...args: Parameters<RouteHandleHook>
        ) {
            if (this.status !== RouteStatus.success) {
                throw new Error(
                    `Cannot call route handle hook - current status is ${this.status} (expected: ${RouteStatus.success})`
                );
            }
            if (self._handled) {
                throw new Error(
                    'Route handle hook can only be called once per navigation'
                );
            }
            self._handled = true;
            return val.call(this, ...args);
        };
    }

    /**
     * 合并新的状态到当前路由的 state 中
     * @param newState 要合并的新状态
     */
    mergeState(newState: Partial<RouteState>): void {
        // 直接合并新的状态，不清空现有状态
        Object.assign(this.state, newState);
    }

    /**
     * 设置单个状态值
     * @param name 状态名称
     * @param value 状态值
     */
    setState(name: string, value: any): void {
        this.state[name] = value;
    }

    /**
     * 将当前路由的所有属性同步到目标路由对象中
     * 用于响应式系统中的路由对象更新
     * @param targetRoute 目标路由对象
     */
    syncTo(targetRoute: Route): void {
        // 复制可枚举属性
        Object.assign(targetRoute, this);

        // 复制不可枚举属性 - 类型安全的属性复制
        for (const property of NON_ENUMERABLE_PROPERTIES) {
            if (property in this && property in targetRoute) {
                // 使用 Reflect.set 进行类型安全的属性设置
                const value = Reflect.get(this, property);
                Reflect.set(targetRoute, property, value);
            }
        }
    }

    /**
     * 克隆当前路由实例
     * 返回一个新的 Route 实例，包含相同的配置和状态
     */
    clone(): Route {
        // 重新构造路由对象，传入当前的状态
        const toInput = {
            path: this.fullPath,
            state: { ...this.state }
        };

        // 从构造函数的 finalOptions 中获取原始的 options
        const options = this._options;

        const clonedRoute = new Route({
            options,
            toType: this.type,
            toInput
        });

        // 手动复制statusCode，因为它可能被手动修改过
        clonedRoute.statusCode = this.statusCode;

        return clonedRoute;
    }
}

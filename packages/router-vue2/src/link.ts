import {
    type RouteRecord,
    type RouterRawLocation,
    isEqualRoute,
    isSameRoute
} from '@esmx/router';
import { type PropType, defineComponent } from 'vue';

import { useRoute, useRouter } from './use';

export interface RouterLinkProps {
    /**
     * 前往的路由路径
     */
    to: RouterRawLocation;

    /**
     * 节点使用的标签名
     * @default 'a'
     */
    tag: string;

    /**
     * 调用 router.replace 以替换 router.push。
     * @default false
     */
    replace: boolean;

    /**
     * 路径激活匹配规则
     * @example include => 路径包含即激活.
     * 如: 当前路由为/en/news/list  此时router-link 的路径为 /en/news 也会激活
     * @example route => 路由匹配才会激活,需要匹配的路由树一致.
     * 如: 当前路由为/en/news/list/123  此时router-link 的路径为 /en/news/list 也会激活
     * @example exact => 路径全匹配才会激活，不仅需要匹配路由树一致，还需要参数匹配才会激活.
     * 如: 当前路由为/en/news/list/123  此时router-link 的路径为 /en/news/list/123 才会激活，如果配置的路径为/en/news/list/123456 也不会激活
     * @default 'include'
     */
    exact: 'include' | 'route' | 'exact';

    /**
     * 是否为相对路径
     * 按照 Hanson 要求目前都是绝对路径，因此废弃此属性
     * @default false
     */
    // append?: boolean;

    /**
     * 路由激活时的class
     * @default 'router-link-active'
     */
    activeClass: string;

    /**
     * 哪些事件触发路由跳转
     * @default 'click'
     */
    event: string | string[];
}

export const RouterLink = defineComponent({
    functional: true,
    props: {
        to: {
            type: [String, Object] as PropType<RouterLinkProps['to']>,
            required: true
        },
        tag: {
            type: String as PropType<RouterLinkProps['tag']>,
            default: 'a'
        },
        replace: {
            type: Boolean as PropType<RouterLinkProps['replace']>,
            default: false
        },
        exact: {
            type: String as PropType<RouterLinkProps['exact']>,
            default: 'include'
        },
        // append: {
        //     type: Boolean as PropType<boolean>,
        //     default: false
        // },
        activeClass: {
            type: String as PropType<RouterLinkProps['activeClass']>,
            default: 'router-link-active'
        },
        event: {
            type: String as PropType<RouterLinkProps['event']>,
            default: 'click'
        }
    },
    render(h, ctx) {
        const { to, tag, replace, exact, activeClass, event } = ctx.props;
        const router = useRouter();
        const current = useRoute();
        const resolveRoute = router.resolve(to);

        /* 匹配函数 */
        let compare: (current: RouteRecord, route: RouteRecord) => Boolean;
        switch (exact) {
            /* 路由级匹配 */
            case 'route':
                compare = isSameRoute;
                break;

            /* 全匹配 */
            case 'exact':
                compare = isEqualRoute;
                break;

            /* 是否包含 */
            // case 'include':
            default:
                compare = (current: RouteRecord, route: RouteRecord) => {
                    return current.fullPath.startsWith(route.fullPath);
                };
                break;
        }

        /* 根据路由是否匹配获取高亮 */
        const active = compare(current, resolveRoute);

        /* 事件处理函数 */
        const handler = (e: MouseEvent) => {
            if (guardEvent(e)) {
                router[replace ? 'replace' : 'push'](to);
            }
        };

        /* 可触发事件 map */
        const on: Record<string, Function | Function[]> = {};
        const eventTypeList = getEventTypeList(event);
        eventTypeList.forEach((eventName) => {
            on[eventName.toLocaleLowerCase()] = handler;
        });

        const className = !ctx.data.class
            ? []
            : Array.isArray(ctx.data.class)
              ? ctx.data.class
              : [ctx.data.class];

        return h(
            tag,
            {
                ...ctx.data,
                class: [
                    ...className,
                    'router-link',
                    {
                        [activeClass]: active
                    }
                ],
                attrs: {
                    ...(ctx.data.attrs || {}),
                    href: resolveRoute.fullPath
                },
                on
            },
            ctx.children
        );
    }
});

function getEventTypeList(eventType: string | string[]): string[] {
    if (Array.isArray(eventType)) {
        if (eventType.length > 0) {
            return eventType;
        }
        return ['click'];
    }
    return [eventType || 'click'];
}

function guardEvent(e: MouseEvent) {
    // don't redirect with control keys
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
    // don't redirect when preventDefault called
    if (e.defaultPrevented) return;
    // don't redirect on right click
    if (e.button !== undefined && e.button !== 0) return;
    // don't redirect if `target="_blank"`
    // @ts-expect-error getAttribute does exist
    if (e.currentTarget?.getAttribute) {
        // @ts-expect-error getAttribute exists
        const target = e.currentTarget.getAttribute('target');
        if (/\b_blank\b/i.test(target)) return;
    }
    // this may be a Weex event which doesn't have this method
    if (e.preventDefault) e.preventDefault();

    return true;
}

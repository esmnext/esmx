import type { Route, RouteConfig } from '@esmx/router';
import {
    type ComputedRef,
    type PropType,
    type ShallowReactive,
    type Slot,
    computed,
    defineComponent,
    getCurrentInstance,
    h,
    inject,
    provide,
    shallowReactive
} from 'vue';

import { routerViewDepthKey, routerViewLocationKey } from './symbols';

function isESModule(obj: any): boolean {
    return Boolean(obj?.__esModule) || obj?.[Symbol.toStringTag] === 'Module';
}

export const RouterView = defineComponent({
    name: 'RouterView',
    inheritAttrs: true,
    props: {
        name: {
            type: String as PropType<string>,
            default: 'default'
        },
        route: Object as PropType<Route>
    },

    // Better compat for @vue/compat users
    // https://github.com/vuejs/router/issues/1315
    compatConfig: { MODE: 3 },

    setup: (props, { attrs, slots }) => {
        const instance = getCurrentInstance();
        if (!instance) {
            console.error('no current instance');
            return;
        }

        const injectedRoute = inject<ShallowReactive<Route>>(
            routerViewLocationKey
        )!;

        const routeToDisplay = computed<Route>(
            () => props.route || injectedRoute
        );
        const injectedDepth = inject<ComputedRef<number>>(
            routerViewDepthKey,
            computed(() => 0)
        );

        const depth = computed<number>(() => {
            let initialDepth = injectedDepth.value;
            const { matched } = routeToDisplay.value;
            let matchedRoute: RouteConfig | undefined;
            while (
                (matchedRoute = matched[initialDepth]) &&
                !matchedRoute?.component
            ) {
                initialDepth++;
            }
            return initialDepth;
        });

        provide(routerViewLocationKey, shallowReactive(routeToDisplay.value));
        provide(
            routerViewDepthKey,
            computed(() => depth.value + 1)
        );

        return () => {
            const matchRoute = routeToDisplay.value.matched[depth.value];
            if (!matchRoute) {
                return null;
            }

            // 处理 ES 模块格式的组件
            let componentToRender = matchRoute.component;
            if (isESModule(componentToRender)) {
                componentToRender =
                    componentToRender.default || componentToRender;
            }

            const component = h(
                componentToRender,
                Object.assign({}, props, attrs)
            );
            return (
                // pass the vnode to the slot as a prop.
                // h and <component :is="..."> both accept vnodes
                normalizeSlot(slots.default, { Component: component }) ||
                component
            );
        };
    }
});

function normalizeSlot(slot: Slot | undefined, data: any) {
    if (!slot) return null;
    const slotContent = slot(data);
    return slotContent.length === 1 ? slotContent[0] : slotContent;
}

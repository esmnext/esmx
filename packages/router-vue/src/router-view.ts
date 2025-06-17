import { defineComponent, h, inject, provide } from 'vue';
import { useRoute } from './use';
import { resolveComponent } from './util';

const RouterViewDepthKey = Symbol('RouterViewDepth');

/**
 * RouterView 组件
 */
export const RouterView = defineComponent({
    name: 'RouterView',

    setup() {
        const route = useRoute();
        const depth = inject(RouterViewDepthKey, 0);
        provide(RouterViewDepthKey, depth + 1);

        return () => {
            const component = resolveComponent(route.matched[depth]?.component);
            return component ? h(component) : null;
        };
    }
});

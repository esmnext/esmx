import type {
    RouteLocationInput,
    RouteMatchType,
    RouterLayerOptions,
    RouterLinkType
} from '@esmx/router';
import { type PropType, defineComponent, h, version } from 'vue';
import { useLink } from './use';

// Vue版本检测
const IS_VUE3 = version.startsWith('3.');

/**
 * RouterLink 组件
 */
export const RouterLink = defineComponent({
    name: 'RouterLink',
    props: {
        to: {
            type: [String, Object] as PropType<RouteLocationInput>,
            required: true
        },
        type: { type: String as PropType<RouterLinkType>, default: 'push' },
        replace: { type: Boolean, default: false },
        tag: { type: String, default: 'a' },
        exact: { type: String as PropType<RouteMatchType>, default: 'include' },
        activeClass: { type: String },
        event: {
            type: [String, Array] as PropType<string | string[]>,
            default: 'click'
        },
        layerOptions: { type: Object as PropType<Partial<RouterLayerOptions>> }
    },

    setup(props, { slots }) {
        const link = useLink(props);
        return () => {
            const data = link.value;
            const eventHandlers = data.getEventHandlers(
                IS_VUE3
                    ? (name) =>
                          `on${name.charAt(0).toUpperCase()}${name.slice(1)}`
                    : undefined
            );

            return h(
                data.tag,
                {
                    ...data.attributes,
                    ...(IS_VUE3 ? eventHandlers : { on: eventHandlers })
                },
                slots.default?.()
            );
        };
    }
});

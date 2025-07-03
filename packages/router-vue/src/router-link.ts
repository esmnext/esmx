import type {
    RouteLayerOptions,
    RouteLocationInput,
    RouteMatchType,
    RouterLinkType
} from '@esmx/router';
import { type PropType, defineComponent, h } from 'vue';
import { useLink } from './use';
import { isVue3 } from './util';

/**
 * RouterLink component for navigation.
 * Renders an anchor tag with proper navigation behavior and active state management.
 *
 * @param props - Component properties
 * @param props.to - Target route location to navigate to
 * @param props.type - Navigation type ('push' | 'replace' | 'pushWindow' | 'replaceWindow' | 'pushLayer')
 * @param props.replace - Use type='replace' instead
 * @param props.exact - How to match the active state ('include' | 'exact' | 'route')
 * @param props.activeClass - CSS class to apply when link is active
 * @param props.event - Event(s) that trigger navigation
 * @param props.tag - Custom tag to render instead of 'a'
 * @param props.layerOptions - Layer options for layer-based navigation
 * @param slots - Component slots
 * @param slots.default - Default slot content
 * @returns Vue component instance
 *
 * @example
 * ```vue
 * <template>
 *   <nav>
 *     <!-- Basic navigation -->
 *     <RouterLink to="/home">Home</RouterLink>
 *     <RouterLink to="/about">About</RouterLink>
 *
 *     <!-- With custom styling -->
 *     <RouterLink
 *       to="/dashboard"
 *       active-class="nav-active"
 *     >
 *       Dashboard
 *     </RouterLink>
 *
 *     <!-- Replace navigation -->
 *     <RouterLink to="/login" type="replace">Login</RouterLink>
 *
 *     <!-- Custom tag and exact matching -->
 *     <RouterLink
 *       to="/contact"
 *       exact="exact"
 *       tag="button"
 *       class="btn"
 *     >
 *       Contact
 *     </RouterLink>
 *   </nav>
 * </template>
 * ```
 */
export const RouterLink = defineComponent({
    name: 'RouterLink',
    props: {
        /**
         * Target route location to navigate to.
         * Can be a string path or route location object.
         * @example '/home' | { path: '/user', query: { id: '123' } }
         */
        to: {
            type: [String, Object] as PropType<RouteLocationInput>,
            required: true
        },
        /**
         * Navigation type for the link.
         * @default 'push'
         * @example 'push' | 'replace' | 'pushWindow' | 'replaceWindow' | 'pushLayer'
         */
        type: { type: String as PropType<RouterLinkType>, default: 'push' },
        /**
         * @deprecated Use 'type="replace"' instead
         * @example :replace={true} → type="replace"
         */
        replace: { type: Boolean, default: false },
        /**
         * How to match the active state.
         * - 'include': Match if current route includes this path
         * - 'exact': Match only if routes are exactly the same
         * - 'route': Match based on route configuration
         * @default 'include'
         */
        exact: { type: String as PropType<RouteMatchType>, default: 'include' },
        /**
         * CSS class to apply when link is active (route matches).
         * @example 'nav-active' | 'selected'
         */
        activeClass: { type: String },
        /**
         * Event(s) that trigger navigation. Can be string or array of strings.
         * @default 'click'
         * @example 'click' | ['click', 'mouseenter']
         */
        event: {
            type: [String, Array] as PropType<string | string[]>,
            default: 'click'
        },
        /**
         * Custom tag to render instead of 'a'.
         * @default 'a'
         * @example 'button' | 'div' | 'span'
         */
        tag: { type: String, default: 'a' },
        /**
         * Layer options for layer-based navigation.
         * Only used when type='pushLayer'.
         * @example { zIndex: 1000, autoPush: false, routerOptions: { mode: 'memory' } }
         */
        layerOptions: { type: Object as PropType<RouteLayerOptions> }
    },

    setup(props, context) {
        const { slots, attrs } = context;
        const link = useLink(props);

        const vue3renderer = () => {
            const data = link.value;
            const genEventName = (name: string): string =>
                `on${name.charAt(0).toUpperCase()}${name.slice(1)}`;

            const eventHandlers = data.getEventHandlers(genEventName);
            Object.keys(attrs).forEach((key) => {
                // In Vue 3, external event handlers are in attrs with 'on' prefix
                if (!key.startsWith('on') || typeof attrs[key] !== 'function')
                    return;
                const externalHandler = attrs[key] as (
                    e: MouseEvent
                ) => Promise<void>;
                const internalHandler = eventHandlers[key];
                eventHandlers[key] = async (e: MouseEvent) => {
                    await externalHandler(e);
                    await internalHandler?.(e);
                };
            });

            return h(
                data.tag,
                {
                    ...data.attributes,
                    ...eventHandlers
                },
                slots.default?.()
            );
        };

        const vue2renderer = () => {
            const data = link.value;

            const eventHandlers = data.getEventHandlers();
            // Vue 2: get external listeners from context
            const $listeners = (context as any).listeners || {};
            Object.keys($listeners).forEach((eventName) => {
                const externalHandler = $listeners[eventName];
                if (typeof externalHandler !== 'function') return;
                const internalHandler = eventHandlers[eventName];
                eventHandlers[eventName] = async (e: MouseEvent) => {
                    await externalHandler(e);
                    await internalHandler?.(e);
                };
            });

            const { class: className, ...attrs } = data.attributes;
            return h(
                data.tag,
                {
                    attrs,
                    class: className,
                    on: eventHandlers
                },
                slots.default?.()
            );
        };

        return isVue3 ? vue3renderer : vue2renderer;
    }
});

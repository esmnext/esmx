import type { RouterLinkProps } from '@esmx/router';
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
            type: [String, Object] as PropType<RouterLinkProps['to']>,
            required: true
        },
        /**
         * Navigation type for the link.
         * @default 'push'
         * @example 'push' | 'replace' | 'pushWindow' | 'replaceWindow' | 'pushLayer'
         */
        type: {
            type: String as PropType<RouterLinkProps['type']>,
            default: 'push'
        },
        /**
         * @deprecated Use 'type="replace"' instead
         * @example :replace={true} → type="replace"
         */
        replace: {
            type: Boolean as PropType<RouterLinkProps['replace']>,
            default: false
        },
        /**
         * How to match the active state.
         * - 'include': Match if current route includes this path
         * - 'exact': Match only if routes are exactly the same
         * - 'route': Match based on route configuration
         * @default 'include'
         */
        exact: {
            type: String as PropType<RouterLinkProps['exact']>,
            default: 'include'
        },
        /**
         * CSS class to apply when link is active (route matches).
         * @example 'nav-active' | 'selected'
         */
        activeClass: {
            type: String as PropType<RouterLinkProps['activeClass']>
        },
        /**
         * Event(s) that trigger navigation. Can be string or array of strings.
         * @default 'click'
         * @example 'click' | ['click', 'mouseenter']
         */
        event: {
            type: [String, Array] as PropType<RouterLinkProps['event']>,
            default: 'click'
        },
        /**
         * Custom tag to render instead of 'a'.
         * @default 'a'
         * @example 'button' | 'div' | 'span'
         */
        tag: { type: String as PropType<RouterLinkProps['tag']>, default: 'a' },
        /**
         * Layer options for layer-based navigation.
         * Only used when type='pushLayer'.
         * @example { zIndex: 1000, autoPush: false, routerOptions: { mode: 'memory' } }
         */
        layerOptions: {
            type: Object as PropType<RouterLinkProps['layerOptions']>
        },
        /**
         * Custom navigation handler called before navigation.
         * Receives the event object and the event name that triggered navigation.
         *
         * @Note you need to call `e.preventDefault()` to prevent default browser navigation.
         */
        beforeNavigate: {
            type: Function as PropType<RouterLinkProps['beforeNavigate']>
        }
    },

    setup(props, context) {
        const link = useLink(props).value;

        if (isVue3) {
            return () => {
                return h(
                    link.tag,
                    {
                        ...link.attributes,
                        ...context.attrs,
                        ...link.createEventHandlers(
                            (name) =>
                                `on${name.charAt(0).toUpperCase()}${name.slice(1)}`
                        )
                    },
                    context.slots.default?.()
                );
            };
        }
        return () => {
            const { class: className, ...attributes } = link.attributes;
            return h(
                link.tag,
                {
                    attrs: {
                        ...attributes,
                        ...context.attrs
                    },
                    class: className,
                    on: link.createEventHandlers()
                },
                context.slots.default?.()
            );
        };
    }
});

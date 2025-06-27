import { defineComponent, h, inject, provide } from 'vue';
import { useRoute } from './use';
import { resolveComponent } from './util';

const RouterViewDepthKey = Symbol('RouterViewDepth');

/**
 * RouterView component for rendering matched route components.
 * Acts as a placeholder where route components are rendered based on the current route.
 * Supports nested routing with proper depth tracking using Vue's provide/inject mechanism.
 *
 * @param props - Component properties (RouterView accepts no props)
 * @param context - Vue setup context (not used)
 * @param context.slots - Component slots (not used)
 * @returns Vue render function that renders the matched route component at current depth
 *
 * @example
 *
 * ```vue
 * <template>
 *   <div id="app">
 *     <!-- Navigation links -->
 *     <nav>
 *       <RouterLink to="/">Home</RouterLink>
 *       <RouterLink to="/about">About</RouterLink>
 *       <RouterLink to="/users">Users</RouterLink>
 *     </nav>
 *
 *     <!-- Root level route components render here -->
 *     <RouterView />
 *   </div>
 * </template>
 * ```
 */
export const RouterView = defineComponent({
    name: 'RouterView',
    setup() {
        const route = useRoute();

        // Get current RouterView depth from parent RouterView (if any)
        // This enables proper nested routing by tracking how deep we are in the component tree
        const depth = inject(RouterViewDepthKey, 0);

        // Provide depth + 1 to child RouterView components
        // This ensures each nested RouterView renders the correct route component
        provide(RouterViewDepthKey, depth + 1);

        return () => {
            // Get the matched route configuration at current depth
            // route.matched is an array of matched route configs from parent to child
            const matchedRoute = route.matched[depth];

            // Resolve the component, handling ES module format if necessary
            const component = matchedRoute
                ? resolveComponent(matchedRoute.component)
                : null;

            // Render the component or null if no match at this depth
            return component ? h(component) : null;
        };
    }
});

import type { Route, Router } from '@esmx/router';

/**
 * Vue 2 type augmentation.
 * Adds $router and $route properties to Vue component instances.
 *
 * @example
 * ```typescript
 * // In Vue 2 components, these properties are automatically available:
 * import { defineComponent } from 'vue';
 *
 * export default defineComponent({
 *   mounted() {
 *     console.log(this.$router); // Router instance
 *     console.log(this.$route);  // Current route
 *
 *     // Navigate programmatically
 *     this.$router.push('/dashboard');
 *   }
 * });
 * ```
 */
declare module 'vue/types/vue' {
    interface Vue {
        readonly $router: Router;
        readonly $route: Route;
    }
}

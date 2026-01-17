import {
    type ComponentType,
    createElement,
    isValidElement,
    type ReactElement,
    useMemo
} from 'react';
import {
    RouterViewDepthContext,
    useRoute,
    useRouterViewDepth
} from './context';
import type { RouterViewProps } from './types';
import { resolveComponent } from './util';

/**
 * RouterView component that renders the matched route component.
 * Acts as a placeholder where route components are rendered based on the current route.
 * Supports nested routing with automatic depth tracking.
 *
 * @param props - Component props
 * @param props.fallback - Optional fallback component when no route matches
 *
 * @example
 * ```tsx
 * // Basic usage
 * import { RouterView } from '@esmx/router-react';
 *
 * function App() {
 *   return (
 *     <div>
 *       <nav>
 *         <RouterLink to="/">Home</RouterLink>
 *         <RouterLink to="/about">About</RouterLink>
 *       </nav>
 *       <RouterView />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Nested routing
 * // Routes: [
 * //   { path: '/users', component: UsersLayout, children: [
 * //     { path: ':id', component: UserProfile }
 * //   ]}
 * // ]
 *
 * function UsersLayout() {
 *   return (
 *     <div>
 *       <h1>Users</h1>
 *       <RouterView /> {/- Renders UserProfile for /users/:id -/}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // With fallback
 * import { RouterView } from '@esmx/router-react';
 *
 * function App() {
 *   return (
 *     <RouterView fallback={<div>Page not found</div>} />
 *   );
 * }
 * ```
 */
export function RouterView({ fallback }: RouterViewProps): ReactElement | null {
    const route = useRoute();
    const depth = useRouterViewDepth();

    // Get the matched route at current depth
    const matchedRoute = route.matched[depth];

    // Resolve the component from the matched route
    const Component = useMemo(() => {
        if (!matchedRoute?.component) {
            return null;
        }
        return resolveComponent(matchedRoute.component) as ComponentType<any>;
    }, [matchedRoute?.component]);

    // Render fallback if no component found
    if (!Component) {
        if (fallback) {
            // If fallback is already a ReactElement, return it
            if (isValidElement(fallback)) {
                return fallback;
            }
            // If fallback is a component, render it
            if (typeof fallback === 'function') {
                return createElement(fallback as ComponentType);
            }
            // Return null for other cases (shouldn't happen with proper typing)
            return null;
        }
        return null;
    }

    // Provide incremented depth for nested RouterViews
    return (
        <RouterViewDepthContext.Provider value={depth + 1}>
            <Component key={matchedRoute.compilePath} />
        </RouterViewDepthContext.Provider>
    );
}

RouterView.displayName = 'RouterView';

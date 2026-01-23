import type { Route, Router } from '@esmx/router';
import { createContext, useContext } from 'react';
import type { RouterContextValue } from './types';

/**
 * React Context for router state.
 * Contains the router instance and current route.
 * Using null as default to detect missing provider.
 */
export const RouterContext = createContext<RouterContextValue | null>(null);
RouterContext.displayName = 'RouterContext';

/**
 * React Context for RouterView depth tracking.
 * Used for nested routing to determine which matched route to render.
 */
export const RouterViewDepthContext = createContext<number>(0);
RouterViewDepthContext.displayName = 'RouterViewDepthContext';

/**
 * Get the router context value.
 * @throws {Error} If used outside of RouterProvider
 * @internal
 */
export function useRouterContext(): RouterContextValue {
    const context = useContext(RouterContext);
    if (!context) {
        throw new Error(
            '[@esmx/router-react] Router context not found. ' +
                'Please ensure your component is wrapped in a RouterProvider.'
        );
    }
    return context;
}

/**
 * Get the router instance for navigation.
 * Must be used within a RouterProvider.
 *
 * @returns Router instance with navigation methods
 * @throws {Error} If used outside of RouterProvider
 *
 * @example
 * ```tsx
 * import { useRouter } from '@esmx/router-react';
 *
 * function NavigationButton() {
 *   const router = useRouter();
 *
 *   const handleClick = () => {
 *     router.push('/dashboard');
 *   };
 *
 *   return <button onClick={handleClick}>Go to Dashboard</button>;
 * }
 * ```
 */
export function useRouter(): Router {
    return useRouterContext().router;
}

/**
 * Get the current route information.
 * Returns a reactive route object that updates when navigation occurs.
 * Must be used within a RouterProvider.
 *
 * @returns Current route object with path, params, query, etc.
 * @throws {Error} If used outside of RouterProvider
 *
 * @example
 * ```tsx
 * import { useRoute } from '@esmx/router-react';
 *
 * function CurrentPath() {
 *   const route = useRoute();
 *
 *   return (
 *     <div>
 *       <p>Path: {route.path}</p>
 *       <p>Params: {JSON.stringify(route.params)}</p>
 *       <p>Query: {JSON.stringify(route.query)}</p>
 *     </div>
 *   );
 * }
 * ```
 */
export function useRoute(): Route {
    return useRouterContext().route;
}

/**
 * Get the current RouterView depth.
 * Used internally by RouterView for nested routing.
 *
 * @returns Current depth level (0 for root, 1 for first nested, etc.)
 *
 * @example
 * ```tsx
 * import { useRouterViewDepth } from '@esmx/router-react';
 *
 * function DebugView() {
 *   const depth = useRouterViewDepth();
 *   return <div>Current depth: {depth}</div>;
 * }
 * ```
 */
export function useRouterViewDepth(): number {
    return useContext(RouterViewDepthContext);
}

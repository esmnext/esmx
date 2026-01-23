import type { Route } from '@esmx/router';
import { createElement, useCallback, useSyncExternalStore } from 'react';
import { RouterContext } from './context';
import type { RouterContextValue, RouterProviderProps } from './types';

/**
 * RouterProvider component that provides router context to the React tree.
 * This must wrap your application to enable routing functionality.
 * Uses useSyncExternalStore for optimal React 18+ integration with concurrent features.
 *
 * @param props - Component props
 * @param props.router - Router instance to provide
 * @param props.children - Child components
 *
 * @example
 * ```tsx
 * import { Router, RouterMode } from '@esmx/router';
 * import { RouterProvider } from '@esmx/router-react';
 *
 * const routes = [
 *   { path: '/', component: Home },
 *   { path: '/about', component: About }
 * ];
 *
 * const router = new Router({
 *   routes,
 *   mode: RouterMode.history
 * });
 *
 * function App() {
 *   return (
 *     <RouterProvider router={router}>
 *       <Layout>
 *         <RouterView />
 *       </Layout>
 *     </RouterProvider>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // SSR usage - initialize router with server URL
 * import { Router, RouterMode } from '@esmx/router';
 * import { RouterProvider } from '@esmx/router-react';
 *
 * const router = new Router({
 *   routes,
 *   mode: RouterMode.history,
 *   base: new URL(serverUrl)
 * });
 *
 * function ServerApp() {
 *   return (
 *     <RouterProvider router={router}>
 *       <App />
 *     </RouterProvider>
 *   );
 * }
 * ```
 */
export function RouterProvider({
    router,
    children
}: RouterProviderProps): React.ReactElement {
    // Subscribe to route changes using useSyncExternalStore
    // This ensures proper integration with React 18's concurrent features
    const subscribe = useCallback(
        (callback: () => void) => {
            return router.afterEach(callback);
        },
        [router]
    );

    const getSnapshot = useCallback((): Route => {
        return router.route;
    }, [router]);

    const getServerSnapshot = useCallback((): Route => {
        return router.route;
    }, [router]);

    // Subscribe to route changes with useSyncExternalStore for concurrent mode safety
    const route = useSyncExternalStore(
        subscribe,
        getSnapshot,
        getServerSnapshot
    );

    // Create stable context value
    const contextValue: RouterContextValue = {
        router,
        route
    };

    // Use createElement instead of JSX
    return createElement(
        RouterContext.Provider,
        { value: contextValue },
        children
    );
}

RouterProvider.displayName = 'RouterProvider';

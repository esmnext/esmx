import type { Route, Router } from '@esmx/router';

/**
 * Interface for the router context value.
 * Contains the router instance and current route.
 */
export interface RouterContextValue {
    /** Router instance for navigation */
    router: Router;
    /** Current route object */
    route: Route;
}

/**
 * Props for the RouterProvider component.
 */
export interface RouterProviderProps {
    /** Router instance to provide to child components */
    router: Router;
    /** Child components */
    children: React.ReactNode;
}

/**
 * Props for the RouterView component.
 */
export interface RouterViewProps {
    /** Optional fallback component to render when no route matches */
    fallback?: React.ComponentType | React.ReactNode;
}

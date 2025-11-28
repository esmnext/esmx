// Error types
export {
    RouteError,
    RouteNavigationAbortedError,
    RouteSelfRedirectionError,
    RouteTaskCancelledError,
    RouteTaskExecutionError
} from './error';
export { Route } from './route';
export { Router } from './router';
export {
    type RouteConfig,
    // Hook function types
    type RouteConfirmHook,
    type RouteConfirmHookResult,
    type RouteHandleHook,
    type RouteHandleResult,
    // Router Layer types
    type RouteLayerOptions,
    type RouteLayerResult,
    // Route location and config types
    type RouteLocation,
    type RouteLocationInput,
    type RouteMatcher,
    type RouteMatchResult,
    type RouteMatchType,
    // Basic data types
    type RouteMeta,
    type RouteNotifyHook,
    type RouteOptions,
    type RouteParsedConfig,
    type RouterLayerOptions,
    type RouterLinkAttributes,
    type RouterLinkProps,
    type RouterLinkResolved,
    // RouterLink types
    type RouterLinkType,
    // Router MicroApp types
    type RouterMicroApp,
    type RouterMicroAppCallback,
    type RouterMicroAppOptions,
    // Core enums
    RouterMode,
    // Router core types
    type RouterOptions,
    type RouterParsedOptions,
    type RouteState,
    RouteType,
    type RouteVerifyHook
} from './types';

// =================== Re-exporting deprecated types ===================

import type { Router } from './router';
import type { Route, RouteLocation, RouteLocationInput } from './types';

/** @deprecated Use `Router` directly instead of `RouterInstance`. */
export type RouterInstance = Router;

/** @deprecated Use `RouteLocationInput` directly instead of `RouterRawLocation`. */
export type RouterRawLocation = RouteLocationInput;

/** @deprecated Use `RouteLocation` directly instead of `RouterLocation`. */
export type RouterLocation = RouteLocation;

/** @deprecated Use `Route` directly instead of `RouteRecord`. */
export type RouteRecord = Route;

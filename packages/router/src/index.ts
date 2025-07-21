export { Router } from './router';
export { Route } from './route';
export {
    // Core enums
    RouterMode,
    RouteType,
    // Hook function types
    type RouteConfirmHook,
    type RouteConfirmHookResult,
    type RouteVerifyHook,
    type RouteHandleHook,
    type RouteNotifyHook,
    // Basic data types
    type RouteMeta,
    type RouteState,
    type RouteHandleResult,
    type RouteMatchType,
    // Route location and config types
    type RouteLocation,
    type RouteLocationInput,
    type RouteConfig,
    type RouteParsedConfig,
    type RouteMatchResult,
    type RouteMatcher,
    type RouteOptions,
    // Router Layer types
    type RouteLayerOptions,
    type RouteLayerResult,
    type RouterLayerOptions,
    // Router MicroApp types
    type RouterMicroApp,
    type RouterMicroAppCallback,
    type RouterMicroAppOptions,
    // Router core types
    type RouterOptions,
    type RouterParsedOptions,
    // RouterLink types
    type RouterLinkType,
    type RouterLinkAttributes,
    type RouterLinkProps,
    type RouterLinkResolved
} from './types';

// Error types
export {
    RouteError,
    RouteTaskCancelledError,
    RouteTaskExecutionError,
    RouteNavigationAbortedError,
    RouteSelfRedirectionError
} from './error';

// =================== Re-exporting deprecated types ===================

// Cannot propagate deprecated JSDoc when re-export due to TypeScript bug: https://github.com/microsoft/TypeScript/issues/53960
// export type {
//     /** @deprecated Use `Router` directly instead of `RouterInstance`. */
//     Router as RouterInstance
// } from './router';

import type { Router } from './router';
/** @deprecated Use `Router` directly instead of `RouterInstance`. */
export type RouterInstance = Router;

import type { Route, RouteLocationInput } from './types';
/** @deprecated Use `RouteLocationInput` directly instead of `RouterRawLocation`. */
export type RouterRawLocation = RouteLocationInput;
/** @deprecated Use `Route` directly instead of `RouterLocation`. */
export type RouterLocation = Route;

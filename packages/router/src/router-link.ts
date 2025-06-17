import type { Router } from './router';
import type {
    Route,
    RouteLocationInput,
    RouteMatchType,
    RouterLayerOptions,
    RouterLinkAttributes,
    RouterLinkProps,
    RouterLinkResolved,
    RouterLinkType
} from './types';

// Constants definition
const CSS_CLASSES = {
    BASE: 'router-link',
    ACTIVE: 'router-link-active',
    EXACT_ACTIVE: 'router-link-exact-active'
} as const;

const EXTERNAL_LINK_PATTERN = /\b_blank\b/i;

/**
 * Normalize navigation type
 * replace property has higher priority than type property (replace is deprecated for backward compatibility)
 */
function normalizeNavigationType(props: RouterLinkProps): RouterLinkType {
    if (props.replace) {
        console.warn(
            '[RouterLink] `replace` property is deprecated, use `type="replace"` instead'
        );
        return 'replace';
    }
    return props.type || 'push';
}

/**
 * Get event type list
 */
function getEventTypeList(eventType: string | string[]): string[] {
    if (Array.isArray(eventType)) {
        const validEvents = eventType.filter(
            (type) => type && typeof type === 'string'
        );
        return validEvents.length > 0 ? validEvents : ['click'];
    }
    return [eventType || 'click'];
}

/**
 * Event guard check
 */
function guardEvent(e: MouseEvent): boolean {
    // don't redirect with control keys
    if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return false;
    // don't redirect when preventDefault called
    if (e.defaultPrevented) return false;
    // don't redirect on right click
    if (e.button !== undefined && e.button !== 0) return false;
    // don't redirect if `target="_blank"`
    const target = e.currentTarget;
    if (target instanceof HTMLElement) {
        const targetAttr = target.getAttribute('target');
        if (EXTERNAL_LINK_PATTERN.test(targetAttr || '')) return false;
    }
    // this may be a Weex event which doesn't have this method
    if (e.preventDefault) e.preventDefault();

    return true;
}

/**
 * Execute route navigation
 */
function executeNavigation(
    router: Router,
    to: RouteLocationInput,
    navigationType: RouterLinkType,
    layerOptions?: Partial<RouterLayerOptions>
): void {
    switch (navigationType) {
        case 'push':
            router.push(to);
            break;
        case 'replace':
            router.replace(to);
            break;
        case 'pushWindow':
            router.pushWindow(to);
            break;
        case 'replaceWindow':
            router.replaceWindow(to);
            break;
        case 'pushLayer':
            router.pushLayer(to, layerOptions);
            break;
        default:
            router.push(to);
    }
}

/**
 * Build rel attribute value
 */
function buildRelAttribute(isPushWindow: boolean, isExternal: boolean): string {
    const relParts: string[] = [];

    if (isExternal) {
        relParts.push('external', 'nofollow');
    }

    if (isPushWindow) {
        relParts.push('noopener', 'noreferrer');
    }

    return relParts.join(' ');
}

/**
 * Create navigation function
 */
function createNavigateFunction(
    router: Router,
    to: RouteLocationInput,
    navigationType: RouterLinkType,
    layerOptions?: Partial<RouterLayerOptions>
): (e?: MouseEvent) => void {
    return (e?: MouseEvent): void => {
        // If there's an event, perform guard check
        if (e && !guardEvent(e)) {
            return;
        }

        executeNavigation(router, to, navigationType, layerOptions);
    };
}

/**
 * Compute CSS classes
 */
function computeClasses(
    isActive: boolean,
    isExactActive: boolean,
    activeClass?: string
): string[] {
    const classes: string[] = [CSS_CLASSES.BASE];

    if (isActive) {
        classes.push(activeClass || CSS_CLASSES.ACTIVE);
    }

    if (isExactActive) {
        classes.push(CSS_CLASSES.EXACT_ACTIVE);
    }

    return classes;
}

/**
 * Compute HTML attributes
 */
function computeAttributes(
    href: string,
    navigationType: RouterLinkType,
    isExternal: boolean,
    classes: string[]
): RouterLinkAttributes {
    const isPushWindow = navigationType === 'pushWindow';

    const attributes: RouterLinkAttributes = {
        href,
        class: classes.join(' ')
    };

    if (isPushWindow) {
        attributes.target = '_blank';
    }

    if (isPushWindow || isExternal) {
        attributes.rel = buildRelAttribute(isPushWindow, isExternal);
    }

    return attributes;
}

/**
 * Create event handlers generator function
 */
function createEventHandlersGenerator(
    navigate: (e?: MouseEvent) => void,
    eventTypes: string[]
): (
    nameTransform?: (eventType: string) => string
) => Record<string, (e: MouseEvent) => void> {
    return (nameTransform?: (eventType: string) => string) => {
        const handlers: Record<string, (e: MouseEvent) => void> = {};

        const handler = (e: MouseEvent) => {
            navigate(e);
        };

        eventTypes.forEach((eventType) => {
            // Use native lowercase event name by default, use transformed name if transform function provided
            const eventName = nameTransform
                ? nameTransform(eventType)
                : eventType.toLowerCase();
            handlers[eventName] = handler;
        });

        return handlers;
    };
}

/**
 * Framework-agnostic link resolver
 *
 * @param router Router instance
 * @param props Link configuration
 * @returns Resolution result
 */
export function createLinkResolver(
    router: Router,
    props: RouterLinkProps
): RouterLinkResolved {
    // Resolve route
    const route = router.resolve(props.to);
    const type = normalizeNavigationType(props);
    const href = route.fullPath;

    // Route matching status
    const isActive = router.isRouteMatched(route, props.exact || 'include');
    const isExactActive = router.isRouteMatched(route, 'exact');

    // Check if external link
    const isExternal = route.url.origin !== router.route.url.origin;

    // Create navigation function
    const navigate = createNavigateFunction(
        router,
        props.to,
        type,
        props.layerOptions
    );

    // Compute UI attributes
    const classes = computeClasses(isActive, isExactActive, props.activeClass);
    const attributes = computeAttributes(href, type, isExternal, classes);

    // Create event handlers
    const eventTypes = getEventTypeList(props.event || 'click');
    const getEventHandlers = createEventHandlersGenerator(navigate, eventTypes);

    return {
        route,
        type,
        isActive,
        isExactActive,
        isExternal,
        tag: props.tag || 'a',
        attributes,
        navigate,
        getEventHandlers
    };
}

import type { Router } from './router';
import type {
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
} satisfies Record<string, string>;
/**
 * Normalize navigation type with backward compatibility for deprecated replace property
 */
function normalizeNavigationType(props: RouterLinkProps): RouterLinkType {
    if (props.replace) {
        console.warn(
            '[RouterLink] The `replace` property is deprecated and will be removed in a future version.\n' +
                'Please use `type="replace"` instead.\n' +
                'Before: <RouterLink replace={true} />\n' +
                'After:  <RouterLink type="replace" />'
        );
        return 'replace';
    }
    return props.type || 'push';
}

/**
 * Get event type list - normalize and validate event types
 */
function getEventTypeList(eventType: unknown | unknown[]): string[] {
    const events = Array.isArray(eventType) ? eventType : [eventType];
    const validEvents = events
        .filter((type): type is string => typeof type === 'string')
        .map((type) => type.trim())
        .filter(Boolean);
    return validEvents.length ? validEvents : ['click'];
}

/**
 * Navigation event handler called before navigation - determines if the router should handle the navigation
 *
 * Returns false: Let browser handle default behavior (normal link navigation)
 * Returns true: Router takes over navigation, prevents default browser behavior
 *
 * This function intelligently decides when to let the browser handle clicks
 * (like Ctrl+click for new tabs) vs when to use SPA routing
 */
function shouldHandleNavigation(e: Event): boolean {
    if (e.defaultPrevented) return false;
    if (e instanceof MouseEvent) {
        if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return false;
        if (e.button !== undefined && e.button !== 0) return false;
    }

    e.preventDefault?.();

    return true;
}

/**
 * Execute route navigation
 */
async function executeNavigation(
    router: Router,
    props: RouterLinkProps,
    linkType: RouterLinkType
): Promise<void> {
    const { to, layerOptions } = props;

    switch (linkType) {
        case 'push':
            await router.push(to);
            break;
        case 'replace':
            await router.replace(to);
            break;
        case 'pushWindow':
            await router.pushWindow(to);
            break;
        case 'replaceWindow':
            await router.replaceWindow(to);
            break;
        case 'pushLayer':
            await router.pushLayer(
                layerOptions
                    ? typeof to === 'string'
                        ? { path: to, layer: layerOptions }
                        : { ...to, layer: layerOptions }
                    : to
            );
            break;
        default:
            await router.push(to);
    }
}

/**
 * Create navigation function
 */
function createNavigateFunction(
    router: Router,
    props: RouterLinkProps,
    navigationType: RouterLinkType
): RouterLinkResolved['navigate'] {
    return async (e: Event): Promise<void> => {
        if (shouldHandleNavigation(e)) {
            await executeNavigation(router, props, navigationType);
        }
    };
}

/**
 * Compute HTML attributes
 */
function computeAttributes(
    href: string,
    navigationType: RouterLinkType,
    isExternal: boolean,
    isActive: boolean,
    isExactActive: boolean,
    activeClass?: string
): RouterLinkAttributes {
    // Only pushWindow opens in a new window, replaceWindow replaces current window
    const isNewWindow = navigationType === 'pushWindow';

    // Build CSS classes
    const classes: string[] = [CSS_CLASSES.BASE];
    if (isActive) {
        classes.push(activeClass || CSS_CLASSES.ACTIVE);
    }
    if (isExactActive) {
        classes.push(CSS_CLASSES.EXACT_ACTIVE);
    }

    const attributes: RouterLinkAttributes = {
        href,
        class: classes.join(' ')
    };

    // Set target for new window
    if (isNewWindow) {
        attributes.target = '_blank';
    }

    // Build rel attribute
    const relParts: string[] = [];
    if (isNewWindow) {
        relParts.push('noopener', 'noreferrer');
    }
    if (isExternal) {
        relParts.push('external', 'nofollow');
    }
    if (relParts.length > 0) {
        attributes.rel = relParts.join(' ');
    }

    return attributes;
}

/**
 * Create event handlers generator function
 */
function createEventHandlersGenerator(
    router: Router,
    props: RouterLinkProps,
    navigationType: RouterLinkType,
    eventTypes: string[]
): RouterLinkResolved['createEventHandlers'] {
    return (format?: (eventType: string) => string) => {
        const handlers: Record<string, (e: Event) => Promise<void>> = {};
        const navigate = createNavigateFunction(router, props, navigationType);

        eventTypes.forEach((eventType) => {
            const eventName = format?.(eventType) ?? eventType.toLowerCase();
            handlers[eventName] = (event) => {
                props.beforeNavigate?.(event, eventType);
                return navigate(event);
            };
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
    const route = router.resolve(props.to);
    const type = normalizeNavigationType(props);
    const href = route.url.href;

    const isActive = router.isRouteMatched(route, props.exact);
    const isExactActive = router.isRouteMatched(route, 'exact');
    const isExternal = route.url.origin !== router.route.url.origin;

    const attributes = computeAttributes(
        href,
        type,
        isExternal,
        isActive,
        isExactActive,
        props.activeClass
    );

    const eventTypes = getEventTypeList(props.event || 'click');
    const createEventHandlers = createEventHandlersGenerator(
        router,
        props,
        type,
        eventTypes
    );

    const navigate = createNavigateFunction(router, props, type);

    return {
        route,
        type,
        isActive,
        isExactActive,
        isExternal,
        tag: props.tag || 'a',
        attributes,
        navigate,
        createEventHandlers
    };
}

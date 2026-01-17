import type { RouterLinkProps, RouterLinkResolved } from '@esmx/router';
import {
    createElement,
    type ElementType,
    forwardRef,
    type MouseEvent,
    type ReactNode,
    useCallback,
    useMemo
} from 'react';
import { useRouter } from './context';

/**
 * Extended props for RouterLink component.
 * Combines RouterLinkProps from @esmx/router with React-specific props.
 */
export interface RouterLinkComponentProps extends RouterLinkProps {
    /** Link content */
    children?: ReactNode;
    /** Additional CSS class name */
    className?: string;
    /** Inline styles */
    style?: React.CSSProperties;
    /** HTML anchor attributes (spread) */
    [key: string]: any;
}

/**
 * RouterLink component for declarative navigation.
 * Renders an anchor tag with proper navigation behavior and active state management.
 * Supports all navigation types: push, replace, pushWindow, replaceWindow, pushLayer.
 *
 * @param props - Component props
 * @param props.to - Target route location
 * @param props.type - Navigation type ('push' | 'replace' | 'pushWindow' | 'replaceWindow' | 'pushLayer')
 * @param props.exact - Active matching mode ('include' | 'exact' | 'route')
 * @param props.activeClass - CSS class for active state
 * @param props.event - Event(s) that trigger navigation
 * @param props.tag - HTML tag to render (default: 'a')
 * @param props.layerOptions - Options for layer navigation
 * @param props.beforeNavigate - Callback before navigation
 * @param props.children - Link content
 *
 * @example
 * ```tsx
 * // Basic navigation
 * <RouterLink to="/home">Home</RouterLink>
 * <RouterLink to="/about">About</RouterLink>
 *
 * // With object location
 * <RouterLink to={{ path: '/users', query: { page: '1' } }}>
 *   Users
 * </RouterLink>
 *
 * // Replace navigation (no history entry)
 * <RouterLink to="/login" type="replace">Login</RouterLink>
 *
 * // Open in new window
 * <RouterLink to="/external" type="pushWindow">External</RouterLink>
 *
 * // Custom active class
 * <RouterLink
 *   to="/dashboard"
 *   activeClass="nav-active"
 *   exact="exact"
 * >
 *   Dashboard
 * </RouterLink>
 *
 * // Custom tag (button)
 * <RouterLink to="/submit" tag="button" className="btn">
 *   Submit
 * </RouterLink>
 *
 * // With beforeNavigate callback
 * <RouterLink
 *   to="/protected"
 *   beforeNavigate={(e, eventName) => {
 *     if (!isAuthenticated) {
 *       e.preventDefault();
 *       showLoginModal();
 *     }
 *   }}
 * >
 *   Protected Page
 * </RouterLink>
 * ```
 */
export const RouterLink = forwardRef<
    HTMLAnchorElement,
    RouterLinkComponentProps
>(function RouterLink(
    {
        to,
        type = 'push',
        replace,
        exact = 'include',
        activeClass,
        event = 'click',
        tag = 'a',
        layerOptions,
        beforeNavigate,
        children,
        className,
        style,
        ...rest
    },
    ref
) {
    const router = useRouter();

    // Resolve the link using router's built-in resolver
    const linkResolved: RouterLinkResolved = useMemo(() => {
        return router.resolveLink({
            to,
            type,
            replace,
            exact,
            activeClass,
            event,
            tag,
            layerOptions,
            beforeNavigate
        });
    }, [
        router,
        to,
        type,
        replace,
        exact,
        activeClass,
        event,
        tag,
        layerOptions,
        beforeNavigate
    ]);

    // Handle click event
    const handleClick = useCallback(
        async (e: MouseEvent<HTMLElement>) => {
            // Call beforeNavigate callback if provided
            beforeNavigate?.(e as unknown as Event, 'click');

            // If default was prevented by beforeNavigate or by modifier keys, skip navigation
            if (e.defaultPrevented) return;

            // Check for modifier keys - let browser handle these
            if (e.metaKey || e.altKey || e.ctrlKey || e.shiftKey) return;
            if (e.button !== 0) return;

            // Prevent default browser navigation
            e.preventDefault();

            // Navigate using the resolved link's navigate function
            await linkResolved.navigate(e as unknown as Event);
        },
        [linkResolved, beforeNavigate]
    );

    // Build class names
    const computedClassName = useMemo(() => {
        const classes: string[] = [];
        if (linkResolved.attributes.class) {
            classes.push(linkResolved.attributes.class);
        }
        if (className) {
            classes.push(className);
        }
        return classes.join(' ') || undefined;
    }, [linkResolved.attributes.class, className]);

    // Build props for the element
    const elementProps = {
        ref,
        href: linkResolved.attributes.href,
        target: linkResolved.attributes.target,
        rel: linkResolved.attributes.rel,
        className: computedClassName,
        style,
        onClick: handleClick,
        ...rest
    };

    // Render the element with the appropriate tag using createElement
    return createElement(tag as ElementType, elementProps, children);
});

RouterLink.displayName = 'RouterLink';

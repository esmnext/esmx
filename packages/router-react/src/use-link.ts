import type { RouterLinkProps, RouterLinkResolved } from '@esmx/router';
import { useMemo } from 'react';
import { useRouter } from './context';

/**
 * Hook to create reactive link helpers for custom navigation components.
 * Returns a resolved link object with attributes, state, and event handlers.
 *
 * This hook is useful when you need to build custom link components
 * with full control over rendering while retaining router functionality.
 *
 * @param props - RouterLink properties
 * @returns Resolved link object with attributes, state, and navigation methods
 *
 * @example
 * ```tsx
 * import { useLink } from '@esmx/router-react';
 *
 * function CustomNavButton({ to, children }) {
 *   const link = useLink({ to, type: 'push', exact: 'include' });
 *
 *   return (
 *     <button
 *       onClick={(e) => link.navigate(e)}
 *       className={link.isActive ? 'active' : ''}
 *       disabled={link.isExactActive}
 *     >
 *       {children}
 *       {link.isActive && <span>✓</span>}
 *     </button>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Building a custom navigation card
 * import { useLink } from '@esmx/router-react';
 *
 * interface NavCardProps {
 *   to: string;
 *   title: string;
 *   description: string;
 *   icon: React.ReactNode;
 * }
 *
 * function NavCard({ to, title, description, icon }: NavCardProps) {
 *   const link = useLink({ to });
 *
 *   return (
 *     <div
 *       className={`nav-card ${link.isActive ? 'active' : ''}`}
 *       onClick={(e) => link.navigate(e)}
 *       role="link"
 *       tabIndex={0}
 *     >
 *       <div className="icon">{icon}</div>
 *       <h3>{title}</h3>
 *       <p>{description}</p>
 *       {link.isExternal && <span className="external-badge">↗</span>}
 *     </div>
 *   );
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Using all resolved properties
 * import { useLink } from '@esmx/router-react';
 *
 * function DebugLink({ to }) {
 *   const link = useLink({ to, exact: 'exact' });
 *
 *   return (
 *     <div>
 *       <a
 *         href={link.attributes.href}
 *         target={link.attributes.target}
 *         rel={link.attributes.rel}
 *         className={link.attributes.class}
 *         onClick={(e) => {
 *           e.preventDefault();
 *           link.navigate(e);
 *         }}
 *       >
 *         Link Text
 *       </a>
 *       <pre>
 *         isActive: {String(link.isActive)}
 *         isExactActive: {String(link.isExactActive)}
 *         isExternal: {String(link.isExternal)}
 *         type: {link.type}
 *         tag: {link.tag}
 *       </pre>
 *     </div>
 *   );
 * }
 * ```
 */
export function useLink(props: RouterLinkProps): RouterLinkResolved {
    const router = useRouter();
    const {
        to,
        type,
        replace,
        exact,
        activeClass,
        event,
        tag,
        layerOptions,
        beforeNavigate
    } = props;

    return useMemo(() => {
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
}

import type { Router } from '@esmx/router';

export interface LayoutOptions {
    appId: string;
    router: Router;
}

export const SIDEBAR_WIDTH = '260px';

const NAV_ITEMS = [
    { path: '/', label: 'Home', icon: 'Hm' },
    { path: '/html/', label: 'HTML', icon: 'H' },
    { path: '/vue2/', label: 'Vue 2', icon: 'V2' },
    { path: '/vue3/', label: 'Vue 3', icon: 'V3' },
    { path: '/react/', label: 'React', icon: 'R' }
];

/**
 * Compress whitespace in inline style attribute values so that
 * v-html hydration comparison passes (Vue2 uses strict equality
 * against the browser-normalized innerHTML).
 */
function normalizeHtml(html: string): string {
    return html.replace(
        / style="([^"]*)"/g,
        (_, s) => ` style="${s.replace(/\s+/g, ' ').trim()}"`
    );
}

function generateNavHtml(router: Router): string {
    return NAV_ITEMS.map((item) => {
        const resolved = router.resolveLink({
            to: item.path,
            type: 'push',
            exact: 'route'
        });
        const isActive = resolved.isActive;
        return normalizeHtml(`
            <a
                href="${resolved.attributes.href}"
                onclick="event.preventDefault()"
                data-nav="${item.path}"
                style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    border-radius: 8px;
                    text-decoration: none;
                    color: ${isActive ? '#fff' : '#94a3b8'};
                    background: ${isActive ? 'rgba(59, 130, 246, 0.15)' : 'transparent'};
                    border-left: ${isActive ? '3px solid #3b82f6' : '3px solid transparent'};
                    cursor: pointer;
                    font-weight: ${isActive ? '600' : '400'};
                "
            >
                <span style="font-size: 1.1rem; width: 24px; text-align: center;">${item.icon}</span>
                <span>${item.label}</span>
            </a>
        `);
    }).join('');
}

export class Layout {
    public readonly appId: string;
    public readonly router: Router;
    public readonly headerId: string;
    public readonly footerId: string;
    private clickHandler: ((e: Event) => void) | null = null;
    private mobileHandlers: Array<() => void> = [];

    constructor(options: LayoutOptions) {
        this.appId = options.appId;
        this.router = options.router;
        this.headerId = `${options.appId}-header`;
        this.footerId = `${options.appId}-footer`;
    }

    private get styleSheet(): string {
        return `
            <style>
                :root {
                    --esmx-sidebar-width: ${SIDEBAR_WIDTH};
                }
                #esmx-sidebar a[data-nav]:hover {
                    background: rgba(59, 130, 246, 0.08);
                    color: #cbd5e1;
                }
                #esmx-menu-btn:focus-visible,
                #esmx-sidebar-close:focus-visible {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                }
                @media (max-width: 767px) {
                    :root {
                        --esmx-sidebar-width: 0px;
                        --esmx-mobile-header-height: 56px;
                    }
                    #esmx-sidebar {
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                    }
                    #esmx-sidebar.esmx-open {
                        transform: translateX(0);
                        width: min(260px, 80vw);
                    }
                    #esmx-sidebar-overlay {
                        display: none;
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.5);
                        z-index: 99;
                    }
                    #esmx-sidebar-overlay.esmx-open {
                        display: block;
                    }
                    #esmx-sidebar-close {
                        display: block !important;
                    }
                    #esmx-main {
                        padding: 16px !important;
                        padding-top: calc(16px + var(--esmx-mobile-header-height, 0px)) !important;
                    }
                }
                @media (min-width: 768px) {
                    #esmx-mobile-header {
                        display: none !important;
                    }
                    #esmx-sidebar-overlay {
                        display: none !important;
                    }
                    #esmx-sidebar-close {
                        display: none !important;
                    }
                }
            </style>
        `;
    }

    get header(): string {
        return normalizeHtml(`
            <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cg transform='translate(20,20)'%3E%3Ccircle r='12' fill='none' stroke='%2312B2EF' stroke-width='2.8'/%3E%3Ccircle r='6.2' fill='%23FFA000'/%3E%3C/g%3E%3C/svg%3E" type="image/svg+xml" />
            ${this.styleSheet}
            <div id="esmx-mobile-header" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 56px;
                background: #0f172a;
                color: white;
                display: flex;
                align-items: center;
                padding: 0 16px;
                z-index: 90;
                gap: 12px;
            ">
                <button id="esmx-menu-btn" style="
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 4px;
                    line-height: 1;
                ">&#9776;</button>
                <span style="font-weight: 700; font-size: 1.125rem;">Esmx Hub</span>
            </div>
            <div id="esmx-sidebar-overlay"></div>
            <div id="esmx-sidebar" style="
                width: ${SIDEBAR_WIDTH};
                background: #0f172a;
                color: white;
                padding: 24px;
                position: fixed;
                left: 0;
                top: 0;
                height: 100vh;
                overflow-y: auto;
                z-index: 100;
                display: flex;
                flex-direction: column;
            ">
                <div style="
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin-bottom: 32px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #334155;
                ">
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cg transform='translate(20,20)'%3E%3Ccircle r='12' fill='none' stroke='%2312B2EF' stroke-width='2.8'/%3E%3Ccircle r='6.2' fill='%23FFA000'/%3E%3C/g%3E%3C/svg%3E" alt="Esmx" style="width: 32px; height: 32px;" />
                    <span style="font-size: 1.25rem; font-weight: 700; color: #fff;">Esmx Hub</span>
                </div>
                <nav style="display: flex; flex-direction: column; gap: 4px;">
                    ${generateNavHtml(this.router)}
                </nav>
                <button id="esmx-sidebar-close" style="
                    display: none;
                    background: transparent;
                    border: none;
                    color: white;
                    font-size: 1.5rem;
                    cursor: pointer;
                    padding: 4px;
                    line-height: 1;
                    position: absolute;
                    top: 16px;
                    right: 16px;
                ">&times;</button>
            </div>
        `);
    }

    get footer(): string {
        return `<div style="
            margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH});
            padding: 24px 32px;
            background: #0f172a;
            color: #94a3b8;
            font-size: 0.875rem;
            text-align: center;
        ">
            <p style="margin: 0;">
                Powered by <a href="https://esmx.dev" target="_blank" style="color: #3b82f6; text-decoration: none;">Esmx</a>
                &copy; ${new Date().getFullYear()}
            </p>
        </div>`;
    }

    private toggleSidebar(open: boolean): void {
        const sidebar = document.getElementById('esmx-sidebar');
        const overlay = document.getElementById('esmx-sidebar-overlay');
        if (sidebar) {
            sidebar.classList.toggle('esmx-open', open);
        }
        if (overlay) {
            overlay.classList.toggle('esmx-open', open);
        }
    }

    mount(): void {
        const container = document.getElementById(this.headerId);
        if (!container) return;

        this.clickHandler = (e: Event) => {
            const target = e.target as HTMLElement;
            const link = target.closest('a[data-nav]') as HTMLElement | null;
            if (!link) return;

            e.preventDefault();
            const path = link.getAttribute('data-nav');
            if (path) {
                this.router.push(path);
                this.toggleSidebar(false);
            }
        };

        container.addEventListener('click', this.clickHandler);

        const menuBtn = document.getElementById('esmx-menu-btn');
        const overlay = document.getElementById('esmx-sidebar-overlay');
        const closeBtn = document.getElementById('esmx-sidebar-close');

        const openMenu = () => this.toggleSidebar(true);
        const closeMenu = () => this.toggleSidebar(false);

        if (menuBtn) {
            menuBtn.addEventListener('click', openMenu);
            this.mobileHandlers.push(() =>
                menuBtn.removeEventListener('click', openMenu)
            );
        }
        if (overlay) {
            overlay.addEventListener('click', closeMenu);
            this.mobileHandlers.push(() =>
                overlay.removeEventListener('click', closeMenu)
            );
        }
        if (closeBtn) {
            closeBtn.addEventListener('click', closeMenu);
            this.mobileHandlers.push(() =>
                closeBtn.removeEventListener('click', closeMenu)
            );
        }
    }

    unmount(): void {
        if (this.clickHandler) {
            const container = document.getElementById(this.headerId);
            if (container) {
                container.removeEventListener('click', this.clickHandler);
            }
            this.clickHandler = null;
        }
        this.mobileHandlers.forEach((cleanup) => cleanup());
        this.mobileHandlers = [];
    }
}

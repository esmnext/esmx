import type { Router } from '@esmx/router';

export interface LayoutOptions {
    appId: string;
    router: Router;
}

export const SIDEBAR_WIDTH = '260px';

const SVG_LOGO = {
    esmx: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 40 40%22%3E%3Cg transform=%22translate(20,20)%22%3E%3Ccircle r=%2212%22 fill=%22none%22 stroke=%22%2312B2EF%22 stroke-width=%222.8%22/%3E%3Ccircle r=%226.2%22 fill=%22%23FFA000%22/%3E%3C/g%3E%3C/svg%3E',
    html: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Cpath d=%22M4 2l2 20 10 8 10-8 2-20H4zm18.4 6H11l.4 4h13l-.6 6.5-7.8 2.2-7.8-2.2-.4-4h3.1l.2 1.5 4.9 1.4 4.9-1.4.4-4.5H9l-.6-7h16.6l-.6 7z%22 fill=%22%23E44D26%22/%3E%3C/svg%3E',
    vue: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Cpath d=%22M16 2L2 28h8.4L16 17.6 21.6 28H30L16 2z%22 fill=%22%2342b883%22/%3E%3Cpath d=%22M16 2l-5.6 9.6L16 19.6l5.6-8L16 2z%22 fill=%22%2335495e%22/%3E%3C/svg%3E',
    react: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%223%22 fill=%22%2361DAFB%22/%3E%3Cellipse cx=%2216%22 cy=%2216%22 rx=%2215%22 ry=%225.5%22 fill=%22none%22 stroke=%22%2361DAFB%22 stroke-width=%221.8%22 transform=%22rotate(60 16 16)%22/%3E%3Cellipse cx=%2216%22 cy=%2216%22 rx=%2215%22 ry=%225.5%22 fill=%22none%22 stroke=%22%2361DAFB%22 stroke-width=%221.8%22 transform=%22rotate(-60 16 16)%22/%3E%3Cellipse cx=%2216%22 cy=%2216%22 rx=%2215%22 ry=%225.5%22 fill=%22none%22 stroke=%22%2361DAFB%22 stroke-width=%221.8%22/%3E%3C/svg%3E',
    preact: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Cpolygon points=%2216,2 28,11 28,25 16,30 4,25 4,11%22 fill=%22none%22 stroke=%22%23673ab8%22 stroke-width=%222%22/%3E%3Ccircle cx=%2216%22 cy=%2216%22 r=%224.5%22 fill=%22%23673ab8%22/%3E%3C/svg%3E',
    solid: 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 32 32%22%3E%3Cpath d=%22M16 2L2 12l6 18h20l6-18L16 2z%22 fill=%22%232c4f7c%22/%3E%3C/svg%3E'
};

const NAV_ITEMS = [
    { path: '/', label: 'Home', svg: SVG_LOGO.esmx },
    { path: '/html/', label: 'HTML', svg: SVG_LOGO.html },
    { path: '/vue2/', label: 'Vue 2', svg: SVG_LOGO.vue },
    { path: '/vue3/', label: 'Vue 3', svg: SVG_LOGO.vue },
    { path: '/react/', label: 'React', svg: SVG_LOGO.react },
    { path: '/preact/', label: 'Preact', svg: SVG_LOGO.preact },
    { path: '/preact-htm/', label: 'Preact HTM', svg: SVG_LOGO.preact },
    { path: '/solid/', label: 'Solid', svg: SVG_LOGO.solid }
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
                <img src="${item.svg}" alt="" style="width: 22px; height: 22px; flex-shrink: 0;" />
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
        const s = this.appId;
        return `
            <style>
                :root {
                    --esmx-sidebar-width: ${SIDEBAR_WIDTH};
                    --esmx-bg-main: #f8fafc;
                    --esmx-bg-card: #fff;
                    --esmx-bg-sidebar: #0f172a;
                    --esmx-text-primary: #0f172a;
                    --esmx-text-secondary: #64748b;
                    --esmx-text-muted: #94a3b8;
                    --esmx-border: #e2e8f0;
                    --esmx-border-divider: #334155;
                    --esmx-link: #3b82f6;
                    --esmx-nav-hover-bg: rgba(59, 130, 246, 0.08);
                    --esmx-nav-hover-color: #cbd5e1;
                    --esmx-card-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    --esmx-card-hover-border: #cbd5e1;
                    --esmx-glow: rgba(59, 130, 246, 0.06);
                }
                @media (prefers-color-scheme: dark) {
                    :root {
                        --esmx-bg-main: #0f172a;
                        --esmx-bg-card: #1e293b;
                        --esmx-bg-sidebar: #020617;
                        --esmx-text-primary: #f1f5f9;
                        --esmx-text-secondary: #94a3b8;
                        --esmx-text-muted: #64748b;
                        --esmx-border: #334155;
                        --esmx-border-divider: #1e293b;
                        --esmx-link: #60a5fa;
                        --esmx-nav-hover-bg: rgba(59, 130, 246, 0.12);
                        --esmx-nav-hover-color: #e2e8f0;
                        --esmx-card-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                        --esmx-card-hover-border: #475569;
                        --esmx-glow: rgba(59, 130, 246, 0.04);
                    }
                }
                #${s}-sidebar a[data-nav] {
                    transition: background 0.2s ease, color 0.2s ease, border-color 0.2s ease;
                }
                #${s}-sidebar a[data-nav]:hover {
                    background: var(--esmx-nav-hover-bg);
                    color: var(--esmx-nav-hover-color);
                }
                #${s}-menu-btn:focus-visible,
                #${s}-sidebar-close:focus-visible {
                    outline: 2px solid #3b82f6;
                    outline-offset: 2px;
                }
                @media (max-width: 767px) {
                    :root {
                        --esmx-sidebar-width: 0px;
                        --esmx-mobile-header-height: 56px;
                    }
                    #${s}-sidebar {
                        transform: translateX(-100%);
                        transition: transform 0.3s ease;
                    }
                    #${s}-sidebar.${s}-open {
                        transform: translateX(0) !important;
                        width: min(260px, 80vw) !important;
                    }
                    #${s}-sidebar-overlay {
                        display: none;
                        position: fixed;
                        inset: 0;
                        background: rgba(0,0,0,0.5);
                        z-index: 99;
                    }
                    #${s}-sidebar-overlay.${s}-open {
                        display: block;
                    }
                    #${s}-sidebar-close {
                        display: block !important;
                    }
                }
                @media (min-width: 768px) {
                    #${s}-mobile-header {
                        display: none !important;
                    }
                    #${s}-sidebar-overlay {
                        display: none !important;
                    }
                    #${s}-sidebar-close {
                        display: none !important;
                    }
                }
            </style>
        `;
    }

    get header(): string {
        const s = this.appId;
        return normalizeHtml(`
            <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cg transform='translate(20,20)'%3E%3Ccircle r='12' fill='none' stroke='%2312B2EF' stroke-width='2.8'/%3E%3Ccircle r='6.2' fill='%23FFA000'/%3E%3C/g%3E%3C/svg%3E" type="image/svg+xml" />
            ${this.styleSheet}
            <div id="${s}-mobile-header" style="
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                height: 56px;
                background: var(--esmx-bg-sidebar);
                color: white;
                display: flex;
                align-items: center;
                padding: 0 16px;
                z-index: 90;
                gap: 12px;
            ">
                <button id="${s}-menu-btn" style="
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
            <div id="${s}-sidebar-overlay"></div>
            <div id="${s}-sidebar" style="
                width: ${SIDEBAR_WIDTH};
                background: var(--esmx-bg-sidebar);
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
                <button id="${s}-sidebar-close" style="
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
            background: var(--esmx-bg-sidebar);
            color: var(--esmx-text-muted);
            font-size: 0.875rem;
            text-align: center;
        ">
            <p style="margin: 0;">
                Powered by <a href="https://esmx.dev" target="_blank" style="color: var(--esmx-link); text-decoration: none;">Esmx</a>
                &copy; ${new Date().getFullYear()}
            </p>
        </div>`;
    }

    private toggleSidebar(open: boolean): void {
        const s = this.appId;
        const sidebar = document.getElementById(`${s}-sidebar`);
        const overlay = document.getElementById(`${s}-sidebar-overlay`);
        if (sidebar) {
            sidebar.classList.toggle(`${s}-open`, open);
            sidebar.style.transform = open ? 'translateX(0)' : '';
            sidebar.style.width = open ? '' : '';
            sidebar.style.visibility = open ? '' : '';
        }
        if (overlay) {
            overlay.classList.toggle(`${s}-open`, open);
            overlay.style.display = open ? 'block' : '';
        }
    }

    mount(): void {
        const s = this.appId;
        const sidebar = document.getElementById(`${s}-sidebar`);
        if (!sidebar) return;

        // Nav link clicks
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
        sidebar.addEventListener('click', this.clickHandler);

        const menuBtn = document.getElementById(`${s}-menu-btn`);
        const overlay = document.getElementById(`${s}-sidebar-overlay`);
        const closeBtn = document.getElementById(`${s}-sidebar-close`);

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
            const sidebar = document.getElementById(`${this.appId}-sidebar`);
            if (sidebar) {
                sidebar.removeEventListener('click', this.clickHandler);
            }
            this.clickHandler = null;
        }
        this.mobileHandlers.forEach((cleanup) => cleanup());
        this.mobileHandlers = [];
    }
}

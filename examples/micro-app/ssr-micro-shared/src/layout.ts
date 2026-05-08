import type { Router } from '@esmx/router';

export interface LayoutOptions {
    appId: string;
    router: Router;
}

const NAV_ITEMS = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/html', label: 'HTML', icon: 'H' },
    { path: '/vue2', label: 'Vue 2', icon: 'V2' },
    { path: '/vue3', label: 'Vue 3', icon: 'V3' },
    { path: '/react', label: 'React', icon: 'R' }
];

const SHARED_HEADER_ID = 'esmx-sidebar';
const SHARED_FOOTER_ID = 'esmx-layout-footer';

function getCurrentPath(router: Router): string {
    try {
        return router.route.path;
    } catch {
        return '/';
    }
}

function generateNavHtml(currentPath: string): string {
    return NAV_ITEMS.map((item) => {
        const isActive = currentPath === item.path;
        return `
            <a
                href="${item.path}"
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
        `;
    }).join('');
}

function updateActiveState(currentPath: string): void {
    const headerEl = document.getElementById(SHARED_HEADER_ID);
    if (!headerEl) return;

    const links = headerEl.querySelectorAll('a[data-nav]');
    links.forEach((link) => {
        const path = link.getAttribute('data-nav');
        const isActive = path === currentPath;
        const el = link as HTMLElement;
        el.style.color = isActive ? '#fff' : '#94a3b8';
        el.style.background = isActive
            ? 'rgba(59, 130, 246, 0.15)'
            : 'transparent';
        el.style.borderLeft = isActive
            ? '3px solid #3b82f6'
            : '3px solid transparent';
        el.style.fontWeight = isActive ? '600' : '400';
    });
}

export class Layout {
    public readonly appId: string;
    public readonly router: Router;
    public readonly id: string;
    public readonly headerId: string;
    public readonly footerId: string;
    private cleanup: (() => void) | null = null;

    constructor(options: LayoutOptions) {
        this.appId = options.appId;
        this.router = options.router;
        this.id = `${options.appId}-layout`;
        this.headerId = SHARED_HEADER_ID;
        this.footerId = SHARED_FOOTER_ID;
    }

    get header(): string {
        const currentPath = getCurrentPath(this.router);

        return `
            <div id="${this.headerId}" style="
                width: 260px;
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
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 32px;
                    padding-bottom: 16px;
                    border-bottom: 1px solid #334155;
                    color: #fff;
                ">
                    Esmx Hub
                </div>
                <nav style="
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                ">
                    ${generateNavHtml(currentPath)}
                </nav>
            </div>
        `;
    }

    get footer(): string {
        return `<div id="${this.footerId}" style="display: none;"></div>`;
    }

    private bindEvents(): void {
        const headerEl = document.getElementById(this.headerId);
        if (!headerEl) return;

        const links = headerEl.querySelectorAll('a[data-nav]');
        const handlers = new Map<Element, EventListener>();

        links.forEach((link) => {
            const handler = (e: Event) => {
                e.preventDefault();
                const path = link.getAttribute('data-nav');
                if (path) {
                    this.router.push(path);
                }
            };
            link.addEventListener('click', handler);
            handlers.set(link, handler);
        });

        this.cleanup = () => {
            handlers.forEach((handler, link) => {
                link.removeEventListener('click', handler);
            });
        };
    }

    mount(): void {
        const currentPath = getCurrentPath(this.router);

        if (document.getElementById(this.headerId)) {
            updateActiveState(currentPath);
            if (this.cleanup) this.cleanup();
            this.bindEvents();
            return;
        }

        this.bindEvents();
    }

    unmount(): void {
        if (this.cleanup) {
            this.cleanup();
            this.cleanup = null;
        }
    }
}

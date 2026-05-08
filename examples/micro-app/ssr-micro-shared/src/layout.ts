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

function getCurrentPath(router: Router): string {
    try {
        return router.route.path;
    } catch {
        return '/';
    }
}

function generateNavHtml(router: Router, currentPath: string): string {
    return NAV_ITEMS.map((item) => {
        const isActive = currentPath === item.path;
        const resolved = router.resolveLink({
            to: item.path,
            type: 'push'
        });
        return `
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
                <span style="font-size: 1.1rem; width: 24px; text-align: center;">${item.icon}</span>
                <span>${item.label}</span>
            </a>
        `;
    }).join('');
}

export class Layout {
    public readonly appId: string;
    public readonly router: Router;
    public readonly headerId: string;
    public readonly footerId: string;
    private clickHandler: ((e: Event) => void) | null = null;

    constructor(options: LayoutOptions) {
        this.appId = options.appId;
        this.router = options.router;
        this.headerId = `${options.appId}-header`;
        this.footerId = `${options.appId}-footer`;
    }

    get header(): string {
        const currentPath = getCurrentPath(this.router);
        return `
            <div style="
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
                <nav style="display: flex; flex-direction: column; gap: 4px;">
                    ${generateNavHtml(this.router, currentPath)}
                </nav>
            </div>
        `;
    }

    get footer(): string {
        return `<div style="display: none;"></div>`;
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
            }
        };

        container.addEventListener('click', this.clickHandler);
    }

    unmount(): void {
        if (this.clickHandler) {
            const container = document.getElementById(this.headerId);
            if (container) {
                container.removeEventListener('click', this.clickHandler);
            }
            this.clickHandler = null;
        }
    }
}

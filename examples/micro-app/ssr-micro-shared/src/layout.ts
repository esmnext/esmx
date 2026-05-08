import type { Router } from '@esmx/router';

export interface LayoutOptions {
    appId: string;
    router: Router;
}

export interface LayoutInstance {
    readonly id: string;
    readonly headerId: string;
    readonly footerId: string;
    readonly header: string;
    readonly footer: string;
    mount(): void;
    unmount(): void;
}

const NAV_ITEMS = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/html', label: 'HTML', icon: 'H' },
    { path: '/vue2', label: 'Vue 2', icon: 'V2' },
    { path: '/vue3', label: 'Vue 3', icon: 'V3' },
    { path: '/react', label: 'React', icon: 'R' }
];

export function useLayout(options: LayoutOptions): LayoutInstance {
    const { appId, router } = options;
    const id = `${appId}-layout`;
    const headerId = `${appId}-header`;
    const footerId = `${appId}-footer`;

    let cleanup: (() => void) | null = null;

    function getCurrentPath(): string {
        try {
            return router.route.path;
        } catch {
            return '/';
        }
    }

    function generateHeader(): string {
        const currentPath = getCurrentPath();

        const navHtml = NAV_ITEMS.map((item) => {
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

        return `
            <div id="${headerId}" style="
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
                    ${navHtml}
                </nav>
            </div>
        `;
    }

    function generateFooter(): string {
        return `<div id="${footerId}" style="display: none;"></div>`;
    }

    function mount(): void {
        const headerEl = document.getElementById(headerId);
        if (!headerEl) return;

        const links = headerEl.querySelectorAll('a[data-nav]');
        const handlers = new Map<Element, EventListener>();

        links.forEach((link) => {
            const handler = (e: Event) => {
                e.preventDefault();
                const path = link.getAttribute('data-nav');
                if (path) {
                    router.push(path);
                }
            };
            link.addEventListener('click', handler);
            handlers.set(link, handler);
        });

        cleanup = () => {
            handlers.forEach((handler, link) => {
                link.removeEventListener('click', handler);
            });
        };
    }

    function unmount(): void {
        if (cleanup) {
            cleanup();
            cleanup = null;
        }
    }

    return {
        id,
        headerId,
        footerId,
        get header() {
            return generateHeader();
        },
        get footer() {
            return generateFooter();
        },
        mount,
        unmount
    };
}

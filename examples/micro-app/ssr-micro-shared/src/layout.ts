import type { Router } from '@esmx/router';

export interface LayoutOptions {
    appId: string;
    router: Router;
}

export interface LayoutInstance {
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

function generateHeader(currentPath: string): string {
    return `
        <div id="${SHARED_HEADER_ID}" style="
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

function generateFooter(): string {
    return `<div id="${SHARED_FOOTER_ID}" style="display: none;"></div>`;
}

function updateActiveState(currentPath: string): void {
    const headerEl = document.getElementById(SHARED_HEADER_ID);
    if (!headerEl) return;

    const links = headerEl.querySelectorAll('a[data-nav]');
    links.forEach((link) => {
        const path = link.getAttribute('data-nav');
        const isActive = path === currentPath;
        (link as HTMLElement).style.color = isActive ? '#fff' : '#94a3b8';
        (link as HTMLElement).style.background = isActive
            ? 'rgba(59, 130, 246, 0.15)'
            : 'transparent';
        (link as HTMLElement).style.borderLeft = isActive
            ? '3px solid #3b82f6'
            : '3px solid transparent';
        (link as HTMLElement).style.fontWeight = isActive ? '600' : '400';
    });
}

export function useLayout(options: LayoutOptions): LayoutInstance {
    const { router } = options;
    let cleanup: (() => void) | null = null;

    function bindEvents(): void {
        const headerEl = document.getElementById(SHARED_HEADER_ID);
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

    function mount(): void {
        const currentPath = getCurrentPath(router);

        if (document.getElementById(SHARED_HEADER_ID)) {
            // DOM 已存在，只更新状态和事件
            updateActiveState(currentPath);
            if (cleanup) cleanup();
            bindEvents();
            return;
        }

        // DOM 不存在，首次挂载
        bindEvents();
    }

    function unmount(): void {
        if (cleanup) {
            cleanup();
            cleanup = null;
        }
        // 不删除 DOM，让下一个应用复用
    }

    return {
        headerId: SHARED_HEADER_ID,
        footerId: SHARED_FOOTER_ID,
        get header() {
            return generateHeader(getCurrentPath(router));
        },
        get footer() {
            return generateFooter();
        },
        mount,
        unmount
    };
}

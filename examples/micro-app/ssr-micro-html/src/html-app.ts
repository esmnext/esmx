import type { Router } from '@esmx/router';
import {
    BaseApp,
    buildSeoHead,
    getAppState,
    Layout,
    SIDEBAR_WIDTH,
    setAppState,
    t
} from 'ssr-micro-shared/src/index';

export class HtmlApp extends BaseApp {
    private layout: Layout;

    constructor(router: Router) {
        super(router);
        this.layout = new Layout({ appId: 'html', router });
    }

    protected getHead() {
        return buildSeoHead(this.router, {
            path: '/html/',
            title: t(this.router, 'fwHtmlTitle'),
            description: t(this.router, 'fwHtmlDesc')
        });
    }

    render(): string {
        return (
            `<div>` +
            `<div id="${this.layout.headerId}">${this.layout.header}</div>` +
            `<div style="margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH}); min-height: 100vh; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));">` +
            `<div style="max-width: 800px; margin: 0 auto;">` +
            `<div style="
                background: var(--esmx-bg-card);
                border-radius: 16px;
                padding: 48px;
                border: 1px solid var(--esmx-border);
                text-align: center;
            ">` +
            `<div style="
                width: 56px;
                height: 56px;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border-radius: 14px;
                display: flex;
                align-items: center;
                justify-content: center;
                margin: 0 auto 20px;
            " role="img" aria-label="HTML">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
                    <path d="M4 2l2 20 10 8 10-8 2-20H4zm18.4 6H11l.4 4h13l-.6 6.5-7.8 2.2-7.8-2.2-.4-4h3.1l.2 1.5 4.9 1.4 4.9-1.4.4-4.5H9l-.6-7h16.6l-.6 7z" fill="#fff"/>
                </svg>
            </div>` +
            `<h1 style="
                font-size: 2rem;
                font-weight: 800;
                color: var(--esmx-text-primary);
                margin-bottom: 12px;
            ">${t(this.router, 'fwHtmlTitle')}</h1>` +
            `<div style="margin:16px 0;">
    <div id="html-count" style="font-size:3rem;font-weight:800;color:var(--esmx-text-primary);margin-bottom:12px;">0</div>
    <div style="display:flex;gap:12px;justify-content:center;">
        <button id="html-inc" style="padding:8px 24px;border-radius:8px;border:none;background:var(--esmx-link);color:#fff;cursor:pointer;font-size:1.2rem;">+</button>
        <button id="html-dec" style="padding:8px 24px;border-radius:8px;border:none;background:#ef4444;color:#fff;cursor:pointer;font-size:1.2rem;">-</button>
    </div>
</div>` +
            `</div>` +
            `</div>` +
            `</div>` +
            `<div id="${this.layout.footerId}">${this.layout.footer}</div>` +
            `</div>`
        );
    }

    protected onMount(container: HTMLElement): void {
        container.innerHTML = this.render();
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'html',
            frameworkVisits: {
                html: (getAppState(this.router).frameworkVisits.html || 0) + 1
            }
        });
        this.layout.mount();
        this.initDemo(container);
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'html',
            frameworkVisits: {
                html: (getAppState(this.router).frameworkVisits.html || 0) + 1
            }
        });
        this.layout.mount();
        this.initDemo(container);
    }

    private initDemo(container: HTMLElement): void {
        const countEl = container.querySelector('#html-count');
        const incEl = container.querySelector('#html-inc');
        const decEl = container.querySelector('#html-dec');
        if (countEl && incEl && decEl) {
            incEl.addEventListener('click', () => {
                countEl.textContent = String(Number(countEl.textContent) + 1);
            });
            decEl.addEventListener('click', () => {
                countEl.textContent = String(Number(countEl.textContent) - 1);
            });
        }
    }

    protected onUnmount(): void {
        this.layout.unmount();
    }

    renderToString(): Promise<string> {
        return Promise.resolve(this.render());
    }
}

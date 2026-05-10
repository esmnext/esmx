import type { Router } from '@esmx/router';
import {
    BaseApp,
    Layout,
    SIDEBAR_WIDTH,
    setRouterHead
} from 'ssr-micro-shared/src/index';
// @ts-expect-error Esmx module linking resolves to environment-specific chunk
import { createHead } from 'unhead';
import type { ActiveHeadEntry, UseHeadInput } from 'unhead/types';

export class HtmlApp extends BaseApp {
    private layout: Layout;
    private head = createHead();
    private headEntry: ActiveHeadEntry<UseHeadInput> | null = null;

    constructor(router: Router) {
        super(router);
        this.layout = new Layout({ appId: 'html', router });
        this.headEntry = this.head.push({
            title: 'HTML Micro-App',
            meta: [
                {
                    name: 'description',
                    content: 'Pure HTML + TypeScript micro-app.'
                }
            ]
        });
        setRouterHead(router, this.head);
    }

    render(): string {
        return (
            `<div>` +
            `<div id="${this.layout.headerId}">${this.layout.header}</div>` +
            `<div id="esmx-main" style="margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH}); min-height: 100vh; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));">` +
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
            ">HTML Micro-App</h1>` +
            `<p style="
                font-size: 1.125rem;
                color: var(--esmx-text-secondary);
                margin-bottom: 32px;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
            ">Pure HTML + TypeScript micro-app.</p>` +
            `</div>` +
            `</div>` +
            `</div>` +
            `<div id="${this.layout.footerId}">${this.layout.footer}</div>` +
            `</div>`
        );
    }

    protected onMount(container: HTMLElement): void {
        container.innerHTML = this.render();
        this.layout.mount();
    }

    protected onHydration(container: HTMLElement): void {
        this.layout.mount();
    }

    protected onUnmount(): void {
        this.headEntry?.dispose();
        this.layout.unmount();
    }

    renderToString(): Promise<string> {
        return Promise.resolve(this.render());
    }
}

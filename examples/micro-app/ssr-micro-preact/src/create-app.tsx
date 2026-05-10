import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider } from '@esmx/router-react';
import { createHead, UnheadProvider } from '@unhead/react/client';
import { hydrate, render } from 'preact';
import { renderToString } from 'preact-render-to-string';
import { h } from 'preact';

import { BaseApp, Layout, SIDEBAR_WIDTH, setRouterHead } from 'ssr-micro-shared/src/index';
import { AppContent } from './app';

function createApp(router, head) {
    return h(UnheadProvider, { head, client: head },
        h(RouterProvider, { router },
            h(AppContent, null)
        )
    );
}

class PreactApp extends BaseApp {
    private head = createHead();
    private layout: Layout;

    constructor(router) {
        super(router);
        this.layout = new Layout({ appId: 'preact', router });
        this.head.push({
            title: 'Preact Micro-App',
            meta: [{ name: 'description', content: 'This page is rendered by a Preact 10 micro-app.' }]
        });
        setRouterHead(router, this.head);
    }

    protected onMount(container: HTMLElement): void {
        render(createApp(this.router, this.head), container);
    }

    protected onHydration(container: HTMLElement): void {
        hydrate(createApp(this.router, this.head), container);
    }

    protected onUnmount(): void {
        if (this.container) {
            render(null, this.container);
        }
    }

    async renderToString(): Promise<string> {
        // SSR: render static HTML with layout, head handled by hub
        return `<div id="${this.layout.headerId}">${this.layout.header}</div>
            <div style="margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH}); min-height: 100vh; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));">
                <div style="max-width: 800px; margin: 0 auto;">
                    <div style="background: var(--esmx-bg-card); border-radius: 16px; padding: 48px; border: 1px solid var(--esmx-border); text-align: center;">
                        <div style="width: 56px; height: 56px; background: linear-gradient(135deg, #673ab8, #512da8); border-radius: 14px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;" role="img" aria-label="Preact">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
                                <polygon points="16,2 28,11 28,25 16,30 4,25 4,11" fill="none" stroke="#fff" stroke-width="2"/>
                                <circle cx="16" cy="16" r="4.5" fill="#fff"/>
                            </svg>
                        </div>
                        <h1 style="font-size: 2rem; font-weight: 800; color: var(--esmx-text-primary); margin-bottom: 12px;">Preact Micro-App</h1>
                        <p style="font-size: 1.125rem; color: var(--esmx-text-secondary); margin-bottom: 32px;">This page is rendered by a Preact 10 micro-app.</p>
                    </div>
                </div>
            </div>
            <div id="${this.layout.footerId}">${this.layout.footer}</div>`;
    }
}

export function createPreactApp(router): RouterMicroAppOptions {
    const app = new PreactApp(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => Promise.resolve(app.renderToString())
    };
}

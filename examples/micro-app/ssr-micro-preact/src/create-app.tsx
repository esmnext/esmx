import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider } from '@esmx/router-react';
import { createHead, UnheadProvider } from '@unhead/react/client';
import { hydrate, render } from 'preact';
import { renderToString } from 'preact-render-to-string';

import { BaseApp, setRouterHead } from 'ssr-micro-shared/src/index';
import { AppContent } from './app';

function createApp(router, head) {
    return (
        <UnheadProvider head={head}>
            <RouterProvider router={router}>
                <AppContent />
            </RouterProvider>
        </UnheadProvider>
    );
}

class PreactApp extends BaseApp {
    private head = createHead();

    constructor(router) {
        super(router);
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

    renderToString(): string {
        const app = createApp(this.router, this.head);
        const html = renderToString(app);
        return html?.trim() ? `<div>${html}</div>` : '';
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

import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider } from '@esmx/router-react';
import { createHead, UnheadProvider } from '@unhead/react/client';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import React from 'react';

import { BaseApp } from 'ssr-micro-shared/src/index';
import { AppContent } from './app';

function createApp(router, head) {
    return () => (
        <UnheadProvider head={head}>
            <RouterProvider router={router}>
                <AppContent />
            </RouterProvider>
        </UnheadProvider>
    );
}

class ReactApp extends BaseApp {
    private reactRoot: ReturnType<typeof createRoot> | null = null;
    private head = createHead();

    constructor(router) {
        super(router);
        router.context.head = this.head;
    }

    protected onMount(container: HTMLElement): void {
        const App = createApp(this.router, this.head);
        this.reactRoot = createRoot(container);
        this.reactRoot.render(<App />);
    }

    protected onHydration(container: HTMLElement): void {
        const App = createApp(this.router, this.head);
        this.reactRoot = hydrateRoot(container, <App />);
    }

    protected onUnmount(): void {
        this.reactRoot?.unmount();
        this.reactRoot = null;
    }

    async renderToString(): Promise<string> {
        const App = createApp(this.router, this.head);
        const html = renderToString(<App />);
        return html?.trim() ? `<div>${html}</div>` : '';
    }
}

export function createReactApp(router): RouterMicroAppOptions {
    const app = new ReactApp(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

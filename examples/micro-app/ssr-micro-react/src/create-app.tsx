import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider } from '@esmx/router-react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { BaseApp } from 'ssr-micro-shared/src/index';
import { AppContent } from './app';

function createApp(router) {
    return () => (
        <RouterProvider router={router}>
            <AppContent />
        </RouterProvider>
    );
}

class ReactApp extends BaseApp {
    private reactRoot: ReturnType<typeof createRoot> | null = null;

    protected onMount(container: HTMLElement): void {
        const App = createApp(this.router);
        this.reactRoot = createRoot(container);
        this.reactRoot.render(<App />);
    }

    protected onHydration(container: HTMLElement): void {
        const App = createApp(this.router);
        this.reactRoot = hydrateRoot(container, <App />);
    }

    protected onUnmount(): void {
        this.reactRoot?.unmount();
        this.reactRoot = null;
    }

    renderToString(): string {
        const App = createApp(this.router);
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

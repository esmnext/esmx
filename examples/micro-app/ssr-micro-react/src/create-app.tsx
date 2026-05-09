import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider } from '@esmx/router-react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { BaseApp } from 'ssr-micro-shared/src/index';
import { AppContent } from './app';

class ReactApp extends BaseApp {
    private reactRoot: ReturnType<typeof createRoot> | null = null;

    protected onMount(container: HTMLElement): void {
        const App = () => (
            <RouterProvider router={this.router}>
                <AppContent />
            </RouterProvider>
        );
        this.reactRoot = createRoot(container);
        this.reactRoot.render(<App />);
    }

    protected onHydration(container: HTMLElement): void {
        const App = () => (
            <RouterProvider router={this.router}>
                <AppContent />
            </RouterProvider>
        );
        this.reactRoot = hydrateRoot(container, <App />);
    }

    protected onUnmount(): void {
        this.reactRoot?.unmount();
        this.reactRoot = null;
    }

    renderToString(): Promise<string> {
        const App = () => (
            <RouterProvider router={this.router}>
                <AppContent />
            </RouterProvider>
        );
        return Promise.resolve(renderToString(<App />));
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

import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider } from '@esmx/router-react';
import { UnheadProvider } from '@unhead/react/client';
import React from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { BaseApp, getAppState, setAppState } from 'ssr-micro-shared/src/index';
import type { Unhead } from 'unhead/types';
import { AppContent } from './app';

function createApp(router: Router, head: Unhead<any>) {
    // Point @unhead/react's `useHead` at the shared router-scoped head so the
    // component uses idiomatic `useHead` while writing to the one head that owns
    // the document.
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

    protected onMount(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'react',
            frameworkVisits: {
                react: (getAppState(this.router).frameworkVisits.react || 0) + 1
            }
        });
        const App = createApp(this.router, this.head);
        this.reactRoot = createRoot(container);
        this.reactRoot.render(<App />);
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'react',
            frameworkVisits: {
                react: (getAppState(this.router).frameworkVisits.react || 0) + 1
            }
        });
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

export function createReactApp(router: Router): RouterMicroAppOptions {
    const app = new ReactApp(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

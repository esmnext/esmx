import type { RouterMicroAppOptions } from '@esmx/router';

import { RouterProvider } from '@esmx/router-react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { AppContent } from './app';

export function createReactApp(router): RouterMicroAppOptions {
    const AppWithProvider = () => (
        <RouterProvider router={router}>
            <AppContent />
        </RouterProvider>
    );

    let reactRoot: ReturnType<typeof createRoot> | null = null;
    let container: HTMLElement | null = null;

    return {
        mount(root: HTMLElement) {
            const ssrEl = root.querySelector('[data-ssr]');
            if (ssrEl) {
                container = ssrEl as HTMLElement;
                reactRoot = hydrateRoot(container, <AppWithProvider />);
            } else {
                container = document.createElement('div');
                root.appendChild(container);
                reactRoot = createRoot(container);
                reactRoot.render(<AppWithProvider />);
            }
        },
        unmount() {
            if (reactRoot) {
                reactRoot.unmount();
                reactRoot = null;
            }
            container?.remove();
            container = null;
        },
        renderToString() {
            return Promise.resolve(renderToString(<AppWithProvider />));
        }
    };
}

import type { RouterMicroAppOptions } from '@esmx/router';

import { RouterProvider } from '@esmx/router-react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { AppContent, SSRContext } from './app';

export function createReactApp(router): RouterMicroAppOptions {
    const AppWithProvider = ({ ssr }: { ssr: boolean }) => (
        <SSRContext.Provider value={ssr}>
            <RouterProvider router={router}>
                <AppContent />
            </RouterProvider>
        </SSRContext.Provider>
    );

    let root: ReturnType<typeof createRoot> | null = null;

    return {
        mount(el: HTMLElement) {
            // React creates a root inside the container and renders within it
            // For SSR, use hydrateRoot to attach event listeners to existing DOM
            const hasSSR = el.querySelector('[data-ssr="true"]') !== null;
            if (hasSSR) {
                root = hydrateRoot(el, <AppWithProvider ssr={false} />);
            } else {
                root = createRoot(el);
                root.render(<AppWithProvider ssr={false} />);
            }
        },
        unmount() {
            // React root.unmount() clears the container's content but preserves the container element
            if (root) {
                root.unmount();
                root = null;
            }
        },
        renderToString() {
            return Promise.resolve(renderToString(<AppWithProvider ssr={true} />));
        }
    };
}

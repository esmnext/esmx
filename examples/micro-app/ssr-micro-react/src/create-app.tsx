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

    let reactRoot: ReturnType<typeof createRoot> | null = null;
    let container: HTMLElement | null = null;

    return {
        mount(root: HTMLElement) {
            const ssrEl = root.querySelector('[data-ssr="true"]');
            if (ssrEl) {
                container = ssrEl as HTMLElement;
                reactRoot = hydrateRoot(container, <AppWithProvider ssr={false} />);
            } else {
                container = document.createElement('div');
                root.appendChild(container);
                reactRoot = createRoot(container);
                reactRoot.render(<AppWithProvider ssr={false} />);
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
            return Promise.resolve(renderToString(<AppWithProvider ssr={true} />));
        }
    };
}

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
            const hasSSR = el.querySelector('[data-ssr="true"]') !== null;
            if (hasSSR) {
                root = hydrateRoot(el, <AppWithProvider ssr={false} />);
            } else {
                root = createRoot(el);
                root.render(<AppWithProvider ssr={false} />);
            }
        },
        unmount() {
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

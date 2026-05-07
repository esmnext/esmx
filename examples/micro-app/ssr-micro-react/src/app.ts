import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider, RouterView } from '@esmx/router-react';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

export function App() {
    return createElement(
        'div',
        { className: 'react-app' },
        createElement('h1', null, 'React Micro-App'),
        createElement(
            'p',
            null,
            'This is a React micro-app rendered by Esmx Router'
        )
    );
}

export function createReactApp(router): RouterMicroAppOptions {
    let root: ReturnType<typeof createRoot> | null = null;

    function AppWithProvider() {
        return createElement(
            RouterProvider,
            { router },
            createElement(RouterView, null)
        );
    }

    return {
        mount(el: HTMLElement) {
            root = createRoot(el);
            root.render(createElement(AppWithProvider));
        },
        unmount() {
            if (root) {
                root.unmount();
                root = null;
            }
        },
        renderToString() {
            return Promise.resolve(
                renderToString(createElement(AppWithProvider))
            );
        }
    };
}

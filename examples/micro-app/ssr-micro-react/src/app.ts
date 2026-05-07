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
    let container: HTMLElement | null = null;

    function AppWithProvider() {
        return createElement(
            RouterProvider,
            { router },
            createElement(RouterView, null)
        );
    }

    return {
        mount(el: HTMLElement) {
            el.innerHTML = '';
            container = document.createElement('div');
            el.appendChild(container);
            root = createRoot(container);
            root.render(createElement(AppWithProvider));
        },
        unmount() {
            if (root) {
                root.unmount();
                root = null;
            }
            if (container && container.parentNode) {
                container.parentNode.removeChild(container);
            }
            container = null;
        },
        renderToString() {
            return Promise.resolve(
                renderToString(createElement(AppWithProvider))
            );
        }
    };
}

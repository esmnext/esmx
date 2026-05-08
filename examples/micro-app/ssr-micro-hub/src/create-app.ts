import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { HomeApp } from './home-app';

export function createHomeApp(router: Router): RouterMicroAppOptions {
    const app = new HomeApp(router);
    let container: HTMLElement | null = null;

    return {
        mount(root: HTMLElement) {
            const ssrEl = root.querySelector('[data-ssr="true"]');
            if (ssrEl) {
                container = ssrEl as HTMLElement;
            } else {
                container = document.createElement('div');
                container.innerHTML = app.render();
                root.appendChild(container);
            }
            app.mount(container);
        },
        unmount() {
            app.unmount();
            container?.remove();
            container = null;
        },
        renderToString() {
            return `<div data-ssr="true">${app.render()}</div>`;
        }
    };
}

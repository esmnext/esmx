import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { HtmlApp } from './html-app';

export function createHtmlApp(router: Router): RouterMicroAppOptions {
    const app = new HtmlApp(router);

    return {
        mount(el: HTMLElement) {
            // For SSR: reuse the existing DOM element marked with data-ssr="true"
            // For CSR: create a new container and append to the root
            app.mount(el);
        },
        unmount() {
            // HtmlApp.unmount() removes the entire container from DOM
            app.unmount();
        },
        renderToString() {
            return app.render(true);
        }
    };
}

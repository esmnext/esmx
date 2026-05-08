import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { HtmlApp } from './html-app';

export function createHtmlApp(router: Router): RouterMicroAppOptions {
    const app = new HtmlApp(router);

    return {
        mount(el: HTMLElement) {
            app.mount(el);
        },
        unmount() {
            app.unmount();
        },
        renderToString() {
            return app.render(true);
        }
    };
}

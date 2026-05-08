import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { HomeApp } from './home-app';

export function createHomeApp(router: Router): RouterMicroAppOptions {
    const app = new HomeApp(router);

    return {
        mount(el: HTMLElement) {
            app.mount(el);
        },
        unmount() {
            app.unmount();
        },
        renderToString() {
            return app.render();
        }
    };
}

import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { HomeApp } from './home-app';

export function createHomeApp(router: Router): RouterMicroAppOptions {
    const app = new HomeApp(router);
    return {
        mount: (root) => app.mount(root),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { LitApp } from './lit-app';

export function createLitApp(router: Router): RouterMicroAppOptions {
    const app = new LitApp(router);
    return {
        mount: (root) => app.mount(root),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

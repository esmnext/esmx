import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { SvelteApp } from './svelte-app';

export function createSvelteApp(router: Router): RouterMicroAppOptions {
    const app = new SvelteApp(router);
    return {
        mount: (root) => app.mount(root),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

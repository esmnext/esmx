import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { HtmlApp } from './html-app';

export function createHtmlApp(router: Router): RouterMicroAppOptions {
    const app = new HtmlApp(router);
    return {
        mount: (root) => app.mount(root),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

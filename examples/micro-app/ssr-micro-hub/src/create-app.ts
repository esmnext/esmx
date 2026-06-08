import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { HomeApp } from './home-app';
import { LandingApp } from './landing-app';

export function createHomeApp(router: Router): RouterMicroAppOptions {
    const app = new HomeApp(router);
    return {
        mount: (root) => app.mount(root),
        hydration: (root) => app.hydration(root),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

export function createLandingApp(router: Router): RouterMicroAppOptions {
    const app = new LandingApp(router);
    return {
        mount: (root) => app.mount(root),
        hydration: (root) => app.hydration(root),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

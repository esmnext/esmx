import type { RouterMicroAppOptions } from '@esmx/router';
import { hydrate, render } from 'preact';
import { renderToString } from 'preact-render-to-string';

import { BaseApp } from 'ssr-micro-shared/src/index';
import { AppContent } from './app';

class PreactApp extends BaseApp {
    protected onMount(container: HTMLElement): void {
        render(<AppContent router={this.router} />, container);
    }

    protected onHydration(container: HTMLElement): void {
        hydrate(<AppContent router={this.router} />, container);
    }

    protected onUnmount(): void {
        if (this.container) {
            render(null, this.container);
        }
    }

    async renderToString(): Promise<string> {
        const html = renderToString(<AppContent router={this.router} />);
        return html?.trim() ? `<div>${html}</div>` : '';
    }
}

export function createPreactApp(router): RouterMicroAppOptions {
    const app = new PreactApp(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

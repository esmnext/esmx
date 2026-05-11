import type { RouterMicroAppOptions } from '@esmx/router';
import { hydrate, render, renderToString } from 'solid-js/web';

import { BaseApp } from 'ssr-micro-shared/src/index';
import { AppContent } from './app';

class SolidApp extends BaseApp {
    private dispose: (() => void) | null = null;

    constructor(router) {
        super(router);
        this.head.push({
            title: 'SolidJS Micro-App',
            meta: [
                {
                    name: 'description',
                    content: 'This page is rendered by a SolidJS micro-app.'
                }
            ]
        });
    }

    protected onMount(container: HTMLElement): void {
        this.dispose = render(
            () => <AppContent router={this.router} />,
            container
        );
    }

    protected onHydration(container: HTMLElement): void {
        this.dispose = hydrate(
            () => <AppContent router={this.router} />,
            container
        );
    }

    protected onUnmount(): void {
        this.dispose?.();
        this.dispose = null;
    }

    async renderToString(): Promise<string> {
        const html = renderToString(() => <AppContent router={this.router} />);
        return html?.trim() ? `<div>${html}</div>` : '';
    }
}

export function createSolidApp(router): RouterMicroAppOptions {
    const app = new SolidApp(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

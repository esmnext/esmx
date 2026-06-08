import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { hydrate, render } from 'preact';
import { renderToString } from 'preact-render-to-string';

import {
    BaseApp,
    buildSeoHead,
    getAppState,
    setAppState
} from 'ssr-micro-shared/src/index';
import { AppContent } from './app';

class PreactApp extends BaseApp {
    protected getHead() {
        return buildSeoHead(this.router, {
            path: '/preact/',
            title: 'Preact Micro-App',
            description: 'This page is rendered by a Preact 10 micro-app.'
        });
    }

    protected onMount(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'preact',
            frameworkVisits: {
                preact: (getAppState(this.router).frameworkVisits.preact || 0) + 1
            }
        });
        render(<AppContent router={this.router} />, container);
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'preact',
            frameworkVisits: {
                preact: (getAppState(this.router).frameworkVisits.preact || 0) + 1
            }
        });
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

export function createPreactApp(router: Router): RouterMicroAppOptions {
    const app = new PreactApp(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

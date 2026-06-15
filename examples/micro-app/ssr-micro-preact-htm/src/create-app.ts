import type { Router, RouterMicroAppOptions } from '@esmx/router';
import { html } from 'htm/preact';
import { hydrate, render } from 'preact';
import { renderToString } from 'preact-render-to-string';

import {
    BaseApp,
    buildSeoHead,
    getAppState,
    setAppState,
    t
} from 'ssr-micro-shared/index';
import { AppContent } from './app';

class PreactHtmApp extends BaseApp {
    protected getHead() {
        return buildSeoHead(this.router, {
            path: '/preact-htm/',
            title: t(this.router, 'fwPreactHtmTitle'),
            description: t(this.router, 'fwPreactHtmDesc')
        });
    }

    protected onMount(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'preact-htm',
            frameworkVisits: {
                'preact-htm':
                    (getAppState(this.router).frameworkVisits['preact-htm'] ||
                        0) + 1
            }
        });
        render(html`<${AppContent} router=${this.router} />`, container);
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'preact-htm',
            frameworkVisits: {
                'preact-htm':
                    (getAppState(this.router).frameworkVisits['preact-htm'] ||
                        0) + 1
            }
        });
        hydrate(html`<${AppContent} router=${this.router} />`, container);
    }

    protected onUnmount(): void {
        if (this.container) {
            render(null, this.container);
        }
    }

    async renderToString(): Promise<string> {
        const rendered = renderToString(
            html`<${AppContent} router=${this.router} />`
        );
        return rendered?.trim() ? `<div>${rendered}</div>` : '';
    }
}

export function createPreactHtmApp(router: Router): RouterMicroAppOptions {
    const app = new PreactHtmApp(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

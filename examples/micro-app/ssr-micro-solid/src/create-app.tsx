import type { Router, RouterMicroAppOptions } from '@esmx/router';
import {
    generateHydrationScript,
    hydrate,
    render,
    renderToString
} from 'solid-js/web';

import {
    BaseApp,
    buildSeoHead,
    getAppState,
    setAppState,
    t
} from 'ssr-micro-shared/src/index';
import { AppContent } from './app';

class SolidApp extends BaseApp {
    private dispose: (() => void) | null = null;

    protected getHead() {
        return buildSeoHead(this.router, {
            path: '/solid/',
            title: t(this.router, 'fwSolidTitle'),
            description: t(this.router, 'fwSolidDesc')
        });
    }

    protected onMount(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'solid',
            frameworkVisits: {
                solid: (getAppState(this.router).frameworkVisits.solid || 0) + 1
            }
        });
        this.dispose = render(
            () => <AppContent router={this.router} />,
            container
        );
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'solid',
            frameworkVisits: {
                solid: (getAppState(this.router).frameworkVisits.solid || 0) + 1
            }
        });
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
        if (!html?.trim()) return '';
        const hydrationScript = generateHydrationScript();
        return `<div>${hydrationScript}${html}</div>`;
    }
}

export function createSolidApp(router: Router): RouterMicroAppOptions {
    const app = new SolidApp(router);
    return {
        mount: (el) => app.mount(el),
        hydration: (el) => app.hydration(el),
        unmount: () => app.unmount(),
        renderToString: () => app.renderToString()
    };
}

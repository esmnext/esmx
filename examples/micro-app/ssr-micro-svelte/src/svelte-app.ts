import type { Router } from '@esmx/router';
import { BaseApp, getAppState, Layout, setAppState } from 'ssr-micro-shared/src/index';

import App from './App.svelte';

export class SvelteApp extends BaseApp {
    private layout: Layout;
    private svelteApp: Record<string, any> | null = null;

    constructor(router: Router) {
        super(router);
        this.layout = new Layout({ appId: 'svelte', router });
    }

    protected getHead() {
        return {
            title: 'Svelte 5 Micro-App',
            meta: [
                {
                    name: 'description',
                    content:
                        'This page is rendered by a Svelte 5 micro-app using runes.'
                }
            ]
        };
    }

    protected onMount(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'svelte',
            frameworkVisits: {
                svelte:
                    (getAppState(this.router).frameworkVisits.svelte || 0) + 1
            }
        });
        import('svelte').then(async ({ mount, tick }) => {
            this.svelteApp = mount(App, {
                target: container,
                props: { layout: this.layout }
            });
            await tick();
            this.layout.mount();
        });
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'svelte',
            frameworkVisits: {
                svelte:
                    (getAppState(this.router).frameworkVisits.svelte || 0) + 1
            }
        });
        import('svelte').then(async ({ hydrate, tick }) => {
            this.svelteApp = hydrate(App, {
                target: container,
                props: { layout: this.layout }
            });
            await tick();
            this.layout.mount();
        });
    }

    protected onUnmount(): void {
        const svelteApp = this.svelteApp;
        if (svelteApp) {
            import('svelte').then(({ unmount }) => {
                unmount(svelteApp);
                this.svelteApp = null;
            });
        }
        this.layout.unmount();
    }

    async renderToString(): Promise<string> {
        const { render } = await import('svelte/server');
        const { body } = render(App, { props: { layout: this.layout } });
        return body?.trim() ? `<div>${body}</div>` : '';
    }
}

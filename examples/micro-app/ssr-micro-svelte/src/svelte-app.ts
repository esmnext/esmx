import type { Router } from '@esmx/router';
import type { ActiveHeadEntry, UseHeadInput } from 'ssr-micro-shared/src/index';
import { BaseApp, Layout } from 'ssr-micro-shared/src/index';

import App from './App.svelte';

export class SvelteApp extends BaseApp {
    private layout: Layout;
    private svelteApp: Record<string, any> | null = null;
    private headEntry: ActiveHeadEntry<UseHeadInput> | null = null;

    constructor(router: Router) {
        super(router);
        this.layout = new Layout({ appId: 'svelte', router });
        this.headEntry = this.head.push({
            title: 'Svelte 5 Micro-App',
            meta: [
                {
                    name: 'description',
                    content:
                        'This page is rendered by a Svelte 5 micro-app using runes.'
                }
            ]
        });
    }

    protected onMount(container: HTMLElement): void {
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
        this.headEntry?.dispose();
        if (this.svelteApp) {
            import('svelte').then(({ unmount }) => {
                unmount(this.svelteApp);
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

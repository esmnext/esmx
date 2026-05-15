import type { Router } from '@esmx/router';
import type { ActiveHeadEntry, UseHeadInput } from 'ssr-micro-shared/src/index';
import {
    BaseApp,
    getAppState,
    Layout,
    SIDEBAR_WIDTH,
    setAppState
} from 'ssr-micro-shared/src/index';

export class HtmlApp extends BaseApp {
    private layout: Layout;
    private headEntry: ActiveHeadEntry<UseHeadInput> | null = null;

    constructor(router: Router) {
        super(router);
        this.layout = new Layout({ appId: 'html', router });
        this.headEntry = this.head.push({
            title: 'HTML Micro-App',
            meta: [
                {
                    name: 'description',
                    content: 'Pure HTML + TypeScript micro-app.'
                }
            ]
        });
    }

    render(): string {
        return (
            `<div>` +
            `<div id="${this.layout.headerId}">${this.layout.header}</div>` +
            `<div style="margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH}); min-height: 100vh; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));">` +
            `<div style="max-width: 800px; margin: 0 auto;">` +
            `<div style="
                background: var(--esmx-bg-card);
                border-radius: 16px;
                padding: 48px;
                border: 1px solid var(--esmx-border);
                text-align: center;
            ">` +
            `<h1 style="margin:0 0 16px;font-weight:800;color:var(--esmx-text-primary);">HTML Micro-App</h1>` +
            `<textarea id="html-input" placeholder="Type something..." style="width:100%;min-height:80px;padding:12px;border-radius:8px;border:1px solid var(--esmx-border);background:var(--esmx-bg-main);color:var(--esmx-text-primary);resize:vertical;font-family:inherit;box-sizing:border-box;"></textarea>` +
            `<p id="html-stats" style="font-size:1rem;color:var(--esmx-text-secondary);margin:12px 0;">Characters: 0 | Words: 0</p>` +
            `</div>` +
            `</div>` +
            `</div>` +
            `<div id="${this.layout.footerId}">${this.layout.footer}</div>` +
            `</div>`
        );
    }

    protected onMount(container: HTMLElement): void {
        container.innerHTML = this.render();
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'html',
            frameworkVisits: {
                html: (getAppState(this.router).frameworkVisits.html || 0) + 1
            }
        });
        this.initDemo(container);
        this.layout.mount();
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'html',
            frameworkVisits: {
                html: (getAppState(this.router).frameworkVisits.html || 0) + 1
            }
        });
        this.initDemo(container);
        this.layout.mount();
    }

    private initDemo(container: HTMLElement): void {
        const input = container.querySelector(
            '#html-input'
        ) as HTMLTextAreaElement | null;
        const stats = container.querySelector(
            '#html-stats'
        ) as HTMLElement | null;
        if (!input || !stats) return;
        input.addEventListener('input', () => {
            const text = input.value;
            stats.textContent = `Characters: ${text.length} | Words: ${text.split(/\s+/).filter(Boolean).length}`;
        });
    }

    protected onUnmount(): void {
        this.headEntry?.dispose();
        this.layout.unmount();
    }

    renderToString(): Promise<string> {
        return Promise.resolve(this.render());
    }
}

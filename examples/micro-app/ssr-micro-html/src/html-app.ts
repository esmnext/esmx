import type { Router } from '@esmx/router';
import {
    BaseApp,
    buildSeoHead,
    getAppState,
    Layout,
    setAppState,
    t
} from 'ssr-micro-shared/index';
import { highlightedSnippet } from './snippet.generated';

export class HtmlApp extends BaseApp {
    private layout: Layout;

    constructor(router: Router) {
        super(router);
        this.layout = new Layout({ appId: 'html', router });
    }

    protected getHead() {
        return buildSeoHead(this.router, {
            path: '/html/',
            title: t(this.router, 'fwHtmlTitle'),
            description: t(this.router, 'fwHtmlDesc')
        });
    }

    render(): string {
        const title = t(this.router, 'fwHtmlTitle');
        return `<div>
            <div id="${this.layout.headerId}">${this.layout.header}</div>
            <main class="esmx-demo-main">
                <article class="esmx-demo-card">
                    <section class="esmx-demo-card__source esmx-code">
                        <header class="esmx-code__header">
                            <span class="esmx-code__file">src/html-app.ts</span>
                        </header>
                        <div class="esmx-code__body">
                            ${highlightedSnippet}
                        </div>
                    </section>
                    <section class="esmx-demo-card__rendered">
                        <h1 class="esmx-demo-card__title">${title}</h1>
                        <div class="esmx-stat">
                            <div class="esmx-stat__label">Count</div>
                            <div id="html-count" class="esmx-stat__value">0</div>
                        </div>
                        <div class="esmx-demo-card__actions">
                            <button id="html-inc" type="button" class="esmx-btn esmx-btn--primary">+</button>
                            <button id="html-dec" type="button" class="esmx-btn">−</button>
                        </div>
                        <div class="esmx-demo-card__tags">
                            <span class="esmx-badge esmx-badge--html">
                                <span class="esmx-dot esmx-dot--html" aria-hidden="true"></span>
                                HTML
                            </span>
                            <span class="esmx-badge">Rspack</span>
                            <span class="esmx-badge">SSR</span>
                        </div>
                    </section>
                </article>
                <footer class="esmx-demo-source">
                    source · <code>examples/micro-app/ssr-micro-html/src/html-app.ts</code>
                </footer>
            </main>
            <div id="${this.layout.footerId}">${this.layout.footer}</div>
        </div>`;
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
        this.layout.mount();
        this.initDemo(container);
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'html',
            frameworkVisits: {
                html: (getAppState(this.router).frameworkVisits.html || 0) + 1
            }
        });
        this.layout.mount();
        this.initDemo(container);
    }

    private initDemo(container: HTMLElement): void {
        const countEl = container.querySelector('#html-count');
        const incEl = container.querySelector('#html-inc');
        const decEl = container.querySelector('#html-dec');
        if (countEl && incEl && decEl) {
            incEl.addEventListener('click', () => {
                countEl.textContent = String(Number(countEl.textContent) + 1);
            });
            decEl.addEventListener('click', () => {
                countEl.textContent = String(Number(countEl.textContent) - 1);
            });
        }
    }

    protected onUnmount(): void {
        this.layout.unmount();
    }

    renderToString(): Promise<string> {
        return Promise.resolve(this.render());
    }
}

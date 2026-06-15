import type { Router } from '@esmx/router';
import { renderThunked, html as ssrHtml } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { hydrate } from '@lit-labs/ssr-client';
import type { TemplateResult } from 'lit';
import { html, render as litRender } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import {
    BaseApp,
    buildSeoHead,
    getAppState,
    Layout,
    setAppState,
    t
} from 'ssr-micro-shared/index';

const SOURCE_SNIPPET = `import { html } from 'lit'

export const counter = (count: number) => html\`
  <p>Count: \${count}</p>
  <button id="inc">+</button>
  <button id="dec">−</button>
\`
`;

/**
 * Hydratable content template — regular `lit` html with markers.
 * Composes the shared `.esmx-demo-card` primitive from
 * `ssr-micro-shared/src/styles/components.css`.
 */
function createContentTemplate(title: string): TemplateResult {
    return html`
        <main class="esmx-demo-main">
            <article class="esmx-demo-card">
                <section class="esmx-demo-card__source esmx-code">
                    <header class="esmx-code__header">
                        <span class="esmx-code__file">src/lit-app.ts</span>
                    </header>
                    <div class="esmx-code__body">
                        <pre>${SOURCE_SNIPPET}</pre>
                    </div>
                </section>
                <section class="esmx-demo-card__rendered">
                    <h1 class="esmx-demo-card__title">${title}</h1>
                    <div class="esmx-stat">
                        <div class="esmx-stat__label">Count</div>
                        <div id="lit-count" class="esmx-stat__value">0</div>
                    </div>
                    <div class="esmx-demo-card__actions">
                        <button id="lit-inc" type="button" class="esmx-btn esmx-btn--primary">+</button>
                        <button id="lit-dec" type="button" class="esmx-btn">−</button>
                    </div>
                    <div class="esmx-demo-card__tags">
                        <span class="esmx-badge esmx-badge--lit">
                            <span class="esmx-dot esmx-dot--lit" aria-hidden="true"></span>
                            Lit
                        </span>
                        <span class="esmx-badge">Rspack</span>
                        <span class="esmx-badge">SSR</span>
                    </div>
                </section>
            </article>
            <footer class="esmx-demo-source">
                source · <code>examples/micro-app/ssr-micro-lit/src/lit-app.ts</code>
            </footer>
        </main>
    `;
}

function createSsrTemplate(
    layout: Layout,
    content: TemplateResult
): ReturnType<typeof ssrHtml> {
    return ssrHtml`
        <div>
            ${unsafeHTML(`<div id="${layout.headerId}">${layout.header}</div>`)}
            ${content}
            ${unsafeHTML(`<div id="${layout.footerId}">${layout.footer}</div>`)}
        </div>
    `;
}

export class LitApp extends BaseApp {
    private layout: Layout;

    constructor(router: Router) {
        super(router);
        this.layout = new Layout({ appId: 'lit', router });
    }

    protected getHead() {
        return buildSeoHead(this.router, {
            path: '/lit/',
            title: t(this.router, 'fwLitTitle'),
            description: t(this.router, 'fwLitDesc')
        });
    }

    protected onMount(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'lit',
            frameworkVisits: {
                lit: (getAppState(this.router).frameworkVisits.lit || 0) + 1
            }
        });
        container.innerHTML = `<div><div id="${this.layout.headerId}">${this.layout.header}</div><div data-lit-content></div><div id="${this.layout.footerId}">${this.layout.footer}</div></div>`;
        const contentEl = container.querySelector(
            '[data-lit-content]'
        ) as HTMLElement | null;
        if (contentEl) {
            litRender(
                createContentTemplate(t(this.router, 'fwLitTitle')),
                contentEl
            );
        }
        this.layout.mount();
        this.initDemo(container);
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'lit',
            frameworkVisits: {
                lit: (getAppState(this.router).frameworkVisits.lit || 0) + 1
            }
        });
        const contentEl = container.querySelector(
            '[data-lit-content]'
        ) as HTMLElement | null;
        if (contentEl) {
            hydrate(
                createContentTemplate(t(this.router, 'fwLitTitle')),
                contentEl
            );
        }
        this.layout.mount();
        this.initDemo(container);
    }

    private initDemo(container: HTMLElement): void {
        const countEl = container.querySelector('#lit-count');
        const incEl = container.querySelector('#lit-inc');
        const decEl = container.querySelector('#lit-dec');
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

    async renderToString(): Promise<string> {
        const content = createContentTemplate(t(this.router, 'fwLitTitle'));
        const wrappedContent = html`<div data-lit-content>${content}</div>`;
        const full = createSsrTemplate(this.layout, wrappedContent);
        const result = renderThunked(full);
        return collectResult(result);
    }
}

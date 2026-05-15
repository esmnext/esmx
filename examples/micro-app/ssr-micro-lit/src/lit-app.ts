import type { Router } from '@esmx/router';
import { renderThunked, html as ssrHtml } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { hydrate } from '@lit-labs/ssr-client';
import type { TemplateResult } from 'lit';
import { html, render as litRender } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { ActiveHeadEntry, UseHeadInput } from 'ssr-micro-shared/src/index';
import {
    BaseApp,
    getAppState,
    Layout,
    SIDEBAR_WIDTH,
    setAppState
} from 'ssr-micro-shared/src/index';

/**
 * Hydratable content template — regular `lit` html with markers.
 * Must not contain unsafeHTML or raw HTML injection.
 */
function createContentTemplate(): TemplateResult {
    return html`
        <div
            style="margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH}); min-height: 100vh; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));"
        >
            <div style="max-width: 800px; margin: 0 auto;">
                <div
                    style="
                        background: var(--esmx-bg-card);
                        border-radius: 16px;
                        padding: 48px;
                        border: 1px solid var(--esmx-border);
                        text-align: center;
                    "
                >
                    <div
                        style="
                            width: 56px;
                            height: 56px;
                            background: linear-gradient(135deg, #324FFF, #283593);
                            border-radius: 14px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            margin: 0 auto 20px;
                        "
                        role="img"
                        aria-label="Lit"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 32 32"
                            width="28"
                            height="28"
                        >
                            <path
                                d="M16 2C7.16 2 2 12 2 17c0 0 3-3 5-3s5 3 9 3 9-3 13 3c0-5-5.16-16-13-16z"
                                fill="#fff"
                            />
                        </svg>
                    </div>
                    <h1
                        style="
                            font-size: 2rem;
                            font-weight: 800;
                            color: var(--esmx-text-primary);
                            margin-bottom: 16px;
                        "
                    >
                        Lit Micro-App
                    </h1>
                    <div style="margin: 16px 0;">
                        <div
                            id="lit-count"
                            style="
                                font-size: 3rem;
                                font-weight: 800;
                                color: var(--esmx-text-primary);
                                margin-bottom: 12px;
                            "
                        >
                            0
                        </div>
                        <div
                            style="
                                display: flex;
                                gap: 12px;
                                justify-content: center;
                            "
                        >
                            <button
                                id="lit-inc"
                                style="
                                    padding: 8px 24px;
                                    border-radius: 8px;
                                    border: none;
                                    background: var(--esmx-link);
                                    color: #fff;
                                    cursor: pointer;
                                    font-size: 1.2rem;
                                "
                            >
                                +
                            </button>
                            <button
                                id="lit-dec"
                                style="
                                    padding: 8px 24px;
                                    border-radius: 8px;
                                    border: none;
                                    background: #ef4444;
                                    color: #fff;
                                    cursor: pointer;
                                    font-size: 1.2rem;
                                "
                            >
                                -
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Server-only outer template — @lit-labs/ssr html, no hydration markers.
 * Wraps the hydratable content template with static header/footer HTML.
 */
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
    private headEntry: ActiveHeadEntry<UseHeadInput> | null = null;

    constructor(router: Router) {
        super(router);
        this.layout = new Layout({ appId: 'lit', router });
        this.headEntry = this.head.push({
            title: 'Lit Micro-App',
            meta: [
                {
                    name: 'description',
                    content:
                        'This page is rendered by a Lit micro-app using Web Components.'
                }
            ]
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
        // Pure CSR: build full DOM with header/footer, then render Lit content
        container.innerHTML = `<div><div id="${this.layout.headerId}">${this.layout.header}</div><div data-lit-content></div><div id="${this.layout.footerId}">${this.layout.footer}</div></div>`;
        const contentEl = container.querySelector(
            '[data-lit-content]'
        ) as HTMLElement | null;
        if (contentEl) {
            litRender(createContentTemplate(), contentEl);
        }
        this.layout.mount();
    }

    protected onHydration(container: HTMLElement): void {
        setAppState(this.router, {
            visitCount: getAppState(this.router).visitCount + 1,
            lastVisited: 'lit',
            frameworkVisits: {
                lit: (getAppState(this.router).frameworkVisits.lit || 0) + 1
            }
        });
        // Hydrate only the content area — header/footer are static server-rendered HTML.
        const contentEl = container.querySelector(
            '[data-lit-content]'
        ) as HTMLElement | null;
        if (contentEl) {
            hydrate(createContentTemplate(), contentEl);
        }
        this.layout.mount();
        this.initDemo(container);
    }

    protected onUnmount(): void {
        this.headEntry?.dispose();
        this.layout.unmount();
    }

    private initDemo(container: HTMLElement): void {
        const count = container.querySelector(
            '#lit-count'
        ) as HTMLElement | null;
        const inc = container.querySelector('#lit-inc') as HTMLElement | null;
        const dec = container.querySelector('#lit-dec') as HTMLElement | null;
        if (!count || !inc || !dec) return;
        let c = 0;
        inc.addEventListener('click', () => {
            c++;
            count.textContent = String(c);
        });
        dec.addEventListener('click', () => {
            c--;
            count.textContent = String(c);
        });
    }

    async renderToString(): Promise<string> {
        const content = createContentTemplate();
        // Wrap hydratable content with a data attribute so onHydration can find it
        const wrappedContent = html`<div data-lit-content>${content}</div>`;
        const full = createSsrTemplate(this.layout, wrappedContent);
        const result = renderThunked(full);
        return collectResult(result);
    }
}

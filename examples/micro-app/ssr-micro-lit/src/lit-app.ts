import type { Router } from '@esmx/router';
import { renderThunked } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import { hydrate } from '@lit-labs/ssr-client';
import type { TemplateResult } from 'lit';
import { html, render as litRender } from 'lit';
import type { ActiveHeadEntry, UseHeadInput } from 'ssr-micro-shared/src/index';
import { BaseApp, Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';

function createTemplate(layout: Layout): TemplateResult {
    return html`
        <div>
            <div id="${layout.headerId}"></div>
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
                                margin-bottom: 12px;
                            "
                        >
                            Lit Micro-App
                        </h1>
                        <p
                            style="
                                font-size: 1.125rem;
                                color: var(--esmx-text-secondary);
                                margin-bottom: 32px;
                            "
                        >
                            This page is rendered by a Lit micro-app using Web
                            Components.
                        </p>
                    </div>
                </div>
            </div>
            <div id="${layout.footerId}"></div>
        </div>
    `;
}

function fillLayout(container: HTMLElement, layout: Layout): void {
    const headerEl = container.querySelector(`#${layout.headerId}`);
    if (headerEl) headerEl.innerHTML = layout.header;
    const footerEl = container.querySelector(`#${layout.footerId}`);
    if (footerEl) footerEl.innerHTML = layout.footer;
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
        const template = createTemplate(this.layout);
        litRender(template, container);
        fillLayout(container, this.layout);
        this.layout.mount();
    }

    protected onHydration(container: HTMLElement): void {
        const template = createTemplate(this.layout);
        hydrate(template, container);
        fillLayout(container, this.layout);
        this.layout.mount();
    }

    protected onUnmount(): void {
        this.headEntry?.dispose();
        this.layout.unmount();
    }

    async renderToString(): Promise<string> {
        const template = createTemplate(this.layout);
        const result = renderThunked(template);
        let html = await collectResult(result);
        // Lit SSR produces empty <div id="..."></div> containers.
        // Inject header/footer content into them via string replacement.
        // This is safe because Lit hydrate() only cares about template
        // expressions — extra content in static elements is ignored.
        html = html.replace(
            `id="${this.layout.headerId}"></div>`,
            `id="${this.layout.headerId}">${this.layout.header}</div>`
        );
        html = html.replace(
            `id="${this.layout.footerId}"></div>`,
            `id="${this.layout.footerId}">${this.layout.footer}</div>`
        );
        return html;
    }
}

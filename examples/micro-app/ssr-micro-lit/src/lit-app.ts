import type { Router } from '@esmx/router';
import { renderThunked } from '@lit-labs/ssr';
import { collectResult } from '@lit-labs/ssr/lib/render-result.js';
import type { TemplateResult } from 'lit';
import { html, render as litRender } from 'lit';
import { unsafeHTML } from 'lit/directives/unsafe-html.js';
import type { ActiveHeadEntry, UseHeadInput } from 'ssr-micro-shared/src/index';
import { BaseApp, Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';

function createTemplate(layout: Layout): TemplateResult {
    return html`
        <div>
            ${unsafeHTML(`<div id="${layout.headerId}">${layout.header}</div>`)}
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
        const template = createTemplate(this.layout);
        litRender(template, container);
        this.layout.mount();
    }

    protected onHydration(container: HTMLElement): void {
        // SSR output is already complete HTML — just attach sidebar event handlers.
        // Lit hydrate() cannot reconcile templates with unsafeHTML() expressions
        // (header/footer) because SSR output lacks Lit's hydration marker comments.
        container; // keep param for interface compliance
        this.layout.mount();
    }

    protected onUnmount(): void {
        this.headEntry?.dispose();
        this.layout.unmount();
    }

    async renderToString(): Promise<string> {
        const template = createTemplate(this.layout);
        const result = renderThunked(template);
        return collectResult(result);
    }
}

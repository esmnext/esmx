import type { Router } from '@esmx/router';
import {
    BaseApp,
    buildSeoHead,
    Layout,
    localePath,
    SIDEBAR_WIDTH,
    subscribeLocale,
    t
} from 'ssr-micro-shared/index';

interface DemoRow {
    to: string;
    framework: string;
    fwDot: string; // CSS class for the framework color dot
    bundler: 'Rspack' | 'Rsbuild' | 'Vite 8';
}

const DEMOS: DemoRow[] = [
    {
        to: '/vue3/',
        framework: 'Vue 3',
        fwDot: 'esmx-dot--vue',
        bundler: 'Rspack'
    },
    {
        to: '/rsbuild-vue/',
        framework: 'Vue 3',
        fwDot: 'esmx-dot--vue',
        bundler: 'Rsbuild'
    },
    {
        to: '/vite-vue/',
        framework: 'Vue 3',
        fwDot: 'esmx-dot--vue',
        bundler: 'Vite 8'
    },
    {
        to: '/vue2/',
        framework: 'Vue 2.7',
        fwDot: 'esmx-dot--vue',
        bundler: 'Rspack'
    },
    {
        to: '/react/',
        framework: 'React 19',
        fwDot: 'esmx-dot--react',
        bundler: 'Rspack'
    },
    {
        to: '/rsbuild-react/',
        framework: 'React 19',
        fwDot: 'esmx-dot--react',
        bundler: 'Rsbuild'
    },
    {
        to: '/vite-react/',
        framework: 'React 19',
        fwDot: 'esmx-dot--react',
        bundler: 'Vite 8'
    },
    {
        to: '/preact/',
        framework: 'Preact 10',
        fwDot: 'esmx-dot--preact',
        bundler: 'Rspack'
    },
    {
        to: '/preact-htm/',
        framework: 'Preact + HTM',
        fwDot: 'esmx-dot--preact',
        bundler: 'Rspack'
    },
    {
        to: '/solid/',
        framework: 'SolidJS',
        fwDot: 'esmx-dot--solid',
        bundler: 'Rspack'
    },
    {
        to: '/svelte/',
        framework: 'Svelte 5',
        fwDot: 'esmx-dot--svelte',
        bundler: 'Rspack'
    },
    {
        to: '/lit/',
        framework: 'Lit',
        fwDot: 'esmx-dot--lit',
        bundler: 'Rspack'
    },
    {
        to: '/html/',
        framework: 'HTML',
        fwDot: 'esmx-dot--html',
        bundler: 'Rspack'
    },
    {
        to: '/rsbuild-html/',
        framework: 'HTML',
        fwDot: 'esmx-dot--html',
        bundler: 'Rsbuild'
    },
    {
        to: '/vite-html/',
        framework: 'HTML',
        fwDot: 'esmx-dot--html',
        bundler: 'Vite 8'
    }
];

export class HomeApp extends BaseApp {
    private layout: Layout;
    private unsubLocale: (() => void) | null = null;

    constructor(router: Router) {
        super(router);
        this.layout = new Layout({ appId: 'home', router });
    }

    protected getHead() {
        return buildSeoHead(this.router, {
            path: '/demo/',
            title: t(this.router, 'homeMetaTitle'),
            description: t(this.router, 'homeMetaDesc')
        });
    }

    private getContentHtml(): string {
        const rows = DEMOS.map((d) => {
            const to = localePath(this.router, d.to);
            const resolved = this.router.resolveLink({ to, type: 'push' });
            return `
                <tr data-to="${to}">
                    <td>
                        <span class="esmx-dot ${d.fwDot}" aria-hidden="true"></span>
                        ${d.framework}
                    </td>
                    <td>${d.bundler}</td>
                    <td>
                        <span class="esmx-dot esmx-dot--success" aria-hidden="true"></span>
                        live
                    </td>
                    <td><a href="${resolved.attributes.href}" data-to="${to}"><code>${d.to}</code></a></td>
                </tr>
            `;
        }).join('');

        return `<div id="home-content">
            <header class="hub-hero">
                <h1 class="hub-hero__title">
                    ${DEMOS.length} demos. 7 frameworks. 3 bundlers.<br />
                    <span class="hub-hero__highlight">One import map.</span>
                </h1>
                <p class="hub-hero__subtitle">
                    ${t(this.router, 'homeHeroSubtitle')}
                </p>
            </header>

            <article class="hub-card">
                <header class="hub-card__header">Demos</header>
                <table class="esmx-table hub-table">
                    <thead>
                        <tr>
                            <th>Framework</th>
                            <th>Bundler</th>
                            <th>Status</th>
                            <th>URL</th>
                        </tr>
                    </thead>
                    <tbody>${rows}</tbody>
                </table>
            </article>

            <aside class="hub-callout">
                <p class="hub-callout__lead">Using Esmx with an AI assistant?</p>
                <p class="hub-callout__body">
                    Feed it <a href="/guide/essentials/styles" target="_blank">esmx.dev/llms.md</a> —
                    one file, every code block CI-validated, versioned with Esmx.
                </p>
            </aside>
        </div>`;
    }

    render(): string {
        return (
            `<div>` +
            `<style>${HUB_STYLES}</style>` +
            `<div id="${this.layout.headerId}">${this.layout.header}</div>` +
            `<div class="hub-main" style="margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH});">${this.getContentHtml()}</div>` +
            `<div id="${this.layout.footerId}">${this.layout.footer}</div>` +
            `</div>`
        );
    }

    private bindContent(container: HTMLElement): void {
        container.addEventListener('click', async (e) => {
            const target = e.target as HTMLElement;
            // Either the <tr data-to> or an explicit <a data-to> inside it.
            const anchor =
                (target.closest('a[data-to]') as HTMLAnchorElement | null) ||
                (target.closest('tr[data-to]') as HTMLTableRowElement | null);
            if (!anchor) return;
            const to = anchor.getAttribute('data-to');
            if (!to) return;
            e.preventDefault();
            await this.router.push(to);
        });

        this.unsubLocale = subscribeLocale(this.router, () => {
            const content = document.getElementById('home-content');
            if (content) content.outerHTML = this.getContentHtml();
        });
    }

    protected onMount(container: HTMLElement): void {
        container.innerHTML = this.render();
        this.layout.mount();
        this.bindContent(container);
    }

    protected onHydration(container: HTMLElement): void {
        this.layout.mount();
        this.bindContent(container);
    }

    protected onUnmount(): void {
        this.unsubLocale?.();
        this.unsubLocale = null;
        this.layout.unmount();
    }

    renderToString(): Promise<string> {
        return Promise.resolve(this.render());
    }
}

const HUB_STYLES = `
.hub-main {
    min-height: 100vh;
    padding: var(--esmx-space-12) var(--esmx-space-8);
    padding-top: calc(var(--esmx-space-12) + var(--esmx-mobile-header-height, 0px));
    max-width: var(--esmx-width-wide);
    margin-right: auto;
}
.hub-hero {
    margin-bottom: var(--esmx-space-12);
    max-width: var(--esmx-width-content);
}
.hub-hero__title {
    margin: 0 0 var(--esmx-space-4);
    font-size: var(--esmx-fs-3xl);
    font-weight: var(--esmx-fw-semibold);
    line-height: var(--esmx-leading-tight);
    color: var(--esmx-text-primary);
}
.hub-hero__highlight {
    color: var(--esmx-brand);
}
.hub-hero__subtitle {
    margin: 0;
    color: var(--esmx-text-secondary);
    font-size: var(--esmx-fs-md);
    max-width: 56ch;
}
.hub-card {
    background: var(--esmx-bg-paper);
    border: 1px solid var(--esmx-border);
    border-radius: var(--esmx-radius-lg);
    overflow: hidden;
    margin-bottom: var(--esmx-space-8);
}
.hub-card__header {
    padding: var(--esmx-space-4) var(--esmx-space-6);
    font-size: var(--esmx-fs-sm);
    text-transform: uppercase;
    letter-spacing: var(--esmx-tracking-eyebrow);
    color: var(--esmx-text-muted);
    border-bottom: 1px solid var(--esmx-border-subtle);
}
.hub-table { width: 100%; }
.hub-table th, .hub-table td { padding: var(--esmx-space-3) var(--esmx-space-6); }
.hub-table tbody tr { cursor: pointer; }
.hub-table tbody tr:hover { background: var(--esmx-bg-subtle); }
.hub-table a {
    color: var(--esmx-brand);
    text-decoration: none;
}
.hub-table code {
    font-family: var(--esmx-font-mono);
    font-size: var(--esmx-fs-xs);
}
.hub-callout {
    background: var(--esmx-brand-soft);
    border-left: 3px solid var(--esmx-brand);
    border-radius: var(--esmx-radius-md);
    padding: var(--esmx-space-4) var(--esmx-space-5);
}
.hub-callout__lead {
    margin: 0 0 var(--esmx-space-1);
    font-weight: var(--esmx-fw-semibold);
    color: var(--esmx-text-primary);
}
.hub-callout__body {
    margin: 0;
    color: var(--esmx-text-primary);
    font-size: var(--esmx-fs-sm);
}
.hub-callout a { color: var(--esmx-brand-hover); text-decoration: underline; font-family: var(--esmx-font-mono); }
@media (max-width: 767px) {
    .hub-main { padding: var(--esmx-space-6) var(--esmx-space-4); }
    .hub-table th, .hub-table td { padding: var(--esmx-space-2) var(--esmx-space-3); }
}
`;

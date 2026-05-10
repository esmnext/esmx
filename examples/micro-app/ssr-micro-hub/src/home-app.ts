import type { Router } from '@esmx/router';
import {
    BaseApp,
    Layout,
    SIDEBAR_WIDTH,
    setRouterHead
} from 'ssr-micro-shared/src/index';
// @ts-expect-error Esmx module linking resolves to environment-specific chunk
import { createHead } from 'unhead';
import type { ActiveHeadEntry, UseHeadInput } from 'unhead/types';

export class HomeApp extends BaseApp {
    private layout: Layout;
    private head = createHead({ disableDefaults: true });
    private headEntry: ActiveHeadEntry<UseHeadInput> | null = null;

    private apps = [
        {
            to: '/html/',
            title: 'HTML',
            subtitle: 'Pure HTML + TypeScript',
            description: 'A native HTML micro-app.',
            icon: 'H',
            iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
            tag: 'Vanilla',
            tagColor: '#f59e0b',
            tagBg: 'rgba(245, 158, 11, 0.1)'
        },
        {
            to: '/vue2/',
            title: 'Vue 2',
            subtitle: 'Vue 2.7 + Composition API',
            description: 'Classic Vue 2 with modern Composition API.',
            icon: 'V2',
            iconBg: 'linear-gradient(135deg, #42b883, #369870)',
            tag: 'Legacy',
            tagColor: '#42b883',
            tagBg: 'rgba(66, 184, 131, 0.1)'
        },
        {
            to: '/vue3/',
            title: 'Vue 3',
            subtitle: 'Vue 3.5 + SSR',
            description: 'Modern Vue 3 with full SSR support.',
            icon: 'V3',
            iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            tag: 'Modern',
            tagColor: '#3b82f6',
            tagBg: 'rgba(59, 130, 246, 0.1)'
        },
        {
            to: '/react/',
            title: 'React',
            subtitle: 'React 18 + Hooks',
            description: 'React 18 with concurrent features.',
            icon: 'R',
            iconBg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            tag: 'Popular',
            tagColor: '#0ea5e9',
            tagBg: 'rgba(14, 165, 233, 0.1)'
        }
    ];

    constructor(router: Router) {
        super(router);
        this.layout = new Layout({ appId: 'home', router });
        this.headEntry = this.head.push({
            title: 'Esmx Micro-App Hub',
            meta: [
                {
                    name: 'description',
                    content:
                        'Explore micro-frontend architecture with Esmx Router'
                }
            ]
        });
        setRouterHead(router, this.head);
    }

    private getContentHtml(): string {
        const heroSection = `
            <div style="text-align: center; margin-bottom: 48px;">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cg transform='translate(20,20)'%3E%3Ccircle r='12' fill='none' stroke='%2312B2EF' stroke-width='2.8'/%3E%3Ccircle r='6.2' fill='%23FFA000'/%3E%3C/g%3E%3C/svg%3E" alt="Esmx" style="width: 64px; height: 64px; margin-bottom: 16px;" />
                <h1 style="font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; color: #0f172a; margin-bottom: 16px;">Micro-Frontend Architecture</h1>
                <p style="font-size: 1.125rem; color: #64748b; max-width: 600px; margin: 0 auto;">
                    Explore how different frontend frameworks coexist in a single application
                    powered by <strong style="color: #3b82f6;">Esmx Router</strong>
                </p>
            </div>
        `;

        const cardsSection = `
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 24px;">
                ${this.apps
                    .map((app) => {
                        const resolved = this.router.resolveLink({
                            to: app.to,
                            type: 'push'
                        });
                        return `
                        <a href="${resolved.attributes.href}" data-to="${app.to}" style="text-decoration: none; color: inherit; display: block;">
                            <article class="esmx-card" style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; cursor: pointer;">
                                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px;">
                                    <div style="width: 56px; height: 56px; background: ${app.iconBg}; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px;" role="img" aria-label="${app.title}">${app.icon}</div>
                                    <span style="padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 600; color: ${app.tagColor}; background: ${app.tagBg};">${app.tag}</span>
                                </div>
                                <h2 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 4px;">${app.title}</h2>
                                <p style="font-size: 0.875rem; color: #64748b; margin-bottom: 12px;">${app.subtitle}</p>
                                <p style="font-size: 0.875rem; color: #94a3b8; margin: 0;">${app.description}</p>
                            </article>
                        </a>
                    `;
                    })
                    .join('')}
            </div>
        `;

        return heroSection + cardsSection;
    }

    render(): string {
        return (
            `<div>` +
            `<style>.esmx-card{transition:box-shadow 0.2s ease,border-color 0.2s ease}.esmx-card:hover{box-shadow:0 4px 20px rgba(0,0,0,0.08);border-color:#cbd5e1}</style>` +
            `<div id="${this.layout.headerId}">${this.layout.header}</div>` +
            `<div id="esmx-main" style="margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH}); min-height: 100vh; background: #f8fafc; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));">${this.getContentHtml()}</div>` +
            `<div id="${this.layout.footerId}">${this.layout.footer}</div>` +
            `</div>`
        );
    }

    protected onMount(container: HTMLElement): void {
        container.innerHTML = this.render();
        this.layout.mount();

        container.addEventListener('click', async (e) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest(
                'a[data-to]'
            ) as HTMLAnchorElement | null;
            if (!anchor) return;

            const to = anchor.getAttribute('data-to');
            if (!to) return;

            e.preventDefault();
            await this.router.push(to);
        });
    }

    protected onHydration(container: HTMLElement): void {
        this.layout.mount();

        container.addEventListener('click', async (e) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest(
                'a[data-to]'
            ) as HTMLAnchorElement | null;
            if (!anchor) return;

            const to = anchor.getAttribute('data-to');
            if (!to) return;

            e.preventDefault();
            await this.router.push(to);
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

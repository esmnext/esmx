import type { Router } from '@esmx/router';
import type { ActiveHeadEntry, UseHeadInput } from 'ssr-micro-shared/src/index';
import { BaseApp, Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';

export class HomeApp extends BaseApp {
    private layout: Layout;
    private headEntry: ActiveHeadEntry<UseHeadInput> | null = null;

    private apps = [
        {
            to: '/html/',
            title: 'HTML',
            subtitle: 'Pure HTML + TypeScript',
            description: 'A native HTML micro-app.',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path d="M4 2l2 20 10 8 10-8 2-20H4zm18.4 6H11l.4 4h13l-.6 6.5-7.8 2.2-7.8-2.2-.4-4h3.1l.2 1.5 4.9 1.4 4.9-1.4.4-4.5H9l-.6-7h16.6l-.6 7z" fill="#fff"/></svg>',
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
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path d="M16 2L2 28h8.4L16 17.6 21.6 28H30L16 2z" fill="#fff"/><path d="M16 2l-5.6 9.6L16 19.6l5.6-8L16 2z" fill="#42b883" opacity="0.6"/></svg>',
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
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path d="M16 2L2 28h8.4L16 17.6 21.6 28H30L16 2z" fill="#fff"/><path d="M16 2l-5.6 9.6L16 19.6l5.6-8L16 2z" fill="#3b82f6" opacity="0.6"/></svg>',
            iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            tag: 'Modern',
            tagColor: '#3b82f6',
            tagBg: 'rgba(59, 130, 246, 0.1)'
        },
        {
            to: '/react/',
            title: 'React 19',
            subtitle: 'React 19 + Hooks',
            description: 'React 19 with concurrent features.',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><circle cx="16" cy="16" r="3" fill="#fff"/><ellipse cx="16" cy="16" rx="15" ry="5.5" fill="none" stroke="#fff" stroke-width="1.8" transform="rotate(60 16 16)"/><ellipse cx="16" cy="16" rx="15" ry="5.5" fill="none" stroke="#fff" stroke-width="1.8" transform="rotate(-60 16 16)"/><ellipse cx="16" cy="16" rx="15" ry="5.5" fill="none" stroke="#fff" stroke-width="1.8"/></svg>',
            iconBg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            tag: 'Popular',
            tagColor: '#0ea5e9',
            tagBg: 'rgba(14, 165, 233, 0.1)'
        },
        {
            to: '/preact/',
            title: 'Preact',
            subtitle: 'Preact 10 + Hooks',
            description: 'Fast 3kB alternative to React.',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><polygon points="16,2 28,11 28,25 16,30 4,25 4,11" fill="none" stroke="#fff" stroke-width="2"/><circle cx="16" cy="16" r="4.5" fill="#fff"/></svg>',
            iconBg: 'linear-gradient(135deg, #673ab8, #512da8)',
            tag: 'Lightweight',
            tagColor: '#673ab8',
            tagBg: 'rgba(103, 58, 184, 0.1)'
        },
        {
            to: '/preact-htm/',
            title: 'Preact HTM',
            subtitle: 'Preact 10 + HTM',
            description: 'Preact with Hyperscript Tagged Markup.',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><polygon points="16,2 28,11 28,25 16,30 4,25 4,11" fill="none" stroke="#fff" stroke-width="2"/><text x="16" y="22" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">H</text></svg>',
            iconBg: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
            tag: 'No JSX',
            tagColor: '#8b5cf6',
            tagBg: 'rgba(139, 92, 246, 0.1)'
        },
        {
            to: '/lit/',
            title: 'Lit',
            subtitle: 'Web Components + SSR',
            description: 'Standards-based Web Components with Lit SSR.',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path d="M16 2C7.16 2 2 12 2 17c0 0 3-3 5-3s5 3 9 3 9-3 13 3c0-5-5.16-16-13-16z" fill="#fff"/><circle cx="16" cy="18" r="3" fill="#283593"/></svg>',
            iconBg: 'linear-gradient(135deg, #324FFF, #283593)',
            tag: 'W3C',
            tagColor: '#324FFF',
            tagBg: 'rgba(50, 79, 255, 0.1)'
        },
        {
            to: '/solid/',
            title: 'SolidJS',
            subtitle: 'Fine-grained Reactivity',
            description: 'No VDOM, signals-based reactive UI.',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path d="M16 2L2 12l6 18h20l6-18L16 2z" fill="#fff"/></svg>',
            iconBg: 'linear-gradient(135deg, #2c4f7c, #446b9e)',
            tag: 'Signals',
            tagColor: '#2c4f7c',
            tagBg: 'rgba(44, 79, 124, 0.1)'
        },
        {
            to: '/svelte/',
            title: 'Svelte 5',
            subtitle: 'Compiler-driven Runes',
            description: 'Reactive components with $state and $derived.',
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="24" height="24"><path d="M15.9 1.8C8.3 1.8 2.1 8 2.1 15.6c0 0 .3-.3.8-.7 2.6-2 7.8-7.8 9.4-7.8 1.4 0 2 4.3 4.2 10.7.8 2.4 1.7 5.1 2.6 7.2 1.7 3.9 3.6 6.6 5.6 6.6 3.6 0 5.2-3 5.2-5.6 0-2.3-1.3-4.1-2.5-3.9-.7.1-1.2.8-1.2 1.6 0 .6.4 1.2 1 1.5.4.2.8.4 1.2.6-.7 1.4-1.9 2.1-3 1.9-1.8-.3-3.1-3.1-4.4-6C18.4 14.5 15.6 1.8 15.9 1.8z" fill="#fff"/></svg>',
            iconBg: 'linear-gradient(135deg, #ff3e00, #bf2e00)',
            tag: 'Runes',
            tagColor: '#ff3e00',
            tagBg: 'rgba(255, 62, 0, 0.1)'
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
    }

    private getContentHtml(): string {
        const heroSection = `
            <div style="text-align: center; margin-bottom: 48px;">
                <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Cg transform='translate(20,20)'%3E%3Ccircle r='12' fill='none' stroke='%2312B2EF' stroke-width='2.8'/%3E%3Ccircle r='6.2' fill='%23FFA000'/%3E%3C/g%3E%3C/svg%3E" alt="Esmx" style="width: 64px; height: 64px; margin-bottom: 16px;" />
                <h1 style="font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; color: var(--esmx-text-primary); margin-bottom: 16px;">Micro-Frontend Architecture</h1>
                <p style="font-size: 1.125rem; color: var(--esmx-text-secondary); max-width: 600px; margin: 0 auto;">
                    Explore how different frontend frameworks coexist in a single application
                    powered by <strong style="color: var(--esmx-link);">Esmx Router</strong>
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
                            <article class="esmx-card" style="background: var(--esmx-bg-card); border-radius: 16px; padding: 32px; border: 1px solid var(--esmx-border); cursor: pointer;">
                                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px;">
                                    <div style="width: 56px; height: 56px; background: ${app.iconBg}; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px;" role="img" aria-label="${app.title}">${app.icon}</div>
                                    <span style="padding: 4px 12px; border-radius: 100px; font-size: 0.75rem; font-weight: 600; color: ${app.tagColor}; background: ${app.tagBg};">${app.tag}</span>
                                </div>
                                <h2 style="font-size: 1.25rem; font-weight: 700; color: var(--esmx-text-primary); margin-bottom: 4px;">${app.title}</h2>
                                <p style="font-size: 0.875rem; color: var(--esmx-text-secondary); margin-bottom: 12px;">${app.subtitle}</p>
                                <p style="font-size: 0.875rem; color: var(--esmx-text-muted); margin: 0;">${app.description}</p>
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
            `<style>.esmx-card{transition:box-shadow 0.2s ease,border-color 0.2s ease,transform 0.2s ease}.esmx-card:hover{box-shadow:var(--esmx-card-shadow);border-color:var(--esmx-card-hover-border);transform:scale(1.01)}</style>` +
            `<div id="${this.layout.headerId}">${this.layout.header}</div>` +
            `<div style="margin-left: var(--esmx-sidebar-width, ${SIDEBAR_WIDTH}); min-height: 100vh; padding: 32px; padding-top: calc(32px + var(--esmx-mobile-header-height, 0px));">${this.getContentHtml()}</div>` +
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

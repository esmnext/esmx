import type { Router } from '@esmx/router';
import { Layout } from 'ssr-micro-shared/src/layout';

export class HomeApp {
    private router: Router;
    private layout: Layout;
    private container: HTMLElement | null = null;

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
        this.router = router;
        this.layout = new Layout({ appId: 'home', router });
    }

    private getContentHtml(): string {
        const heroSection = `
            <div style="text-align: center; margin-bottom: 48px;">
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
                            <article style="background: white; border-radius: 16px; padding: 32px; border: 1px solid #e2e8f0; cursor: pointer;">
                                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px;">
                                    <div style="width: 56px; height: 56px; background: ${app.iconBg}; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 20px;">${app.icon}</div>
                                    <span style="padding: 4px 12px; border-radius: 100px; font-size: 12px; font-weight: 600; color: ${app.tagColor}; background: ${app.tagBg};">${app.tag}</span>
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
            `<div id="${this.layout.headerId}">${this.layout.header}</div>` +
            `<div style="margin-left: 260px; min-height: 100vh; background: #f8fafc; padding: 32px;">${this.getContentHtml()}</div>` +
            `<div id="${this.layout.footerId}">${this.layout.footer}</div>`
        );
    }

    mount(container: HTMLElement): void {
        container.setAttribute('data-ssr', 'false');
        this.container = container;
        this.layout.mount();

        this.container.addEventListener('click', async (e) => {
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

    unmount(): void {
        this.layout.unmount();
        this.container = null;
    }
}

import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { useLayout } from 'ssr-micro-shared/src/layout';

export function createHomeApp(router: Router): RouterMicroAppOptions {
    let container: HTMLElement | null = null;
    let layout: ReturnType<typeof useLayout> | null = null;

    const apps = [
        {
            to: '/html',
            title: 'HTML',
            subtitle: 'Pure HTML + TypeScript',
            description:
                'A native HTML micro-app without any framework dependencies. Demonstrates the flexibility of Esmx Router with vanilla JavaScript.',
            icon: 'H',
            iconBg: 'linear-gradient(135deg, #f59e0b, #d97706)',
            tag: 'Vanilla',
            tagColor: '#f59e0b',
            tagBg: 'rgba(245, 158, 11, 0.1)'
        },
        {
            to: '/vue2',
            title: 'Vue 2',
            subtitle: 'Vue 2.7 + Composition API',
            description:
                'Classic Vue 2 with modern Composition API support. Shows how legacy Vue apps can integrate into a modern micro-frontend architecture.',
            icon: 'V2',
            iconBg: 'linear-gradient(135deg, #42b883, #369870)',
            tag: 'Legacy',
            tagColor: '#42b883',
            tagBg: 'rgba(66, 184, 131, 0.1)'
        },
        {
            to: '/vue3',
            title: 'Vue 3',
            subtitle: 'Vue 3.5 + SSR',
            description:
                'Modern Vue 3 with full SSR support, script setup syntax, and the latest ecosystem tools. The recommended way to build Vue apps.',
            icon: 'V3',
            iconBg: 'linear-gradient(135deg, #3b82f6, #2563eb)',
            tag: 'Modern',
            tagColor: '#3b82f6',
            tagBg: 'rgba(59, 130, 246, 0.1)'
        },
        {
            to: '/react',
            title: 'React',
            subtitle: 'React 18 + Hooks',
            description:
                'React 18 with concurrent features, hooks, and server-side rendering. Demonstrates seamless React integration in the Esmx ecosystem.',
            icon: 'R',
            iconBg: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
            tag: 'Popular',
            tagColor: '#0ea5e9',
            tagBg: 'rgba(14, 165, 233, 0.1)'
        }
    ];

    function getContentHtml(): string {
        const heroSection = `
            <div style="text-align: center; margin-bottom: 48px;">
                <h1 style="
                    font-size: clamp(2rem, 5vw, 3rem);
                    font-weight: 800;
                    color: #0f172a;
                    margin-bottom: 16px;
                    line-height: 1.2;
                ">Micro-Frontend Architecture</h1>
                <p style="
                    font-size: 1.125rem;
                    color: #64748b;
                    max-width: 600px;
                    margin: 0 auto;
                    line-height: 1.6;
                ">
                    Explore how different frontend frameworks coexist in a single application
                    powered by <strong style="color: #3b82f6;">Esmx Router</strong>
                </p>
                <div style="
                    display: inline-flex;
                    gap: 8px;
                    margin-top: 24px;
                    padding: 8px 16px;
                    background: white;
                    border-radius: 100px;
                    border: 1px solid #e2e8f0;
                    font-size: 14px;
                    color: #64748b;
                ">
                    <span style="display: inline-block; width: 8px; height: 8px; background: #22c55e; border-radius: 50%;"></span>
                    All systems operational
                </div>
            </div>
        `;

        const cardsSection = `
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
                gap: 24px;
            ">
                ${apps
                    .map((app) => {
                        const resolved = router.resolveLink({
                            to: app.to,
                            type: 'push'
                        });
                        return `
                        <a href="${resolved.attributes.href}" data-to="${app.to}" style="
                            text-decoration: none;
                            color: inherit;
                            display: block;
                        ">
                            <article style="
                                background: white;
                                border-radius: 16px;
                                padding: 32px;
                                border: 1px solid #e2e8f0;
                                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                                cursor: pointer;
                                height: 100%;
                                box-sizing: border-box;
                                position: relative;
                                overflow: hidden;
                            " onmouseover="this.style.transform='translateY(-4px)'; this.style.boxShadow='0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)'; this.style.borderColor='#cbd5e1';"
                               onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none'; this.style.borderColor='#e2e8f0';"
                            >
                                <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px;">
                                    <div style="
                                        width: 56px;
                                        height: 56px;
                                        background: ${app.iconBg};
                                        border-radius: 14px;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-weight: 700;
                                        font-size: 20px;
                                        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
                                    ">${app.icon}</div>
                                    <span style="
                                        padding: 4px 12px;
                                        border-radius: 100px;
                                        font-size: 12px;
                                        font-weight: 600;
                                        color: ${app.tagColor};
                                        background: ${app.tagBg};
                                    ">${app.tag}</span>
                                </div>
                                <h2 style="
                                    font-size: 1.25rem;
                                    font-weight: 700;
                                    color: #0f172a;
                                    margin-bottom: 4px;
                                ">${app.title}</h2>
                                <p style="
                                    font-size: 0.875rem;
                                    color: #64748b;
                                    margin-bottom: 12px;
                                    font-weight: 500;
                                ">${app.subtitle}</p>
                                <p style="
                                    font-size: 0.875rem;
                                    color: #94a3b8;
                                    line-height: 1.5;
                                    margin: 0;
                                ">${app.description}</p>
                                <div style="
                                    margin-top: 20px;
                                    display: flex;
                                    align-items: center;
                                    gap: 6px;
                                    color: ${app.tagColor};
                                    font-size: 14px;
                                    font-weight: 600;
                                ">
                                    Explore <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="transition: transform 0.2s;"><path d="M6 12l4-4-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                </div>
                            </article>
                        </a>
                    `;
                    })
                    .join('')}
            </div>
        `;

        const featuresSection = `
            <div style="
                margin-top: 64px;
                padding: 32px;
                background: white;
                border-radius: 16px;
                border: 1px solid #e2e8f0;
            ">
                <h2 style="
                    font-size: 1.25rem;
                    font-weight: 700;
                    color: #0f172a;
                    margin-bottom: 24px;
                    text-align: center;
                ">Key Features</h2>
                <div style="
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 24px;
                ">
                    ${[
                        {
                            icon: '⚡',
                            title: 'Build-time Isolation',
                            desc: 'Each app builds independently with zero coupling'
                        },
                        {
                            icon: '🔗',
                            title: 'Runtime Integration',
                            desc: 'Seamless module sharing via ESM Import Map'
                        },
                        {
                            icon: '🚀',
                            title: 'Full SSR Support',
                            desc: 'Server-side rendering for all frameworks'
                        },
                        {
                            icon: '📦',
                            title: 'Framework Agnostic',
                            desc: 'Works with Vue, React, or vanilla JS'
                        }
                    ]
                        .map(
                            (f) => `
                            <div style="text-align: center;">
                                <div style="font-size: 2rem; margin-bottom: 12px;">${f.icon}</div>
                                <h3 style="font-size: 1rem; font-weight: 600; color: #0f172a; margin-bottom: 8px;">${f.title}</h3>
                                <p style="font-size: 0.875rem; color: #64748b; margin: 0;">${f.desc}</p>
                            </div>
                        `
                        )
                        .join('')}
                </div>
            </div>
        `;

        return heroSection + cardsSection + featuresSection;
    }

    return {
        mount(el: HTMLElement) {
            el.innerHTML = '';
            container = document.createElement('div');
            container.className = 'app-container';
            el.appendChild(container);

            layout = useLayout({ appId: 'home', router });

            container.innerHTML =
                layout.header +
                `<div style="margin-left: 260px; min-height: 100vh; background: #f8fafc; padding: 32px;">` +
                getContentHtml() +
                `</div>` +
                layout.footer;

            layout.mount();

            container.addEventListener('click', async (e) => {
                const target = e.target as HTMLElement;
                const anchor = target.closest(
                    'a[data-to]'
                ) as HTMLAnchorElement | null;
                if (!anchor) return;

                const to = anchor.getAttribute('data-to');
                if (!to) return;

                e.preventDefault();
                await router.push(to);
            });
        },
        unmount() {
            layout?.unmount();
            layout = null;
            if (container?.parentNode) {
                container.parentNode.removeChild(container);
            }
            container = null;
        },
        renderToString() {
            const layout = useLayout({ appId: 'home', router });
            return (
                layout.header +
                `<div style="margin-left: 260px; min-height: 100vh; background: #f8fafc; padding: 32px;">` +
                getContentHtml() +
                `</div>` +
                layout.footer
            );
        }
    };
}

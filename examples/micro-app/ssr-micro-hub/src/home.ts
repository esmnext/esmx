import type { Router, RouterMicroAppOptions } from '@esmx/router';

export function createHomeApp(router: Router): RouterMicroAppOptions {
    const links = [
        {
            to: '/html',
            title: 'HTML',
            desc: 'Native HTML + TypeScript',
            color: '#f59e0b',
            bg: '#fef3c7',
            textColor: '#92400e'
        },
        {
            to: '/vue2',
            title: 'Vue 2',
            desc: 'Vue 2.7 with Composition API',
            color: '#42b883',
            bg: '#ecfdf5',
            textColor: '#065f46'
        },
        {
            to: '/vue3',
            title: 'Vue 3',
            desc: 'Vue 3.5 with SSR',
            color: '#3b82f6',
            bg: '#eff6ff',
            textColor: '#1e40af'
        },
        {
            to: '/react',
            title: 'React',
            desc: 'React 18 with Hooks',
            color: '#0ea5e9',
            bg: '#f0f9ff',
            textColor: '#0369a1'
        }
    ];

    return {
        mount(el: HTMLElement) {
            el.innerHTML = `
                <div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif;">
                    <h1 style="color: #333; font-size: 2.5rem; margin-bottom: 16px;">Esmx Micro-App Hub</h1>
                    <p style="color: #666; font-size: 1.2rem; margin-bottom: 40px;">
                        A micro-frontend architecture demonstration using Esmx Router
                    </p>
                    <div id="nav-cards" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 800px; margin: 0 auto;">
                        ${links
                            .map((link) => {
                                const resolved = router.resolveLink({
                                    to: link.to,
                                    type: 'push'
                                });
                                return `
                            <a href="${resolved.attributes.href}" data-to="${link.to}" style="text-decoration: none; color: inherit;">
                                <div style="padding: 24px; background: ${link.bg}; border-radius: 12px; transition: transform 0.2s; cursor: pointer;">
                                    <h2 style="color: ${link.color}; margin-bottom: 8px;">${link.title}</h2>
                                    <p style="color: ${link.textColor}; font-size: 0.9rem;">${link.desc}</p>
                                </div>
                            </a>
                        `;
                            })
                            .join('')}
                    </div>
                </div>
            `;

            const container = el.querySelector('#nav-cards');
            if (container) {
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
            }
        },
        unmount() {
            // Nothing to clean up
        },
        renderToString() {
            return `
                <div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif;">
                    <h1 style="color: #333; font-size: 2.5rem; margin-bottom: 16px;">Esmx Micro-App Hub</h1>
                    <p style="color: #666; font-size: 1.2rem; margin-bottom: 40px;">
                        A micro-frontend architecture demonstration using Esmx Router
                    </p>
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 800px; margin: 0 auto;">
                        ${links
                            .map((link) => {
                                const resolved = router.resolveLink({
                                    to: link.to,
                                    type: 'push'
                                });
                                return `
                            <a href="${resolved.attributes.href}" style="text-decoration: none; color: inherit;">
                                <div style="padding: 24px; background: ${link.bg}; border-radius: 12px; transition: transform 0.2s; cursor: pointer;">
                                    <h2 style="color: ${link.color}; margin-bottom: 8px;">${link.title}</h2>
                                    <p style="color: ${link.textColor}; font-size: 0.9rem;">${link.desc}</p>
                                </div>
                            </a>
                        `;
                            })
                            .join('')}
                    </div>
                </div>
            `;
        }
    };
}

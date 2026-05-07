import type { Router, RouterMicroAppOptions } from '@esmx/router';

export function createHomeApp(router: Router): RouterMicroAppOptions {
    const htmlHref = router.resolveLink({ to: '/html' }).attributes.href;
    const vue2Href = router.resolveLink({ to: '/vue2' }).attributes.href;
    const vue3Href = router.resolveLink({ to: '/vue3' }).attributes.href;
    const reactHref = router.resolveLink({ to: '/react' }).attributes.href;

    const HTML = `
    <div style="padding: 40px; text-align: center; font-family: system-ui, sans-serif;">
        <h1 style="color: #333; font-size: 2.5rem; margin-bottom: 16px;">Esmx Micro-App Hub</h1>
        <p style="color: #666; font-size: 1.2rem; margin-bottom: 40px;">
            A micro-frontend architecture demonstration using Esmx Router
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; max-width: 800px; margin: 0 auto;">
            <a href="${htmlHref}" style="text-decoration: none; color: inherit;">
                <div style="padding: 24px; background: #fef3c7; border-radius: 12px; transition: transform 0.2s; cursor: pointer;">
                    <h2 style="color: #f59e0b; margin-bottom: 8px;">HTML</h2>
                    <p style="color: #92400e; font-size: 0.9rem;">Native HTML + TypeScript</p>
                </div>
            </a>
            <a href="${vue2Href}" style="text-decoration: none; color: inherit;">
                <div style="padding: 24px; background: #ecfdf5; border-radius: 12px; transition: transform 0.2s; cursor: pointer;">
                    <h2 style="color: #42b883; margin-bottom: 8px;">Vue 2</h2>
                    <p style="color: #065f46; font-size: 0.9rem;">Vue 2.7 with Composition API</p>
                </div>
            </a>
            <a href="${vue3Href}" style="text-decoration: none; color: inherit;">
                <div style="padding: 24px; background: #eff6ff; border-radius: 12px; transition: transform 0.2s; cursor: pointer;">
                    <h2 style="color: #3b82f6; margin-bottom: 8px;">Vue 3</h2>
                    <p style="color: #1e40af; font-size: 0.9rem;">Vue 3.5 with SSR</p>
                </div>
            </a>
            <a href="${reactHref}" style="text-decoration: none; color: inherit;">
                <div style="padding: 24px; background: #f0f9ff; border-radius: 12px; transition: transform 0.2s; cursor: pointer;">
                    <h2 style="color: #0ea5e9; margin-bottom: 8px;">React</h2>
                    <p style="color: #0369a1; font-size: 0.9rem;">React 18 with Hooks</p>
                </div>
            </a>
        </div>
    </div>
`;

    return {
        mount(el: HTMLElement) {
            el.innerHTML = HTML;
        },
        unmount() {
            // Nothing to clean up
        },
        renderToString() {
            return HTML;
        }
    };
}

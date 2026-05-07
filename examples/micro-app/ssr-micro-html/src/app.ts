import type { RouterMicroAppOptions } from '@esmx/router';

export function createHtmlApp(): RouterMicroAppOptions {
    const HTML = `
        <div style="background: #fef3c7; padding: 40px; border-radius: 12px; text-align: center; font-family: system-ui, sans-serif;">
            <h1 style="color: #f59e0b; font-size: 2.5rem; margin-bottom: 16px;">Hello from HTML!</h1>
            <p style="color: #92400e; font-size: 1.2rem;">This is a native HTML + TypeScript micro-app powered by Esmx.</p>
            <div style="margin-top: 24px; padding: 16px; background: white; border-radius: 8px; display: inline-block;">
                <code style="color: #d97706; font-size: 1rem;">ssr-micro-html</code>
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

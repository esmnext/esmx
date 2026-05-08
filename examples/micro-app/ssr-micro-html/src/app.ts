import type { Router, RouterMicroAppOptions } from '@esmx/router';

import { useLayout } from 'ssr-micro-shared/src/layout';

const CONTENT_HTML = `
    <div style="max-width: 800px; margin: 0 auto;">
        <div style="
            background: white;
            border-radius: 16px;
            padding: 48px;
            border: 1px solid #e2e8f0;
            text-align: center;
        ">
            <div style="
                width: 64px;
                height: 64px;
                background: linear-gradient(135deg, #f59e0b, #d97706);
                border-radius: 16px;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-weight: 700;
                font-size: 28px;
                margin: 0 auto 24px;
                box-shadow: 0 10px 15px -3px rgba(245, 158, 11, 0.3);
            ">H</div>
            <h1 style="
                font-size: 2rem;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 12px;
            ">HTML Micro-App</h1>
            <p style="
                font-size: 1.125rem;
                color: #64748b;
                margin-bottom: 32px;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
            ">This page is rendered by a pure HTML + TypeScript micro-app without any framework dependencies.</p>
            <div style="
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 12px 24px;
                background: #fef3c7;
                border-radius: 8px;
                color: #92400e;
                font-family: monospace;
                font-size: 14px;
            ">
                <span></span> ssr-micro-html
            </div>
            <div style="margin-top: 32px; padding-top: 32px; border-top: 1px solid #e2e8f0;">
                <p style="color: #94a3b8; font-size: 14px; margin: 0;">No framework overhead — just clean, native web technologies</p>
            </div>
        </div>
    </div>
`;

export function createHtmlApp(router: Router): RouterMicroAppOptions {
    let container: HTMLElement | null = null;
    let layout: ReturnType<typeof useLayout> | null = null;

    return {
        mount(el: HTMLElement) {
            el.innerHTML = '';
            container = document.createElement('div');
            container.className = 'app-container';
            el.appendChild(container);

            layout = useLayout({ appId: 'html', router });

            container.innerHTML =
                layout.header +
                `<div style="margin-left: 260px; min-height: 100vh; background: #f8fafc; padding: 32px;">` +
                CONTENT_HTML +
                `</div>` +
                layout.footer;

            layout.mount();
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
            const layout = useLayout({ appId: 'html', router });
            return (
                layout.header +
                `<div style="margin-left: 260px; min-height: 100vh; background: #f8fafc; padding: 32px;">` +
                CONTENT_HTML +
                `</div>` +
                layout.footer
            );
        }
    };
}

import type { Router } from '@esmx/router';
import { Layout } from 'ssr-micro-shared/src/layout';

export class HtmlApp {
    private layout: Layout;

    constructor(router: Router) {
        this.layout = new Layout({ appId: 'html', router });
    }

    render(): string {
        return (
            `<div id="${this.layout.headerId}">${this.layout.header}</div>` +
            `<div style="margin-left: 260px; min-height: 100vh; background: #f8fafc; padding: 32px;">` +
            `<div style="max-width: 800px; margin: 0 auto;">` +
            `<div style="
                background: white;
                border-radius: 16px;
                padding: 48px;
                border: 1px solid #e2e8f0;
                text-align: center;
            ">` +
            `<div style="
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
            ">H</div>` +
            `<h1 style="
                font-size: 2rem;
                font-weight: 800;
                color: #0f172a;
                margin-bottom: 12px;
            ">HTML Micro-App</h1>` +
            `<p style="
                font-size: 1.125rem;
                color: #64748b;
                margin-bottom: 32px;
                max-width: 500px;
                margin-left: auto;
                margin-right: auto;
            ">Pure HTML + TypeScript micro-app.</p>` +
            `</div>` +
            `</div>` +
            `</div>` +
            `<div id="${this.layout.footerId}">${this.layout.footer}</div>`
        );
    }

    mount(el: HTMLElement): void {
        el.innerHTML = this.render();
        this.layout.mount();
    }

    unmount(): void {
        this.layout.unmount();
    }
}

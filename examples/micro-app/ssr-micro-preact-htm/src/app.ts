import { html } from 'htm/preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';

const badgeStyle =
    'width:56px;height:56px;background:linear-gradient(135deg, #8b5cf6, #7c3aed);border-radius:14px;display:flex;align-items:center;justify-content:center;margin:0 auto 20px';
const cardStyle = `background:var(--esmx-bg-card);border-radius:16px;padding:48px;border:1px solid var(--esmx-border);text-align:center`;
const h1Style =
    'font-size:2rem;font-weight:800;color:var(--esmx-text-primary);margin-bottom:12px';
const pStyle =
    'font-size:1.125rem;color:var(--esmx-text-secondary);margin-bottom:32px';

function Clock() {
    const [time, setTime] = useState(new Date().toLocaleTimeString());
    useEffect(() => {
        const id = setInterval(
            () => setTime(new Date().toLocaleTimeString()),
            1000
        );
        return () => clearInterval(id);
    }, []);
    return html`
        <div style="font-size:3rem;font-weight:800;font-family:monospace;color:var(--esmx-text-primary);margin:12px 0;">
            ${time}
        </div>
        <p style="color:var(--esmx-text-secondary);">Live clock using HTM tagged templates</p>
    `;
}

export function AppContent({ router }) {
    const layout = useMemo(
        () => new Layout({ appId: 'preact-htm', router }),
        [router]
    );

    useEffect(() => {
        layout.mount();
        return () => layout.unmount();
    }, [layout]);

    return html`
        <div>
            <div id=${layout.headerId} dangerouslySetInnerHTML=${{ __html: layout.header }} />
            <div style=${{ marginLeft: `var(--esmx-sidebar-width, ${SIDEBAR_WIDTH})`, minHeight: '100vh', padding: '32px', paddingTop: 'calc(32px + var(--esmx-mobile-header-height, 0px))' }}>
                <div style=${{ maxWidth: '800px', margin: '0 auto' }}>
                    <div style=${cardStyle}>
                        <div style=${badgeStyle} role="img" aria-label="Preact HTM">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
                                <polygon points="16,2 28,11 28,25 16,30 4,25 4,11" fill="none" stroke="#fff" stroke-width="2"/>
                                <text x="16" y="22" text-anchor="middle" fill="#fff" font-size="14" font-weight="700">H</text>
                            </svg>
                        </div>
                        <h1 style=${h1Style}>Preact + HTM Micro-App</h1>
                        ${Clock()}
                    </div>
                </div>
            </div>
            <div id=${layout.footerId} dangerouslySetInnerHTML=${{ __html: layout.footer }} />
        </div>
    `;
}

import { onCleanup, onMount } from 'solid-js';

import { Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';

export function AppContent(props: { router: any }) {
    const layout = new Layout({ appId: 'solid', router: props.router });

    onMount(() => {
        layout.mount();
    });

    onCleanup(() => {
        layout.unmount();
    });

    return (
        <div>
            <div id={layout.headerId} innerHTML={layout.header} />
            <div
                style={{
                    'margin-left': `var(--esmx-sidebar-width, ${SIDEBAR_WIDTH})`,
                    'min-height': '100vh',
                    padding: '32px',
                    'padding-top':
                        'calc(32px + var(--esmx-mobile-header-height, 0px))'
                }}
            >
                <div style={{ 'max-width': '800px', margin: '0 auto' }}>
                    <div
                        style={{
                            background: 'var(--esmx-bg-card)',
                            'border-radius': '16px',
                            padding: '48px',
                            border: '1px solid var(--esmx-border)',
                            'text-align': 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                background:
                                    'linear-gradient(135deg, #2c4f7c, #446b9e)',
                                'border-radius': '14px',
                                display: 'flex',
                                'align-items': 'center',
                                'justify-content': 'center',
                                margin: '0 auto 20px'
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 32 32"
                                width="28"
                                height="28"
                                role="img"
                                aria-label="SolidJS"
                            >
                                <path
                                    d="M16 2L2 12l6 18h20l6-18L16 2z"
                                    fill="#fff"
                                    opacity="0.9"
                                />
                            </svg>
                        </div>
                        <h1
                            style={{
                                'font-size': '2rem',
                                'font-weight': 800,
                                color: 'var(--esmx-text-primary)',
                                'margin-bottom': '12px'
                            }}
                        >
                            SolidJS Micro-App
                        </h1>
                        <p
                            style={{
                                'font-size': '1.125rem',
                                color: 'var(--esmx-text-secondary)',
                                'margin-bottom': '32px'
                            }}
                        >
                            This page is rendered by a SolidJS micro-app.
                        </p>
                    </div>
                </div>
            </div>
            <div id={layout.footerId} innerHTML={layout.footer} />
        </div>
    );
}

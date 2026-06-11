import { createSignal, onCleanup, onMount } from 'solid-js';

import { Layout, SIDEBAR_WIDTH, t } from 'ssr-micro-shared/src/index';

function Counter() {
    const [count, setCount] = createSignal(0);
    return (
        <div style="margin:16px 0;">
            <div style="font-size:3rem;font-weight:800;color:var(--esmx-text-primary);margin-bottom:12px;">
                {count()}
            </div>
            <div style="display:flex;gap:12px;justify-content:center;">
                <button
                    onClick={() => setCount((c) => c + 1)}
                    style="padding:8px 24px;border-radius:8px;border:none;background:var(--esmx-link);color:#fff;cursor:pointer;font-size:1.2rem;"
                >
                    +
                </button>
                <button
                    onClick={() => setCount((c) => c - 1)}
                    style="padding:8px 24px;border-radius:8px;border:none;background:#ef4444;color:#fff;cursor:pointer;font-size:1.2rem;"
                >
                    -
                </button>
            </div>
        </div>
    );
}

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
                            {t(props.router, 'fwSolidTitle')}
                        </h1>
                        <Counter />
                    </div>
                </div>
            </div>
            <div id={layout.footerId} innerHTML={layout.footer} />
        </div>
    );
}

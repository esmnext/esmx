import type { Router } from '@esmx/router';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { Layout, SIDEBAR_WIDTH, t } from 'ssr-micro-shared/src/index';

function Counter() {
    const [count, setCount] = useState(0);
    return (
        <div style={{ margin: '16px 0' }}>
            <div
                style={{
                    fontSize: '3rem',
                    fontWeight: 800,
                    color: 'var(--esmx-text-primary)',
                    marginBottom: '12px'
                }}
            >
                {count}
            </div>
            <div
                style={{
                    display: 'flex',
                    gap: '12px',
                    justifyContent: 'center'
                }}
            >
                <button
                    onClick={() => setCount((c) => c + 1)}
                    style={{
                        padding: '8px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'var(--esmx-link)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                    }}
                >
                    +
                </button>
                <button
                    onClick={() => setCount((c) => c - 1)}
                    style={{
                        padding: '8px 24px',
                        borderRadius: '8px',
                        border: 'none',
                        background: '#ef4444',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '1.2rem'
                    }}
                >
                    -
                </button>
            </div>
        </div>
    );
}

export function AppContent({ router }: { router: Router }) {
    const layout = useMemo(
        () => new Layout({ appId: 'preact', router }),
        [router]
    );

    useEffect(() => {
        layout.mount();
        return () => layout.unmount();
    }, [layout]);

    return (
        <div>
            <div
                id={layout.headerId}
                dangerouslySetInnerHTML={{ __html: layout.header }}
            />
            <div
                style={{
                    marginLeft: `var(--esmx-sidebar-width, ${SIDEBAR_WIDTH})`,
                    minHeight: '100vh',
                    padding: '32px',
                    paddingTop:
                        'calc(32px + var(--esmx-mobile-header-height, 0px))'
                }}
            >
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div
                        style={{
                            background: 'var(--esmx-bg-card)',
                            borderRadius: '16px',
                            padding: '48px',
                            border: '1px solid var(--esmx-border)',
                            textAlign: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                background:
                                    'linear-gradient(135deg, #673ab8, #512da8)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}
                            role="img"
                            aria-label="Preact"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 32 32"
                                width="28"
                                height="28"
                            >
                                <polygon
                                    points="16,2 28,11 28,25 16,30 4,25 4,11"
                                    fill="none"
                                    stroke="#fff"
                                    stroke-width="2"
                                />
                                <circle cx="16" cy="16" r="4.5" fill="#fff" />
                            </svg>
                        </div>
                        <h1
                            style={{
                                fontSize: '2rem',
                                fontWeight: 800,
                                color: 'var(--esmx-text-primary)',
                                marginBottom: '12px'
                            }}
                        >
                            {t(router, 'fwPreactTitle')}
                        </h1>
                        <Counter />
                    </div>
                </div>
            </div>
            <div
                id={layout.footerId}
                dangerouslySetInnerHTML={{ __html: layout.footer }}
            />
        </div>
    );
}

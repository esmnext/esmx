import { useEffect, useMemo } from 'preact/hooks';

import { useRouter } from '@esmx/router-react';
import { useHead } from '@unhead/react';
import { Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';

export function AppContent() {
    const router = useRouter();
    const layout = useMemo(
        () => new Layout({ appId: 'preact', router }),
        [router]
    );

    useHead({
        title: 'Preact Micro-App',
        meta: [
            {
                name: 'description',
                content: 'This page is rendered by a Preact 10 micro-app.'
            }
        ]
    });

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
                    marginLeft: 'var(--esmx-sidebar-width, ' + SIDEBAR_WIDTH + ')',
                    minHeight: '100vh',
                    padding: '32px',
                    paddingTop: 'calc(32px + var(--esmx-mobile-header-height, 0px))'
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
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
                                <path d="M16 2L2 16l14 14 14-14L16 2z" fill="#fff" opacity="0.9"/>
                                <circle cx="16" cy="16" r="5" fill="none" stroke="#fff" stroke-width="2"/>
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
                            Preact Micro-App
                        </h1>
                        <p
                            style={{
                                fontSize: '1.125rem',
                                color: 'var(--esmx-text-secondary)',
                                marginBottom: '32px'
                            }}
                        >
                            This page is rendered by a Preact 10 micro-app.
                        </p>
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

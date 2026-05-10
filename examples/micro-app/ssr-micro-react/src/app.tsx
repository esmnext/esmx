import { useRouter } from '@esmx/router-react';
import { useHead } from '@unhead/react';
import { useEffect, useMemo } from 'react';
import React from 'react';

import { Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';

export function AppContent() {
    const router = useRouter();
    const layout = useMemo(
        () => new Layout({ appId: 'react', router }),
        [router]
    );

    useHead({
        title: 'React Micro-App',
        meta: [
            {
                name: 'description',
                content: 'This page is rendered by a React 18 micro-app.'
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
                id="esmx-main"
                style={{
                    marginLeft: 'var(--esmx-sidebar-width, ' + SIDEBAR_WIDTH + ')',
                    minHeight: '100vh',
                    background: '#f8fafc',
                    padding: '32px',
                    paddingTop: 'calc(32px + var(--esmx-mobile-header-height, 0px))'
                }}
            >
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    <div
                        style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '48px',
                            textAlign: 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                background:
                                    'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '20px',
                                margin: '0 auto 20px'
                            }}
                        >
                            R
                        </div>
                        <h1
                            style={{
                                fontSize: '2rem',
                                fontWeight: 800,
                                color: '#0f172a',
                                marginBottom: '12px'
                            }}
                        >
                            React Micro-App
                        </h1>
                        <p
                            style={{
                                fontSize: '1.125rem',
                                color: '#64748b',
                                marginBottom: '32px'
                            }}
                        >
                            This page is rendered by a React 18 micro-app.
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

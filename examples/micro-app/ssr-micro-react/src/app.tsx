import { useRouter } from '@esmx/router-react';
import { useEffect, useMemo } from 'react';

import { Layout } from 'ssr-micro-shared/src/index';

export function AppContent() {
    const router = useRouter();
    const layout = useMemo(
        () => new Layout({ appId: 'react', router }),
        [router]
    );

    useEffect(() => {
        layout.mount();
        return () => layout.unmount();
    }, [layout]);

    return (
        <div data-ssr>
            <div
                id={layout.headerId}
                dangerouslySetInnerHTML={{ __html: layout.header }}
            />
            <div
                style={{
                    marginLeft: '260px',
                    minHeight: '100vh',
                    background: '#f8fafc',
                    padding: '32px'
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
                                width: '64px',
                                height: '64px',
                                background:
                                    'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                borderRadius: '16px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 700,
                                fontSize: '24px',
                                margin: '0 auto 24px'
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

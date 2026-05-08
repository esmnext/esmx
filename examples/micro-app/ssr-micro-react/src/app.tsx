import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider } from '@esmx/router-react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { useRouter } from '@esmx/router-react';
import { useEffect } from 'react';

import { Layout } from 'ssr-micro-shared/src/layout';

function AppContent() {
    const router = useRouter();
    const layout = new Layout({ appId: 'react', router });

    useEffect(() => {
        layout.mount();
        return () => layout.unmount();
    }, []);

    return (
        <div>
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
                                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
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

export function createReactApp(router): RouterMicroAppOptions {
    const AppWithProvider = () => (
        <RouterProvider router={router}>
            <AppContent />
        </RouterProvider>
    );

    let root: ReturnType<typeof createRoot> | null = null;

    return {
        mount(el: HTMLElement) {
            root = createRoot(el);
            root.render(<AppWithProvider />);
        },
        unmount() {
            if (root) {
                root.unmount();
                root = null;
            }
        },
        renderToString() {
            return Promise.resolve(renderToString(<AppWithProvider />));
        }
    };
}

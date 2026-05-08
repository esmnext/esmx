import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider, useRouter } from '@esmx/router-react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
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
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Layout generates safe HTML
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
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Layout generates safe HTML
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
    let container: HTMLElement | null = null;

    return {
        mount(el: HTMLElement) {
            el.innerHTML = '';
            container = document.createElement('div');
            el.appendChild(container);
            root = createRoot(container);
            root.render(<AppWithProvider />);
        },
        unmount() {
            if (root) {
                root.unmount();
                root = null;
            }
            if (container?.parentNode) {
                container.parentNode.removeChild(container);
            }
            container = null;
        },
        renderToString() {
            return Promise.resolve(renderToString(<AppWithProvider />));
        }
    };
}

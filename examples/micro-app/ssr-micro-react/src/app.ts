import type { RouterMicroAppOptions } from '@esmx/router';
import { RouterProvider } from '@esmx/router-react';
import { createElement, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { Layout } from 'ssr-micro-shared/src/layout';

function AppContent({ router }) {
    const layout = new Layout({ appId: 'react', router });

    useEffect(() => {
        layout.mount();
        return () => layout.unmount();
    }, [layout.mount, layout.unmount]);

    return createElement(
        'div',
        null,
        createElement(
            'div',
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Layout generates safe HTML
            { dangerouslySetInnerHTML: { __html: layout.header } }
        ),
        createElement(
            'div',
            {
                style: {
                    marginLeft: '260px',
                    minHeight: '100vh',
                    background: '#f8fafc',
                    padding: '32px'
                }
            },
            createElement(
                'div',
                { style: { maxWidth: '800px', margin: '0 auto' } },
                createElement(
                    'div',
                    {
                        style: {
                            background: 'white',
                            borderRadius: '16px',
                            padding: '48px',
                            border: '1px solid #e2e8f0',
                            textAlign: 'center'
                        }
                    },
                    createElement(
                        'div',
                        {
                            style: {
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
                                margin: '0 auto 24px',
                                boxShadow:
                                    '0 10px 15px -3px rgba(14, 165, 233, 0.3)'
                            }
                        },
                        'R'
                    ),
                    createElement(
                        'h1',
                        {
                            style: {
                                fontSize: '2rem',
                                fontWeight: 800,
                                color: '#0f172a',
                                marginBottom: '12px'
                            }
                        },
                        'React Micro-App'
                    ),
                    createElement(
                        'p',
                        {
                            style: {
                                fontSize: '1.125rem',
                                color: '#64748b',
                                marginBottom: '32px',
                                maxWidth: '500px',
                                marginLeft: 'auto',
                                marginRight: 'auto'
                            }
                        },
                        'This page is rendered by a React 18 micro-app with hooks, concurrent features, and server-side rendering via Esmx Router.'
                    ),
                    createElement(
                        'div',
                        {
                            style: {
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                padding: '12px 24px',
                                background: '#f0f9ff',
                                borderRadius: '8px',
                                color: '#0369a1',
                                fontFamily: 'monospace',
                                fontSize: '14px'
                            }
                        },
                        createElement('span', null, '⚛️'),
                        ' ssr-micro-react'
                    ),
                    createElement(
                        'div',
                        {
                            style: {
                                marginTop: '32px',
                                paddingTop: '32px',
                                borderTop: '1px solid #e2e8f0'
                            }
                        },
                        createElement(
                            'p',
                            {
                                style: {
                                    color: '#94a3b8',
                                    fontSize: '14px',
                                    margin: 0
                                }
                            },
                            '⚛️ React 18 with Hooks and Concurrent Features'
                        )
                    )
                )
            )
        ),
        createElement(
            'div',
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Layout generates safe HTML
            { dangerouslySetInnerHTML: { __html: layout.footer } }
        )
    );
}

export function createReactApp(router): RouterMicroAppOptions {
    let root: ReturnType<typeof createRoot> | null = null;
    let container: HTMLElement | null = null;

    function AppWithProvider() {
        return createElement(
            RouterProvider,
            { router },
            createElement(AppContent, { router })
        );
    }

    return {
        mount(el: HTMLElement) {
            el.innerHTML = '';
            container = document.createElement('div');
            container.className = 'app-container';
            el.appendChild(container);
            root = createRoot(container);
            root.render(createElement(AppWithProvider));
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
            return Promise.resolve(
                renderToString(createElement(AppWithProvider))
            );
        }
    };
}

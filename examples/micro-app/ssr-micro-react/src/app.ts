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
        createElement('div', {
            id: layout.headerId,
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Layout generates safe HTML
            dangerouslySetInnerHTML: { __html: layout.header }
        }),
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
                                margin: '0 auto 24px'
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
                                marginBottom: '32px'
                            }
                        },
                        'This page is rendered by a React 18 micro-app.'
                    )
                )
            )
        ),
        createElement('div', {
            id: layout.footerId,
            // biome-ignore lint/security/noDangerouslySetInnerHtml: Layout generates safe HTML
            dangerouslySetInnerHTML: { __html: layout.footer }
        })
    );
}

export function createReactApp(router): RouterMicroAppOptions {
    const AppWithProvider = () =>
        createElement(
            RouterProvider,
            { router },
            createElement(AppContent, { router })
        );

    let root: ReturnType<typeof createRoot> | null = null;
    let container: HTMLElement | null = null;

    return {
        mount(el: HTMLElement) {
            el.innerHTML = '';
            container = document.createElement('div');
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

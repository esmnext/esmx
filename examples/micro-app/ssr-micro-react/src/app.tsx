import { useRouter } from '@esmx/router-react';
import { useHead } from '@unhead/react';
import { useEffect, useMemo, useState } from 'react';
import React from 'react';

function Counter() {
    const [count, setCount] = useState(0);
    return (
        <div>
            <div style={{fontSize: '3rem', fontWeight: 800, color: 'var(--esmx-text-primary)', margin: '0 0 12px'}}>{count}</div>
            <div style={{display: 'flex', gap: '12px', justifyContent: 'center'}}>
                <button onClick={() => setCount(c => c + 1)} style={{padding: '8px 24px', borderRadius: '8px', border: 'none', background: 'var(--esmx-link)', color: '#fff', cursor: 'pointer', fontSize: '1.2rem'}}>+1</button>
                <button onClick={() => setCount(c => c - 1)} style={{padding: '8px 24px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontSize: '1.2rem'}}>-1</button>
            </div>
        </div>
    );
}

import { Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';

export function AppContent() {
    const router = useRouter();
    const layout = useMemo(
        () => new Layout({ appId: 'react', router }),
        [router]
    );

    useHead({
        title: 'React 19 Micro-App',
        meta: [
            {
                name: 'description',
                content: 'This page is rendered by a React 19 micro-app.'
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
                                    'linear-gradient(135deg, #0ea5e9, #0284c7)',
                                borderRadius: '14px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 20px'
                            }}
                            role="img"
                            aria-label="React"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="28" height="28">
                                <circle cx="16" cy="16" r="3" fill="#fff"/>
                                <ellipse cx="16" cy="16" rx="15" ry="5.5" fill="none" stroke="#fff" strokeWidth="1.8" transform="rotate(60 16 16)"/>
                                <ellipse cx="16" cy="16" rx="15" ry="5.5" fill="none" stroke="#fff" strokeWidth="1.8" transform="rotate(-60 16 16)"/>
                                <ellipse cx="16" cy="16" rx="15" ry="5.5" fill="none" stroke="#fff" strokeWidth="1.8"/>
                            </svg>
                        </div>
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

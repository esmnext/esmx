import { useEffect, useMemo, useState, useRef } from 'preact/hooks';

import { Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';

function Ball() {
    const [pos, setPos] = useState(0);
    const dirRef = useRef(1);
    useEffect(() => {
        const id = setInterval(() => {
            setPos(p => {
                const n = p + dirRef.current * 4;
                if (n > 230 || n < 0) dirRef.current = -dirRef.current;
                return n > 230 ? 230 : n < 0 ? 0 : n;
            });
        }, 16);
        return () => clearInterval(id);
    }, []);
    return (
        <div style={{ width: '260px', height: '40px', background: 'var(--esmx-bg-main)', borderRadius: '20px', position: 'relative', margin: '16px auto', overflow: 'hidden' }}>
            <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#673ab8,#512da8)', borderRadius: '50%', position: 'absolute', top: '6px', left: `${pos}px` }} />
        </div>
    );
}

export function AppContent({ router }) {
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
                                background: 'linear-gradient(135deg, #673ab8, #512da8)',
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
                                <polygon points="16,2 28,11 28,25 16,30 4,25 4,11" fill="none" stroke="#fff" stroke-width="2"/>
                                <circle cx="16" cy="16" r="4.5" fill="#fff"/>
                            </svg>
                        </div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--esmx-text-primary)', marginBottom: '12px' }}>
                            Preact Micro-App
                        </h1>
                        <Ball />
                        <p style={{ fontSize: '1.125rem', color: 'var(--esmx-text-secondary)', marginBottom: '32px' }}>
                            Bouncing ball animation (3KB runtime)
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

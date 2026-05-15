import { createSignal, onCleanup, onMount } from 'solid-js';

function ColorMixer() {
    const [r, setR] = createSignal(59);
    const [g, setG] = createSignal(130);
    const [b, setB] = createSignal(246);
    const color = () => `rgb(${r()}, ${g()}, ${b()})`;
    return (
        <div>
            <div style={{width: '120px', height: '120px', borderRadius: '16px', margin: '12px auto', background: color(), boxShadow: `0 4px 20px ${color()}66`}} />
            <div style={{maxWidth: '300px', margin: '0 auto'}}>
                {[['R', r, setR, '#ef4444'], ['G', g, setG, '#10b981'], ['B', b, setB, '#3b82f6']].map(([label, val, set, color]) => (
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                        <span style={{color, width: '16px', fontWeight: 700}}>{label}</span>
                        <input type="range" min="0" max="255" value={val()} onInput={e => set(Number(e.target.value))} style={{flex: 1}} />
                        <span style={{fontFamily: 'monospace', width: '32px', color: 'var(--esmx-text-primary)'}}>{val()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

import { Layout, SIDEBAR_WIDTH } from 'ssr-micro-shared/src/index';

export function AppContent(props: { router: any }) {
    const layout = new Layout({ appId: 'solid', router: props.router });

    onMount(() => {
        layout.mount();
    });

    onCleanup(() => {
        layout.unmount();
    });

    return (
        <div>
            <div id={layout.headerId} innerHTML={layout.header} />
            <div
                style={{
                    'margin-left': `var(--esmx-sidebar-width, ${SIDEBAR_WIDTH})`,
                    'min-height': '100vh',
                    padding: '32px',
                    'padding-top':
                        'calc(32px + var(--esmx-mobile-header-height, 0px))'
                }}
            >
                <div style={{ 'max-width': '800px', margin: '0 auto' }}>
                    <div
                        style={{
                            background: 'var(--esmx-bg-card)',
                            'border-radius': '16px',
                            padding: '48px',
                            border: '1px solid var(--esmx-border)',
                            'text-align': 'center'
                        }}
                    >
                        <div
                            style={{
                                width: '56px',
                                height: '56px',
                                background:
                                    'linear-gradient(135deg, #2c4f7c, #446b9e)',
                                'border-radius': '14px',
                                display: 'flex',
                                'align-items': 'center',
                                'justify-content': 'center',
                                margin: '0 auto 20px'
                            }}
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 32 32"
                                width="28"
                                height="28"
                                role="img"
                                aria-label="SolidJS"
                            >
                                <path
                                    d="M16 2L2 12l6 18h20l6-18L16 2z"
                                    fill="#fff"
                                    opacity="0.9"
                                />
                            </svg>
                        </div>
                        <ColorMixer />
                    </div>
                </div>
            </div>
            <div id={layout.footerId} innerHTML={layout.footer} />
        </div>
    );
}

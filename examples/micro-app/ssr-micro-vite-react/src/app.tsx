import { useRouter } from '@esmx/router-react';
import { useHead } from '@unhead/react';
import { useEffect, useMemo, useState } from 'react';

import { buildSeoHead, Layout, t } from 'ssr-micro-shared/index';

const SOURCE_SNIPPET = `import { useState } from 'react'

export function Counter() {
  const [count, setCount] = useState(0)
  return (
    <>
      <p>Count: {count}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>−</button>
    </>
  )
}`;

function Counter() {
    const [count, setCount] = useState(0);
    return (
        <>
            <div className="esmx-stat">
                <div className="esmx-stat__label">Count</div>
                <div className="esmx-stat__value">{count}</div>
            </div>
            <div className="esmx-demo-card__actions">
                <button
                    type="button"
                    className="esmx-btn esmx-btn--primary"
                    onClick={() => setCount((c) => c + 1)}
                >
                    +
                </button>
                <button
                    type="button"
                    className="esmx-btn"
                    onClick={() => setCount((c) => c - 1)}
                >
                    −
                </button>
            </div>
        </>
    );
}

export function AppContent() {
    const router = useRouter();
    const layout = useMemo(
        () => new Layout({ appId: 'react', router }),
        [router]
    );

    useHead(
        buildSeoHead(router, {
            path: '/vite-react/',
            title: t(router, 'fwReactTitle'),
            description: t(router, 'fwReactDesc')
        })
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
            <main className="esmx-demo-main">
                <article className="esmx-demo-card">
                    <section className="esmx-demo-card__source esmx-code">
                        <header className="esmx-code__header">
                            <span className="esmx-code__file">src/app.tsx</span>
                        </header>
                        <div className="esmx-code__body">
                            <pre>{SOURCE_SNIPPET}</pre>
                        </div>
                    </section>

                    <section className="esmx-demo-card__rendered">
                        <h1 className="esmx-demo-card__title">
                            {t(router, 'fwReactTitle')}
                        </h1>
                        <Counter />
                        <div className="esmx-demo-card__tags">
                            <span className="esmx-badge esmx-badge--react">
                                <span
                                    className="esmx-dot esmx-dot--react"
                                    aria-hidden="true"
                                />
                                React 19
                            </span>
                            <span className="esmx-badge">Vite 8</span>
                            <span className="esmx-badge">SSR</span>
                        </div>
                    </section>
                </article>

                <footer className="esmx-demo-source">
                    source ·{' '}
                    <code>
                        examples/micro-app/ssr-micro-vite-react/src/app.tsx
                    </code>
                </footer>
            </main>
            <div
                id={layout.footerId}
                dangerouslySetInnerHTML={{ __html: layout.footer }}
            />
        </div>
    );
}

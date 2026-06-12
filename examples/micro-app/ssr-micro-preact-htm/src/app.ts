import type { Router } from '@esmx/router';
import { html } from 'htm/preact';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { Layout, t } from 'ssr-micro-shared/src/index';

const SOURCE_SNIPPET = `import { html } from 'htm/preact'
import { useState } from 'preact/hooks'

export function Counter() {
  const [count, setCount] = useState(0)
  return html\`
    <p>Count: \${count}</p>
    <button onClick=\${() => setCount(c => c + 1)}>+</button>
    <button onClick=\${() => setCount(c => c - 1)}>−</button>
  \`
}`;

function Counter() {
    const [count, setCount] = useState(0);
    return html`<div class="esmx-stat">
            <div class="esmx-stat__label">Count</div>
            <div class="esmx-stat__value">${count}</div>
        </div>
        <div class="esmx-demo-card__actions">
            <button type="button" class="esmx-btn esmx-btn--primary" onClick=${() => setCount((c) => c + 1)}>+</button>
            <button type="button" class="esmx-btn" onClick=${() => setCount((c) => c - 1)}>−</button>
        </div>`;
}

export function AppContent({ router }: { router: Router }) {
    const layout = useMemo(
        () => new Layout({ appId: 'preact-htm', router }),
        [router]
    );

    useEffect(() => {
        layout.mount();
        return () => layout.unmount();
    }, [layout]);

    return html`
        <div>
            <div id=${layout.headerId} dangerouslySetInnerHTML=${{ __html: layout.header }} />
            <main class="esmx-demo-main">
                <article class="esmx-demo-card">
                    <section class="esmx-demo-card__source esmx-code">
                        <header class="esmx-code__header">
                            <span class="esmx-code__file">src/app.ts</span>
                        </header>
                        <div class="esmx-code__body">
                            <pre>${SOURCE_SNIPPET}</pre>
                        </div>
                    </section>
                    <section class="esmx-demo-card__rendered">
                        <h1 class="esmx-demo-card__title">${t(router, 'fwPreactHtmTitle')}</h1>
                        <${Counter} />
                        <div class="esmx-demo-card__tags">
                            <span class="esmx-badge esmx-badge--preact">
                                <span class="esmx-dot esmx-dot--preact" aria-hidden="true"></span>
                                Preact + HTM
                            </span>
                            <span class="esmx-badge">Rspack</span>
                            <span class="esmx-badge">SSR</span>
                        </div>
                    </section>
                </article>
                <footer class="esmx-demo-source">
                    source · <code>examples/micro-app/ssr-micro-preact-htm/src/app.ts</code>
                </footer>
            </main>
            <div id=${layout.footerId} dangerouslySetInnerHTML=${{ __html: layout.footer }} />
        </div>
    `;
}

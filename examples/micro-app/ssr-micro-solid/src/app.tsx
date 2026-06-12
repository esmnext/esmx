import { createSignal, onCleanup, onMount } from 'solid-js';

import { Layout, t } from 'ssr-micro-shared/src/index';

const SOURCE_SNIPPET = `import { createSignal } from 'solid-js'

export function Counter() {
  const [count, setCount] = createSignal(0)
  return (
    <>
      <p>Count: {count()}</p>
      <button onClick={() => setCount(c => c + 1)}>+</button>
      <button onClick={() => setCount(c => c - 1)}>−</button>
    </>
  )
}`;

function Counter() {
    const [count, setCount] = createSignal(0);
    return (
        <>
            <div class="esmx-stat">
                <div class="esmx-stat__label">Count</div>
                <div class="esmx-stat__value">{count()}</div>
            </div>
            <div class="esmx-demo-card__actions">
                <button
                    type="button"
                    class="esmx-btn esmx-btn--primary"
                    onClick={() => setCount((c) => c + 1)}
                >
                    +
                </button>
                <button
                    type="button"
                    class="esmx-btn"
                    onClick={() => setCount((c) => c - 1)}
                >
                    −
                </button>
            </div>
        </>
    );
}

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
            <main class="esmx-demo-main">
                <article class="esmx-demo-card">
                    <section class="esmx-demo-card__source esmx-code">
                        <header class="esmx-code__header">
                            <span class="esmx-code__file">src/app.tsx</span>
                        </header>
                        <div class="esmx-code__body">
                            <pre>{SOURCE_SNIPPET}</pre>
                        </div>
                    </section>

                    <section class="esmx-demo-card__rendered">
                        <h1 class="esmx-demo-card__title">
                            {t(props.router, 'fwSolidTitle')}
                        </h1>
                        <Counter />
                        <div class="esmx-demo-card__tags">
                            <span class="esmx-badge esmx-badge--solid">
                                <span
                                    class="esmx-dot esmx-dot--solid"
                                    aria-hidden="true"
                                />
                                SolidJS
                            </span>
                            <span class="esmx-badge">Rspack</span>
                            <span class="esmx-badge">SSR</span>
                        </div>
                    </section>
                </article>

                <footer class="esmx-demo-source">
                    source ·{' '}
                    <code>examples/micro-app/ssr-micro-solid/src/app.tsx</code>
                </footer>
            </main>
            <div id={layout.footerId} innerHTML={layout.footer} />
        </div>
    );
}

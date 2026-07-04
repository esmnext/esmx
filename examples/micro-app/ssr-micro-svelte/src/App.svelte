<script lang="ts">
import type { Layout } from 'ssr-micro-shared/index';
import { highlightedSnippet } from './snippet.generated';

interface Props {
    layout: Layout;
    title: string;
}

const { layout, title }: Props = $props();

// biome-ignore lint/style/useConst: Svelte 5 $state rune requires `let` for reassignable bindings
let count = $state(0);
</script>

<div>
    {@html `<div id="${layout.headerId}">${layout.header}</div>`}
    <main class="esmx-demo-main">
        <article class="esmx-demo-card">
            <section class="esmx-demo-card__source esmx-code">
                <header class="esmx-code__header">
                    <span class="esmx-code__file">src/App.svelte</span>
                </header>
                <div class="esmx-code__body">
                    {@html highlightedSnippet}
                </div>
            </section>

            <section class="esmx-demo-card__rendered">
                <h1 class="esmx-demo-card__title">{title}</h1>

                <div class="esmx-stat">
                    <div class="esmx-stat__label">Count</div>
                    <div class="esmx-stat__value">{count}</div>
                </div>

                <div class="esmx-demo-card__actions">
                    <button type="button" class="esmx-btn esmx-btn--primary" onclick={() => count++}>+</button>
                    <button type="button" class="esmx-btn" onclick={() => count--}>−</button>
                </div>

                <div class="esmx-demo-card__tags">
                    <span class="esmx-badge esmx-badge--svelte">
                        <span class="esmx-dot esmx-dot--svelte" aria-hidden="true"></span>
                        Svelte 5
                    </span>
                    <span class="esmx-badge">Rspack</span>
                    <span class="esmx-badge">SSR</span>
                </div>
            </section>
        </article>

        <footer class="esmx-demo-source">
            source · <code>examples/micro-app/ssr-micro-svelte/src/App.svelte</code>
        </footer>
    </main>
    {@html `<div id="${layout.footerId}">${layout.footer}</div>`}
</div>

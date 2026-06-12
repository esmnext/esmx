<script setup lang="ts">
import HelloWorld from './components/hello-world.vue';
</script>

<template>
    <main class="demo">
        <article class="demo__card">
            <HelloWorld />
            <p class="demo__source">
                source ·
                <code>src/app.vue</code>
            </p>
        </article>
    </main>
</template>

<style>
/* Inline token set — standalone demos own their CSS. */
:root {
    --esmx-brand: #0091e2;
    --esmx-bg-canvas: #fdfdfd;
    --esmx-bg-paper: #ffffff;
    --esmx-bg-subtle: #f5f7f9;
    --esmx-border: #e5e9ed;
    --esmx-text-primary: #0c1117;
    --esmx-text-secondary: #5a6473;
    --esmx-text-muted: #8b949e;
    --esmx-fw-vue: #41b883;
    --esmx-font-sans: 'Inter Variable', system-ui, -apple-system, sans-serif;
    --esmx-font-mono: 'JetBrains Mono Variable', ui-monospace, 'SF Mono', Menlo, monospace;
}
@media (prefers-color-scheme: dark) {
    :root {
        --esmx-bg-canvas: #0c1117;
        --esmx-bg-paper: #161b22;
        --esmx-bg-subtle: #1c232c;
        --esmx-border: #30363d;
        --esmx-text-primary: #e6edf3;
        --esmx-text-secondary: #8b949e;
        --esmx-text-muted: #6e7681;
    }
}
* { box-sizing: border-box; }
body {
    margin: 0;
    min-height: 100vh;
    background: var(--esmx-bg-canvas);
    color: var(--esmx-text-primary);
    font-family: var(--esmx-font-sans);
    font-size: 16px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
}
.demo { max-width: 960px; margin: 0 auto; padding: 64px 24px; }
.demo__card {
    background: var(--esmx-bg-paper);
    border: 1px solid var(--esmx-border);
    border-radius: 8px;
    padding: 24px;
}
.demo__title { margin: 0 0 16px; font-size: 2rem; font-weight: 600; line-height: 1.2; }
.demo__message { margin: 0 0 24px; color: var(--esmx-text-secondary); }
.demo__code {
    background: var(--esmx-bg-subtle);
    border-radius: 6px;
    padding: 16px 20px;
    overflow-x: auto;
    margin: 0 0 16px;
    font-family: var(--esmx-font-mono);
    font-size: 0.875rem;
    line-height: 1.55;
}
.demo__code pre { margin: 0; }
.demo__stat { display: inline-flex; flex-direction: column; gap: 4px; padding: 16px 0; }
.demo__stat-label {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--esmx-text-muted);
    font-weight: 500;
}
.demo__stat-value {
    font-family: var(--esmx-font-mono);
    font-size: 2rem;
    font-weight: 600;
    line-height: 1.2;
}
.demo__actions { display: flex; gap: 8px; margin: 8px 0 16px; }
.demo__btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 8px 14px;
    font-family: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--esmx-text-primary);
    background: transparent;
    border: 1px solid var(--esmx-border);
    border-radius: 6px;
    cursor: pointer;
    transition: background 100ms;
}
.demo__btn:hover { background: var(--esmx-bg-subtle); }
.demo__btn--primary {
    color: #fff;
    background: var(--esmx-brand);
    border-color: var(--esmx-brand);
}
.demo__btn--primary:hover { background: #0079bd; border-color: #0079bd; }
.demo__tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.demo__badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    font-family: var(--esmx-font-mono);
    font-size: 0.75rem;
    color: var(--esmx-text-secondary);
    border: 1px solid var(--esmx-border);
    border-radius: 9999px;
}
.demo__badge--vue { color: var(--esmx-fw-vue); border-color: var(--esmx-fw-vue); }
.demo__dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 9999px;
    background: var(--esmx-text-muted);
}
.demo__dot--vue { background: var(--esmx-fw-vue); }
.demo__source { margin-top: 16px; color: var(--esmx-text-muted); font-size: 0.875rem; }
.demo__source code { font-family: var(--esmx-font-mono); font-size: 0.75rem; }
</style>

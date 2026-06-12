import type { RenderContext } from '@esmx/core';
import { message } from './message';

const STYLES = `
:root {
    --esmx-brand: #0091e2;
    --esmx-bg-canvas: #fdfdfd;
    --esmx-bg-paper: #ffffff;
    --esmx-bg-subtle: #f5f7f9;
    --esmx-border: #e5e9ed;
    --esmx-text-primary: #0c1117;
    --esmx-text-secondary: #5a6473;
    --esmx-text-muted: #8b949e;
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
.demo__tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 16px; }
.demo__badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 2px 8px;
    font-family: var(--esmx-font-mono);
    font-size: 0.75rem;
    color: var(--esmx-text-secondary);
    border: 1px solid var(--esmx-border);
    border-radius: 9999px;
}
.demo__badge--brand { color: var(--esmx-brand); border-color: var(--esmx-brand); }
.demo__source { margin-top: 16px; color: var(--esmx-text-muted); font-size: 0.875rem; }
.demo__source code { font-family: var(--esmx-font-mono); font-size: 0.75rem; }
`.trim();

const SOURCE_SNIPPET = `// src/entry.server.ts — Vite's SSR entry
export default async (rc: RenderContext) => {
  await rc.commit()
  rc.html = \`<!DOCTYPE html><html>...<h1>\${message('server')}</h1>...\`
}`;

function escapeHtml(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export default async (rc: RenderContext) => {
    await rc.commit();

    rc.html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    ${rc.preload()}
    <title>Esmx + Vite SSR</title>
    <style>${STYLES}</style>
    ${rc.css()}
</head>
<body>
    <main class="demo">
        <article class="demo__card">
            <h1 class="demo__title">${message('server')}</h1>
            <p class="demo__message">Server-side rendered by Esmx on Vite. The client entry hydrates this page in place.</p>
            <div class="demo__code"><pre>${escapeHtml(SOURCE_SNIPPET)}</pre></div>
            <div class="demo__tags">
                <span class="demo__badge demo__badge--brand">Esmx</span>
                <span class="demo__badge">Vite 8</span>
                <span class="demo__badge">SSR</span>
                <span class="demo__badge">HTML</span>
            </div>
            <div id="app"></div>
            <p class="demo__source">source · <code>examples/ssr-vite-html/src/entry.server.ts</code></p>
        </article>
    </main>
    ${rc.importmap()}
    ${rc.moduleEntry()}
    ${rc.modulePreload()}
</body>
</html>
`;
};

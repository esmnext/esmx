import { expect, test } from '@playwright/test';

// Each test captures the production-built page at a stable viewport and
// compares against a Linux/Chromium baseline. Baselines must be generated
// in matching environment (CI / mcr.microsoft.com/playwright docker image)
// to avoid host-rendering drift — see README.md "Visual regression".
//
// Test groups expect a server set already running:
//   STANDALONE   → scripts/start-all.mjs --group=standalone  (ports 3000-3005)
//   HUB          → scripts/start-all.mjs --group=hub         (hub on :3000)
// The HUB group is run by default; the visual job in regression.yml runs
// both groups in two passes.

type Route = { name: string; path: string; port: number };

// Override via TARGET_HOST when running inside Docker (e.g. host.docker.internal).
const HOST = process.env.TARGET_HOST || '127.0.0.1';
const url = (port: number, path: string) => `http://${HOST}:${port}${path}`;

const HUB_ROUTES: Route[] = [
    { name: 'hub-landing', port: 3000, path: '/' },
    { name: 'hub-demo-index', port: 3000, path: '/demo/' },
    { name: 'hub-html', port: 3000, path: '/html/' },
    { name: 'hub-lit', port: 3000, path: '/lit/' },
    { name: 'hub-vue2', port: 3000, path: '/vue2/' },
    { name: 'hub-vue3', port: 3000, path: '/vue3/' },
    { name: 'hub-react', port: 3000, path: '/react/' },
    { name: 'hub-preact', port: 3000, path: '/preact/' },
    { name: 'hub-preact-htm', port: 3000, path: '/preact-htm/' },
    { name: 'hub-solid', port: 3000, path: '/solid/' },
    { name: 'hub-svelte', port: 3000, path: '/svelte/' },
    { name: 'hub-vite-html', port: 3000, path: '/vite-html/' },
    { name: 'hub-vite-react', port: 3000, path: '/vite-react/' },
    { name: 'hub-vite-vue', port: 3000, path: '/vite-vue/' },
    { name: 'hub-rsbuild-html', port: 3000, path: '/rsbuild-html/' },
    { name: 'hub-rsbuild-react', port: 3000, path: '/rsbuild-react/' },
    { name: 'hub-rsbuild-vue', port: 3000, path: '/rsbuild-vue/' }
];

const STANDALONE_ROUTES: Route[] = [
    { name: 'standalone-vite-html', port: 3000, path: '/' },
    { name: 'standalone-rsbuild-html', port: 3001, path: '/' },
    { name: 'standalone-vite-react', port: 3002, path: '/' },
    { name: 'standalone-vite-vue', port: 3003, path: '/' },
    { name: 'standalone-rsbuild-react', port: 3004, path: '/' },
    { name: 'standalone-rsbuild-vue', port: 3005, path: '/' }
];

const GROUP = process.env.VISUAL_GROUP || 'hub';
const ROUTES = GROUP === 'standalone' ? STANDALONE_ROUTES : HUB_ROUTES;

for (const route of ROUTES) {
    test(route.name, async ({ page }) => {
        await page.goto(url(route.port, route.path), {
            waitUntil: 'networkidle'
        });
        // Wait for fonts & lazy hydration to settle.
        await page.waitForLoadState('domcontentloaded');
        await page.evaluate(() => document.fonts.ready);
        await expect(page).toHaveScreenshot(`${route.name}.png`, {
            fullPage: true
        });
    });
}

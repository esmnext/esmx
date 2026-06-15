import { defineConfig, devices } from '@playwright/test';

// Visual regression for Esmx demo suite.
// Servers are brought up by scripts/start-all.mjs before tests run.
// Baselines are committed under tests/visual/__snapshots__ and must be
// generated on Linux/Chromium (CI image) to avoid host-rendering drift.
export default defineConfig({
    testDir: './tests/visual',
    fullyParallel: false,
    forbidOnly: !!process.env.CI,
    retries: 0,
    workers: 1,
    reporter: process.env.CI
        ? [['github'], ['html', { open: 'never' }]]
        : 'list',
    expect: {
        toHaveScreenshot: {
            maxDiffPixelRatio: 0.01,
            animations: 'disabled'
        }
    },
    use: {
        viewport: { width: 1280, height: 800 },
        ignoreHTTPSErrors: true,
        screenshot: 'only-on-failure'
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] }
        }
    ]
});

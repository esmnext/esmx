#!/usr/bin/env node
// Sequential smoke runner for production-built Esmx examples.
//
// For each example: spawn `pnpm start`, poll the configured port until 200,
// curl `/` once, assert the response is HTML and contains hydration markers
// (importmap + module script). Kill the server, move on.
//
// Hydration "browser" check is deferred to F2 (Playwright); this layer
// proves the SSR HTML wire-up is in place so the client bundle WILL hydrate.

import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const STANDALONE = [
    { name: 'ssr-vite-html', dir: 'examples/ssr-vite-html', port: 3000 },
    { name: 'ssr-rsbuild-html', dir: 'examples/ssr-rsbuild-html', port: 3001 },
    { name: 'ssr-vite-react', dir: 'examples/ssr-vite-react', port: 3002 },
    { name: 'ssr-vite-vue', dir: 'examples/ssr-vite-vue', port: 3003 },
    {
        name: 'ssr-rsbuild-react',
        dir: 'examples/ssr-rsbuild-react',
        port: 3004
    },
    { name: 'ssr-rsbuild-vue', dir: 'examples/ssr-rsbuild-vue', port: 3005 }
];

const MICRO = [
    {
        name: 'ssr-micro-hub',
        dir: 'examples/micro-app/ssr-micro-hub',
        port: 3000
    },
    {
        name: 'ssr-micro-html',
        dir: 'examples/micro-app/ssr-micro-html',
        port: 3001
    },
    {
        name: 'ssr-micro-lit',
        dir: 'examples/micro-app/ssr-micro-lit',
        port: 3002
    },
    {
        name: 'ssr-micro-vue2',
        dir: 'examples/micro-app/ssr-micro-vue2',
        port: 3003
    },
    {
        name: 'ssr-micro-vue3',
        dir: 'examples/micro-app/ssr-micro-vue3',
        port: 3004
    },
    {
        name: 'ssr-micro-react',
        dir: 'examples/micro-app/ssr-micro-react',
        port: 3005
    },
    {
        name: 'ssr-micro-preact',
        dir: 'examples/micro-app/ssr-micro-preact',
        port: 3006
    },
    {
        name: 'ssr-micro-preact-htm',
        dir: 'examples/micro-app/ssr-micro-preact-htm',
        port: 3007
    },
    {
        name: 'ssr-micro-solid',
        dir: 'examples/micro-app/ssr-micro-solid',
        port: 3008
    },
    {
        name: 'ssr-micro-svelte',
        dir: 'examples/micro-app/ssr-micro-svelte',
        port: 3009
    },
    {
        name: 'ssr-micro-vite-html',
        dir: 'examples/micro-app/ssr-micro-vite-html',
        port: 3010
    },
    {
        name: 'ssr-micro-vite-react',
        dir: 'examples/micro-app/ssr-micro-vite-react',
        port: 3011
    },
    {
        name: 'ssr-micro-vite-vue',
        dir: 'examples/micro-app/ssr-micro-vite-vue',
        port: 3012
    },
    {
        name: 'ssr-micro-rsbuild-html',
        dir: 'examples/micro-app/ssr-micro-rsbuild-html',
        port: 3013
    },
    {
        name: 'ssr-micro-rsbuild-react',
        dir: 'examples/micro-app/ssr-micro-rsbuild-react',
        port: 3014
    },
    {
        name: 'ssr-micro-rsbuild-vue',
        dir: 'examples/micro-app/ssr-micro-rsbuild-vue',
        port: 3015
    }
];

const TARGETS = [...STANDALONE, ...MICRO];

const STARTUP_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 500;

async function waitForReady(port) {
    const deadline = Date.now() + STARTUP_TIMEOUT_MS;
    let lastErr = 'connection refused';
    while (Date.now() < deadline) {
        try {
            const res = await fetch(`http://127.0.0.1:${port}/`, {
                signal: AbortSignal.timeout(2000)
            });
            if (res.status === 200) {
                const body = await res.text();
                if (/^\s*<!DOCTYPE/i.test(body)) {
                    return { status: res.status, body };
                }
                lastErr = `200 but no DOCTYPE in body (len=${body.length})`;
            } else {
                lastErr = `status=${res.status}`;
            }
        } catch (e) {
            lastErr = e.message || String(e);
        }
        await delay(POLL_INTERVAL_MS);
    }
    throw new Error(
        `server on port ${port} did not become ready in ${STARTUP_TIMEOUT_MS}ms (last: ${lastErr})`
    );
}

function assertHydratable(html, target) {
    const checks = [
        { name: 'importmap script', re: /<script[^>]*type=["']importmap["']/ },
        { name: 'module entry script', re: /<script[^>]*type=["']module["']/ }
    ];
    const failures = checks
        .filter(({ re }) => !re.test(html))
        .map((c) => c.name);
    if (failures.length) {
        throw new Error(
            `${target.name}: HTML missing hydration markers [${failures.join(', ')}]`
        );
    }
}

async function smokeOne(target) {
    const start = Date.now();
    const child = spawn('pnpm', ['--filter', `./${target.dir}`, 'start'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
            ...process.env,
            PORT: String(target.port),
            NODE_ENV: 'production'
        }
    });

    let stderr = '';
    child.stderr.on('data', (b) => {
        stderr += b.toString();
    });

    try {
        const { body: html } = await waitForReady(target.port);
        assertHydratable(html, target);
        console.log(
            `✓ ${target.name} (:${target.port}) ${Date.now() - start}ms`
        );
        return { ok: true };
    } catch (e) {
        console.error(`✗ ${target.name} (:${target.port}) ${e.message}`);
        if (stderr) console.error(`  stderr: ${stderr.trim().slice(-500)}`);
        return { ok: false, error: e.message };
    } finally {
        child.kill('SIGTERM');
        await delay(200);
        if (!child.killed) child.kill('SIGKILL');
    }
}

async function main() {
    const filter = process.argv[2];
    const targets = filter ? TARGETS.filter((t) => t.name === filter) : TARGETS;
    if (!targets.length) {
        console.error(`No targets match filter "${filter}"`);
        process.exit(2);
    }
    const results = [];
    for (const t of targets) {
        results.push({ target: t, ...(await smokeOne(t)) });
    }
    const failed = results.filter((r) => !r.ok);
    console.log(
        `\nSmoke summary: ${results.length - failed.length}/${results.length} passed`
    );
    if (failed.length) {
        for (const r of failed) console.log(`  - ${r.target.name}: ${r.error}`);
        process.exit(1);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

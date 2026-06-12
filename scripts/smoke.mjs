#!/usr/bin/env node
// Batched smoke runner for production-built Esmx examples.
//
// Runs servers in two parallel groups (standalone + hub-federated micros):
//   - Group "standalone": 6 servers on ports 3000-3005, one set at a time
//   - Group "micro": hub (3000) + 15 remotes on 3001-3015, all at once
// In each group all servers come up concurrently; we then curl each `/`,
// assert it's a hydration-ready HTML document (status 200 + DOCTYPE +
// `<script type="importmap">` + `<script type="module">`), and kill
// the group. Wall-clock dominated by the slowest server in each group,
// not by sum-of-all — what used to take ~25 min sequentially now finishes
// in ~2 min.

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

const STARTUP_TIMEOUT_MS = 60_000;
const POLL_INTERVAL_MS = 500;

async function waitForReady(port) {
    const deadline = Date.now() + STARTUP_TIMEOUT_MS;
    let lastErr = 'connection refused';
    while (Date.now() < deadline) {
        try {
            const res = await fetch(`http://127.0.0.1:${port}/`, {
                signal: AbortSignal.timeout(3000)
            });
            if (res.status === 200) {
                const body = await res.text();
                if (/^\s*<!DOCTYPE/i.test(body)) return body;
            }
            lastErr = `status=${res.status}`;
        } catch (e) {
            lastErr = e.message || String(e);
        }
        await delay(POLL_INTERVAL_MS);
    }
    throw new Error(`not ready in ${STARTUP_TIMEOUT_MS}ms (last: ${lastErr})`);
}

function assertHydratable(html, name) {
    const checks = [
        { what: 'importmap script', re: /<script[^>]*type=["']importmap["']/ },
        { what: 'module entry script', re: /<script[^>]*type=["']module["']/ }
    ];
    const missing = checks
        .filter(({ re }) => !re.test(html))
        .map((c) => c.what);
    if (missing.length) {
        throw new Error(
            `${name}: missing hydration markers [${missing.join(', ')}]`
        );
    }
}

function spawnServer(target) {
    const child = spawn('pnpm', ['--filter', `./${target.dir}`, 'start'], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
            ...process.env,
            PORT: String(target.port),
            NODE_ENV: 'production'
        }
    });
    child._stderr = '';
    child.stderr.on('data', (b) => {
        child._stderr += b.toString();
    });
    // Drain stdout so the child doesn't block on full pipe buffer.
    child.stdout.on('data', () => {});
    return child;
}

async function killAll(children) {
    for (const c of children) {
        if (!c.killed) c.kill('SIGTERM');
    }
    await delay(500);
    for (const c of children) {
        if (!c.killed) c.kill('SIGKILL');
    }
}

async function runGroup(groupName, targets) {
    console.log(
        `\n=== smoke group: ${groupName} (${targets.length} servers) ===`
    );
    const start = Date.now();
    const children = targets.map(spawnServer);
    try {
        const results = await Promise.allSettled(
            targets.map(async (t) => {
                const html = await waitForReady(t.port);
                assertHydratable(html, t.name);
                return { ok: true, target: t };
            })
        );
        let passed = 0;
        const failures = [];
        for (let i = 0; i < results.length; i++) {
            const r = results[i];
            const t = targets[i];
            if (r.status === 'fulfilled') {
                console.log(`✓ ${t.name} (:${t.port})`);
                passed++;
            } else {
                const err = r.reason?.message || String(r.reason);
                console.error(`✗ ${t.name} (:${t.port}) ${err}`);
                const child = children[i];
                if (child._stderr) {
                    console.error(
                        `  stderr: ${child._stderr.trim().slice(-500)}`
                    );
                }
                failures.push({ target: t, error: err });
            }
        }
        console.log(
            `  ${passed}/${targets.length} passed (${Date.now() - start}ms)`
        );
        return failures;
    } finally {
        await killAll(children);
    }
}

async function main() {
    const failures = [];
    failures.push(...(await runGroup('standalone', STANDALONE)));
    failures.push(...(await runGroup('micro (hub + 15 remotes)', MICRO)));

    console.log(
        `\nSmoke summary: ${failures.length === 0 ? 'PASS' : `${failures.length} failure(s)`}`
    );
    if (failures.length) {
        for (const f of failures)
            console.log(`  - ${f.target.name}: ${f.error}`);
        process.exit(1);
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

#!/usr/bin/env node
// Bring up every production-built Esmx example in the background, wait until
// each /  responds with a hydration-ready HTML document, then keep the
// processes alive until the parent receives SIGINT/SIGTERM.
//
// Usage:
//   node scripts/start-all.mjs --group=standalone   # 6 servers (3000-3005)
//   node scripts/start-all.mjs --group=hub          # hub at 3000 only
//   node scripts/start-all.mjs --group=micro        # 16 servers (3000-3015)
//
// The "hub" group implicitly federates remote routes via Esmx module-linking;
// you do NOT need to start the remotes separately to reach /demo/<framework>/.

import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const STANDALONE = [
    { dir: 'examples/ssr-vite-html', port: 3000 },
    { dir: 'examples/ssr-rsbuild-html', port: 3001 },
    { dir: 'examples/ssr-vite-react', port: 3002 },
    { dir: 'examples/ssr-vite-vue', port: 3003 },
    { dir: 'examples/ssr-rsbuild-react', port: 3004 },
    { dir: 'examples/ssr-rsbuild-vue', port: 3005 }
];

const HUB = [{ dir: 'examples/micro-app/ssr-micro-hub', port: 3000 }];

const MICRO = [
    { dir: 'examples/micro-app/ssr-micro-hub', port: 3000 },
    { dir: 'examples/micro-app/ssr-micro-html', port: 3001 },
    { dir: 'examples/micro-app/ssr-micro-lit', port: 3002 },
    { dir: 'examples/micro-app/ssr-micro-vue2', port: 3003 },
    { dir: 'examples/micro-app/ssr-micro-vue3', port: 3004 },
    { dir: 'examples/micro-app/ssr-micro-react', port: 3005 },
    { dir: 'examples/micro-app/ssr-micro-preact', port: 3006 },
    { dir: 'examples/micro-app/ssr-micro-preact-htm', port: 3007 },
    { dir: 'examples/micro-app/ssr-micro-solid', port: 3008 },
    { dir: 'examples/micro-app/ssr-micro-svelte', port: 3009 },
    { dir: 'examples/micro-app/ssr-micro-vite-html', port: 3010 },
    { dir: 'examples/micro-app/ssr-micro-vite-react', port: 3011 },
    { dir: 'examples/micro-app/ssr-micro-vite-vue3', port: 3012 },
    { dir: 'examples/micro-app/ssr-micro-rsbuild-html', port: 3013 },
    { dir: 'examples/micro-app/ssr-micro-rsbuild-react', port: 3014 },
    { dir: 'examples/micro-app/ssr-micro-rsbuild-vue3', port: 3015 }
];

const GROUPS = { standalone: STANDALONE, hub: HUB, micro: MICRO };

function parseArgs() {
    const arg = process.argv.find((a) => a.startsWith('--group='));
    const group = arg ? arg.split('=')[1] : 'hub';
    if (!GROUPS[group]) {
        console.error(
            `Unknown group "${group}". Expected one of: ${Object.keys(GROUPS).join(', ')}`
        );
        process.exit(2);
    }
    return GROUPS[group];
}

async function waitForReady(port, timeoutMs = 30_000) {
    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
        try {
            const res = await fetch(`http://127.0.0.1:${port}/`, {
                signal: AbortSignal.timeout(2000)
            });
            if (res.status === 200) {
                const body = await res.text();
                if (/^\s*<!DOCTYPE/i.test(body)) return;
            }
        } catch {}
        await delay(500);
    }
    throw new Error(
        `server on port ${port} did not become ready in ${timeoutMs}ms`
    );
}

const children = [];

function cleanup() {
    for (const c of children) {
        if (!c.killed) c.kill('SIGTERM');
    }
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

async function main() {
    const targets = parseArgs();
    for (const t of targets) {
        const child = spawn('pnpm', ['--filter', `./${t.dir}`, 'start'], {
            stdio: ['ignore', 'pipe', 'pipe'],
            env: {
                ...process.env,
                PORT: String(t.port),
                NODE_ENV: 'production'
            }
        });
        children.push(child);
    }
    await Promise.all(targets.map((t) => waitForReady(t.port)));
    console.log(`READY ${targets.map((t) => t.port).join(',')}`);
    // Stay alive until killed
    await new Promise(() => {});
}

main().catch((e) => {
    console.error(e);
    cleanup();
    process.exit(1);
});

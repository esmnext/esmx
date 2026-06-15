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
import fs from 'node:fs';
import path from 'node:path';
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
        name: 'ssr-micro-vite-vue3',
        dir: 'examples/micro-app/ssr-micro-vite-vue3',
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
        name: 'ssr-micro-rsbuild-vue3',
        dir: 'examples/micro-app/ssr-micro-rsbuild-vue3',
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
    // Bypass `pnpm --filter X start` (workspace resolution + npm-script overhead
    // is ~5-10s per spawn on CI). Run dist/index.mjs directly with cwd set so
    // esmx can find its dist/server/manifest.json. Each example's dist is
    // already self-contained from `pnpm build:examples`.
    // --import @esmx/core/cli installs the Node ESM loader hook esmx uses for
    // bundler-handled assets (.css side-effect imports → no-op SyntheticModule)
    // and entry.node.ts extension resolution. Without it federation-style
    // imports crash at startup with ERR_UNKNOWN_FILE_EXTENSION.
    const child = spawn(
        process.execPath,
        ['--import', '@esmx/core/cli', 'dist/index.mjs'],
        {
            cwd: target.dir,
            stdio: ['ignore', 'pipe', 'pipe'],
            env: {
                ...process.env,
                PORT: String(target.port),
                NODE_ENV: 'production'
            }
        }
    );
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

// --- Gate 2 (B2): build-artifact chunk-graph assertions ---------------------
//
// Proves what build-free `esmx validate` cannot: that single-owner resolution
// actually collapses each framework runtime to ONE shared copy in the built
// dist, and that coexisting majors (vue@2 vs vue@3) stay isolated.
//
// We read each micro-app's built `dist/client/manifest.json` (`provides` is now
// version-only, e.g. `{ vue: { version } }`) plus the physical framework chunk
// files emitted next to it (`<name>.<hash>.final.mjs` at the top level of
// dist/client). A "framework chunk" is a top-level final-mjs whose base name is
// the bare runtime package (vue / react / react-dom / preact); scoped chunks
// like `@unhead/vue.*.final.mjs` live under a scope dir and are NOT matched.
//
// Invariants asserted per framework:
//   - exactly ONE owner app declares the framework in `provides` AND emits its
//     chunk (the *-shared app);
//   - every other app in that framework's set emits ZERO own chunks for it
//     (externalized to the owner — single-owner intact);
//   - vue@2 and vue@3 resolve to DISTINCT owners/chunks (no cross-major dedupe).
//
// Any violation throws, which `main()` surfaces as a non-zero exit.

const MICRO_APP_ROOT = 'examples/micro-app';

// Each framework: the bare runtime package names whose chunks we track, the
// sole expected owner, the expected provided major, and the consumer apps that
// must ship zero own copies.
const FRAMEWORK_OWNERSHIP = [
    {
        framework: 'vue@3',
        pkg: 'vue',
        chunkNames: ['vue'],
        owner: 'ssr-micro-vue3-shared',
        major: 3,
        consumers: [
            'ssr-micro-vue3',
            'ssr-micro-vite-vue3',
            'ssr-micro-rsbuild-vue3'
        ]
    },
    {
        framework: 'vue@2',
        pkg: 'vue',
        chunkNames: ['vue'],
        owner: 'ssr-micro-vue2',
        major: 2,
        consumers: []
    },
    {
        framework: 'react',
        pkg: 'react',
        chunkNames: ['react', 'react-dom'],
        owner: 'ssr-micro-react-shared',
        major: 19,
        consumers: [
            'ssr-micro-react',
            'ssr-micro-vite-react',
            'ssr-micro-rsbuild-react'
        ]
    },
    {
        framework: 'preact',
        pkg: 'preact',
        chunkNames: ['preact'],
        owner: 'ssr-micro-preact-shared',
        major: 10,
        consumers: ['ssr-micro-preact', 'ssr-micro-preact-htm']
    }
];

function readManifest(app) {
    const file = path.join(MICRO_APP_ROOT, app, 'dist/client/manifest.json');
    if (!fs.existsSync(file)) {
        throw new Error(
            `${app}: missing dist/client/manifest.json — run \`pnpm build:examples\` first`
        );
    }
    return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

// Top-level framework chunk files in dist/client matching `<name>.<hash>.final.mjs`
// for any of the given bare package names. Returns the matched file names.
function frameworkChunkFiles(app, chunkNames) {
    const dir = path.join(MICRO_APP_ROOT, app, 'dist/client');
    if (!fs.existsSync(dir)) return [];
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    const matchers = chunkNames.map(
        (n) =>
            new RegExp(
                `^${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\.[a-f0-9]+\\.final\\.mjs$`
            )
    );
    return entries
        .filter((e) => e.isFile())
        .map((e) => e.name)
        .filter((name) => matchers.some((re) => re.test(name)));
}

function majorOf(version) {
    const m = /^(\d+)\./.exec(String(version ?? ''));
    return m ? Number(m[1]) : null;
}

function assertChunkGraph() {
    console.log('\n=== smoke gate B2: build-artifact chunk-graph ===');
    const errors = [];
    // Record (framework -> owner chunk file names) to verify cross-major isolation.
    const ownerChunks = {};

    for (const spec of FRAMEWORK_OWNERSHIP) {
        // 1. Owner must declare the framework in `provides` at the expected major
        //    AND physically emit its chunk(s).
        const ownerManifest = readManifest(spec.owner);
        const provided = ownerManifest.provides?.[spec.pkg];
        if (!provided) {
            errors.push(
                `${spec.framework}: owner ${spec.owner} does not declare \`${spec.pkg}\` in provides`
            );
        } else if (majorOf(provided.version) !== spec.major) {
            errors.push(
                `${spec.framework}: owner ${spec.owner} provides ${spec.pkg}@${provided.version} (major ${majorOf(provided.version)}), expected major ${spec.major}`
            );
        }

        const ownerEmitted = frameworkChunkFiles(spec.owner, spec.chunkNames);
        if (ownerEmitted.length === 0) {
            errors.push(
                `${spec.framework}: owner ${spec.owner} emits ZERO framework chunks [${spec.chunkNames.join(', ')}] — single-owner provider broken`
            );
        }
        ownerChunks[spec.framework] = ownerEmitted;

        // 2. Every consumer must externalize: empty/absent provides for this pkg
        //    AND zero own framework chunks.
        for (const consumer of spec.consumers) {
            const cManifest = readManifest(consumer);
            if (cManifest.provides?.[spec.pkg]) {
                errors.push(
                    `${spec.framework}: consumer ${consumer} re-declares \`${spec.pkg}\` in provides — single-owner broken (should externalize to ${spec.owner})`
                );
            }
            const cEmitted = frameworkChunkFiles(consumer, spec.chunkNames);
            if (cEmitted.length > 0) {
                errors.push(
                    `${spec.framework}: consumer ${consumer} ships its OWN framework copy [${cEmitted.join(', ')}] — single-owner resolution regressed`
                );
            }
        }

        const consumerNote = spec.consumers.length
            ? `${spec.consumers.length} consumer(s) externalized`
            : 'no consumers';
        console.log(
            `  ${spec.framework}: owner ${spec.owner} emits [${ownerEmitted.join(', ') || 'NONE'}], ${consumerNote}`
        );
    }

    // 3. Cross-major isolation: vue@2 and vue@3 must be distinct chunks/owners,
    //    i.e. vue@2 was NOT deduped onto the vue@3 owner.
    const vue2 = ownerChunks['vue@2'] ?? [];
    const vue3 = ownerChunks['vue@3'] ?? [];
    const overlap = vue2.filter((f) => vue3.includes(f));
    if (overlap.length > 0) {
        errors.push(
            `cross-major: vue@2 and vue@3 share chunk file(s) [${overlap.join(', ')}] — majors collapsed`
        );
    }
    if (vue2.length > 0 && vue3.length > 0) {
        console.log(
            `  cross-major: vue@2 [${vue2.join(', ')}] ⟂ vue@3 [${vue3.join(', ')}] (distinct)`
        );
    }

    if (errors.length) {
        for (const e of errors) console.error(`  ✗ ${e}`);
        throw new Error(
            `chunk-graph gate B2 failed with ${errors.length} violation(s)`
        );
    }
    console.log('  ✓ single-owner intact; majors isolated');
}

async function main() {
    // Gate 2 (B2): static post-build chunk-graph assertions. No servers needed;
    // runs first so a single-owner regression fails fast before booting servers.
    assertChunkGraph();

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

#!/usr/bin/env node
// Gate 5 — the agent one-shot test (RFC 0001 §10).
//
// Falsifiable proof of the AI-era thesis: given ONLY the JSON Schema + the
// agent-facing llms.md, a model authors a correct `esmx` declaration, judged
// SOLELY by `esmx validate --json`'s exit status (never by human reading).
// Two measurements per role:
//   - AUTHORING: model writes a declaration from a scenario → validate must
//     accept it (exit 0) on the first attempt.
//   - REPAIR: each validate-emitted, declaration-repairable code is induced,
//     its structured diagnostic is fed back → the model must repair it so
//     validate accepts, in one follow-up.
//
// Pass bars (RFC §10): authoring ≥9/10 per role; repair ≥8/10 per code.
//
// The model is PLUGGABLE via the ESMX_GATE5_MODEL env var:
//   - `stub`  — built-in canned responses; proves the harness itself works
//               with no external model (default).
//   - `kimi`  — runs `kimi -p <prompt>` (print mode).
//   - any other value is treated as a shell command receiving the prompt on
//     argv ($1) and emitting the completion on stdout.
// TRIALS overrides the per-role/per-code trial count (default 10).

import { execFile } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const REPO = path.resolve(fileURLToPath(import.meta.url), '../..');
const ESMX_CLI = path.join(REPO, 'packages/core/dist/cli/index.mjs');
const MODEL = process.env.ESMX_GATE5_MODEL ?? 'stub';
const TRIALS = Number(process.env.TRIALS ?? 10);
const AUTHOR_BAR = 0.9;
const REPAIR_BAR = 0.8;

// ── Agent context: the ONLY material a real model is given ──────────────────
function agentContext() {
    const schema = path.join(REPO, 'packages/core/src/declaration/schema.ts');
    const llms = path.join(REPO, 'examples/docs/src/en/llms.md');
    return {
        schema: fs.readFileSync(schema, 'utf-8'),
        llms: fs.readFileSync(llms, 'utf-8')
    };
}

// ── Model adapter ───────────────────────────────────────────────────────────
// A model call returns ONLY the JSON object intended for the package.json
// `esmx` field (the harness writes it into the scratch module + validates).
async function callModel(prompt, stubValue) {
    if (MODEL === 'stub') {
        return stubValue ?? STUB.default;
    }
    const cmd = MODEL === 'kimi' ? 'kimi' : MODEL;
    // `kimi -p` is non-interactive print mode (it rejects --yolo).
    const args = MODEL === 'kimi' ? ['-p', prompt] : [prompt];
    const { stdout } = await execFileAsync(cmd, args, {
        maxBuffer: 8 * 1024 * 1024
    });
    return extractJson(stdout);
}

// Return the LAST top-level JSON object in a completion — agentic CLIs often
// think-then-answer (the JSON appears in reasoning first) and print a trailing
// session footer, so the final balanced object is the actual answer.
function extractJson(text) {
    const objects = [];
    let depth = 0;
    let start = -1;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '{') {
            if (depth === 0) start = i;
            depth++;
        } else if (text[i] === '}' && depth > 0 && --depth === 0) {
            objects.push(text.slice(start, i + 1));
        }
    }
    for (let i = objects.length - 1; i >= 0; i--) {
        try {
            return JSON.parse(objects[i]);
        } catch {}
    }
    throw new Error('model returned no parseable JSON object');
}

// ── Scratch workspace + the validate judge ──────────────────────────────────
// Lays out `<ws>/node_modules/<dep>` for each surrounding module and a target
// module whose `esmx` field is filled by the model, then runs the real
// `esmx validate --json` with cwd = target. Pass = zero error-severity
// diagnostics (exit 0) — the machine judge, never human reading.
function writeModule(dir, pkg, { built, noSources } = {}) {
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
        path.join(dir, 'package.json'),
        JSON.stringify(pkg, null, 4)
    );
    // Auto-create declared entry/exports targets so they satisfy the
    // E_TARGET_MISSING existence check — unless `noSources` (used to induce
    // E_TARGET_MISSING and to judge a repair that must point at a real file).
    if (!noSources) {
        for (const target of declaredTargets(pkg.esmx)) {
            const file = path.resolve(dir, target);
            fs.mkdirSync(path.dirname(file), { recursive: true });
            if (!fs.existsSync(file)) fs.writeFileSync(file, '');
        }
    }
    if (built) {
        const cdir = path.join(dir, 'dist/client');
        fs.mkdirSync(cdir, { recursive: true });
        fs.writeFileSync(path.join(cdir, 'manifest.json'), '{"protocol":2}');
    }
}

function touchFile(dir, relativePath) {
    const file = path.resolve(dir, relativePath);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file)) fs.writeFileSync(file, '');
}

function declaredTargets(esmx) {
    if (!esmx || typeof esmx !== 'object') return [];
    const out = [];
    for (const side of Object.values(esmx.entry ?? {})) {
        if (typeof side === 'string') out.push(side);
    }
    for (const value of Object.values(esmx.exports ?? {})) {
        if (typeof value === 'string') out.push(value);
        else if (value && typeof value === 'object') {
            for (const side of Object.values(value)) {
                if (typeof side === 'string') out.push(side);
            }
        }
    }
    return out;
}

function makeWorkspace(scenario, esmxField) {
    const ws = fs.realpathSync(
        fs.mkdtempSync(path.join(os.tmpdir(), 'esmx-gate5-'))
    );
    for (const dep of scenario.deps ?? []) {
        writeModule(path.join(ws, 'node_modules', dep.name), dep.pkg, {
            built: dep.built ?? true
        });
        if (dep.installs) {
            for (const [pkgName, version] of Object.entries(dep.installs)) {
                writeModule(
                    path.join(
                        ws,
                        'node_modules',
                        dep.name,
                        'node_modules',
                        pkgName
                    ),
                    { name: pkgName, version }
                );
            }
        }
    }
    const targetDir = path.join(ws, 'target');
    writeModule(
        targetDir,
        {
            name: scenario.targetName,
            version: '1.0.0',
            ...scenario.targetExtra,
            esmx: esmxField
        },
        { noSources: scenario.targetNoSources }
    );
    for (const relativePath of scenario.realFiles ?? []) {
        touchFile(targetDir, relativePath);
    }
    for (const [pkgName, version] of Object.entries(scenario.installs ?? {})) {
        writeModule(path.join(targetDir, 'node_modules', pkgName), {
            name: pkgName,
            version
        });
    }
    return { ws, targetDir };
}

async function judge(targetDir) {
    // The machine judge IS the exit status (RFC §10): `esmx validate` exits
    // non-zero iff an error-severity diagnostic is present (warnings exit 0).
    // The --json envelope conveys severity via that exit code, not a field —
    // so a clean exit is the pass, and a non-zero exit's stdout lists the
    // offending diagnostics (for reporting which code failed).
    try {
        await execFileAsync('node', [ESMX_CLI, 'validate', '--json'], {
            cwd: targetDir,
            maxBuffer: 8 * 1024 * 1024
        });
        return { pass: true, errors: [] };
    } catch (e) {
        const out = e.stdout ? safeJson(e.stdout) : null;
        const errors = out?.diagnostics ?? [
            { code: 'E_VALIDATE_CRASH', message: String(e) }
        ];
        return { pass: false, errors };
    }
}

function safeJson(s) {
    try {
        return JSON.parse(s);
    } catch {
        return null;
    }
}

// ── Roles / scenarios ────────────────────────────────────────────────────────
const SCENARIOS = {
    provider: {
        targetName: 'shared',
        task: 'Author the `esmx` field for a module named "shared" that has a client+server entry, provides the bare package "vue", and exposes one logical export "./ui" → "./src/ui.ts".',
        installs: { vue: '3.5.13' }
    },
    consumer: {
        targetName: 'cart',
        targetExtra: { dependencies: { shared: '^1.0.0' } },
        task: 'Author the `esmx` field for a module "cart" that has a client+server entry, USES the mounted module "shared", and exposes one export "./widget" → "./src/widget.ts". It does not provide any bare package.',
        deps: [
            {
                name: 'shared',
                pkg: {
                    name: 'shared',
                    version: '1.2.0',
                    esmx: {
                        entry: {
                            client: './src/entry.client.ts',
                            server: './src/entry.server.ts'
                        },
                        provides: ['vue']
                    }
                },
                installs: { vue: '3.5.13' }
            }
        ]
    },
    composer: {
        targetName: 'host',
        targetExtra: { dependencies: { shared: '^1.0.0', cart: '^1.0.0' } },
        task: 'Author the `esmx` field for a composer module "host" with a client+server entry that USES both mounted modules "shared" and "cart". It provides nothing and exports nothing.',
        deps: [
            {
                name: 'shared',
                pkg: {
                    name: 'shared',
                    version: '1.2.0',
                    esmx: {
                        entry: {
                            client: './src/entry.client.ts',
                            server: './src/entry.server.ts'
                        },
                        provides: ['vue']
                    }
                },
                installs: { vue: '3.5.13' }
            },
            {
                name: 'cart',
                pkg: {
                    name: 'cart',
                    version: '1.0.0',
                    esmx: {
                        entry: {
                            client: './src/entry.client.ts',
                            server: './src/entry.server.ts'
                        },
                        uses: ['shared']
                    }
                }
            }
        ]
    }
};

function authorPrompt(ctx, scenario) {
    return [
        'You are authoring an esmx module declaration. Output ONLY the JSON object for the package.json "esmx" field — no prose, no code fence.',
        '',
        '## JSON Schema',
        ctx.schema,
        '',
        '## Authoring guide (llms.md)',
        ctx.llms,
        '',
        '## Task',
        scenario.task
    ].join('\n');
}

// ── Stub model: canned correct declarations (proves the harness) ────────────
const STUB = {
    provider: {
        entry: {
            client: './src/entry.client.ts',
            server: './src/entry.server.ts'
        },
        provides: ['vue'],
        exports: { './ui': './src/ui.ts' }
    },
    consumer: {
        entry: {
            client: './src/entry.client.ts',
            server: './src/entry.server.ts'
        },
        uses: ['shared'],
        exports: { './widget': './src/widget.ts' }
    },
    composer: {
        entry: {
            client: './src/entry.client.ts',
            server: './src/entry.server.ts'
        },
        uses: ['shared', 'cart']
    },
    default: { entry: { client: './src/entry.client.ts' } }
};

// ── Repair: induce each validate-emitted, declaration-repairable code, then
//    feed the structured diagnostic back and require a one-shot fix that
//    validate accepts. (E_VERSION/E_NOT_BUILT/E_PROTOCOL are excluded — they
//    are not fixable by editing the `esmx` field alone.) ──────────────────────
const ENTRY = {
    client: './src/entry.client.ts',
    server: './src/entry.server.ts'
};

const INDUCE = [
    {
        code: 'E_TARGET_MISSING',
        task: 'A declared entry/exports target points at a file that does not exist. The module has a real source file at ./src/entry.client.ts. Fix the path.',
        scenario: {
            targetName: 'm',
            targetNoSources: true,
            realFiles: ['./src/entry.client.ts']
        },
        broken: { entry: { client: './src/entry.clientt.ts' } }
    },
    {
        code: 'E_DUP_PROVIDER',
        task: 'A shared package has two owners: this module provides "vue" and so does the used module "base". Give it a single owner.',
        scenario: {
            targetName: 'm',
            installs: { vue: '3.5.13' },
            deps: [
                {
                    name: 'base',
                    pkg: {
                        name: 'base',
                        version: '1.0.0',
                        esmx: { entry: ENTRY, provides: ['vue'] }
                    },
                    installs: { vue: '3.5.13' }
                }
            ]
        },
        broken: { entry: ENTRY, uses: ['base'], provides: ['vue'] }
    },
    {
        code: 'E_NOT_LINKED',
        task: 'This module uses a module that is not mounted.',
        scenario: { targetName: 'm' },
        broken: { entry: ENTRY, uses: ['ghost'] }
    },
    {
        code: 'E_SCHEMA',
        task: 'The declaration has an invalid/unknown field.',
        scenario: { targetName: 'm' },
        broken: { entry: ENTRY, bogusKey: 1 }
    },
    {
        code: 'E_CYCLE',
        task: 'A module this one uses sits in a uses cycle (a ↔ b). Stop using the cycling subtree.',
        scenario: {
            targetName: 'm',
            deps: [
                {
                    name: 'a',
                    pkg: {
                        name: 'a',
                        version: '1.0.0',
                        esmx: { entry: ENTRY, uses: ['b'] }
                    }
                },
                {
                    name: 'b',
                    pkg: {
                        name: 'b',
                        version: '1.0.0',
                        esmx: { entry: ENTRY, uses: ['a'] }
                    }
                }
            ]
        },
        broken: { entry: ENTRY, uses: ['a'] }
    }
];

const STUB_REPAIR = {
    E_TARGET_MISSING: { entry: { client: './src/entry.client.ts' } },
    E_DUP_PROVIDER: { entry: ENTRY, uses: ['base'] },
    E_NOT_LINKED: { entry: ENTRY },
    E_SCHEMA: { entry: ENTRY },
    E_CYCLE: { entry: ENTRY }
};

function repairPrompt(ctx, broken, diagnostics, task) {
    return [
        'You are repairing an esmx module declaration that failed validation. Output ONLY the corrected JSON object for the package.json "esmx" field — no prose, no code fence.',
        '',
        '## JSON Schema',
        ctx.schema,
        '',
        '## Authoring guide (llms.md)',
        ctx.llms,
        '',
        '## The declaration that failed',
        JSON.stringify(broken, null, 2),
        '',
        '## Validator diagnostics (esmx validate --json)',
        diagnostics
            .map((d) => `- [${d.code}] ${d.message}\n  fix: ${d.fix}`)
            .join('\n'),
        '',
        '## Task',
        task
    ].join('\n');
}

// ── Run ──────────────────────────────────────────────────────────────────────
async function runAuthoring(role) {
    const ctx = agentContext();
    const scenario = SCENARIOS[role];
    let pass = 0;
    const fails = [];
    for (let i = 0; i < TRIALS; i++) {
        let esmxField;
        try {
            esmxField = await callModel(
                authorPrompt(ctx, scenario),
                STUB[role]
            );
        } catch (e) {
            fails.push(`trial ${i}: model error ${e.message}`);
            continue;
        }
        const { ws, targetDir } = makeWorkspace(scenario, esmxField);
        const verdict = await judge(targetDir);
        fs.rmSync(ws, { recursive: true, force: true });
        if (verdict.pass) pass++;
        else
            fails.push(
                `trial ${i}: ${verdict.errors.map((e) => e.code).join(',')}`
            );
    }
    return { role, pass, total: TRIALS, fails };
}

async function runRepair(item) {
    const ctx = agentContext();
    // Induce: confirm the broken declaration actually emits the target code.
    const induced = makeWorkspace(item.scenario, item.broken);
    const before = await judge(induced.targetDir);
    fs.rmSync(induced.ws, { recursive: true, force: true });
    const diag = before.errors.filter((e) => e.code === item.code);
    if (diag.length === 0) {
        const got = before.errors.map((e) => e.code).join(',') || 'none';
        return { code: item.code, induced: false, note: got };
    }
    let pass = 0;
    const fails = [];
    for (let i = 0; i < TRIALS; i++) {
        let fixed;
        try {
            fixed = await callModel(
                repairPrompt(ctx, item.broken, diag, item.task),
                STUB_REPAIR[item.code]
            );
        } catch (e) {
            fails.push(`trial ${i}: model error ${e.message}`);
            continue;
        }
        const ws = makeWorkspace(item.scenario, fixed);
        const verdict = await judge(ws.targetDir);
        fs.rmSync(ws.ws, { recursive: true, force: true });
        if (verdict.pass) pass++;
        else
            fails.push(
                `trial ${i}: ${verdict.errors.map((e) => e.code).join(',') || '?'}`
            );
    }
    return { code: item.code, induced: true, pass, total: TRIALS, fails };
}

async function main() {
    console.log(
        `\n=== Gate 5 — agent one-shot test (model: ${MODEL}, ${TRIALS} trials) ===\n`
    );
    if (!fs.existsSync(ESMX_CLI)) {
        console.error(
            `esmx CLI not built at ${ESMX_CLI}; run pnpm build:packages`
        );
        process.exit(2);
    }

    const results = [];
    for (const role of ['provider', 'consumer', 'composer']) {
        results.push(await runAuthoring(role));
    }

    let allPass = true;
    console.log('Authoring (bar ≥90% accepted by `esmx validate --json`):');
    for (const r of results) {
        const rate = r.pass / r.total;
        const ok = rate >= AUTHOR_BAR;
        allPass &&= ok;
        console.log(
            `  ${ok ? '✓' : '✗'} ${r.role.padEnd(9)} ${r.pass}/${r.total}` +
                (r.fails.length
                    ? `  fails: ${r.fails.slice(0, 3).join(' | ')}`
                    : '')
        );
    }

    console.log(
        '\nRepair (bar ≥80% fixed from the structured diagnostic, one follow-up):'
    );
    for (const item of INDUCE) {
        const r = await runRepair(item);
        if (!r.induced) {
            allPass = false;
            console.log(
                `  ✗ ${r.code.padEnd(18)} induce failed (got ${r.note})`
            );
            continue;
        }
        const ok = r.pass / r.total >= REPAIR_BAR;
        allPass &&= ok;
        console.log(
            `  ${ok ? '✓' : '✗'} ${r.code.padEnd(18)} ${r.pass}/${r.total}` +
                (r.fails.length
                    ? `  fails: ${r.fails.slice(0, 2).join(' | ')}`
                    : '')
        );
    }

    console.log(
        `\nGate 5: ${allPass ? 'PASS' : 'FAIL'}` +
            (MODEL === 'stub'
                ? '  (stub model — harness self-check only; set ESMX_GATE5_MODEL=kimi for a real trial)'
                : '')
    );
    process.exit(allPass ? 0 : 1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

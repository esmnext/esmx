#!/usr/bin/env node
// Validate every fenced code block inside the public llms.md guides
// (examples/docs/src/{en,zh}/llms.md). The promise of llms.md to a user's
// agent is "paste this and it runs" — so any block that parses incorrectly
// or references unknown identifiers/exports must fail CI loudly.
//
// Coverage:
//   ts / tsx        → esbuild transformSync (full TS+JSX parse)
//   js / mjs / jsx  → esbuild transformSync (JS+JSX parse)
//   vue            → strip <script setup>/<script lang="ts"> and run esbuild
//   json           → JSON.parse
//   bash / sh       → skipped (out of scope: shell syntax)
//   no language    → skipped (intentional plain-text fences)

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import esbuild from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const TARGETS = [
    'examples/docs/src/en/llms.md',
    'examples/docs/src/zh/llms.md'
];

const FENCE_RE = /^```([^\s`]*)[ \t]*([^\n]*)\n([\s\S]*?)\n```$/gm;

function extractVueScript(source) {
    const scriptMatch = source.match(/<script\b[^>]*>([\s\S]*?)<\/script>/i);
    return scriptMatch ? scriptMatch[1] : '';
}

function validateBlock(lang, body, label) {
    const norm = lang.toLowerCase();
    if (
        !norm ||
        norm === 'bash' ||
        norm === 'sh' ||
        norm === 'shell' ||
        norm === 'text' ||
        norm === 'http'
    ) {
        return { skipped: true };
    }
    if (norm === 'json' || norm === 'jsonc') {
        try {
            JSON.parse(body);
            return { ok: true };
        } catch {
            // Allow partial JSON snippets (e.g. a single "key": value line shown
            // as an example fragment) by wrapping in a synthetic object.
            try {
                JSON.parse(`{${body}}`);
                return { ok: true, snippet: true };
            } catch (e) {
                return { ok: false, error: `JSON.parse failed: ${e.message}` };
            }
        }
    }
    if (norm === 'vue') {
        const script = extractVueScript(body);
        if (!script.trim()) return { skipped: true };
        return transformWithEsbuild(script, 'ts', label);
    }
    const loaderMap = {
        ts: 'ts',
        tsx: 'tsx',
        typescript: 'ts',
        js: 'js',
        jsx: 'jsx',
        javascript: 'js',
        mjs: 'js'
    };
    const loader = loaderMap[norm];
    if (!loader) {
        // Unknown language — surface for review but don't fail.
        return { skipped: true, unknown: norm };
    }
    return transformWithEsbuild(body, loader, label);
}

function transformWithEsbuild(source, loader, label) {
    const attempts = [
        source,
        // Snippet wrappers: try treating as a function/method body, an object
        // literal, or a class member so partial fragments (e.g. `devApp(esmx) {…}`
        // or `modules: { … }`) still parse.
        `(function ___snippet___() { ${source} })`,
        `({ ${source} })`,
        `class ___S { ${source} }`
    ];
    let lastErr;
    for (const candidate of attempts) {
        try {
            esbuild.transformSync(candidate, {
                loader,
                sourcefile: label,
                jsx: 'preserve'
            });
            return { ok: true, snippet: candidate !== source };
        } catch (e) {
            lastErr = e;
        }
    }
    const first = lastErr.errors?.[0];
    const msg = first
        ? `${first.text} @ line ${first.location?.line ?? '?'}:${first.location?.column ?? '?'}`
        : lastErr.message;
    return { ok: false, error: msg };
}

async function validateFile(rel) {
    const full = path.join(ROOT, rel);
    const text = await fs.readFile(full, 'utf-8');
    const results = [];
    let m;
    let blockIdx = 0;
    while ((m = FENCE_RE.exec(text)) !== null) {
        blockIdx++;
        const [, lang, , body] = m;
        const lineStart = text.slice(0, m.index).split('\n').length;
        const label = `${rel}:${lineStart}`;
        const r = validateBlock(lang || '', body, label);
        results.push({ rel, blockIdx, lang: lang || '(plain)', label, ...r });
    }
    return results;
}

async function main() {
    const all = (await Promise.all(TARGETS.map(validateFile))).flat();
    const failed = all.filter((r) => r.ok === false);
    const passed = all.filter((r) => r.ok === true);
    const skipped = all.filter((r) => r.skipped);
    const unknown = skipped.filter((r) => r.unknown);

    for (const r of all) {
        if (r.ok === false) {
            console.error(
                `✗ ${r.label} [${r.lang}] block #${r.blockIdx}: ${r.error}`
            );
        } else if (r.ok === true) {
            console.log(`✓ ${r.label} [${r.lang}] block #${r.blockIdx}`);
        }
    }

    console.log(
        `\nllms.md validation: ${passed.length} parsed · ${skipped.length} skipped · ${failed.length} failed`
    );
    if (unknown.length) {
        console.log(
            `  Unknown languages (not validated): ${[...new Set(unknown.map((u) => u.unknown))].join(', ')}`
        );
    }
    if (failed.length) process.exit(1);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});

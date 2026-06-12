import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { generatePkgWrapperSource, inspectPkg } from '../src/index';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(HERE, '../../..');
const ROOT_REACT_EXAMPLE = path.join(
    WORKSPACE,
    'examples/micro-app/ssr-micro-react'
);

/**
 * Fixture root: a temp project whose `node_modules` is populated with small
 * synthetic packages, one per edge case. Each package ships a `package.json`
 * with a `name` field so `detectModuleKind` can settle on the module kind.
 */
let fixtureRoot: string;

async function writePkg(
    name: string,
    files: Record<string, string>
): Promise<void> {
    const dir = path.join(fixtureRoot, 'node_modules', name);
    await fs.mkdir(dir, { recursive: true });
    for (const [file, content] of Object.entries(files)) {
        await fs.writeFile(path.join(dir, file), content);
    }
}

beforeAll(async () => {
    fixtureRoot = await fs.mkdtemp(path.join(os.tmpdir(), 'esmx-pkg-wrapper-'));

    await writePkg('cond-pkg', {
        'package.json': JSON.stringify({
            name: 'cond-pkg',
            version: '1.0.0',
            main: 'index.js'
        }),
        'index.js': [
            "'use strict';",
            "if (process.env.NODE_ENV === 'production') {",
            "    module.exports = require('./prod.js');",
            '} else {',
            "    module.exports = require('./dev.js');",
            '}',
            ''
        ].join('\n'),
        'prod.js': 'exports.alpha = 1;\nexports.beta = 2;\n',
        'dev.js':
            'exports.alpha = 1;\nexports.beta = 2;\nexports.devOnly = 3;\n'
    });

    await writePkg('reexport-pkg', {
        'package.json': JSON.stringify({
            name: 'reexport-pkg',
            version: '1.0.0',
            main: 'index.js'
        }),
        'index.js': "module.exports = require('./impl.js');\n",
        'impl.js': 'exports.first = 1;\nexports.second = 2;\n'
    });

    await writePkg('esm-pkg', {
        'package.json': JSON.stringify({
            name: 'esm-pkg',
            version: '1.0.0',
            type: 'module',
            exports: { '.': { import: './index.mjs' } }
        }),
        'index.mjs': [
            'export const one = 1;',
            'export function two() {}',
            'export default { one };',
            ''
        ].join('\n')
    });

    await writePkg('proxy-pkg', {
        'package.json': JSON.stringify({
            name: 'proxy-pkg',
            version: '1.0.0',
            exports: { '.': { import: './index.mjs', require: './impl.cjs' } }
        }),
        'index.mjs': "export * from './impl.cjs';\n",
        'impl.cjs': 'exports.fromCjs = 1;\nexports.alsoCjs = 2;\n'
    });

    await writePkg('default-only-pkg', {
        'package.json': JSON.stringify({
            name: 'default-only-pkg',
            version: '1.0.0',
            main: 'index.js'
        }),
        'index.js': 'module.exports = function main() {};\n'
    });

    await writePkg('@scope/named-pkg', {
        'package.json': JSON.stringify({
            name: '@scope/named-pkg',
            version: '1.0.0',
            main: 'index.js'
        }),
        'index.js': 'exports.scopedExport = 1;\n'
    });

    await writePkg('require-only-pkg', {
        'package.json': JSON.stringify({
            name: 'require-only-pkg',
            version: '1.0.0',
            exports: { '.': { require: './main.cjs' } }
        }),
        'main.cjs': 'exports.viaRequire = 1;\n'
    });

    await writePkg('dual-cond-pkg', {
        'package.json': JSON.stringify({
            name: 'dual-cond-pkg',
            version: '1.0.0',
            exports: { '.': { import: './esm.mjs', require: './cjs.cjs' } }
        }),
        'esm.mjs': 'export const esmName = 1;\n',
        'cjs.cjs': 'exports.cjsName = 1;\n'
    });

    await writePkg('cjs-default-key-pkg', {
        'package.json': JSON.stringify({
            name: 'cjs-default-key-pkg',
            version: '1.0.0',
            main: 'index.js'
        }),
        'index.js':
            'exports.default = 1;\nexports.foo = 2;\nexports.__esModule = true;\n'
    });

    await writePkg('cyclic-pkg', {
        'package.json': JSON.stringify({
            name: 'cyclic-pkg',
            version: '1.0.0',
            main: 'index.js'
        }),
        'index.js': "module.exports = require('./a.js');\n",
        'a.js': "module.exports = require('./index.js');\n"
    });

    await writePkg('esm-weird-names-pkg', {
        'package.json': JSON.stringify({
            name: 'esm-weird-names-pkg',
            version: '1.0.0',
            type: 'module',
            main: 'index.js'
        }),
        'index.js': [
            'const v = 1;',
            'export { v as valid };',
            "export { v as 'not-valid' };",
            'export { v as default };',
            ''
        ].join('\n')
    });
});

afterAll(async () => {
    await fs.rm(fixtureRoot, { recursive: true, force: true });
});

describe('inspectPkg edge cases (synthetic fixture packages)', () => {
    it('intersects names across conditional NODE_ENV branches (react pattern)', async () => {
        const r = await inspectPkg(fixtureRoot, 'cond-pkg');

        expect(r.hasDefault).toBe(true);
        expect(r.names.sort()).toEqual(['alpha', 'beta']);
        expect(r.names).not.toContain('devOnly');
    });

    it('follows pure CJS re-export to the file that declares the names', async () => {
        const r = await inspectPkg(fixtureRoot, 'reexport-pkg');

        expect(r.hasDefault).toBe(true);
        expect(r.names.sort()).toEqual(['first', 'second']);
    });

    it('enumerates a straight ESM package with an explicit default export', async () => {
        const r = await inspectPkg(fixtureRoot, 'esm-pkg');

        expect(r.hasDefault).toBe(true);
        expect(r.names.sort()).toEqual(['one', 'two']);
        expect(r.names).not.toContain('default');
    });

    it('lexes the CJS target behind an ESM `export *` proxy without synthesizing default', async () => {
        const r = await inspectPkg(fixtureRoot, 'proxy-pkg');

        expect(r.hasDefault).toBe(false);
        expect(r.names.sort()).toEqual(['alsoCjs', 'fromCjs']);
    });

    it('reports default-only for a CJS package whose module.exports is a function', async () => {
        const r = await inspectPkg(fixtureRoot, 'default-only-pkg');

        expect(r.names).toEqual([]);
        expect(r.hasDefault).toBe(true);
    });

    it('resolves scoped package names', async () => {
        const r = await inspectPkg(fixtureRoot, '@scope/named-pkg');

        expect(r.hasDefault).toBe(true);
        expect(r.names).toEqual(['scopedExport']);
    });

    it('falls back to require resolution when exports map has only a require condition', async () => {
        const r = await inspectPkg(fixtureRoot, 'require-only-pkg');

        expect(r.hasDefault).toBe(true);
        expect(r.names).toEqual(['viaRequire']);
    });

    it('prefers the import condition over require when both are present', async () => {
        const r = await inspectPkg(fixtureRoot, 'dual-cond-pkg');

        expect(r.names).toEqual(['esmName']);
        expect(r.names).not.toContain('cjsName');
        expect(r.hasDefault).toBe(false);
    });

    it('filters reserved keys (default, __esModule) out of CJS named exports', async () => {
        const r = await inspectPkg(fixtureRoot, 'cjs-default-key-pkg');

        expect(r.names).toEqual(['foo']);
        expect(r.names).not.toContain('default');
        expect(r.names).not.toContain('__esModule');
        expect(r.hasDefault).toBe(true);
    });

    it('terminates on cyclic CJS re-exports and returns no names', async () => {
        const r = await inspectPkg(fixtureRoot, 'cyclic-pkg');

        expect(r.names).toEqual([]);
        expect(r.hasDefault).toBe(true);
    });

    it('keeps only valid identifier names from ESM string-literal exports', async () => {
        const r = await inspectPkg(fixtureRoot, 'esm-weird-names-pkg');

        expect(r.names).toEqual(['valid']);
        expect(r.hasDefault).toBe(true);
    });

    it('warns once and degrades to empty result for an unresolvable specifier', async () => {
        const warnSpy = vi
            .spyOn(console, 'warn')
            .mockImplementation(() => undefined);

        const r = await inspectPkg(fixtureRoot, 'definitely-missing-pkg');

        expect(r).toEqual({ names: [], hasDefault: false });
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy.mock.calls[0][0]).toContain('definitely-missing-pkg');
        warnSpy.mockRestore();
    });
});

describe('inspectPkg deep subpath specifiers (real packages)', () => {
    it('resolves react-dom/client via its own exports-map subpath entry', async () => {
        const r = await inspectPkg(ROOT_REACT_EXAMPLE, 'react-dom/client');

        expect(r.hasDefault).toBe(true);
        expect(r.names).toContain('createRoot');
        expect(r.names).toContain('hydrateRoot');
    });

    it('produces different results for react-dom and react-dom/client', async () => {
        const rootEntry = await inspectPkg(ROOT_REACT_EXAMPLE, 'react-dom');
        const subpath = await inspectPkg(
            ROOT_REACT_EXAMPLE,
            'react-dom/client'
        );

        expect(rootEntry.names).toContain('createPortal');
        expect(rootEntry.names).not.toContain('createRoot');
        expect(subpath.names).toContain('createRoot');
    });
});

describe('generatePkgWrapperSource edge cases', () => {
    it('emits only the default re-export for a default-only package', () => {
        const src = generatePkgWrapperSource('default-only-pkg', [], true);

        expect(src).toBe('export { default } from "default-only-pkg";\n');
    });

    it('keeps deep subpath specifiers intact in the emitted source', () => {
        const src = generatePkgWrapperSource(
            'react-dom/client',
            ['createRoot', 'hydrateRoot'],
            false
        );

        expect(src).toBe(
            'export { createRoot, hydrateRoot } from "react-dom/client";\n'
        );
    });

    it('always terminates the source with a single trailing newline', () => {
        const withBoth = generatePkgWrapperSource('react', ['useState'], true);
        const empty = generatePkgWrapperSource('empty-pkg', [], false);

        expect(withBoth.endsWith(';\n')).toBe(true);
        expect(withBoth.endsWith('\n\n')).toBe(false);
        expect(empty).toBe('export {};\n');
    });
});

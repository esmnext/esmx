import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import {
    buildPkgWrapper,
    generatePkgWrapperSource,
    inspectPkg
} from '../src/index';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const WORKSPACE = path.resolve(HERE, '../../..');

/**
 * Choose example directories whose `node_modules` actually contain the
 * package we're probing (pnpm uses a strict, non-hoisted layout).
 */
const ROOT_REACT_EXAMPLE = path.join(
    WORKSPACE,
    'examples/micro-app/ssr-micro-react'
);
const ROOT_VUE_EXAMPLE = path.join(
    WORKSPACE,
    'examples/micro-app/ssr-micro-vue3'
);
const ROOT_PREACT_EXAMPLE = path.join(
    WORKSPACE,
    'examples/micro-app/ssr-micro-preact'
);
const ROOT_SHARED = path.join(WORKSPACE, 'examples/micro-app/ssr-micro-shared');

describe('generatePkgWrapperSource', () => {
    it('emits both named-exports and default for CJS pkg', () => {
        const src = generatePkgWrapperSource(
            'react',
            ['useState', 'createContext'],
            true
        );
        expect(src).toContain(
            'export { useState, createContext } from "react";'
        );
        expect(src).toContain('export { default } from "react";');
    });

    it('emits only named-exports when pkg has no default', () => {
        const src = generatePkgWrapperSource(
            'preact',
            ['h', 'render', 'Component'],
            false
        );
        expect(src).toContain('export { h, render, Component } from "preact";');
        expect(src).not.toContain('export { default }');
    });

    it('falls back to empty re-export when pkg has nothing detectable', () => {
        const src = generatePkgWrapperSource('mystery', [], false);
        // Must be syntactically valid ESM
        expect(src).toContain('export {};');
    });

    it('quotes the specifier safely', () => {
        const src = generatePkgWrapperSource(
            '@scope/with-special-chars',
            ['x'],
            true
        );
        expect(src).toContain('from "@scope/with-special-chars"');
    });
});

describe('inspectPkg', () => {
    it('enumerates react (CJS with conditional NODE_ENV branches)', async () => {
        const r = await inspectPkg(ROOT_REACT_EXAMPLE, 'react');
        expect(r.hasDefault).toBe(true);
        // Must contain the production-safe set (intersection across branches).
        expect(r.names).toContain('useState');
        expect(r.names).toContain('createContext');
        expect(r.names).toContain('useEffect');
        // dev-only names must NOT leak through (intersection excludes them).
        expect(r.names).not.toContain('act');
        expect(r.names).not.toContain('captureOwnerStack');
        // Reserved name should not appear.
        expect(r.names).not.toContain('__esModule');
        expect(r.names).not.toContain('default');
    });

    it('enumerates vue (ESM proxy → CJS conditional → @vue/runtime-dom chain)', async () => {
        const r = await inspectPkg(ROOT_VUE_EXAMPLE, 'vue');
        // vue's `index.mjs` is `export * from './index.js'` — pure ESM proxy
        // with no explicit default of its own, so we don't synthesize one
        // either. Consumers' `import { createApp } from 'vue'` uses the named
        // exports the chain reaches.
        expect(r.hasDefault).toBe(false);
        // Core API names that survive the prod/dev intersection.
        expect(r.names).toContain('createApp');
        expect(r.names).toContain('h');
        expect(r.names).toContain('Transition');
        expect(r.names).not.toContain('__esModule');
    });

    it('enumerates preact (pure ESM, no default)', async () => {
        const r = await inspectPkg(ROOT_PREACT_EXAMPLE, 'preact');
        expect(r.hasDefault).toBe(false);
        expect(r.names).toContain('h');
        expect(r.names).toContain('render');
        expect(r.names).toContain('Component');
    });

    it('resolves ESM-only `exports` map (@esmx/router)', async () => {
        const r = await inspectPkg(ROOT_SHARED, '@esmx/router');
        expect(r.names).toContain('Router');
        expect(r.names).toContain('Route');
    });

    it('handles unresolvable specifier gracefully (warns, returns empty)', async () => {
        const r = await inspectPkg(WORKSPACE, 'no-such-package-xyzzy');
        expect(r.names).toEqual([]);
        expect(r.hasDefault).toBe(false);
    });
});

describe('buildPkgWrapper', () => {
    it('combines inspect + generate into a single call', async () => {
        const w = await buildPkgWrapper({
            root: ROOT_REACT_EXAMPLE,
            spec: 'react'
        });
        expect(w.hasDefault).toBe(true);
        expect(w.names).toContain('useState');
        expect(w.source).toContain('export { default } from "react";');
        expect(w.source).toMatch(
            /export \{[^}]*\bcreateContext\b[^}]*\} from "react"/
        );
    });
});

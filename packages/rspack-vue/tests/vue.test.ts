import type { Esmx } from '@esmx/core';
import { describe, expect, test, vi } from 'vitest';

const { createRspackHtmlApp } = vi.hoisted(() => ({
    createRspackHtmlApp: vi.fn((..._args: unknown[]) => ({}) as never)
}));

vi.mock('@esmx/rspack', () => ({
    createRspackHtmlApp,
    rspack: { DefinePlugin: class DefinePlugin {} },
    RSPACK_LOADER: { cssLoader: 'css-loader' }
}));

import { createRspackVue2App, createRspackVue3App } from '../src/index';

// A fluent recorder that returns itself for any property/call, capturing every
// method invocation so the chain hook can run without a real webpack-chain.
function createChainRecorder() {
    const calls: { name: string; args: unknown[] }[] = [];
    const make = (name: string): any =>
        new Proxy(
            (...args: unknown[]) => {
                calls.push({ name, args });
                return make('root');
            },
            {
                get: (_t, prop) =>
                    typeof prop === 'string' ? make(prop) : undefined
            }
        );
    return { chain: make('root'), calls };
}

function called(
    calls: { name: string; args: unknown[] }[],
    name: string,
    arg?: unknown
) {
    return calls.some(
        (c) => c.name === name && (arg === undefined || c.args[0] === arg)
    );
}

const COMMAND = { dev: 'dev' };

function runChain(
    factory: typeof createRspackVue3App,
    esmx: Record<string, unknown>,
    buildTarget: string
) {
    createRspackHtmlApp.mockClear();
    const userChain = vi.fn();
    factory({ ...esmx, COMMAND } as unknown as Esmx, { chain: userChain });

    const options = createRspackHtmlApp.mock.calls[0][1] as {
        chain: (context: unknown) => void;
    };
    const { chain, calls } = createChainRecorder();
    const context = { chain, buildTarget, esmx: { ...esmx, COMMAND } };
    options.chain(context);

    return { calls, userChain, context };
}

describe('createRspackVue3App', () => {
    test('delegates to createRspackHtmlApp', () => {
        createRspackHtmlApp.mockClear();

        createRspackVue3App({ isProd: false, COMMAND } as unknown as Esmx);

        expect(createRspackHtmlApp).toHaveBeenCalledTimes(1);
    });

    test('registers the .vue extension, loader and rule', () => {
        const { calls } = runChain(
            createRspackVue3App,
            { isProd: false },
            'client'
        );

        expect(called(calls, 'add', '.vue')).toBe(true);
        expect(called(calls, 'plugin', 'vue-loader')).toBe(true);
        expect(called(calls, 'rule', 'vue')).toBe(true);
    });

    test('aliases vue$ to a runtime build', () => {
        const { calls } = runChain(
            createRspackVue3App,
            { isProd: false },
            'client'
        );

        const alias = calls.find(
            (c) => c.name === 'set' && c.args[0] === 'vue$'
        );
        expect(alias?.args[1]).toEqual(expect.stringContaining('vue.runtime'));
    });

    test('defines the Vue env for client builds', () => {
        expect(
            called(
                runChain(createRspackVue3App, { isProd: false }, 'client')
                    .calls,
                'plugin',
                'define-vue-env'
            )
        ).toBe(true);
        expect(
            called(
                runChain(createRspackVue3App, { isProd: false }, 'server')
                    .calls,
                'plugin',
                'define-vue-env'
            )
        ).toBe(false);
    });

    test('preserves the user-supplied chain hook', () => {
        const { userChain, context } = runChain(
            createRspackVue3App,
            { isProd: false },
            'client'
        );

        expect(userChain).toHaveBeenCalledTimes(1);
        expect(userChain.mock.calls[0][0]).toBe(context);
    });
});

describe('createRspackVue2App', () => {
    test('registers the vue loader and rule', () => {
        const { calls } = runChain(
            createRspackVue2App,
            { isProd: false, command: 'build' },
            'client'
        );

        expect(called(calls, 'plugin', 'vue-loader')).toBe(true);
        expect(called(calls, 'rule', 'vue')).toBe(true);
    });

    test('aliases vue$ to the Vue 2 runtime build', () => {
        const { calls } = runChain(
            createRspackVue2App,
            { isProd: false, command: 'build' },
            'client'
        );

        const alias = calls.find(
            (c) => c.name === 'set' && c.args[0] === 'vue$'
        );
        expect(alias?.args[1]).toBe('vue/dist/vue.runtime.esm.js');
    });

    test('adds the dev HMR loader for client dev builds', () => {
        const dev = runChain(
            createRspackVue2App,
            { isProd: false, command: 'dev' },
            'client'
        );
        const build = runChain(
            createRspackVue2App,
            { isProd: false, command: 'build' },
            'client'
        );

        expect(called(dev.calls, 'use', 'vue2-dev-hmr-loader')).toBe(true);
        expect(called(build.calls, 'use', 'vue2-dev-hmr-loader')).toBe(false);
    });
});

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

import { createRspackReactApp } from '../src/index';

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

function runChain(buildTarget: string, isProd: boolean) {
    createRspackHtmlApp.mockClear();
    const userChain = vi.fn();
    createRspackReactApp({ isProd } as unknown as Esmx, { chain: userChain });

    const options = createRspackHtmlApp.mock.calls[0][1] as {
        chain: (context: unknown) => void;
    };
    const { chain, calls } = createChainRecorder();
    const context = { chain, buildTarget, esmx: { isProd } };
    options.chain(context);

    return { calls, userChain, context };
}

describe('createRspackReactApp', () => {
    test('delegates to createRspackHtmlApp', () => {
        createRspackHtmlApp.mockClear();

        createRspackReactApp({ isProd: false } as unknown as Esmx);

        expect(createRspackHtmlApp).toHaveBeenCalledTimes(1);
    });

    test('registers the tsx/jsx extensions and loader rule', () => {
        const { calls } = runChain('client', false);

        expect(called(calls, 'add', '.tsx')).toBe(true);
        expect(called(calls, 'add', '.jsx')).toBe(true);
        expect(called(calls, 'rule', 'react-tsx')).toBe(true);
    });

    test('enables React Refresh only for client dev builds', () => {
        expect(
            called(runChain('client', false).calls, 'plugin', 'react-refresh')
        ).toBe(true);
        expect(
            called(runChain('server', false).calls, 'plugin', 'react-refresh')
        ).toBe(false);
        expect(
            called(runChain('client', true).calls, 'plugin', 'react-refresh')
        ).toBe(false);
    });

    test('defines the React env for client builds', () => {
        expect(
            called(
                runChain('client', false).calls,
                'plugin',
                'define-react-env'
            )
        ).toBe(true);
        expect(
            called(
                runChain('server', false).calls,
                'plugin',
                'define-react-env'
            )
        ).toBe(false);
    });

    test('preserves the user-supplied chain hook', () => {
        const { userChain, context } = runChain('client', false);

        expect(userChain).toHaveBeenCalledTimes(1);
        expect(userChain.mock.calls[0][0]).toBe(context);
    });
});

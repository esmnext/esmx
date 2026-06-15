import type { Esmx } from '@esmx/core';
import { describe, expect, test, vi } from 'vitest';

const { createRsbuildApp } = vi.hoisted(() => ({
    createRsbuildApp: vi.fn(async (..._args: unknown[]) => ({}) as never)
}));

vi.mock('@esmx/rsbuild', () => ({ createRsbuildApp }));

import { createRsbuildVueApp } from '../src/index';

const esmx = { isProd: false } as unknown as Esmx;

function lastOptions() {
    return createRsbuildApp.mock.calls.at(-1)?.[1] as {
        config?: (context: {
            buildTarget: string;
            config: { plugins: unknown[]; tools?: Record<string, unknown> };
        }) => void;
    };
}

function makeContext(buildTarget: string) {
    return {
        buildTarget,
        config: { plugins: [] as unknown[], tools: {} as Record<string, any> }
    };
}

describe('createRsbuildVueApp', () => {
    test('delegates to createRsbuildApp with the same esmx instance', async () => {
        createRsbuildApp.mockClear();

        await createRsbuildVueApp(esmx);

        expect(createRsbuildApp).toHaveBeenCalledTimes(1);
        expect(createRsbuildApp.mock.calls[0][0]).toBe(esmx);
    });

    test('injects the Vue plugin through the config hook', async () => {
        createRsbuildApp.mockClear();

        await createRsbuildVueApp(esmx);
        const context = makeContext('client');
        lastOptions().config?.(context);

        expect(context.config.plugins.length).toBeGreaterThan(0);
    });

    test('aliases vue$ to the runtime build via bundlerChain', async () => {
        createRsbuildApp.mockClear();

        await createRsbuildVueApp(esmx);
        const context = makeContext('server');
        lastOptions().config?.(context);

        const set = vi.fn().mockReturnThis();
        const chain = { resolve: { alias: { set } } };
        context.config.tools.bundlerChain(chain, {});

        expect(set).toHaveBeenCalledWith(
            'vue$',
            expect.stringContaining('vue.runtime')
        );
    });

    test('preserves the user-supplied config hook', async () => {
        createRsbuildApp.mockClear();
        const userConfig = vi.fn();

        await createRsbuildVueApp(esmx, { config: userConfig });
        const context = makeContext('client');
        lastOptions().config?.(context);

        expect(userConfig).toHaveBeenCalledWith(context);
    });
});

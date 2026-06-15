import type { Esmx } from '@esmx/core';
import { describe, expect, test, vi } from 'vitest';

const { createRsbuildApp } = vi.hoisted(() => ({
    createRsbuildApp: vi.fn(async (..._args: unknown[]) => ({}) as never)
}));

vi.mock('@esmx/rsbuild', () => ({ createRsbuildApp }));

import { createRsbuildReactApp } from '../src/index';

const esmx = { isProd: false } as unknown as Esmx;

function lastOptions() {
    return createRsbuildApp.mock.calls.at(-1)?.[1] as {
        config?: (context: { config: { plugins: unknown[] } }) => void;
    };
}

describe('createRsbuildReactApp', () => {
    test('delegates to createRsbuildApp with the same esmx instance', async () => {
        createRsbuildApp.mockClear();

        await createRsbuildReactApp(esmx);

        expect(createRsbuildApp).toHaveBeenCalledTimes(1);
        expect(createRsbuildApp.mock.calls[0][0]).toBe(esmx);
    });

    test('injects the React plugin through the config hook', async () => {
        createRsbuildApp.mockClear();

        await createRsbuildReactApp(esmx);
        const context = { config: { plugins: [] as unknown[] } };
        lastOptions().config?.(context);

        expect(context.config.plugins.length).toBeGreaterThan(0);
    });

    test('preserves the user-supplied config hook', async () => {
        createRsbuildApp.mockClear();
        const userConfig = vi.fn();

        await createRsbuildReactApp(esmx, { config: userConfig });
        const context = { config: { plugins: [] as unknown[] } };
        lastOptions().config?.(context);

        expect(userConfig).toHaveBeenCalledWith(context);
    });
});

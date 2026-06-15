import type { Esmx } from '@esmx/core';
import { describe, expect, test, vi } from 'vitest';

const { createViteApp } = vi.hoisted(() => ({
    createViteApp: vi.fn(async (..._args: unknown[]) => ({}) as never)
}));

vi.mock('@esmx/vite', () => ({ createViteApp }));

import { createViteReactApp } from '../src/index';

const esmx = { isProd: false } as unknown as Esmx;

function lastOptions() {
    return createViteApp.mock.calls.at(-1)?.[1] as {
        config?: (context: { config: { plugins: unknown[] } }) => void;
    };
}

describe('createViteReactApp', () => {
    test('delegates to createViteApp with the same esmx instance', async () => {
        createViteApp.mockClear();

        await createViteReactApp(esmx);

        expect(createViteApp).toHaveBeenCalledTimes(1);
        expect(createViteApp.mock.calls[0][0]).toBe(esmx);
    });

    test('injects the React plugin through the config hook', async () => {
        createViteApp.mockClear();

        await createViteReactApp(esmx);
        const context = { config: { plugins: [] as unknown[] } };
        lastOptions().config?.(context);

        expect(context.config.plugins.length).toBeGreaterThan(0);
    });

    test('preserves the user-supplied config hook', async () => {
        createViteApp.mockClear();
        const userConfig = vi.fn();

        await createViteReactApp(esmx, { config: userConfig });
        const context = { config: { plugins: [] as unknown[] } };
        lastOptions().config?.(context);

        expect(userConfig).toHaveBeenCalledWith(context);
    });
});

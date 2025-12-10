/**
 * @vitest-environment happy-dom
 */
import { describe, expect, it } from 'vitest';
import type { InjectionKey } from 'vue';
import {
    createApp,
    getCurrentInstance,
    h,
    inject,
    nextTick,
    provide
} from 'vue';

describe('app.runWithContext()', () => {
    it('should exist on Vue app', () => {
        const app = createApp({ render: () => h('div') });
        expect(typeof app.runWithContext).toBe('function');
    });

    it('should enable inject to read provided value within context', () => {
        const KEY: InjectionKey<number> = Symbol('ctx-key');
        const app = createApp({ render: () => h('div') });
        app.provide(KEY, 42);

        const value = app.runWithContext(() => inject(KEY));
        expect(value).toBe(42);
    });
    it('should not read value provided in root setup via runWithContext', async () => {
        const KEY: InjectionKey<number> = Symbol('ctx-key-setup');
        const app = createApp({
            setup() {
                provide(KEY, 7);
                return () => h('div');
            }
        });
        const container = document.createElement('div');
        document.body.appendChild(container);
        app.mount(container);
        await nextTick();
        const value = app.runWithContext(() => inject(KEY));
        expect(value).toBeUndefined();
        app.unmount();
        container.remove();
    });
    it('should read app-level provide set inside setup via appContext', async () => {
        const KEY: InjectionKey<number> = Symbol('ctx-key-setup-app');
        const app = createApp({
            setup() {
                const appInst = getCurrentInstance()!.appContext.app;
                appInst.provide(KEY, 9);
                return () => h('div');
            }
        });
        const container = document.createElement('div');
        document.body.appendChild(container);
        app.mount(container);
        await nextTick();
        const value = app.runWithContext(() => inject(KEY));
        expect(value).toBe(9);
        app.unmount();
        container.remove();
    });
});

import { afterEach, describe, expect, it, vi } from 'vitest';
import { RouterMode } from './types';

const setIsBrowserTrue = () => {
    if (typeof globalThis !== 'object') return;
    (globalThis as any).window = {
        location: {
            href: 'http://test.com/base/'
        }
    };
    (globalThis as any).location = window.location;
    vi.resetModules();
};

const setIsBrowserFalse = () => {
    if (typeof globalThis !== 'object') return;
    // biome-ignore lint/performance/noDelete:
    delete (globalThis as any).window;
    // biome-ignore lint/performance/noDelete:
    delete (globalThis as any).location;
    vi.resetModules();
};

describe('parsedOptions', () => {
    afterEach(setIsBrowserFalse);

    it('should throw if base is missing and not in browser', async () => {
        const { parsedOptions } = await import('./options');
        expect(() => parsedOptions({} as any)).toThrow(/base.*required/);
    });

    it('should throw if base is invalid', async () => {
        const { parsedOptions } = await import('./options');
        expect(() => parsedOptions({ base: 'not-a-url' } as any)).toThrow(
            /Invalid 'base'/
        );
    });

    it('should set mode to options.mode or default to history in browser', async () => {
        setIsBrowserTrue();
        const { parsedOptions } = await import('./options');
        const opts = parsedOptions({
            base: 'http://a.com',
            mode: RouterMode.abstract,
            routes: []
        } as any);
        expect(opts.mode).toBe(RouterMode.abstract);
        const opts2 = parsedOptions({
            base: 'http://a.com',
            routes: []
        } as any);
        expect(opts2.mode).toBe(RouterMode.history);
    });

    it('should assign apps as function or object', async () => {
        setIsBrowserTrue();
        const { parsedOptions } = await import('./options');
        const fn = () => 'apps';
        const optsFn = parsedOptions({
            base: 'http://a.com',
            apps: fn,
            routes: []
        } as any);
        expect(optsFn.apps).toBe(fn);
        const obj = { a: 1 };
        const optsObj = parsedOptions({
            base: 'http://a.com',
            apps: obj,
            routes: []
        } as any);
        expect(optsObj.apps).not.toBe(obj); // 应该是新对象
        expect(optsObj.apps).toEqual(obj);
        (optsObj.apps as any).a = 2;
        expect(obj.a).toBe(1);
    });

    it('should use location.href if base is not provided (in browser)', async () => {
        setIsBrowserTrue();
        const { parsedOptions } = await import('./options');
        const opts = parsedOptions({ routes: [] } as any);
        expect(opts.base.href).toBe(location.href);
    });

    it('should use empty array if routes is not provided', async () => {
        const { parsedOptions } = await import('./options');
        const opts = parsedOptions({ base: 'http://a.com' } as any);
        expect(Array.isArray(opts.routes)).toBe(true);
        expect(opts.routes.length).toBe(0);
    });

    it('should clone rootStyle if provided, otherwise false', async () => {
        const { parsedOptions } = await import('./options');
        const style = { color: 'red' };
        const opts = parsedOptions({
            base: 'http://a.com',
            routes: [],
            rootStyle: style
        } as any);
        expect(opts.rootStyle).not.toBe(style);
        expect(opts.rootStyle).toEqual(style);
        const opts2 = parsedOptions({
            base: 'http://a.com',
            routes: []
        } as any);
        expect(opts2.rootStyle).toBe(false);
    });

    it('should clone layer if provided, otherwise null', async () => {
        const { parsedOptions } = await import('./options');
        const layer = { enable: true };
        const opts = parsedOptions({
            base: 'http://a.com',
            routes: [],
            layer
        } as any);
        expect(opts.layer).not.toBe(layer);
        expect(opts.layer).toEqual(layer);
        const opts2 = parsedOptions({
            base: 'http://a.com',
            routes: []
        } as any);
        expect(opts2.layer).toBe(null);
    });

    it('should use default onBackNoResponse if not provided', async () => {
        const { parsedOptions } = await import('./options');
        const opts = parsedOptions({ base: 'http://a.com', routes: [] } as any);
        expect(typeof opts.onBackNoResponse).toBe('function');
        // 默认函数应可调用且无异常
        expect(() => opts.onBackNoResponse({} as any)).not.toThrow();
    });

    it('should NOT clone context object', async () => {
        const { parsedOptions } = await import('./options');
        const context = { user: 'test' };
        const opts = parsedOptions({
            base: 'http://a.com',
            routes: [],
            context
        } as any);
        expect(opts.context).toBe(context);
        expect(opts.context.user).toBe('test');
        opts.context.user = 'changed';
        expect(context.user).toBe('changed');
    });
});

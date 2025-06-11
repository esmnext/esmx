import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_LOCATION } from './default';
import type { Route } from './types';

describe('DEFAULT_LOCATION', () => {
    let originalWindowOpen: typeof window.open;
    let mockLocation: Partial<Location>;

    beforeEach(() => {
        if (typeof window === 'object') {
            originalWindowOpen = window.open;
        }
        mockLocation = { href: '' };
        if (typeof globalThis !== 'object') {
            return;
        }
        (globalThis.window as any) = {
            location: mockLocation
        };
        globalThis.location = window.location;
    });

    afterEach(() => {
        window.open = originalWindowOpen;
    });

    it('should open a new window if isPush is true and window.open returns a window', () => {
        const mockNewWindow = { opener: {} };
        // @ts-ignore
        window.open = vi.fn(() => mockNewWindow);
        const url = new URL('https://example.com');
        const to: Route = { url, isPush: true } as any;
        const result = DEFAULT_LOCATION(to, null);
        expect(window.open).toHaveBeenCalledWith(url.href);
        expect(mockNewWindow.opener).toBeNull();
        expect(result).toBe(mockNewWindow);
    });

    it('should fallback to location.href if window.open returns null', () => {
        // @ts-ignore
        window.open = vi.fn(() => null);
        const url = new URL('https://fallback.com');
        const to: Route = { url, isPush: true } as any;
        DEFAULT_LOCATION(to, null);
        expect(window.open).toHaveBeenCalledWith(url.href);
        expect(mockLocation.href).toBe(url.href);
    });

    it('should set location.href if isPush is false', () => {
        // @ts-ignore
        window.open = vi.fn();
        const url = new URL('https://direct.com');
        const to: Route = { url, isPush: false } as any;
        DEFAULT_LOCATION(to, null);
        expect(mockLocation.href).toBe(url.href);
        expect(window.open).not.toHaveBeenCalled();
    });

    // 测试 try-catch 分支：window.open 抛出异常时，应该 fallback 到 location.href
    it('should set location.href if window.open throws an error (try-catch)', () => {
        // @ts-ignore
        window.open = vi.fn(() => {
            throw new Error('window.open failed');
        });
        const url = new URL('https://error.com');
        const to: Route = { url, isPush: true } as any;
        DEFAULT_LOCATION(to, null);
        expect(window.open).toHaveBeenCalledWith(url.href);
        expect(mockLocation.href).toBe(url.href);
    });
});

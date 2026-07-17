/**
 * @vitest-environment happy-dom
 */
import { afterEach, describe, expect, it } from 'vitest';
import {
    getSavedScrollPosition,
    saveScrollPosition,
    scrollPositions
} from '../src/scroll';

describe('scroll position', () => {
    afterEach(() => {
        scrollPositions.clear();
        // Reset history.state to a clean baseline between tests.
        history.replaceState(null, '');
    });

    it('does not throw when history.state is null', () => {
        // Regression guard: getSavedScrollPosition used to dereference
        // history.state[POSITION_KEY] unconditionally and threw a TypeError
        // when the browser set history.state to null (new tab, SSR first paint).
        expect(history.state).toBeNull();
        expect(() => getSavedScrollPosition('/some/key')).not.toThrow();
        expect(getSavedScrollPosition('/some/key')).toBeNull();
    });

    it('returns the default value when nothing is saved and state is null', () => {
        expect(history.state).toBeNull();
        const fallback = { left: 10, top: 20 };
        expect(getSavedScrollPosition('/missing', fallback)).toBe(fallback);
    });

    it('round-trips a saved position through the in-memory map', () => {
        const key = '/page/a';
        const pos = { left: 100, top: 200 };
        saveScrollPosition(key, pos);
        expect(getSavedScrollPosition(key)).toEqual(pos);
    });

    it('consumes the saved position so a second read returns null', () => {
        const key = '/page/b';
        saveScrollPosition(key, { left: 1, top: 2 });
        expect(getSavedScrollPosition(key)).toEqual({ left: 1, top: 2 });
        // The in-memory entry is deleted after the first read.
        expect(getSavedScrollPosition(key)).toBeNull();
    });
});

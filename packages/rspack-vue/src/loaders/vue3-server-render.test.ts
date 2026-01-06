import { describe, expect, it } from 'vitest';
import vue3ServerRenderLoader from './vue3-server-render';

describe('vue3-server-render loader', () => {
    it('appends guarded wrapper around __exports__.ssrRender and collects import.meta', () => {
        const source = `
const __exports__ = {};
__exports__.ssrRender = function original() {};
export default __exports__;
`;

        // @ts-expect-error - loader doesn't rely on loader context in this implementation
        const result = vue3ServerRenderLoader.call({}, source) as string;

        expect(result).toContain("import { useSSRContext } from 'vue';");
        expect(result).toContain(
            'const __esmxOriginalSsrRender = __exports__.ssrRender;'
        );
        expect(result).toContain(
            '__exports__.ssrRender = function esmxWrappedSsrRender()'
        );
        expect(result).toContain('ctx?.importMetaSet?.add(import.meta);');
        expect(result).toContain(
            "if (typeof __exports__ !== 'undefined' && __exports__ && typeof __exports__.ssrRender === 'function')"
        );
    });

    it('does not modify source when __exports__ is not present', () => {
        const source = `export default {};`;

        // @ts-expect-error - loader doesn't rely on loader context in this implementation
        const result = vue3ServerRenderLoader.call({}, source) as string;

        expect(result).toBe(source);
    });

    it('injects guard even when ssrRender is missing', () => {
        const source = `
const __exports__ = {};
export default __exports__;
`;

        // @ts-expect-error - loader doesn't rely on loader context in this implementation
        const result = vue3ServerRenderLoader.call({}, source) as string;

        expect(result).toContain(
            "if (typeof __exports__ !== 'undefined' && __exports__ && typeof __exports__.ssrRender === 'function')"
        );
        // original source content must stay intact
        expect(result).toMatch(/const __exports__ = {};/);
        expect(result).toMatch(/export default __exports__;/);
    });
});

import { fileURLToPath } from 'node:url';
import type { rspack } from '@esmx/rspack';

const ADD_IMPORT = `
import { useSSRContext } from 'vue';

if (typeof __exports__ !== 'undefined' && __exports__ && typeof __exports__.ssrRender === 'function') {
    const __esmxOriginalSsrRender = __exports__.ssrRender;

    __exports__.ssrRender = function esmxWrappedSsrRender() {
        const ctx = useSSRContext();
        ctx?.importMetaSet?.add(import.meta);
        return __esmxOriginalSsrRender.apply(this, arguments);
    };
}
`;

export default function (this: rspack.LoaderContext, text: string) {
    if (!text.includes('__exports__')) {
        return text;
    }

    return text + ADD_IMPORT;
}

export const vue3ServerRenderLoader = (() => {
    try {
        // Use import.meta.resolve if available (Node.js 20.6.0+)
        if (typeof import.meta.resolve === 'function') {
            return fileURLToPath(import.meta.resolve(import.meta.url));
        }
    } catch {
        // Fallback for environments without import.meta.resolve (e.g., vitest)
    }
    // Fallback: use import.meta.url directly (always available in ESM)
    return fileURLToPath(import.meta.url);
})();

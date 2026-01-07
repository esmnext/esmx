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

// Export the absolute path to this loader file
// import.meta.url provides the current module's URL (always available in ESM)
export const vue3ServerRenderLoader = fileURLToPath(import.meta.url);

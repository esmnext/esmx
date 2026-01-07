import { fileURLToPath } from 'node:url';
import type { rspack } from '@esmx/rspack';

const ADD_IMPORT = `
function initImport() {
    // Track this module's import.meta during SSR
    if (typeof window === 'undefined' && globalThis.__SSR_CONTEXT__?.importMetaSet) {
        globalThis.__SSR_CONTEXT__.importMetaSet.add(import.meta);
    }
}
initImport();
`;

export default function (this: rspack.LoaderContext, text: string) {
    return text + ADD_IMPORT;
}

export const reactServerRenderLoader = fileURLToPath(
    import.meta.resolve(import.meta.url)
);

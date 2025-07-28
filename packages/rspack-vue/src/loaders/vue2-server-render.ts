import { fileURLToPath } from 'node:url';
import type { rspack } from '@esmx/rspack';

const ADD_IMPORT = `
function initImport () {
    const mixins = Array.isArray(component.options.mixins) ? component.options.mixins : [];
    mixins.push({
        serverPrefetch () {
            this.$ssrContext?.importMetaSet?.add(import.meta);
        }
    });
    component.options.mixins = mixins;
}
initImport();
export default component.exports
`;

export default function (this: rspack.LoaderContext, text: string) {
    return text.replaceAll('export default component.exports', ADD_IMPORT);
}

export const vue2ServerRenderLoader = fileURLToPath(
    import.meta.resolve(import.meta.url)
);

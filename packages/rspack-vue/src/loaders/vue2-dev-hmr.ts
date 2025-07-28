import { fileURLToPath } from 'node:url';
import type { rspack } from '@esmx/rspack';

const FIX_ESM = `api.install(require('vue').default)`;

export default function (this: rspack.LoaderContext, text: string) {
    return text.replaceAll(`api.install(require('vue'))`, FIX_ESM);
}

export const vue2DevHmrLoader = fileURLToPath(
    import.meta.resolve(import.meta.url)
);

import { fileURLToPath } from 'node:url';

function resolve(name: string) {
    return fileURLToPath(import.meta.resolve(name));
}

export const RSPACK_LOADER = {
    builtinSwcLoader: 'builtin:swc-loader',
    lightningcssLoader: 'builtin:lightningcss-loader',
    cssLoader: resolve('css-loader'),
    styleLoader: resolve('style-loader'),
    lessLoader: resolve('less-loader'),
    styleResourcesLoader: resolve('style-resources-loader'),
    workerRspackLoader: resolve('worker-rspack-loader')
} satisfies Record<string, string>;

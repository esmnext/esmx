import { fileURLToPath } from 'node:url';

function resolve(name: string) {
    return fileURLToPath(import.meta.resolve(name));
}

export const RSPACK_LOADER = {
    /**
     * Rspack 内置的 builtin:swc-loader
     */
    builtinSwcLoader: 'builtin:swc-loader',
    /**
     * Rspack 内置的 lightningcss-loader
     */
    lightningcssLoader: 'builtin:lightningcss-loader',
    /**
     * css-loader
     */
    cssLoader: resolve('css-loader'),
    /**
     * style-loader
     */
    styleLoader: resolve('style-loader'),
    /**
     * less-loader
     */
    lessLoader: resolve('less-loader'),
    /**
     * style-resources-loader
     */
    styleResourcesLoader: resolve('style-resources-loader'),
    /**
     * worker-rspack-loader
     */
    workerRspackLoader: resolve('worker-rspack-loader')
} satisfies Record<string, string>;

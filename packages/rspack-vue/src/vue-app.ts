import { fileURLToPath } from 'node:url';
import type { Esmx } from '@esmx/core';
import { createRspackHtmlApp, RSPACK_LOADER, rspack } from '@esmx/rspack';
import { VueLoaderPlugin as VueLoader2Plugin } from 'vue-loader-v15';
import { VueLoaderPlugin as VueLoader3Plugin } from 'vue-loader-v17';
import {
    vue2DevHmrLoader,
    vue2ServerRenderLoader,
    vue3ServerRenderLoader
} from './loaders';
import type { RspackVueAppOptions } from './vue';

type VueType = '2' | '3';

export function createRspackVueApp(
    esmx: Esmx,
    vueType: VueType,
    options?: RspackVueAppOptions
) {
    return createRspackHtmlApp(esmx, {
        ...options,
        loaders: {
            styleLoader: fileURLToPath(import.meta.resolve('vue-style-loader')),
            ...options?.loaders
        },
        chain(context) {
            const { chain, buildTarget, esmx } = context;
            const defineVue = <T>({
                vue2,
                vue3
            }: {
                vue2: () => T;
                vue3: () => T;
            }) => {
                if (vueType === '2') {
                    return vue2();
                } else {
                    return vue3();
                }
            };

            chain.resolve.extensions.add('.vue');

            defineVue({
                vue2: () => {
                    chain.plugin('vue-loader').use(VueLoader2Plugin);
                    // Rspack 2.0: Ensure css-loader is matched for vue style requests
                    // so vue-loader 15's pitcher can generate the correct inline loader chain.
                    chain.module
                        .rule('vue-style')
                        .resourceQuery(/vue&type=style/)
                        .use('css-loader')
                        .loader(RSPACK_LOADER.cssLoader)
                        .end();
                },
                vue3: () => {
                    chain.plugin('vue-loader').use(VueLoader3Plugin);
                    // Rspack 2.0: Add explicit rule for vue3 style requests
                    // to ensure css-loader is applied
                    chain.module
                        .rule('vue3-style')
                        .resourceQuery(/vue&type=style/)
                        .use('vue-style-loader')
                        .loader(
                            fileURLToPath(
                                import.meta.resolve('vue-style-loader')
                            )
                        )
                        .end()
                        .use('css-loader')
                        .loader(RSPACK_LOADER.cssLoader)
                        .end();
                }
            });

            const vueLoader = fileURLToPath(
                defineVue({
                    vue2: () => import.meta.resolve('vue-loader-v15'),
                    vue3: () => import.meta.resolve('vue-loader-v17')
                })
            );

            const vueRule = chain.module.rule('vue').test(/\.vue$/);

            vueRule
                .use('vue-loader')
                .loader(vueLoader)
                .options({
                    ...options?.vueLoader,
                    experimentalInlineMatchResource: false,
                    optimizeSSR: buildTarget === 'server'
                });

            if (buildTarget === 'server') {
                defineVue({
                    vue2: () => {
                        vueRule
                            .use('vue-server-render-loader')
                            .loader(vue2ServerRenderLoader)
                            .before('vue-loader');
                    },
                    vue3: () => {
                        vueRule
                            .use('vue-server-render-loader')
                            .loader(vue3ServerRenderLoader)
                            .before('vue-loader');
                    }
                });
            }

            defineVue({
                vue2: () => {
                    if (
                        esmx.command === esmx.COMMAND.dev &&
                        buildTarget === 'client'
                    ) {
                        vueRule
                            .use('vue2-dev-hmr-loader')
                            .loader(vue2DevHmrLoader)
                            .before('vue-loader');
                    }
                },
                vue3: () => {}
            });

            defineVue({
                vue2: () => {
                    chain.resolve.alias.set(
                        'vue$',
                        'vue/dist/vue.runtime.esm.js'
                    );
                },
                vue3: () => {
                    chain.resolve.alias.set(
                        'vue$',
                        esmx.isProd
                            ? 'vue/dist/vue.runtime.esm-browser.prod.js'
                            : 'vue/dist/vue.runtime.esm-browser.js'
                    );
                }
            });

            if (buildTarget === 'client') {
                chain.plugin('define-vue-env').use(rspack.DefinePlugin, [
                    {
                        'process.env.VUE_ENV': JSON.stringify(buildTarget)
                    }
                ]);
            }

            options?.chain?.(context);
        }
    });
}

import type { Esmx } from '@esmx/core';
import { createRspackHtmlApp, rspack } from '@esmx/rspack';
import { VueLoaderPlugin as VueLoader2Plugin } from 'vue2-loader';
import { VueLoaderPlugin as VueLoader3Plugin } from 'vue3-loader';
import type { RspackVueAppOptions } from './vue';
import { vue2Loader } from './vue2-loader';
import { vue3Loader } from './vue3-loader';

type VueType = '2' | '3';

export function createRspackVueApp(
    esmx: Esmx,
    vueType: VueType,
    options?: RspackVueAppOptions
) {
    return createRspackHtmlApp(esmx, {
        ...options,
        loaders: {
            styleLoader: new URL(import.meta.resolve('vue-style-loader'))
                .pathname,
            ...options?.loaders
        },
        config(context) {
            const { config, buildTarget } = context;
            // 支持 Vue 拓展名
            config.resolve = {
                ...config.resolve,
                extensions: [...(config.resolve?.extensions ?? []), '.vue']
            };
            config.plugins = config.plugins || [];
            switch (vueType) {
                case '2':
                    // @ts-ignore
                    config.plugins.push(new VueLoader2Plugin());
                    break;
                case '3':
                    config.plugins.push(new VueLoader3Plugin());
                    break;
            }
            // 设置 Vue 相关的环境变量
            if (buildTarget === 'client') {
                config.plugins.push(
                    new rspack.DefinePlugin({
                        'process.env.VUE_ENV': JSON.stringify(buildTarget)
                    })
                );
            }
            // 设置 vue-loader
            const vueRuleUse: rspack.RuleSetUse = [
                {
                    loader: new URL(import.meta.resolve(`vue${vueType}-loader`))
                        .pathname,
                    options: {
                        ...options?.vueLoader,
                        experimentalInlineMatchResource: true,
                        optimizeSSR: buildTarget === 'server'
                    }
                }
            ];
            switch (vueType) {
                case '2':
                    vueRuleUse.unshift(vue2Loader);
                    break;
                case '3':
                    vueRuleUse.unshift(vue3Loader);
                    break;
            }
            config.module = {
                ...config.module,
                rules: [
                    ...(config.module?.rules ?? []),
                    {
                        test: /\.vue$/,
                        use: vueRuleUse
                    }
                ]
            };
            // 设置 vue 别名
            let vueAlias: string | null = null;
            switch (vueType) {
                case '2':
                    vueAlias = 'vue/dist/vue.esm.js';
                    break;
                case '3':
                    vueAlias = 'vue/dist/vue.runtime.esm-browser.js';
                    break;
            }
            if (vueAlias) {
                config.resolve!.alias = {
                    ...config.resolve!.alias!,
                    vue$: vueAlias
                };
            }
            // 设置自定义配置
            options?.config?.(context);
        }
    });
}

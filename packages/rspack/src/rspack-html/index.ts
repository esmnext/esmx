import type { Esmx } from '@esmx/core';
import {
    type LightningcssLoaderOptions,
    rspack,
    type SwcLoaderOptions
} from '@rspack/core';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import type RspackChain from 'rspack-chain';
import {
    type BuildTarget,
    createRspackApp,
    RSPACK_LOADER,
    type RspackAppOptions
} from '../rspack';
import type { TargetSetting } from './target-setting';
import { getTargetSetting } from './target-setting';

export type { TargetSetting };
export interface RspackHtmlAppOptions extends RspackAppOptions {
    /**
     * CSS output mode configuration
     *
     * @default Automatically selected based on environment:
     * - Production: 'css', outputs CSS to separate files for better caching and parallel loading
     * - Development: 'js', bundles CSS into JS to support hot module replacement (HMR) for instant style updates
     *
     * - 'css': Output CSS to separate CSS files
     * - 'js': Bundle CSS into JS files and dynamically inject styles at runtime
     * - false: Disable default CSS processing configuration, requires manual loader rule configuration
     *
     * @example
     * ```ts
     * // Use environment default configuration
     * css: undefined
     *
     * // Force output to separate CSS files
     * css: 'css'
     *
     * // Force bundle into JS
     * css: 'js'
     *
     * // Custom CSS processing
     * css: false
     * ```
     */
    css?: 'css' | 'js' | false;

    /**
     * Custom loader configuration
     *
     * Allows replacing default loader implementations, useful for switching to framework-specific loaders
     *
     * @example
     * ```ts
     * // Use Vue's style-loader
     * loaders: {
     *   styleLoader: 'vue-style-loader'
     * }
     * ```
     */
    loaders?: Partial<Record<keyof typeof RSPACK_LOADER, string>>;

    /**
     * Configure style injection method. For complete options, see:
     * https://github.com/webpack-contrib/style-loader
     *
     * @example
     * ```ts
     * styleLoader: {
     *   injectType: 'singletonStyleTag',
     *   attributes: { id: 'app-styles' }
     * }
     * ```
     */
    styleLoader?: Record<string, any>;

    /**
     * Configure CSS modules, URL resolution, etc. For complete options, see:
     * https://github.com/webpack-contrib/css-loader
     *
     * @example
     * ```ts
     * cssLoader: {
     *   modules: true,
     *   url: false
     * }
     * ```
     */
    cssLoader?: Record<string, any>;

    /**
     * Configure Less compilation options. For complete options, see:
     * https://github.com/webpack-contrib/less-loader
     *
     * @example
     * ```ts
     * lessLoader: {
     *   lessOptions: {
     *     javascriptEnabled: true,
     *     modifyVars: { '@primary-color': '#1DA57A' }
     *   }
     * }
     * ```
     */
    lessLoader?: Record<string, any>;

    /**
     * Automatically inject global style resources. For complete options, see:
     * https://github.com/yenshih/style-resources-loader
     *
     * @example
     * ```ts
     * styleResourcesLoader: {
     *   patterns: [
     *     './src/styles/variables.less',
     *     './src/styles/mixins.less'
     *   ]
     * }
     * ```
     */
    styleResourcesLoader?: Record<string, any>;

    /**
     * Configure TypeScript/JavaScript compilation options. For complete options, see:
     * https://rspack.dev/guide/features/builtin-swc-loader
     *
     * @example
     * ```ts
     * swcLoader: {
     *   jsc: {
     *     parser: {
     *       syntax: 'typescript',
     *       decorators: true
     *     },
     *     transform: {
     *       legacyDecorator: true
     *     }
     *   }
     * }
     * ```
     */
    swcLoader?: SwcLoaderOptions;

    /**
     * Define compile-time global constants, supports setting different values for different build targets
     * For complete documentation, see: https://rspack.dev/plugins/webpack/define-plugin
     *
     * @example
     * ```ts
     * // Unified value
     * definePlugin: {
     *   'process.env.APP_ENV': JSON.stringify('production')
     * }
     *
     * // Values for different build targets
     * definePlugin: {
     *   'process.env.IS_SERVER': {
     *     server: 'true',
     *     client: 'false'
     *   }
     * }
     * ```
     */
    definePlugin?: Record<
        string,
        string | Partial<Record<BuildTarget, string>>
    >;

    /**
     * Set the target runtime environment for the code, affecting code compilation downgrading and polyfill injection
     *
     * @example
     * ```ts
     * // Global compatible mode
     * target: 'compatible'
     *
     * // Global modern mode
     * target: 'modern'
     *
     * // Global custom targets
     * target: ['chrome>=89', 'edge>=89', 'firefox>=108', 'safari>=16.4', 'node>=24']
     *
     * // Per-build-target configuration
     * target: {
     *   client: 'modern',
     *   server: ['node>=24']
     * }
     * ```
     */
    target?: TargetSetting;
}

export async function createRspackHtmlApp(
    esmx: Esmx,
    options?: RspackHtmlAppOptions
) {
    options = {
        ...options,
        css: options?.css ? options.css : esmx.isProd ? 'css' : 'js'
    };
    return createRspackApp(esmx, {
        ...options,
        chain(context) {
            const { chain, buildTarget, esmx } = context;

            chain.stats('errors-warnings');
            chain.devtool(false);
            chain.cache(false);

            configureAssetRules(chain, esmx);

            chain.module
                .rule('json')
                .test(/\.json$/i)
                .type('json');

            configureWorkerRule(chain, esmx, options);

            configureTypeScriptRule(chain, buildTarget, options);

            configureOptimization(chain, options);

            chain.plugin('node-polyfill').use(NodePolyfillPlugin);

            configureDefinePlugin(chain, buildTarget, options);

            chain.resolve.extensions.clear().add('...').add('.ts');

            configureCssRules(chain, esmx, options);

            options?.chain?.(context);
        }
    });
}

function configureAssetRules(chain: RspackChain, esmx: Esmx): void {
    chain.module
        .rule('images')
        .test(
            /\.(png|jpg|jpeg|gif|svg|bmp|webp|ico|apng|avif|tif|tiff|jfif|pjpeg|pjp|cur)$/i
        )
        .type('asset/resource')
        .set('generator', {
            filename: filename(esmx, 'images')
        });

    chain.module
        .rule('media')
        .test(/\.(mp4|webm|ogg|mov)$/i)
        .type('asset/resource')
        .set('generator', {
            filename: filename(esmx, 'media')
        });

    chain.module
        .rule('audio')
        .test(/\.(mp3|wav|flac|aac|m4a|opus)$/i)
        .type('asset/resource')
        .set('generator', {
            filename: filename(esmx, 'audio')
        });

    chain.module
        .rule('fonts')
        .test(/\.(woff|woff2|eot|ttf|otf|ttc)(\?.*)?$/i)
        .type('asset/resource')
        .set('generator', {
            filename: filename(esmx, 'fonts')
        });
}

function configureWorkerRule(
    chain: RspackChain,
    esmx: Esmx,
    options: RspackHtmlAppOptions
): void {
    chain.module
        .rule('worker')
        .test(/\.worker\.(c|m)?(t|j)s$/i)
        .use('worker-loader')
        .loader(
            options.loaders?.workerRspackLoader ??
                RSPACK_LOADER.workerRspackLoader
        )
        .options({
            esModule: false,
            filename: `${esmx.name}/workers/[name].[contenthash]${esmx.isProd ? '.final' : ''}.js`
        });
}

function configureTypeScriptRule(
    chain: RspackChain,
    buildTarget: BuildTarget,
    options: RspackHtmlAppOptions
): void {
    const targets = getTargetSetting(options?.target, buildTarget);
    chain.module
        .rule('typescript')
        .test(/\.(ts|mts)$/i)
        .use('swc-loader')
        .loader(
            options.loaders?.builtinSwcLoader ?? RSPACK_LOADER.builtinSwcLoader
        )
        .options({
            env: {
                targets,
                ...options?.swcLoader?.env
            },
            jsc: {
                parser: {
                    syntax: 'typescript',
                    ...options?.swcLoader?.jsc?.parser
                },
                ...options?.swcLoader?.jsc
            },
            ...options?.swcLoader
        } as SwcLoaderOptions)
        .end()
        .type('javascript/auto');
}

function configureOptimization(
    chain: RspackChain,
    options: RspackHtmlAppOptions
): void {
    chain.optimization
        .minimizer('swc-js-minimizer')
        .use(rspack.SwcJsMinimizerRspackPlugin, [
            {
                minimizerOptions: {
                    format: {
                        comments: false
                    }
                }
            }
        ]);

    chain.optimization
        .minimizer('lightningcss-minimizer')
        .use(rspack.LightningCssMinimizerRspackPlugin, [
            {
                minimizerOptions: {
                    targets: getTargetSetting(options?.target, 'client'),
                    errorRecovery: false
                }
            }
        ]);
}

function configureDefinePlugin(
    chain: RspackChain,
    buildTarget: BuildTarget,
    options: RspackHtmlAppOptions
): void {
    if (options.definePlugin) {
        const defineOptions: Record<string, string> = {};
        Object.entries(options.definePlugin).forEach(([name, value]) => {
            const targetValue =
                typeof value === 'string'
                    ? value
                    : value[buildTarget as keyof typeof value];
            if (typeof targetValue === 'string' && name !== targetValue) {
                defineOptions[name] = targetValue;
            }
        });

        if (Object.keys(defineOptions).length) {
            chain.plugin('define').use(rspack.DefinePlugin, [defineOptions]);
        }
    }
}

function configureCssRules(
    chain: RspackChain,
    esmx: Esmx,
    options: RspackHtmlAppOptions
): void {
    if (options.css === false) {
        return;
    }

    if (options.css === 'js') {
        configureCssInJS(chain, esmx, options);
        return;
    }
    configureCssExtract(chain, options);
}

function configureCssInJS(
    chain: RspackChain,
    esmx: Esmx,
    options: RspackHtmlAppOptions
): void {
    chain.module
        .rule('css')
        .test(/\.css$/)
        .use('style-loader')
        .loader(options.loaders?.styleLoader ?? RSPACK_LOADER.styleLoader)
        .options(options.styleLoader ?? {})
        .end()
        .use('css-loader')
        .loader(options.loaders?.cssLoader ?? RSPACK_LOADER.cssLoader)
        .options(options.cssLoader ?? {})
        .end()
        .use('lightning-css-loader')
        .loader(
            options.loaders?.lightningcssLoader ??
                RSPACK_LOADER.lightningcssLoader
        )
        .options({
            targets: getTargetSetting(options?.target, 'client'),
            minify: esmx.isProd
        } as LightningcssLoaderOptions)
        .end()
        .type('javascript/auto');

    const lessRule = chain.module
        .rule('less')
        .test(/\.less$/)
        .use('style-loader')
        .loader(options.loaders?.styleLoader ?? RSPACK_LOADER.styleLoader)
        .options(options.styleLoader ?? {})
        .end()
        .use('css-loader')
        .loader(options.loaders?.cssLoader ?? RSPACK_LOADER.cssLoader)
        .options(options.cssLoader ?? {})
        .end()
        .use('lightning-css-loader')
        .loader(
            options.loaders?.lightningcssLoader ??
                RSPACK_LOADER.lightningcssLoader
        )
        .options({
            targets: getTargetSetting(options?.target, 'client'),
            minify: esmx.isProd
        } as LightningcssLoaderOptions)
        .end()
        .use('less-loader')
        .loader(options.loaders?.lessLoader ?? RSPACK_LOADER.lessLoader)
        .options(options.lessLoader ?? {})
        .end();

    if (options.styleResourcesLoader) {
        lessRule
            .use('style-resources-loader')
            .loader(
                options.loaders?.styleResourcesLoader ??
                    RSPACK_LOADER.styleResourcesLoader
            )
            .options(options.styleResourcesLoader);
    }

    lessRule.type('javascript/auto');
}

function configureCssExtract(
    chain: RspackChain,
    options: RspackHtmlAppOptions
): void {
    chain.set('experiments', {
        ...(chain.get('experiments') ?? {}),
        css: true
    });

    const experiments = chain.get('experiments');
    if (!experiments || !experiments.css) {
        return;
    }

    const lessRule = chain.module
        .rule('less')
        .test(/\.less$/)
        .use('less-loader')
        .loader(options.loaders?.lessLoader ?? RSPACK_LOADER.lessLoader)
        .options(options.lessLoader ?? {})
        .end();

    if (options.styleResourcesLoader) {
        lessRule
            .use('style-resources-loader')
            .loader(
                options.loaders?.styleResourcesLoader ??
                    RSPACK_LOADER.styleResourcesLoader
            )
            .options(options.styleResourcesLoader);
    }

    lessRule.type('css');
}

function filename(esmx: Esmx, name: string, ext = '[ext]') {
    return esmx.isProd
        ? `${name}/[name].[contenthash:8].final${ext}`
        : `${name}/[path][name]${ext}`;
}

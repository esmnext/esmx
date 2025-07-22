import type { Esmx } from '@esmx/core';
import {
    type LightningcssLoaderOptions,
    type SwcLoaderOptions,
    rspack
} from '@rspack/core';
import NodePolyfillPlugin from 'node-polyfill-webpack-plugin';
import type RspackChain from 'rspack-chain';
import {
    type BuildTarget,
    RSPACK_LOADER,
    type RspackAppOptions,
    createRspackApp
} from '../rspack';

export interface RspackHtmlAppOptions extends RspackAppOptions {
    /**
     * CSS 输出模式配置
     *
     * @default 根据环境自动选择：
     * - 生产环境: 'css'，将CSS输出到独立文件中，有利于缓存和并行加载
     * - 开发环境: 'js'，将CSS打包到JS中以支持热更新(HMR)，实现样式的即时更新
     *
     * - 'css': 将 CSS 输出到独立的 CSS 文件中
     * - 'js': 将 CSS 打包到 JS 文件中，运行时动态插入样式
     * - false: 关闭默认的 CSS 处理配置，需要手动配置 loader 规则
     *
     * @example
     * ```ts
     * // 使用环境默认配置
     * css: undefined
     *
     * // 强制输出到独立的 CSS 文件
     * css: 'css'
     *
     * // 强制打包到 JS 中
     * css: 'js'
     *
     * // 自定义 CSS 处理
     * css: false
     * ```
     */
    css?: 'css' | 'js' | false;

    /**
     * 自定义 loader 配置
     *
     * 允许替换默认的 loader 实现，可用于切换到特定框架的 loader
     *
     * @example
     * ```ts
     * // 使用 Vue 的 style-loader
     * loaders: {
     *   styleLoader: 'vue-style-loader'
     * }
     * ```
     */
    loaders?: Partial<Record<keyof typeof RSPACK_LOADER, string>>;

    /**
     * style-loader 配置项
     *
     * 用于配置样式注入方式，完整选项参考:
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
     * css-loader 配置项
     *
     * 用于配置 CSS 模块化、URL 解析等，完整选项参考:
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
     * less-loader 配置项
     *
     * 用于配置 Less 编译选项，完整选项参考:
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
     * style-resources-loader 配置项
     *
     * 用于自动注入全局的样式资源，完整选项参考:
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
     * SWC loader 配置项
     *
     * 用于配置 TypeScript/JavaScript 编译选项，完整选项参考:
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
     * DefinePlugin 配置项
     *
     * 用于定义编译时的全局常量，支持针对不同构建目标设置不同的值
     * 完整说明参考: https://rspack.dev/plugins/webpack/define-plugin
     *
     * @example
     * ```ts
     * // 统一的值
     * definePlugin: {
     *   'process.env.APP_ENV': JSON.stringify('production')
     * }
     *
     * // 针对不同构建目标的值
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
     * 构建目标配置
     *
     * 用于设置代码的目标运行环境，影响代码的编译降级和 polyfill 注入
     *
     * @example
     * ```ts
     * target: {
     *   // 浏览器构建目标
     *   web: ['chrome>=87', 'firefox>=78', 'safari>=14'],
     *   // Node.js 构建目标
     *   node: ['node>=16']
     * }
     * ```
     */
    target?: {
        /**
         * 浏览器构建目标
         *
         * @default ['chrome>=64', 'edge>=79', 'firefox>=67', 'safari>=11.1']
         */
        web?: string[];

        /**
         * Node.js 构建目标
         *
         * @default ['node>=24']
         */
        node?: string[];
    };
}

export async function createRspackHtmlApp(
    esmx: Esmx,
    options?: RspackHtmlAppOptions
) {
    options = {
        ...options,
        target: {
            web: ['chrome>=64', 'edge>=79', 'firefox>=67', 'safari>=11.1'],
            node: ['node>=24'],
            ...options?.target
        },
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
        .test(/\.(jpe?g|png|gif|bmp|webp|svg)$/i)
        .type('asset/resource')
        .set('generator', {
            filename: filename(esmx, 'images')
        });

    chain.module
        .rule('media')
        .test(/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i)
        .type('asset/resource')
        .set('generator', {
            filename: filename(esmx, 'media')
        });

    chain.module
        .rule('fonts')
        .test(/\.(woff|woff2|eot|ttf|otf)(\?.*)?$/i)
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
    chain.module
        .rule('typescript')
        .test(/\.(ts|mts)$/i)
        .use('swc-loader')
        .loader(
            options.loaders?.builtinSwcLoader ?? RSPACK_LOADER.builtinSwcLoader
        )
        .options({
            env: {
                targets:
                    buildTarget === 'client'
                        ? options?.target?.web
                        : options?.target?.node,
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
                    targets: options.target?.web,
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
    configureCssExtract(chain, esmx, options);
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
        .options(options.styleLoader || {})
        .end()
        .use('css-loader')
        .loader(options.loaders?.cssLoader ?? RSPACK_LOADER.cssLoader)
        .options(options.cssLoader || {})
        .end()
        .use('lightning-css-loader')
        .loader(
            options.loaders?.lightningcssLoader ??
                RSPACK_LOADER.lightningcssLoader
        )
        .options({
            targets: options.target?.web ?? [],
            minify: esmx.isProd
        } as LightningcssLoaderOptions)
        .end()
        .type('javascript/auto');

    const lessRule = chain.module
        .rule('less')
        .test(/\.less$/)
        .use('style-loader')
        .loader(options.loaders?.styleLoader ?? RSPACK_LOADER.styleLoader)
        .options(options.styleLoader || {})
        .end()
        .use('css-loader')
        .loader(options.loaders?.cssLoader ?? RSPACK_LOADER.cssLoader)
        .options(options.cssLoader || {})
        .end()
        .use('lightning-css-loader')
        .loader(
            options.loaders?.lightningcssLoader ??
                RSPACK_LOADER.lightningcssLoader
        )
        .options({
            targets: options.target?.web ?? [],
            minify: esmx.isProd
        } as LightningcssLoaderOptions)
        .end()
        .use('less-loader')
        .loader(options.loaders?.lessLoader ?? RSPACK_LOADER.lessLoader)
        .options(options.lessLoader || {})
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
    esmx: Esmx,
    options: RspackHtmlAppOptions
): void {
    chain.set('experiments', {
        ...(chain.get('experiments') || {}),
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
        .options(options.lessLoader || {})
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

/**
 * @file Node.js 服务器入口文件
 * @description 负责开发环境配置和服务器启动，提供 SSR 运行时环境
 */

import http from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * 配置开发环境的应用创建器
     * @description 创建并配置 Rspack 应用实例，用于开发环境的构建和热更新
     */
    async devApp(esmx) {
        // Import plugin di top level (bukan di dalam chain)
        const ReactRefreshPlugin = (
            await import('@rspack/plugin-react-refresh')
        ).default;

        // Resolve loaders dan import plugins di top level
        let postcssLoaderPath: string | null = null;
        let styleLoaderPath: string | null = null;
        let cssLoaderPath: string | null = null;
        let tailwindcss: any = null;
        let autoprefixer: any = null;

        try {
            const postcssLoaderModule = await import.meta.resolve(
                'postcss-loader'
            );
            postcssLoaderPath = fileURLToPath(postcssLoaderModule);
            console.log('✓ postcss-loader found at:', postcssLoaderPath);
        } catch (e) {
            console.warn(
                '⚠ postcss-loader not found, Tailwind may not work correctly:',
                e
            );
        }

        try {
            const styleLoaderModule = await import.meta.resolve('style-loader');
            styleLoaderPath = fileURLToPath(styleLoaderModule);
            console.log('✓ style-loader found at:', styleLoaderPath);
        } catch (e) {
            console.warn('⚠ style-loader not found:', e);
        }

        try {
            const cssLoaderModule = await import.meta.resolve('css-loader');
            cssLoaderPath = fileURLToPath(cssLoaderModule);
            console.log('✓ css-loader found at:', cssLoaderPath);
        } catch (e) {
            console.warn('⚠ css-loader not found:', e);
        }

        // Import Tailwind dan Autoprefixer plugins
        try {
            const tailwindcssModule = await import('tailwindcss');
            tailwindcss = tailwindcssModule.default;
            const autoprefixerModule = await import('autoprefixer');
            autoprefixer = autoprefixerModule.default;
            console.log('✓ Tailwind and Autoprefixer plugins loaded');
        } catch (e) {
            console.warn('⚠ Failed to load Tailwind/Autoprefixer plugins:', e);
        }

        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                // Disable default CSS configuration dan buat manual untuk PostCSS
                css: false,
                chain({ chain, buildTarget, esmx }) {
                    // Tambahkan .tsx ke extensions (penting untuk resolve TSX files)
                    chain.resolve.extensions.add('.tsx');

                    // Configure path aliases untuk @/* imports
                    const srcPath = join(esmx.root, 'src');
                    chain.resolve.alias.set('@', srcPath);

                    // Konfigurasi untuk React TSX/TSX
                    // Note: Rule ini akan override rule TypeScript default untuk .tsx files
                    chain.module
                        .rule('tsx')
                        .test(/\.tsx?$/) // Match both .ts and .tsx
                        .use('swc-loader')
                        .loader('builtin:swc-loader')
                        .options({
                            jsc: {
                                parser: {
                                    syntax: 'typescript',
                                    tsx: true, // Enable TSX parsing
                                    decorators: true
                                },
                                transform: {
                                    react: {
                                        runtime: 'automatic', // React 17+ automatic JSX
                                        development:
                                            buildTarget === 'client' &&
                                            !esmx.isProd,
                                        refresh:
                                            buildTarget === 'client' &&
                                            !esmx.isProd
                                    }
                                }
                            }
                        })
                        .end()
                        .type('javascript/auto');

                    // Buat CSS rule manual dengan PostCSS loader
                    // Hanya untuk client build
                    // Urutan loader di webpack/rspack: diproses dari KANAN ke KIRI (bottom to top dalam chain)
                    // Urutan penulisan di chain: style-loader -> css-loader -> postcss-loader
                    // Urutan eksekusi: postcss-loader (pertama) -> css-loader (kedua) -> style-loader (terakhir)
                    if (buildTarget === 'client') {
                        if (postcssLoaderPath) {
                            // Mode dengan PostCSS untuk Tailwind (development & production)
                            const postcssConfigPath = join(
                                esmx.root,
                                'postcss.config.js'
                            );
                            console.log(
                                '✓ Configuring CSS rule with PostCSS for Tailwind'
                            );
                            console.log('  PostCSS config:', postcssConfigPath);
                            console.log('  PostCSS loader:', postcssLoaderPath);

                            // Hapus rule CSS yang mungkin sudah ada
                            if (chain.module.rules.has('css')) {
                                chain.module.rules.delete('css');
                            }

                            // Buat rule CSS baru dengan PostCSS
                            // Urutan penulisan: style-loader -> css-loader -> postcss-loader
                            // Urutan eksekusi: postcss-loader (pertama) -> css-loader (kedua) -> style-loader (terakhir)
                            const tailwindConfigPath = join(
                                esmx.root,
                                'tailwind.config.js'
                            );

                            // Buat postcssOptions dengan plugins secara eksplisit
                            const postcssOptions: any = {};

                            if (tailwindcss && autoprefixer) {
                                // Gunakan plugins secara eksplisit
                                postcssOptions.plugins = [
                                    tailwindcss({ config: tailwindConfigPath }),
                                    autoprefixer()
                                ];
                                console.log(
                                    '  Using Tailwind and Autoprefixer plugins directly'
                                );
                            } else {
                                // Fallback ke config file
                                postcssOptions.config = postcssConfigPath;
                                console.log('  Using PostCSS config file');
                            }

                            chain.module
                                .rule('css')
                                .test(/\.css$/)
                                .use('style-loader')
                                .loader(styleLoaderPath || 'style-loader')
                                .end()
                                .use('css-loader')
                                .loader(cssLoaderPath || 'css-loader')
                                .options({
                                    importLoaders: 1, // Process dengan postcss-loader sebelum css-loader
                                    esModule: false,
                                    modules: false
                                })
                                .end()
                                .use('postcss-loader')
                                .loader(postcssLoaderPath) // Gunakan path file langsung
                                .options({
                                    postcssOptions,
                                    sourceMap: false
                                })
                                .end()
                                .type('javascript/auto');
                        } else {
                            console.warn(
                                '⚠ PostCSS loader not available, CSS will be processed without Tailwind'
                            );
                            // postcss-loader tidak tersedia: gunakan default tanpa PostCSS
                            chain.module
                                .rule('css')
                                .test(/\.css$/)
                                .use('style-loader')
                                .loader(styleLoaderPath || 'style-loader')
                                .end()
                                .use('css-loader')
                                .loader(cssLoaderPath || 'css-loader')
                                .end()
                                .type('javascript/auto');
                        }
                    }

                    // Plugin React Refresh untuk HMR (hanya di client + development)
                    if (buildTarget === 'client' && !esmx.isProd) {
                        chain.plugin('react-refresh').use(ReactRefreshPlugin);
                    }
                }
            })
        );
    },

    /**
     * 配置并启动 HTTP 服务器
     * @description 创建 HTTP 服务器实例，集成 Esmx 中间件，处理 SSR 请求
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // 使用 Esmx 中间件处理请求
            esmx.middleware(req, res, async () => {
                // 执行服务端渲染
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('服务启动: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;

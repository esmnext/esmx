import type { Esmx } from '@esmx/core';
import { createRspackHtmlApp, rspack } from '@esmx/rspack';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import type { RspackReactAppOptions } from './react';

export function createRspackReactApp(
    esmx: Esmx,
    options?: RspackReactAppOptions
) {
    return createRspackHtmlApp(esmx, {
        ...options,
        chain(context) {
            const { chain, buildTarget, esmx } = context;

            // Add .tsx and .jsx to extensions
            chain.resolve.extensions.add('.tsx').add('.jsx');

            // Configure React JSX/TSX loader
            // Create a separate rule for TSX/JSX files to add React support
            chain.module
                .rule('react-tsx')
                .test(/\.(tsx|jsx)$/)
                .use('swc-loader')
                .loader('builtin:swc-loader')
                .options({
                    jsc: {
                        parser: {
                            syntax: 'typescript',
                            tsx: true,
                            decorators: true
                        },
                        transform: {
                            react: {
                                runtime: 'automatic',
                                development:
                                    buildTarget === 'client' && !esmx.isProd,
                                refresh:
                                    buildTarget === 'client' && !esmx.isProd
                            }
                        }
                    }
                })
                .end()
                .type('javascript/auto');

            // Add React Refresh plugin for HMR (client + development only)
            // Automatically enabled for client development, same as Vue HMR
            if (buildTarget === 'client' && !esmx.isProd) {
                chain.plugin('react-refresh').use(ReactRefreshPlugin);
            }

            // Note: React SSR doesn't need special loader like Vue
            // React components can be rendered directly with react-dom/server

            // React uses CommonJS, need to configure proper ESM interop
            // This ensures react and react-dom are bundled with proper ESM exports
            chain.resolve.set('fullySpecified', false);

            // Configure module concatenation for better ESM output
            chain.optimization.set('concatenateModules', true);

            // Define React environment
            if (buildTarget === 'client') {
                chain.plugin('define-react-env').use(rspack.DefinePlugin, [
                    {
                        'process.env.NODE_ENV': JSON.stringify(
                            esmx.isProd ? 'production' : 'development'
                        )
                    }
                ]);
            }

            options?.chain?.(context);
        }
    });
}

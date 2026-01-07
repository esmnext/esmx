import type { Esmx } from '@esmx/core';
import { createRspackHtmlApp, rspack } from '@esmx/rspack';
import ReactRefreshPlugin from '@rspack/plugin-react-refresh';
import { reactServerRenderLoader } from './loaders';
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
            const reactRule = chain.module
                .rule('react-tsx')
                .test(/\.(tsx|jsx)$/);

            // Add SSR loader for server builds (before swc-loader)
            if (buildTarget === 'server') {
                reactRule
                    .use('react-server-render-loader')
                    .loader(reactServerRenderLoader);
            }

            reactRule
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

            // React SSR loader is configured above in the react-tsx rule
            // It tracks import.meta for each component during server-side rendering

            // React aliases are handled automatically by Rspack
            // No need to set explicit aliases

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

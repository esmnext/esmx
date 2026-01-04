import type { Esmx } from '@esmx/core';
import type { RspackOptions } from '@rspack/core';
import { rspack } from '@rspack/core';
import RspackChain from 'rspack-chain';
import nodeExternals from 'webpack-node-externals';
import type { ModuleLinkPluginOptions } from '../module-link';
import { initModuleLink } from '../module-link';
import type { RspackAppOptions } from './app';
import type { BuildTarget } from './build-target';

export function createChainConfig(
    esmx: Esmx,
    buildTarget: BuildTarget,
    options: RspackAppOptions
): RspackChain {
    const isHot = buildTarget === 'client' && !esmx.isProd;
    const isClient = buildTarget === 'client';
    const isServer = buildTarget === 'server';
    const isNode = buildTarget === 'node';

    const chain = new RspackChain();

    chain.context(esmx.root);
    chain.mode(esmx.isProd ? 'production' : 'development');
    chain.target(isClient ? 'web' : 'node24');
    chain.cache(!esmx.isProd);

    chain.output
        .clean(esmx.isProd)
        .filename(
            !isNode && esmx.isProd
                ? '[name].[contenthash:8].final.mjs'
                : '[name].mjs'
        )
        .chunkFilename(
            esmx.isProd
                ? 'chunks/[name].[contenthash:8].final.mjs'
                : 'chunks/[name].mjs'
        )
        .publicPath(
            isClient ? 'auto' : `${esmx.basePathPlaceholder}${esmx.basePath}`
        );

    chain.output.set(
        'cssFilename',
        esmx.isProd ? '[name].[contenthash:8].final.css' : '[name].css'
    );
    chain.output.set(
        'cssChunkFilename',
        esmx.isProd
            ? 'chunks/[name].[contenthash:8].final.css'
            : 'chunks/[name].css'
    );
    chain.output.path(esmx.resolvePath('dist', buildTarget));

    chain.plugin('progress').use(rspack.ProgressPlugin, [
        {
            prefix: buildTarget
        }
    ]);

    if (isHot) {
        chain.plugin('hmr').use(rspack.HotModuleReplacementPlugin);
    }

    chain.module.parser.set('javascript', {
        url: isClient ? true : 'relative',
        importMeta: false,
        strictExportPresence: true
    });

    chain.module.generator.set('asset', {
        emit: isClient
    });

    chain.module.generator.set('asset/resource', {
        emit: isClient
    });

    chain.resolve.alias.set(esmx.name, esmx.root);

    chain.optimization
        .minimize(options.minimize ?? esmx.isProd)
        .emitOnErrors(true);

    chain.externalsPresets({
        web: isClient,
        node: isServer || isNode
    });

    chain.externalsType('module-import');

    if (isNode) {
        chain.externals([
            // @ts-expect-error
            nodeExternals({
                // @ts-expect-error
                importType: 'module-import'
            })
        ]);
    }

    chain.experiments({
        ...(chain.get('experiments') || {}),
        outputModule: true,
        nativeWatcher: true,
        rspackFuture: {
            bundlerInfo: { force: false }
        }
    });

    // Configure lazy compilation following Rspack 1.7.0 standard
    // Enable for client builds in development mode only
    // Explicitly disable for all other build targets (server, node) and production mode
    if (!esmx.isProd && isClient) {
        chain.set('lazyCompilation', {
            imports: true,
            entries: false
        });
    } else {
        // Explicitly disable lazy compilation for server, node builds, and production mode
        chain.set('lazyCompilation', false);
    }

    initModuleLink(chain, createModuleLinkConfig(esmx, buildTarget));

    return chain;
}

function createModuleLinkConfig(
    esmx: Esmx,
    buildTarget: BuildTarget
): ModuleLinkPluginOptions {
    const isClient = buildTarget === 'client';
    const isServer = buildTarget === 'server';
    const isNode = buildTarget === 'node';

    if (isNode) {
        return {
            name: esmx.name,
            exports: {
                'src/entry.node': {
                    pkg: false,
                    file: './src/entry.node'
                }
            }
        };
    }

    const preEntries: string[] = [];
    if (isClient && !esmx.isProd) {
        preEntries.push(
            `${import.meta.resolve('webpack-hot-middleware/client.js')}?path=/${esmx.name}/hot-middleware`
        );
    }

    return {
        ...esmx.moduleConfig.environments[buildTarget],
        name: esmx.name,
        injectChunkName: isServer,
        deps: Object.keys(esmx.moduleConfig.links),
        preEntries
    };
}

export function createRspackConfig(
    esmx: Esmx,
    buildTarget: BuildTarget,
    options: RspackAppOptions
): RspackOptions {
    const chain = createChainConfig(esmx, buildTarget, options);
    options.chain?.({ esmx, options, buildTarget, chain });
    const config = chain.toConfig();
    options.config?.({ esmx, options, buildTarget, config });
    return config;
}

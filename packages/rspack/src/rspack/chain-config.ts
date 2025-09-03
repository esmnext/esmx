import type { Esmx } from '@esmx/core';
import { moduleLinkPlugin } from '@esmx/rspack-module-link-plugin';
import { rspack } from '@rspack/core';
import type { RspackOptions } from '@rspack/core';
import RspackChain from 'rspack-chain';
import nodeExternals from 'webpack-node-externals';
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

    const config = new RspackChain();

    config.context(esmx.root);
    config.mode(esmx.isProd ? 'production' : 'development');
    config.target(isClient ? 'web' : 'node24');
    config.cache(!esmx.isProd);

    config.output
        .clean(esmx.isProd)
        .filename(
            !isNode && esmx.isProd
                ? 'exports/[name].[contenthash:8].final.mjs'
                : 'exports/[name].mjs'
        )
        .chunkFilename(
            esmx.isProd
                ? 'chunks/[name].[contenthash:8].final.mjs'
                : 'chunks/[name].mjs'
        )
        .publicPath(
            isClient ? 'auto' : `${esmx.basePathPlaceholder}${esmx.basePath}`
        );

    config.output.set(
        'cssFilename',
        esmx.isProd
            ? 'exports/[name].[contenthash:8].final.css'
            : 'exports/[name].css'
    );
    config.output.set(
        'cssChunkFilename',
        esmx.isProd
            ? 'chunks/[name].[contenthash:8].final.css'
            : 'chunks/[name].css'
    );

    const outputPath = (() => {
        switch (buildTarget) {
            case 'client':
                return esmx.resolvePath('dist/client');
            case 'server':
                return esmx.resolvePath('dist/server');
            case 'node':
                return esmx.resolvePath('dist/node');
        }
    })();
    config.output.path(outputPath);

    config.plugin('progress').use(rspack.ProgressPlugin, [
        {
            prefix: buildTarget
        }
    ]);

    config
        .plugin('module-link')
        .use(moduleLinkPlugin, [createModuleLinkConfig(esmx, buildTarget)]);

    if (isHot) {
        config.plugin('hmr').use(rspack.HotModuleReplacementPlugin);
    }

    config.module.parser.set('javascript', {
        url: isClient ? true : 'relative'
    });

    config.module.generator.set('asset', {
        emit: isClient
    });

    config.module.generator.set('asset/resource', {
        emit: isClient
    });

    config.resolve.alias.set(esmx.name, esmx.root);

    config.optimization
        .minimize(options.minimize ?? esmx.isProd)
        .emitOnErrors(true);

    config.externalsPresets({
        web: isClient,
        node: isServer || isNode
    });
    config.externalsType('module-import');

    if (isNode) {
        config.externals([
            // @ts-ignore
            nodeExternals({
                // @ts-ignore
                importType: 'module-import'
            })
        ]);
    }

    return config;
}

function createModuleLinkConfig(esmx: Esmx, buildTarget: BuildTarget) {
    const isClient = buildTarget === 'client';
    const isServer = buildTarget === 'server';
    const isNode = buildTarget === 'node';

    if (isNode) {
        return {
            name: esmx.name,
            exports: {
                'src/entry.node': {
                    rewrite: false,
                    file: './src/entry.node'
                }
            }
        };
    }

    const exports: Record<string, { rewrite: boolean; file: string }> = {};
    for (const [name, item] of Object.entries(esmx.moduleConfig.exports)) {
        if (item.entryPoints[buildTarget]) {
            exports[name] = {
                rewrite: item.rewrite,
                file: item.entryPoints[buildTarget]
            };
        }
    }

    const preEntries: string[] = [];
    if (isClient && !esmx.isProd) {
        preEntries.push(
            `${import.meta.resolve('webpack-hot-middleware/client.js')}?path=/${esmx.name}/hot-middleware`
        );
    }

    return {
        name: esmx.name,
        injectChunkName: isServer,
        imports: esmx.moduleConfig.imports,
        deps: Object.keys(esmx.moduleConfig.links),
        exports,
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

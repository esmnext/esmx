import path from 'node:path';
import type { Esmx } from '@esmx/core';
import { buildPkgWrapper } from '@esmx/pkg-wrapper';
import type { RspackOptions } from '@rspack/core';
import { rspack } from '@rspack/core';
import { RspackChain } from 'rspack-chain';
import RspackVirtualModulePlugin from 'rspack-plugin-virtual-module';
import nodeExternals from 'webpack-node-externals';
import type { ModuleLinkPluginOptions } from '../module-link';
import { initModuleLink } from '../module-link';
import type { RspackAppOptions } from './app';
import type { BuildTarget } from './build-target';

export async function createChainConfig(
    esmx: Esmx,
    buildTarget: BuildTarget,
    options: RspackAppOptions
): Promise<RspackChain> {
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
        importMeta: false
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
        .emitOnErrors(true)
        .runtimeChunk('single');

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

    chain.output.set('module', true);
    chain.output.bundlerInfo({ force: false });
    chain.set('nativeWatcher', true);

    chain.set('lazyCompilation', false);

    const { linkOpts, virtualModules } = await createModuleLinkConfig(
        esmx,
        buildTarget
    );

    // Install pkg-export wrappers as VIRTUAL MODULES. Each `pkg:react`
    // becomes a virtual file under `<cwd>/node_modules/.esmx-virtual/<remote>/`
    // whose source is the generated re-export wrapper. The federation entry
    // points at this virtual file; the wrapper internally does
    // `import * as __ns from 'react'` so the bundler's resolver / aliases
    // still apply to the real package. Same mental model as Vite's
    // `esmx://react` virtual id pattern, realized through
    // `rspack-plugin-virtual-module` here.
    if (Object.keys(virtualModules).length > 0) {
        chain
            .plugin('esmx-pkg-virtual-modules')
            .use(RspackVirtualModulePlugin, [
                virtualModules,
                `.esmx-virtual-${esmx.name}`
            ]);
    }

    initModuleLink(chain, linkOpts, esmx.isProd);

    return chain;
}

interface ModuleLinkBundle {
    linkOpts: ModuleLinkPluginOptions;
    /** Virtual module map: pseudo-path → wrapper source (empty for node). */
    virtualModules: Record<string, string>;
}

async function createModuleLinkConfig(
    esmx: Esmx,
    buildTarget: BuildTarget
): Promise<ModuleLinkBundle> {
    const isClient = buildTarget === 'client';
    const isServer = buildTarget === 'server';
    const isNode = buildTarget === 'node';

    if (isNode) {
        return {
            linkOpts: {
                name: esmx.name,
                exports: {
                    'src/entry.node': {
                        pkg: false,
                        file: './src/entry.node'
                    }
                }
            },
            virtualModules: {}
        };
    }

    const preEntries: string[] = [];
    if (isClient && !esmx.isProd) {
        preEntries.push(
            `${import.meta.resolve('webpack-hot-middleware/client.js')}?path=/${esmx.name}/hot-middleware`
        );
    }

    // Compute pkg-export wrappers as VIRTUAL MODULES (see installation site
    // in createChainConfig). The wrapper imports the real package by its
    // ORIGINAL bare specifier so the bundler's resolver / aliases still
    // apply; we only add static named-export plumbing on top.
    const env = esmx.moduleConfig.environments[buildTarget];
    const patchedExports: typeof env.exports = {};
    const virtualModules: Record<string, string> = {};
    const wrapperFiles: string[] = [];
    // The virtual modules plugin writes its files into a temp dir under
    // node_modules (see RspackVirtualModulePlugin instantiation above) — we
    // anchor on the same path so the federation entry (and externals
    // wrapper-skip check) sees the real on-disk path the bundler will report
    // as the chunk's issuer.
    const virtualBaseDir = path.join(
        esmx.root,
        'node_modules',
        `.esmx-virtual-${esmx.name}`
    );
    for (const [name, exp] of Object.entries(env.exports)) {
        if (exp.pkg && exp.file) {
            const { source } = await buildPkgWrapper({
                root: esmx.root,
                spec: exp.file
            });
            const safeName = `${exp.file.replace(/[^A-Za-z0-9_-]/g, '_')}.mjs`;
            // Key passed to the plugin is a SIMPLE filename — it gets joined
            // under the plugin's tempDir. The resulting actual on-disk path
            // is what rspack reports as the chunk's issuer.
            virtualModules[safeName] = source;
            const actualPath = path.join(virtualBaseDir, safeName);
            wrapperFiles.push(actualPath);
            patchedExports[name] = { ...exp, file: actualPath };
        } else {
            patchedExports[name] = exp;
        }
    }

    return {
        linkOpts: {
            ...env,
            exports: patchedExports,
            name: esmx.name,
            injectChunkName: isServer,
            deps: Object.keys(esmx.moduleConfig.links),
            preEntries,
            wrapperFiles
        },
        virtualModules
    };
}

export async function createRspackConfig(
    esmx: Esmx,
    buildTarget: BuildTarget,
    options: RspackAppOptions
): Promise<RspackOptions> {
    const chain = await createChainConfig(esmx, buildTarget, options);
    options.chain?.({ esmx, options, buildTarget, chain });
    const config = chain.toConfig();
    options.config?.({ esmx, options, buildTarget, config });
    return config;
}

import { rspack } from '@rspack/core';
import type RspackChain from 'rspack-chain';
import {
    applyEntryConfig,
    applyExternalsConfig,
    applyModuleConfig
} from './config';
import type { ParsedModuleLinkPluginOptions } from './types';

export function applyChainConfig2(
    chain: RspackChain,
    opts: ParsedModuleLinkPluginOptions
): void {
    applyEntryConfig(chain, opts);
    applyExternalsConfig(chain, opts);

    // Set module compilation configuration
    if (chain.get('mode') === 'production') {
        chain.output.set('module', true);

        chain
            .plugin('esm-library')
            .use(new rspack.experiments.EsmLibraryPlugin());
        chain.optimization.set('runtimeChunk', 'single');
    } else {
        applyModuleConfig(chain);
    }
}

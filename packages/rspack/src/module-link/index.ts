import type RspackChain from 'rspack-chain';
import { applyChainConfig1 } from './config1';
// import { applyChainConfig2 } from './config2';
import { ManifestPlugin } from './manifest-plugin';
import { parseOptions } from './parse';
import type { ModuleLinkPluginOptions } from './types';

export function initModuleLink(
    chain: RspackChain,
    options: ModuleLinkPluginOptions
): void {
    const opts = parseOptions(options);
    applyChainConfig1(chain, opts);
    // applyChainConfig2(chain, opts);

    chain.plugin('module-link-manifest').use(ManifestPlugin, [opts]);
}

export type { ModuleLinkPluginOptions } from './types';

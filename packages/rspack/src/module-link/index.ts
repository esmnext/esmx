import type RspackChain from 'rspack-chain';
import { applyChainConfig } from './apply-chain-config';
import { ManifestPlugin } from './manifest-plugin';
import { parseOptions } from './parse';
import type { ModuleLinkPluginOptions } from './types';

export function initModuleLink(
    chain: RspackChain,
    options: ModuleLinkPluginOptions
): void {
    const opts = parseOptions(options);

    applyChainConfig(chain, opts);

    chain.plugin('module-link-manifest').use(ManifestPlugin, [opts]);
}

export type { ModuleLinkPluginOptions } from './types';

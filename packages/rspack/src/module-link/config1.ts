import type RspackChain from 'rspack-chain';
import {
    applyEntryConfig,
    applyExternalsConfig,
    applyModuleConfig
} from './config';
import type { ParsedModuleLinkPluginOptions } from './types';

export function applyChainConfig1(
    chain: RspackChain,
    opts: ParsedModuleLinkPluginOptions
): void {
    applyEntryConfig(chain, opts);
    applyExternalsConfig(chain, opts);

    // Set module compilation configuration
    applyModuleConfig(chain);
    if (chain.get('mode') === 'production') {
        chain.output.library({
            type: 'modern-module'
        });
        chain.optimization.set('avoidEntryIife', true);
    }
}

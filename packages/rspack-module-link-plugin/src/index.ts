import type { Compiler, RspackPluginFunction } from '@rspack/core';
import { initConfig } from './config';
import { initEntry } from './entry';
import { initExternal } from './external';
import { intiManifestJson } from './manifest';
import { parseOptions } from './parse';
import type { ModuleLinkPluginOptions } from './types';

export function moduleLinkPlugin(
    options: ModuleLinkPluginOptions
): RspackPluginFunction {
    const opts = parseOptions(options);
    return (compiler: Compiler) => {
        initConfig(compiler, opts);
        initEntry(compiler, opts);
        initExternal(compiler, opts);
        intiManifestJson(compiler, opts);
    };
}

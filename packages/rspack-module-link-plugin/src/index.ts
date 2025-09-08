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
        initConfig(compiler.options);
        initEntry(compiler.options, opts);
        initExternal(compiler, opts);
        intiManifestJson(compiler, opts);
    };
}

export type { ModuleLinkPluginOptions };

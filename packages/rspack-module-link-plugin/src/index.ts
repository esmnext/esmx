import type { Compiler, RspackPluginFunction } from '@rspack/core';
import { intiManifestJson } from './manifest';
import { parseOptions } from './parse';
import type { ModuleLinkPluginOptions } from './types';
import { initV1 } from './v1';

export function moduleLinkPlugin(
    options: ModuleLinkPluginOptions
): RspackPluginFunction {
    const opts = parseOptions(options);
    return (compiler: Compiler) => {
        initV1(compiler, opts);
        intiManifestJson(compiler, opts);
    };
}

export type { ModuleLinkPluginOptions };

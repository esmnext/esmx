import type { ParsedModuleConfig } from '@esmx/core';
import type { Compiler, RspackPluginFunction } from '@rspack/core';
import { entryPlugin } from './entry-plugin';
import { externalPlugin } from './external-plugin';
import { packagePlugin } from './package-plugin';

export function moduleLinkPlugin(
    moduleConfig: ParsedModuleConfig
): RspackPluginFunction {
    return (compiler: Compiler) => {
        entryPlugin(moduleConfig, compiler);
        externalPlugin(moduleConfig, compiler);
        packagePlugin(moduleConfig, compiler);
    };
}

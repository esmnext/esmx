import type { Compiler } from '@rspack/core';
import type { ParsedModuleLinkPluginOptions } from '../types';
import { initConfig } from './config';
import { initEntry } from './entry';
import { initExternal } from './external';

export function initV1(
    compiler: Compiler,
    opts: ParsedModuleLinkPluginOptions
): void {
    initConfig(compiler.options);
    initEntry(compiler.options, opts);
    initExternal(compiler, opts);
}

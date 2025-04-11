import type { Compiler } from '@rspack/core';
import type { ParsedModuleLinkPluginOptions } from './types';

export function initEntry(
    compiler: Compiler,
    opts: ParsedModuleLinkPluginOptions
) {
    if (typeof compiler.options.entry === 'function') {
        throw new TypeError(`'entry' option does not support functions`);
    }
    let entry = compiler.options.entry;

    if (entry.main && Object.keys(entry.main).length === 0) {
        entry = {};
    }
    for (const value of Object.values(opts.exports)) {
        entry[value.name] = {
            import: [value.file]
        };
    }
    compiler.options.entry = entry;
}

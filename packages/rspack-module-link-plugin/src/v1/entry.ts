import type { RspackOptionsNormalized } from '@rspack/core';
import type { ParsedModuleLinkPluginOptions } from '../types';

export function initEntry(
    options: RspackOptionsNormalized,
    opts: ParsedModuleLinkPluginOptions
) {
    if (typeof options.entry === 'function') {
        throw new TypeError(`'entry' option does not support functions`);
    }
    let entry = options.entry;

    if (entry.main && Object.keys(entry.main).length === 0) {
        entry = {};
    }

    for (const value of Object.values(opts.exports)) {
        if (value.file) {
            entry[value.name] = {
                import: [...opts.preEntries, value.file]
            };
        }
    }

    options.entry = entry;
}

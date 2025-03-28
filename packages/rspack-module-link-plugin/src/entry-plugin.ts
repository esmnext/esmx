import type { ParsedModuleConfig } from '@esmx/core';
import type { Compiler } from '@rspack/core';

export function entryPlugin(
    moduleConfig: ParsedModuleConfig,
    compiler: Compiler
) {
    if (typeof compiler.options.entry === 'function') {
        throw new TypeError(`'entry' option does not support functions`);
    }
    const entry = compiler.options.entry;
    moduleConfig.exports.forEach(({ exportName, exportPath }) => {
        entry[exportName] = {
            import: [exportPath]
        };
    });
}

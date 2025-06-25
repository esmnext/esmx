import { styleText } from 'node:util';
import type {
    ModuleLinkPluginOptions,
    ParsedModuleLinkPluginOptions
} from './types';

export function parseOptions(
    options: ModuleLinkPluginOptions
): ParsedModuleLinkPluginOptions {
    const exports: ParsedModuleLinkPluginOptions['exports'] = {};
    if (options.exports) {
        for (const [name, item] of Object.entries(options.exports)) {
            exports[name] = {
                name,
                rewrite: !!item.rewrite,
                file: item.file,
                identifier: `${options.name}/${name}`
            };
        }
    }
    return {
        name: options.name,
        ext: options.ext ? `.${options.ext}` : '.mjs',
        exports,
        imports: options.imports ?? {},
        injectChunkName: options.injectChunkName ?? false,
        preEntries: options.preEntries ?? []
    };
}

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
            if (name in exports) {
                console.warn(
                    styleText(
                        'yellow',
                        `[rspack-module-link-plugin] Warning: Duplicate export name '${name}'.`
                    )
                );
                continue;
            }
            exports[name] = {
                name,
                rewrite: !!item.rewrite,
                file: item.file,
                identifier: item.rewrite ? `${options.name}/${name}` : name
            };
        }
    }
    return {
        name: options.name,
        ext: options.ext ? `.${options.ext}` : '.mjs',
        exports,
        injectChunkName: options.injectChunkName ?? false
    };
}

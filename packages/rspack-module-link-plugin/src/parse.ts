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
                pkg: !!item.pkg,
                file: item.file,
                identifier: `${options.name}/${name}`
            };
        }
    }
    const deps = (options.deps ?? []).filter((name) => name !== options.name);
    return {
        name: options.name,
        ext: options.ext ? `.${options.ext}` : '.mjs',
        exports,
        imports: options.imports ?? {},
        scopes: options.scopes ?? {},
        injectChunkName: options.injectChunkName ?? false,
        preEntries: options.preEntries ?? [],
        deps
    };
}

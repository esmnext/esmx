import { styleText } from 'node:util';
import type {
    ManifestJsonExportType,
    ModuleLinkPluginOptions,
    ParsedModuleLinkPluginOptions
} from './types';
const TYPE_PREFIX = {
    npm: 'npm:'
};

export function parseOptions(
    options: ModuleLinkPluginOptions
): ParsedModuleLinkPluginOptions {
    const exports: ParsedModuleLinkPluginOptions['exports'] = {};
    if (options.exports) {
        const setExport = (exportName: string, file: string) => {
            let type: ManifestJsonExportType = 'public';
            let name = exportName;
            for (const [key, value] of Object.entries(TYPE_PREFIX)) {
                if (name.startsWith(value)) {
                    name = name.substring(value.length) || options.name;
                    type = key as ManifestJsonExportType;
                    break;
                }
            }
            if (name in exports) {
                console.warn(
                    styleText(
                        'yellow',
                        `[rspack-module-link-plugin] Warning: Duplicate export name '${name}'.`
                    )
                );
                return;
            }
            let identifier: string;
            switch (type) {
                case 'public':
                    identifier = `${options.name}/${name}`;
                    break;
                case 'npm':
                    identifier = name;
                    break;
            }
            exports[name] = {
                name,
                type,
                identifier,
                file
            };
        };

        for (const exportOpts of options.exports) {
            if (typeof exportOpts === 'string') {
                let exportPath = exportOpts;
                for (const [, value] of Object.entries(TYPE_PREFIX)) {
                    if (exportPath.startsWith(value)) {
                        exportPath = exportPath.substring(value.length);
                        break;
                    }
                }
                setExport(exportOpts, exportPath);
            } else {
                for (const [exportName, exportPath] of Object.entries(
                    exportOpts
                )) {
                    setExport(exportName, exportPath);
                }
            }
        }
    }
    return {
        name: options.name,
        ext: options.ext ? `.${options.ext}` : '.mjs',
        exports,
        injectChunkName: options.injectChunkName ?? false
    };
}

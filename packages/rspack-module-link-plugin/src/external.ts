import type {
    Compiler,
    ExternalItem,
    ExternalItemFunctionData
} from '@rspack/core';
import type {
    ManifestJsonExport,
    ParsedModuleLinkPluginOptions
} from './types';

export function initExternal(
    compiler: Compiler,
    opts: ParsedModuleLinkPluginOptions
) {
    const externals: ExternalItem[] = [];
    if (Array.isArray(compiler.options.externals)) {
        externals.push(...compiler.options.externals);
    } else if (compiler.options.externals) {
        externals.push(compiler.options.externals);
    }

    const defaultContext = compiler.options.context ?? process.cwd();

    const absolutePathMap = new Map<string, ManifestJsonExport>();
    const identifierMap = new Map<string, ManifestJsonExport>();

    externals.push(async (data: ExternalItemFunctionData) => {
        if (!data.request || !data.context || !data.contextInfo?.issuer) return;

        if (absolutePathMap.size === 0) {
            await Promise.all(
                Object.values(opts.exports).map(async (value) => {
                    identifierMap.set(value.identifier, value);
                    const entry = await resolvePath(
                        data,
                        defaultContext,
                        value.file
                    );
                    if (entry) {
                        absolutePathMap.set(entry, value);
                    }
                })
            );
        }
        let exportItem = identifierMap.get(data.request);
        if (!exportItem) {
            const result = await resolvePath(data, data.context, data.request);
            if (result) {
                exportItem = absolutePathMap.get(result);
            }
        }

        if (exportItem) {
            return `module-import ${exportItem.identifier}`;
        }
    });
    compiler.options.externals = externals;
}

async function resolvePath(
    data: ExternalItemFunctionData,
    context: string,
    request: string
): Promise<string | null> {
    return new Promise((resolve) => {
        if (data.getResolve) {
            data.getResolve()(context, request, (err, res) => {
                resolve(res ? res : null);
            });
        } else {
            resolve(null);
        }
    });
}

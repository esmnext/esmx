import type {
    Compiler,
    ExternalItem,
    ExternalItemFunctionData
} from '@rspack/core';
import type { ParsedModuleLinkPluginOptions } from './types';

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

    const importMap = new Map<string, string>();
    externals.push(async (data: ExternalItemFunctionData) => {
        if (!data.request || !data.context || !data.contextInfo?.issuer) return;

        if (importMap.size === 0) {
            await Promise.all(
                Object.values(opts.exports).map(async (value) => {
                    const identifier = value.rewrite
                        ? value.identifier
                        : value.name;
                    importMap.set(identifier, identifier);
                    const entry = await resolvePath(
                        data,
                        defaultContext,
                        value.file
                    );
                    if (entry) {
                        importMap.set(entry, identifier);
                    }
                })
            );
            for (const key of Object.keys(opts.imports)) {
                importMap.set(key, key);
            }
        }
        // 1、先按照标识符查找
        let importName = importMap.get(data.request);
        if (!importName) {
            // 2、再按照路径查找
            const result = await resolvePath(data, data.context, data.request);
            if (result) {
                importName = importMap.get(result);
            }
        }

        if (importName) {
            return `module-import ${importName}`;
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

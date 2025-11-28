import type { ExternalItem, ExternalItemFunctionData } from '@rspack/core';
import type RspackChain from 'rspack-chain';
import type { ParsedModuleLinkPluginOptions } from './types';

export function applyEntryConfig(
    chain: RspackChain,
    opts: ParsedModuleLinkPluginOptions
): void {
    if (chain.entryPoints.has('main')) {
        const mainEntry = chain.entry('main');
        if (mainEntry.values().length === 0) {
            chain.entryPoints.clear();
        }
    }

    for (const value of Object.values(opts.exports)) {
        if (value.file) {
            const entry = chain.entry(value.name);
            for (const preEntry of opts.preEntries) {
                entry.add(preEntry);
            }
            entry.add(value.file);
        }
    }
}

export function applyModuleConfig(chain: RspackChain) {
    chain.output
        .set('module', true)
        .set('chunkFormat', 'module')
        .set('chunkLoading', 'import')
        .set('workerChunkLoading', 'import');
    chain.output.library({
        type: 'module'
    });
}

export function applyExternalsConfig(
    chain: RspackChain,
    opts: ParsedModuleLinkPluginOptions
): void {
    const existingExternals = chain.get('externals') || [];
    const externals: ExternalItem[] = Array.isArray(existingExternals)
        ? [...existingExternals]
        : [existingExternals];

    const compilerContext = chain.get('context') ?? process.cwd();
    const externalFunc = createExternalsFunction(opts, compilerContext);
    externals.push(externalFunc);

    chain.externals(externals);
}

function createExternalsFunction(
    opts: ParsedModuleLinkPluginOptions,
    compilerContext: string
) {
    const importMap = new Map<string, string>();
    let initPromise: Promise<void> | null = null;
    type ResolvePath = (
        request: string,
        context?: string
    ) => Promise<string | null>;
    const init = (resolvePath: ResolvePath): Promise<void> => {
        if (initPromise) return initPromise;

        initPromise = (async () => {
            await Promise.all(
                Object.values(opts.exports).map(async (value) => {
                    const identifier = value.pkg
                        ? value.name
                        : value.identifier;
                    importMap.set(identifier, identifier);
                    importMap.set(value.name, identifier);

                    const resolvedPath = await resolvePath(value.file);
                    if (resolvedPath) {
                        importMap.set(resolvedPath, identifier);
                    }
                })
            );

            for (const key of Object.keys(opts.imports)) {
                importMap.set(key, key);
            }
        })();

        return initPromise;
    };

    const match = async (
        request: string,
        context: string,
        resolvePath: ResolvePath
    ): Promise<string | null> => {
        if (!request) return null;

        if (opts.deps.length > 0) {
            const matchedDep = opts.deps.find(
                (dep) => request === dep || request.startsWith(`${dep}/`)
            );
            if (matchedDep) {
                return request;
            }
        }

        let importName = importMap.get(request);
        if (!importName) {
            const resolvedPath = await resolvePath(request, context);
            if (resolvedPath) {
                importName = importMap.get(resolvedPath);
            }
        }

        return importName || null;
    };

    const FILE_EXT_REGEX =
        /\.worker\.(js|mjs|cjs|jsx|mjsx|cjsx|ts|mts|cts|tsx|mtsx|ctsx)$/i;

    return async (data: ExternalItemFunctionData) => {
        if (
            !data.request ||
            !data.context ||
            !data.contextInfo?.issuer ||
            FILE_EXT_REGEX.test(data.contextInfo.issuer)
        )
            return;

        const defaultContext = compilerContext;
        const resolvePath: ResolvePath = async (
            request: string,
            context = defaultContext
        ): Promise<string | null> => {
            if (!data.getResolve) {
                return null;
            }
            const resolveFunc = data.getResolve();
            return new Promise<string | null>((resolve) => {
                resolveFunc(context, request, (err, res) => {
                    resolve(typeof res === 'string' ? res : null);
                });
            });
        };

        await init(resolvePath);
        const matchedIdentifier = await match(
            data.request,
            data.context,
            resolvePath
        );

        if (matchedIdentifier) {
            return `module-import ${matchedIdentifier}`;
        }
    };
}

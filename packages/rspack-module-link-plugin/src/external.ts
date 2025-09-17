import type {
    Compiler,
    ExternalItem,
    ExternalItemFunctionData
} from '@rspack/core';
import type { ParsedModuleLinkPluginOptions } from './types';

type ResolvePath = (
    request: string,
    context?: string
) => Promise<string | null>;

export function createExternals(opts: ParsedModuleLinkPluginOptions) {
    const importMap = new Map<string, string>();

    let initPromise: Promise<void> | null = null;

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

    return { init, match };
}

export function initExternal(
    compiler: Compiler,
    opts: ParsedModuleLinkPluginOptions
): void {
    const externals: ExternalItem[] = [];
    if (Array.isArray(compiler.options.externals)) {
        externals.push(...compiler.options.externals);
    } else if (compiler.options.externals) {
        externals.push(compiler.options.externals);
    }

    const { init, match } = createExternals(opts);
    const defaultContext = compiler.options.context ?? process.cwd();

    externals.push(async (data: ExternalItemFunctionData) => {
        if (!data.request || !data.context || !data.contextInfo?.issuer) return;

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
    });

    compiler.options.externals = externals;
}

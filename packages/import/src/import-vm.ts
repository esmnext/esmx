import fs from 'node:fs';
import { createRequire, isBuiltin } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { FileReadError } from './error';
import { createImportMapResolver } from './import-map-resolve';
import type { ImportMap } from './types';

const requireSync = createRequire(import.meta.url);

let lazyGlobalsMaterialized = false;

/**
 * Materializes Node's lazily-defined `DOMException` global in the main realm
 * before a vm SSR context is created.
 *
 * Node installs `DOMException` as a lazy getter on the global object. When that
 * getter is first invoked from inside a vm context — which happens when an SSR
 * library copies/enumerates `globalThis` during rendering (e.g. `@lit-labs/ssr`
 * runs `Object.assign(globalThis, window)`) — Node hits an `isolate_data`
 * native assertion and aborts the entire process, because vm contexts do not
 * carry Node's per-context data.
 *
 * This is a robustness property of esmx's own vm execution sandbox, not a shim
 * for any specific framework: reading the global here, in the main realm,
 * replaces the lazy getter with a plain data property on the shared global so
 * code running inside the vm only ever observes a concrete value. It runs once
 * and has no observable effect beyond eagerly instantiating a global that would
 * otherwise be created on first access anyway.
 */
function materializeLazyGlobals(): void {
    if (lazyGlobalsMaterialized) {
        return;
    }
    lazyGlobalsMaterialized = true;
    void globalThis.DOMException;
}

export interface VmImportOptions {
    readFileSync?: (path: string) => string;
}

async function importBuiltinModule(specifier: string, context: vm.Context) {
    const nodeModule = await import(specifier);
    const keys = Object.keys(nodeModule);
    const module = new vm.SyntheticModule(
        keys,
        function evaluateCallback() {
            keys.forEach((key) => {
                this.setExport(key, nodeModule[key]);
            });
        },
        {
            identifier: specifier,
            context: context
        }
    );
    await module.link(() => {
        throw new TypeError(`Native modules should not be linked`);
    });
    await module.evaluate();
    return module;
}

export function createVmImport(
    baseURL: URL,
    importMap: ImportMap = {},
    options?: VmImportOptions
) {
    const readFileSync =
        options?.readFileSync ?? ((path) => fs.readFileSync(path, 'utf-8'));
    const importMapResolver = createImportMapResolver(baseURL.href, importMap);
    const buildMeta = (specifier: string, parent: string): ImportMeta => {
        const result = importMapResolver(specifier, parent);

        const url: string = result ?? import.meta.resolve(specifier, parent);
        const filename = fileURLToPath(url);
        return {
            main: false,
            filename,
            dirname: path.dirname(filename),
            url,
            resolve: (specifier: string, parent: string | URL = url) => {
                return import.meta.resolve(specifier, parent);
            }
        };
    };

    function syncLinker(
        specifier: string,
        parent: string,
        context: vm.Context,
        cache: Map<string, vm.SourceTextModule>,
        linkStatus: Map<string, Promise<void>>,
        moduleIds: string[]
    ): vm.SourceTextModule | vm.SyntheticModule {
        if (isBuiltin(specifier)) {
            const nodeModule = requireSync(specifier);
            const keys = Object.keys(nodeModule);
            const hasDefault = keys.includes('default');
            if (!hasDefault) {
                keys.push('default');
            }
            const module = new vm.SyntheticModule(
                keys,
                function evaluateCallback() {
                    keys.forEach((key) => {
                        this.setExport(
                            key,
                            key === 'default' && !hasDefault
                                ? nodeModule
                                : nodeModule[key]
                        );
                    });
                },
                {
                    identifier: specifier,
                    context: context
                }
            );
            const linkResult = module.link(() => {
                throw new TypeError(`Native modules should not be linked`);
            });
            const linkPromise =
                linkResult && typeof linkResult.then === 'function'
                    ? linkResult.then(() => module.evaluate())
                    : module.evaluate();
            linkStatus.set(specifier, linkPromise);
            return module;
        }
        const meta = buildMeta(specifier, parent);

        const cachedModule = cache.get(meta.url);
        if (cachedModule) {
            return cachedModule;
        }

        let text: string;
        try {
            text = readFileSync(meta.filename);
        } catch (error) {
            throw new FileReadError(
                `Failed to read module: ${meta.filename}`,
                moduleIds,
                meta.filename,
                error as Error
            );
        }

        const module = new vm.SourceTextModule(text, {
            initializeImportMeta: (importMeta) => {
                Object.assign(importMeta, meta);
            },
            identifier: specifier,
            context: context,
            importModuleDynamically: (specifier, referrer) => {
                return moduleLinker(
                    specifier,
                    meta.url,
                    referrer.context,
                    cache,
                    linkStatus,
                    [...moduleIds, meta.filename]
                );
            }
        });

        cache.set(meta.url, module);

        const linkPromise = module
            .link((specifier: string, referrer) => {
                return syncLinker(
                    specifier,
                    meta.url,
                    referrer.context,
                    cache,
                    linkStatus,
                    [...moduleIds, meta.filename]
                );
            })
            .then(() => module.evaluate());

        linkStatus.set(meta.url, linkPromise);

        return module;
    }

    async function moduleLinker(
        specifier: string,
        parent: string,
        context: vm.Context,
        cache: Map<string, vm.SourceTextModule>,
        linkStatus: Map<string, Promise<void>>,
        moduleIds: string[]
    ) {
        if (isBuiltin(specifier)) {
            return importBuiltinModule(specifier, context);
        }
        const meta = buildMeta(specifier, parent);

        const cachedModule = cache.get(meta.url);
        if (cachedModule) {
            const status = linkStatus.get(meta.url);
            if (status) {
                await status;
            }
            return cachedModule;
        }

        const module = syncLinker(
            specifier,
            parent,
            context,
            cache,
            linkStatus,
            moduleIds
        );

        const status = linkStatus.get(meta.url);
        if (status) {
            await status;
        }

        return module;
    }

    return async (
        specifier: string,
        parent: string,
        sandbox?: vm.Context,
        options?: vm.CreateContextOptions
    ) => {
        materializeLazyGlobals();
        const context = vm.createContext(sandbox, options);
        const cache = new Map<string, vm.SourceTextModule>();
        const linkStatus = new Map<string, Promise<void>>();
        const module = await moduleLinker(
            specifier,
            parent,
            context,
            cache,
            linkStatus,
            []
        );

        return module.namespace as Record<string, any>;
    };
}

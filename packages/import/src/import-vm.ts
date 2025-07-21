import fs from 'node:fs';
import { isBuiltin } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import vm from 'node:vm';
import IM from '@import-maps/resolve';
import { CircularDependencyError, FileReadError } from './error';
import type { ImportMap } from './types';

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

export function createVmImport(baseURL: URL, importMap: ImportMap = {}) {
    const parsedImportMap = IM.parse(importMap, baseURL);
    const parse = (specifier: string, parent: string) => {
        const result = IM.resolve(specifier, parsedImportMap, new URL(parent));

        let filename: string;
        if (result.matched && result.resolvedImport) {
            filename = result.resolvedImport.href;
        } else {
            filename = import.meta.resolve(specifier, parent);
        }
        const url = pathToFileURL(filename);
        const pathname = fileURLToPath(url);
        return {
            filename,
            url,
            pathname
        };
    };
    async function moduleLinker(
        specifier: string,
        parent: string,
        context: vm.Context,
        cache: Map<string, Promise<vm.SourceTextModule>>,
        moduleIds: string[]
    ) {
        if (isBuiltin(specifier)) {
            return importBuiltinModule(specifier, context);
        }
        const parsed = parse(specifier, parent);

        if (moduleIds.includes(parsed.pathname)) {
            throw new CircularDependencyError(
                'Circular dependency detected',
                moduleIds,
                parsed.pathname
            );
        }

        const module = cache.get(parsed.pathname);
        if (module) {
            return module;
        }
        const modulePromise = new Promise<vm.SourceTextModule>((resolve) => {
            process.nextTick(() => {
                moduleBuild().then(resolve);
            });
        });

        const dirname = path.dirname(parsed.filename);
        cache.set(parsed.pathname, modulePromise);
        return modulePromise;

        async function moduleBuild(): Promise<vm.SourceTextModule> {
            let text: string;
            try {
                text = fs.readFileSync(parsed.pathname, 'utf-8');
            } catch (error) {
                throw new FileReadError(
                    `Failed to read module: ${parsed.pathname}`,
                    moduleIds,
                    parsed.pathname,
                    error as Error
                );
            }
            const module = new vm.SourceTextModule(text, {
                initializeImportMeta: (meta) => {
                    meta.filename = parsed.filename;
                    meta.dirname = dirname;
                    meta.resolve = (
                        specifier: string,
                        parent: string | URL = parsed.url
                    ) => {
                        return import.meta.resolve(specifier, parent);
                    };
                    meta.url = parsed.url.toString();
                },
                identifier: specifier,
                context: context,
                importModuleDynamically: (specifier, referrer) => {
                    return moduleLinker(
                        specifier,
                        parsed.filename,
                        referrer.context,
                        cache,
                        [...moduleIds, parsed.pathname]
                    );
                }
            });
            await module.link((specifier: string, referrer) => {
                return moduleLinker(
                    specifier,
                    parsed.filename,
                    referrer.context,
                    cache,
                    [...moduleIds, parsed.pathname]
                );
            });
            await module.evaluate();
            return module;
        }
    }
    return async (
        specifier: string,
        parent: string,
        sandbox?: vm.Context,
        options?: vm.CreateContextOptions
    ) => {
        const context = vm.createContext(sandbox, options);
        const module = await moduleLinker(
            specifier,
            parent,
            context,
            new Map(),
            []
        );

        return module.namespace as Record<string, any>;
    };
}

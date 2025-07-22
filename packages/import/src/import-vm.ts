import fs from 'node:fs';
import { isBuiltin } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { CircularDependencyError, FileReadError } from './error';
import { createImportMapResolver } from './import-map-resolve';
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
    const importMapResolver = createImportMapResolver(baseURL.href, importMap);
    const buildMeta = (specifier: string, parent: string): ImportMeta => {
        const result = importMapResolver(specifier, parent);

        const url: string = result ?? import.meta.resolve(specifier, parent);
        const filename = fileURLToPath(url);
        return {
            filename,
            dirname: path.dirname(filename),
            url,
            resolve: (specifier: string, parent: string | URL = url) => {
                return import.meta.resolve(specifier, parent);
            }
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
        const meta = buildMeta(specifier, parent);

        if (moduleIds.includes(meta.filename)) {
            throw new CircularDependencyError(
                'Circular dependency detected',
                moduleIds,
                meta.filename
            );
        }

        const module = cache.get(meta.filename);
        if (module) {
            return module;
        }
        const modulePromise = new Promise<vm.SourceTextModule>((resolve) => {
            process.nextTick(() => {
                moduleBuild().then(resolve);
            });
        });

        cache.set(meta.filename, modulePromise);
        return modulePromise;

        async function moduleBuild(): Promise<vm.SourceTextModule> {
            let text: string;
            try {
                text = fs.readFileSync(meta.filename, 'utf-8');
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
                        meta.filename,
                        referrer.context,
                        cache,
                        [...moduleIds, meta.filename]
                    );
                }
            });
            await module.link((specifier: string, referrer) => {
                return moduleLinker(
                    specifier,
                    meta.filename,
                    referrer.context,
                    cache,
                    [...moduleIds, meta.filename]
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

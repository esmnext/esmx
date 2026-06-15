import fs from 'node:fs';
import { createRequire, isBuiltin } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { FileReadError } from './error';
import { createImportMapResolver } from './import-map-resolve';
import type { ImportMap } from './types';

const requireSync = createRequire(import.meta.url);

/**
 * Cache value type. Style-asset imports (`*.css`, `*.scss`, etc.) materialize
 * as a `SyntheticModule` exposing the asset URL; everything else parses through
 * `SourceTextModule`. Both inherit from the (internal) base `vm.Module` and
 * expose the `namespace` getter the public API ultimately returns.
 */
type CachedVmModule = vm.SourceTextModule | vm.SyntheticModule;

/**
 * Extensions that the esmx federation contract treats as STYLE ASSETS rather
 * than executable JS modules. On the server they materialize as no-op synthetic
 * modules exposing the asset URL — they have no observable side effect there,
 * because there is no document. Browsers receive the stylesheet via a
 * `<link rel="stylesheet">` that the host injects from the federation manifest
 * (`chunks[*].css[]`), not by evaluating these modules. See
 * `docs/design/principles.md` P1 and the G section of the redesign plan.
 *
 * Query strings (`?inline`, `?url`) are tolerated — bundlers sometimes attach
 * them when rewriting CSS imports.
 */
const STYLE_ASSET_RE =
    /\.(?:css|scss|sass|less|stylus|styl|pcss|postcss)(?:\?.*)?$/i;

function isStyleAsset(url: string): boolean {
    return STYLE_ASSET_RE.test(url);
}

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
        cache: Map<string, CachedVmModule>,
        linkStatus: Map<string, Promise<void>>,
        moduleIds: string[]
    ): CachedVmModule {
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

        // Style assets (.css and friends) are part of esmx's federation
        // contract but carry no observable server-side behaviour — the host
        // emits a `<link rel="stylesheet">` from the manifest, not by
        // evaluating the file. Return a SyntheticModule exposing the asset
        // URL so user code that writes `import sheet from './x.css'`
        // typechecks and runs without the VM trying to parse CSS as JS.
        if (isStyleAsset(meta.url)) {
            const exportNames = ['default', 'href'];
            const styleModule = new vm.SyntheticModule(
                exportNames,
                function evaluateCallback() {
                    this.setExport('default', meta.url);
                    this.setExport('href', meta.url);
                },
                { identifier: specifier, context }
            );
            cache.set(meta.url, styleModule);
            const linkResult = styleModule.link(() => {
                throw new TypeError(
                    `Style modules should not be linked: ${specifier}`
                );
            });
            const linkPromise =
                linkResult && typeof linkResult.then === 'function'
                    ? linkResult.then(() => styleModule.evaluate())
                    : styleModule.evaluate();
            linkStatus.set(meta.url, linkPromise);
            return styleModule;
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
        cache: Map<string, CachedVmModule>,
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
        const cache = new Map<string, CachedVmModule>();
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

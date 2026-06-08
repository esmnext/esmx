import fs from 'node:fs';
import path from 'node:path';
import type {
    Esmx,
    ManifestJson,
    Middleware,
    RenderContextOptions
} from '@esmx/core';
import { RenderContext, type ServerRenderHandle } from '@esmx/core';
import {
    createServer,
    type InlineConfig,
    type Plugin,
    type ViteDevServer
} from 'vite';
import { createViteConfig, type ViteAppOptions } from './config';

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.mts'];

/** Resolve an extensionless export `file` to its real source path. */
function resolveSourceFile(root: string, file: string): string {
    const base = path.resolve(root, file);
    if (path.extname(base) && fs.existsSync(base)) {
        return base;
    }
    for (const ext of SOURCE_EXTENSIONS) {
        if (fs.existsSync(base + ext)) {
            return base + ext;
        }
    }
    return base;
}

/**
 * Development server (real HMR), validated by the poc-hmr feasibility test.
 *
 * Runs a Vite dev server in middleware mode with `base` set to esmx's
 * `/<name>/` path so Vite's own module URLs (/@vite/client, /src/*) align with
 * esmx routing. A synthesized client manifest makes core's import map point the
 * browser entry at the Vite-served source module (HMR-enabled), and SSR renders
 * via `ssrLoadModule` straight from source — no rebuild, true module HMR.
 */
export interface ViteDevApp {
    middleware: Middleware;
    render: (options?: RenderContextOptions) => Promise<RenderContext>;
    close: () => Promise<boolean>;
}

export async function createViteDevServer(
    esmx: Esmx,
    options: ViteAppOptions
): Promise<ViteDevApp> {
    const base = esmx.basePath; // "/<name>/"

    // Browser entry source files, used both to inject the HMR client and to
    // build the dev import map.
    const clientExports = Object.values(
        esmx.moduleConfig.environments.client.exports
    ).filter((e) => e.file !== '' && !e.pkg);
    const clientEntrySources = new Set(
        clientExports.map((e) => resolveSourceFile(esmx.root, e.file))
    );

    // Prepend the Vite HMR runtime to each browser entry (core-generated HTML
    // can't be modified, so we inject through the module graph).
    const injectHmrClient: Plugin = {
        name: 'esmx:inject-vite-client',
        apply: 'serve',
        transform(code, id) {
            const file = id.split('?')[0];
            if (clientEntrySources.has(file)) {
                return {
                    code: `import ${JSON.stringify(`${base}@vite/client`)};\n${code}`,
                    map: null
                };
            }
            return null;
        }
    };

    // Reuse the client build config solely to collect user/framework plugins
    // (e.g. @vitejs/plugin-react added via options.config).
    const clientBuildConfig: InlineConfig = createViteConfig(
        esmx,
        'client',
        options
    );

    const server: ViteDevServer = await createServer({
        root: esmx.root,
        base,
        configFile: false,
        appType: 'custom',
        mode: 'development',
        server: { middlewareMode: true },
        resolve: { alias: { [esmx.name]: esmx.root } },
        plugins: [injectHmrClient, ...(clientBuildConfig.plugins ?? [])]
    });

    writeDevManifests(esmx, clientExports);

    const serverEntry = resolveSourceFile(
        esmx.root,
        esmx.moduleConfig.environments.server.exports['src/entry.server']
            ?.file || './src/entry.server'
    );
    const serverEntryUrl = `/${path.relative(esmx.root, serverEntry)}`;

    const middleware: Middleware = (req, res, next) => {
        server.middlewares(req, res, next);
    };

    const render = async (
        renderOptions?: RenderContextOptions
    ): Promise<RenderContext> => {
        const rc = new RenderContext(esmx, renderOptions);
        const module = await server.ssrLoadModule(serverEntryUrl);
        const serverRender: ServerRenderHandle = module[rc.entryName];
        if (typeof serverRender === 'function') {
            await serverRender(rc);
        }
        return rc;
    };

    const close = async (): Promise<boolean> => {
        await server.close();
        return true;
    };

    return { middleware, render, close };
}

/**
 * Write minimal dev manifests so core's import map points the browser entry at
 * the Vite-served source module. Bare dependencies (react, etc.) are resolved
 * by Vite itself in dev, so no pkg scopes are emitted here.
 *
 * core's RenderContext.commit() lexes the entry file from disk (under
 * dist/client) to compute module preloads, so the entry sources are copied
 * there. The browser never reads these copies — Vite's base-prefixed dev
 * server intercepts the requests and serves the HMR-enabled transforms.
 */
function writeDevManifests(
    esmx: Esmx,
    clientExports: Array<{ name: string; file: string; pkg: boolean }>
): void {
    const exportsField: ManifestJson['exports'] = {};
    for (const exp of clientExports) {
        const sourceFile = resolveSourceFile(esmx.root, exp.file);
        const rel = path.relative(esmx.root, sourceFile);
        exportsField[exp.name] = {
            name: exp.name,
            pkg: false,
            file: rel,
            identifier: `${esmx.name}/${exp.name}`
        };

        // Mirror the entry source into dist/client for core's preload lexer.
        const dest = esmx.resolvePath('dist/client', rel);
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        fs.copyFileSync(sourceFile, dest);
    }
    const manifest: ManifestJson = {
        name: esmx.name,
        exports: exportsField,
        scopes: { '': {} },
        files: [],
        chunks: {}
    };
    esmx.writeSync(
        esmx.resolvePath('dist/client', 'manifest.json'),
        JSON.stringify(manifest, null, 4)
    );
    esmx.writeSync(
        esmx.resolvePath('dist/server', 'manifest.json'),
        JSON.stringify(manifest, null, 4)
    );
}

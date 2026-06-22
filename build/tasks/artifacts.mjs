import { cpSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { config } from '../config.mjs';
import { getPackagePaths, log, toDisplayPath } from '../utils.mjs';

async function findSSRDirectories() {
    log.info('Searching for projects with client builds...');

    const projectPaths = await getPackagePaths('examples');
    const ssrDirs = [];
    for (const projectPath of projectPaths) {
        const clientPath = join(projectPath, 'dist', 'client');
        if (!existsSync(clientPath)) continue;

        const packageJsonPath = join(projectPath, 'package.json');
        if (!existsSync(packageJsonPath)) continue;

        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        if (!packageJson.name) continue;

        ssrDirs.push({ name: packageJson.name, path: clientPath });
        log.info(`Found client build in ${toDisplayPath(clientPath)}`);
    }

    return ssrDirs;
}

export async function copyArtifacts() {
    log.info('Copying build artifacts...');

    if (!existsSync(config.outDir)) {
        mkdirSync(config.outDir, { recursive: true });
    }

    const ssrDirs = await findSSRDirectories();

    if (ssrDirs.length === 0) {
        log.warn('No client builds found to copy');
    }

    // The docs package owns the site root (copied to config.outDir below), so
    // it must NOT also be namespaced to `dist/docs/`. That second copy produced
    // a full duplicate of the site under `/docs/*` — 111 canonical-duplicate
    // URLs that wasted crawl budget and inflated "crawled - currently not
    // indexed" in Search Console. Demos still get their own `/<name>/` paths.
    const namespacedDirs = ssrDirs.filter(({ name }) => name !== 'docs');

    for (const { name, path } of namespacedDirs) {
        const targetDir = join(config.outDir, name);
        mkdirSync(targetDir, { recursive: true });
        // The hub is overlaid at the site root below, so its root-relative HTML
        // pages (landing + each `/<framework>/` demo) already exist at the root.
        // Copy only the hub's ASSETS to its `/ssr-micro-hub/` namespace — the
        // root HTML loads its scripts/styles from there — and skip the HTML,
        // which would otherwise duplicate every root page under
        // `/ssr-micro-hub/*` (canonical-duplicate URLs Google indexed instead
        // of the clean paths).
        const filter =
            name === 'ssr-micro-hub'
                ? (src) => !src.endsWith('.html')
                : undefined;
        cpSync(path, targetDir, { recursive: true, filter });
        log.info(
            `Copied ${toDisplayPath(path)} to ${toDisplayPath(targetDir)}`
        );
    }

    const docsPath = join(config.examplesDir, 'docs/dist/client');
    if (existsSync(docsPath)) {
        cpSync(docsPath, config.outDir, { recursive: true });
        log.info(
            `Copied ${toDisplayPath(docsPath)} to ${toDisplayPath(config.outDir)}`
        );
    }

    // The micro-app hub owns the site root: overlay its root-based pages
    // (landing at `/` and `/zh`, plus the demo/per-framework routes) on top of
    // the docs content. The docs no longer emit a home page, so the only files
    // this adds at the root are the hub's HTML entry points; the docs' `/guide`,
    // `/api`, and `/blog` trees are untouched. Hub client assets keep their
    // `/ssr-micro-hub/` namespace (already copied above by package name), so the
    // overlaid HTML resolves its scripts without duplicating assets at the root.
    const hub = ssrDirs.find(({ name }) => name === 'ssr-micro-hub');
    if (hub) {
        cpSync(hub.path, config.outDir, { recursive: true });
        log.info(
            `Overlaid ${toDisplayPath(hub.path)} onto ${toDisplayPath(config.outDir)} (site root)`
        );
    }
}

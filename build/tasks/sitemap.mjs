import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, extname, join, parse, relative } from 'node:path';
import { config } from '../config.mjs';
import { log, toDisplayPath } from '../utils.mjs';

function findAllHtmlFiles(dir, baseDir = dir, files = []) {
    if (!existsSync(dir)) return files;

    const entries = readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullPath = join(dir, entry.name);

        if (entry.isDirectory()) {
            // Coverage reports are internal artifacts: excluded from the sitemap
            // (and disallowed in robots.txt) so search engines never index them.
            if (entry.name === 'coverage') continue;
            findAllHtmlFiles(fullPath, baseDir, files);
        } else if (entry.isFile() && extname(entry.name) === '.html') {
            if (entry.name === '404.html' || entry.name.startsWith('google')) {
                continue;
            }

            const relativePath = relative(baseDir, fullPath);
            files.push({
                path: relativePath,
                fullPath,
                isIndex: entry.name === 'index.html'
            });
        }
    }

    return files;
}

/** Derive the public URL path for a built HTML file (clean-url aware). */
function computeUrlPath(file) {
    if (file.isIndex) {
        let urlPath = dirname(file.path);
        if (urlPath === '.') return '/';
        if (!urlPath.startsWith('/')) urlPath = '/' + urlPath;
        if (!urlPath.endsWith('/')) urlPath += '/';
        return urlPath;
    }
    const parsedPath = parse(file.path);
    const urlPath = join(parsedPath.dir, parsedPath.name);
    return urlPath.startsWith('/') ? urlPath : '/' + urlPath;
}

/**
 * The en/zh counterparts of a URL path. English lives at the root and Chinese
 * under `/zh` — the single scheme the whole site shares — so the pair is derived
 * deterministically and symmetrically (an en page and its zh counterpart resolve
 * to the same two paths).
 */
function localeVariants(urlPath) {
    const isZh =
        urlPath === '/zh' || urlPath === '/zh/' || urlPath.startsWith('/zh/');
    const enPath = isZh ? urlPath.replace(/^\/zh/, '') || '/' : urlPath;
    const zhPath = isZh ? urlPath : urlPath === '/' ? '/zh/' : `/zh${urlPath}`;
    return { enPath, zhPath };
}

/**
 * hreflang `<xhtml:link>` alternates for a URL — emitted only when both language
 * versions actually exist (checked against `known`). Monolingual pages (e.g. the
 * standalone framework demos that have no `/zh` variant) get no alternates, so
 * the sitemap never advertises a fabricated URL that would 404.
 */
function hreflangLinks(urlPath, baseUrl, known) {
    const { enPath, zhPath } = localeVariants(urlPath);
    if (!known.has(enPath) || !known.has(zhPath)) return '';
    return (
        `<xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${enPath}"/>` +
        `<xhtml:link rel="alternate" hreflang="zh" href="${baseUrl}${zhPath}"/>` +
        `<xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${enPath}"/>`
    );
}

function generateSitemapXml(htmlFiles, baseUrl) {
    const entries = htmlFiles.map((file) => ({
        urlPath: computeUrlPath(file)
    }));
    const known = new Set(entries.map((entry) => entry.urlPath));

    const urlset = entries
        .map(({ urlPath }) => {
            const loc = `${baseUrl}${urlPath}`;
            const lastmod = new Date().toISOString();
            const priority = urlPath === '/' ? '1.0' : '0.8';
            const changefreq = urlPath === '/' ? 'weekly' : 'monthly';
            const alternates = hreflangLinks(urlPath, baseUrl, known);
            return `<url><loc>${loc}</loc><lastmod>${lastmod}</lastmod><priority>${priority}</priority><changefreq>${changefreq}</changefreq>${alternates}</url>`;
        })
        .join('');

    return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urlset}</urlset>`;
}

function processHtmlLinks(htmlFiles) {
    log.info('Processing HTML files to remove .html extensions from links...');

    let processedCount = 0;
    const coveragePattern = /[/\\]coverage[/\\]/;

    for (const file of htmlFiles) {
        const content = readFileSync(file.fullPath, 'utf8');
        const isCoverageFile = coveragePattern.test(file.fullPath);
        let newContent = content;

        if (isCoverageFile) {
            newContent = newContent.replace(
                /href=["']([^"']*?\.(ts|js|tsx|jsx|css|scss|less|vue|json|md|mjs)\.html)["']/g,
                (match, p1) =>
                    p1.includes('://')
                        ? match
                        : `href="${p1.substring(0, p1.length - 5)}"`
            );

            newContent = newContent.replace(
                /href=["'](index\.html|index\.[^"']*?\.html)["']/g,
                (match, p1) =>
                    p1 === 'index.html'
                        ? 'href="index"'
                        : `href="${p1.substring(0, p1.length - 5)}"`
            );
        } else {
            newContent = newContent.replace(
                /href=["']([^"']*?\.(ts|js|tsx|jsx|css|scss|less)\.html)["']/g,
                (match, p1) =>
                    p1.includes('://')
                        ? match
                        : `href="${p1.substring(0, p1.length - 5)}"`
            );
        }

        newContent = newContent.replace(
            /href=["']([^"']*?)\.html["']/g,
            (match, p1) =>
                p1.includes('://') || p1 === '404' || p1.startsWith('google')
                    ? match
                    : `href="${p1}"`
        );

        if (content !== newContent) {
            writeFileSync(file.fullPath, newContent, 'utf8');
            processedCount++;
        }
    }

    if (processedCount > 0) {
        log.success(
            `Processed ${processedCount} HTML files to remove .html extensions from links`
        );
    } else {
        log.info('No HTML files needed processing');
    }
}

export async function generateSitemap() {
    log.info('Generating sitemap.xml...');

    const distDir = config.outDir;
    if (!existsSync(distDir)) {
        log.warn(
            'Output directory does not exist, skipping sitemap generation'
        );
        return;
    }

    const baseUrl = config.baseUrl;
    const htmlFiles = findAllHtmlFiles(distDir, distDir);

    if (htmlFiles.length === 0) {
        log.warn('No HTML files found, skipping sitemap generation');
        return;
    }

    log.info(`Found ${htmlFiles.length} HTML files for sitemap`);

    processHtmlLinks(htmlFiles);

    const sitemap = generateSitemapXml(htmlFiles, baseUrl);
    const sitemapPath = join(distDir, 'sitemap.xml');

    writeFileSync(sitemapPath, sitemap, 'utf8');

    log.success(`Sitemap generated: ${toDisplayPath(sitemapPath)}`);
}

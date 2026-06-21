import { useHead, usePageData } from '@rspress/core/runtime';

/**
 * Per-page SEO for the documentation. Registered as a global UI component, so it
 * runs for every doc route during SSG and emits content-aware tags into the HTML
 * head via unhead (the same head engine Rspress uses internally, so tags with the
 * same key are de-duplicated rather than doubled).
 *
 * Every value is derived from the page's own data — title, description, route,
 * and locale — never a shared template. The docs no longer own the site home
 * (the micro-app landing does), so every doc page is treated as an article.
 */

// The production origin. Canonical/OG URLs must be absolute, and the deployed
// docs always live on this host (kept in sync with build config + robots.txt).
const SITE_ORIGIN = 'https://esmx.dev';
const SITE_NAME = 'Esmx';
const OG_IMAGE = `${SITE_ORIGIN}/og-cover.png`;
const OG_LOCALE: Record<string, string> = { en: 'en_US', zh: 'zh_CN' };

// Captured once per build. Fallback for pages whose git-derived lastUpdatedTime
// is unavailable during SSG (e.g. shallow CI clones), so every TechArticle
// carries valid dates instead of omitting them. Stable across all pages in a
// single build.
const BUILD_TIME = new Date().toISOString();

interface PageLike {
    routePath?: string;
    title?: string;
    description?: string;
    lang?: string;
    pageType?: string;
    lastUpdatedTime?: string | number;
    frontmatter?: Record<string, unknown>;
}

/**
 * Split a route into its locale and locale-agnostic path. English is served at
 * the root; Chinese lives under a `/zh` prefix — the single scheme the whole
 * site (landing + docs) shares.
 */
function splitLocale(routePath: string): { lang: 'en' | 'zh'; path: string } {
    if (routePath === '/zh' || routePath.startsWith('/zh/')) {
        return { lang: 'zh', path: routePath.slice(3) || '/' };
    }
    return { lang: 'en', path: routePath };
}

function localizedUrl(lang: 'en' | 'zh', path: string): string {
    const suffix = path === '/' ? '' : path;
    if (lang === 'zh') {
        // The zh home must keep its trailing slash (`/zh/`): the host 308s
        // `/zh` -> `/zh/`, so the slashless form would make canonical/hreflang
        // point at a redirect instead of the final URL.
        return suffix ? `${SITE_ORIGIN}/zh${suffix}` : `${SITE_ORIGIN}/zh/`;
    }
    return `${SITE_ORIGIN}${suffix}`;
}

/** ISO 8601 date from an epoch (number/numeric string) or a date string, if usable. */
function toIsoDate(value: string | number | undefined): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const ms =
        typeof value === 'number'
            ? value
            : /^\d+$/.test(value)
              ? Number(value)
              : Date.parse(value);
    if (!Number.isFinite(ms)) return undefined;
    return new Date(ms).toISOString();
}

/**
 * A BreadcrumbList of Home → current page. Intermediate path segments are NOT
 * emitted as crumbs: the docs have no section landing pages (e.g. `/api`,
 * `/api/router`, `/guide/start` all 404), so linking them would point every
 * non-final crumb at a dead URL — which Google flags and may drop the whole
 * breadcrumb. Both emitted items resolve to a real page.
 */
function buildBreadcrumb(lang: 'en' | 'zh', path: string, leafName: string) {
    const items = [{ name: 'Home', url: localizedUrl(lang, '/') }];
    if (path !== '/') {
        items.push({ name: leafName, url: localizedUrl(lang, path) });
    }
    return {
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url
        }))
    };
}

export default function SeoHead() {
    const { page } = usePageData() as { page: PageLike };

    const routePath = page.routePath || '/';
    const { lang, path } = splitLocale(routePath);
    const altLang = lang === 'zh' ? 'en' : 'zh';

    const canonical = localizedUrl(lang, path);
    const enUrl = localizedUrl('en', path);
    const zhUrl = localizedUrl('zh', path);

    const suffix = page.frontmatter?.titleSuffix as string | undefined;
    const baseTitle = page.title || SITE_NAME;
    const title = suffix ? `${baseTitle} - ${suffix}` : baseTitle;
    const description =
        page.description ||
        (page.frontmatter?.description as string | undefined) ||
        '';
    const gitDate = toIsoDate(page.lastUpdatedTime);
    const frontmatterDate = toIsoDate(
        page.frontmatter?.date as string | number | undefined
    );
    const dateModified = gitDate || frontmatterDate || BUILD_TIME;
    const datePublished = frontmatterDate || gitDate || BUILD_TIME;

    const article: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: baseTitle,
        name: title,
        description,
        inLanguage: lang,
        url: canonical,
        mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
        image: OG_IMAGE,
        author: { '@type': 'Organization', name: SITE_NAME, url: SITE_ORIGIN },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_ORIGIN,
            logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/logo.svg` }
        }
    };
    article.dateModified = dateModified;
    article.datePublished = datePublished;

    const breadcrumb = {
        '@context': 'https://schema.org',
        ...buildBreadcrumb(lang, path, baseTitle)
    };

    useHead({
        link: [
            { rel: 'canonical', href: canonical },
            { rel: 'alternate', hreflang: 'en', href: enUrl },
            { rel: 'alternate', hreflang: 'zh', href: zhUrl },
            { rel: 'alternate', hreflang: 'x-default', href: enUrl }
        ],
        meta: [
            { property: 'og:type', content: 'article' },
            { property: 'og:site_name', content: SITE_NAME },
            { property: 'og:title', content: title },
            { property: 'og:description', content: description },
            { property: 'og:url', content: canonical },
            { property: 'og:image', content: OG_IMAGE },
            { property: 'og:locale', content: OG_LOCALE[lang] },
            { property: 'og:locale:alternate', content: OG_LOCALE[altLang] },
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:title', content: title },
            { name: 'twitter:description', content: description },
            { name: 'twitter:image', content: OG_IMAGE }
        ],
        script: [
            {
                type: 'application/ld+json',
                innerHTML: JSON.stringify(article)
            },
            {
                type: 'application/ld+json',
                innerHTML: JSON.stringify(breadcrumb)
            }
        ]
    });

    return null;
}

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
    return lang === 'zh' ? `${SITE_ORIGIN}/zh${suffix}` : `${SITE_ORIGIN}${suffix}`;
}

/** ISO 8601 date from Rspress's lastUpdatedTime (epoch ms or string), if usable. */
function toIsoDate(value: string | number | undefined): string | undefined {
    if (value === undefined || value === null || value === '') return undefined;
    const ms = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(ms)) return undefined;
    return new Date(ms).toISOString();
}

/** A BreadcrumbList from the locale-agnostic path segments (Guide → Start → …). */
function buildBreadcrumb(lang: 'en' | 'zh', path: string) {
    const segments = path.split('/').filter(Boolean);
    const items = [{ name: 'Home', url: localizedUrl(lang, '/') }];
    let acc = '';
    for (const segment of segments) {
        acc += `/${segment}`;
        const name = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
        items.push({ name, url: localizedUrl(lang, acc) });
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
    const modified = toIsoDate(page.lastUpdatedTime);

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
    if (modified) {
        article.dateModified = modified;
        article.datePublished = modified;
    }

    const breadcrumb = {
        '@context': 'https://schema.org',
        ...buildBreadcrumb(lang, path)
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

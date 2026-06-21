import type { Router } from '@esmx/router';
import type { SerializableHead } from 'unhead/types';

import { getLocale } from './i18n';

/**
 * Per-page SEO for the hub's own pages (landing + demo). Mirrors the docs'
 * SeoHead so the whole single-domain site is consistent: absolute canonical,
 * `en`/`zh`/`x-default` hreflang, full Open Graph + Twitter Card, and optional
 * JSON-LD. Every value comes from the page that calls it — never a shared
 * template — and the locale is read from the router (URL is the source of truth).
 */

const SITE_ORIGIN = 'https://esmx.dev';
const SITE_NAME = 'Esmx';
const OG_IMAGE = `${SITE_ORIGIN}/og-cover.png`;
const OG_LOCALE: Record<string, string> = { en: 'en_US', zh: 'zh_CN' };

export interface SeoOptions {
    /** Locale-agnostic path the page lives at, e.g. `/` or `/demo/`. */
    path: string;
    title: string;
    description: string;
    /** Open Graph `og:type`; defaults to `website`. */
    ogType?: string;
    /** Extra JSON-LD objects (already shaped, `@context` included). */
    jsonLd?: Record<string, unknown>[];
}

function localizedUrl(lang: string, path: string): string {
    if (lang === 'zh') {
        // zh home keeps its trailing slash (`/zh/`): the host 308s `/zh` ->
        // `/zh/`, so the slashless form would make canonical point at a redirect.
        return path === '/' ? `${SITE_ORIGIN}/zh/` : `${SITE_ORIGIN}/zh${path}`;
    }
    return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

/** The page's primary structured-data entity, mirroring the docs' TechArticle. */
function webPageLd(
    canonical: string,
    title: string,
    description: string,
    lang: string
): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: title,
        description,
        url: canonical,
        inLanguage: lang,
        isPartOf: {
            '@type': 'WebSite',
            name: SITE_NAME,
            url: `${SITE_ORIGIN}/`
        },
        primaryImageOfPage: { '@type': 'ImageObject', url: OG_IMAGE },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_ORIGIN
        }
    };
}

/**
 * BreadcrumbList from the locale-agnostic path segments (Home → Demo, …).
 * Returns `[]` for the home page, where a single-item breadcrumb adds nothing.
 */
function breadcrumbLd(lang: string, path: string): Record<string, unknown>[] {
    const segments = path.split('/').filter(Boolean);
    if (segments.length === 0) return [];
    const items = [{ name: 'Home', url: localizedUrl(lang, '/') }];
    let acc = '';
    for (const segment of segments) {
        acc += `/${segment}`;
        const name = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
        items.push({ name, url: localizedUrl(lang, `${acc}/`) });
    }
    return [
        {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: item.url
            }))
        }
    ];
}

export function buildSeoHead(
    router: Router,
    options: SeoOptions
): SerializableHead {
    const { path, title, description, ogType = 'website', jsonLd } = options;
    const lang = getLocale(router);
    const altLang = lang === 'zh' ? 'en' : 'zh';

    const canonical = localizedUrl(lang, path);
    const enUrl = localizedUrl('en', path);
    const zhUrl = localizedUrl('zh', path);

    // Every page carries a primary entity (WebPage) + breadcrumb, then any
    // page-specific nodes the caller adds (e.g. the landing's Organization /
    // WebSite / SoftwareApplication) — consistent with the docs' SeoHead.
    const structuredData = [
        webPageLd(canonical, title, description, lang),
        ...breadcrumbLd(lang, path),
        ...(jsonLd ?? [])
    ];

    return {
        // Single source of truth for the document language; the server shell
        // renders `<html${htmlAttrs}>` with no hardcoded lang, so this is the
        // only `lang` attribute and it tracks the URL locale.
        htmlAttrs: { lang },
        title,
        link: [
            { rel: 'canonical', href: canonical },
            { rel: 'alternate', hreflang: 'en', href: enUrl },
            { rel: 'alternate', hreflang: 'zh', href: zhUrl },
            { rel: 'alternate', hreflang: 'x-default', href: enUrl }
        ],
        meta: [
            { name: 'description', content: description },
            { property: 'og:type', content: ogType },
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
        script: structuredData.map((entry) => ({
            type: 'application/ld+json',
            innerHTML: JSON.stringify(entry)
        }))
    };
}

/** Organization node reused across the hub's structured data. */
export function organizationLd(): Record<string, unknown> {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        url: SITE_ORIGIN,
        logo: { '@type': 'ImageObject', url: `${SITE_ORIGIN}/logo.svg` },
        sameAs: ['https://github.com/esmnext/esmx']
    };
}

/** WebSite + SoftwareApplication describing Esmx itself, for the landing page. */
export function landingLd(description: string): Record<string, unknown>[] {
    return [
        organizationLd(),
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: SITE_NAME,
            url: `${SITE_ORIGIN}/`,
            description,
            publisher: {
                '@type': 'Organization',
                name: SITE_NAME,
                url: SITE_ORIGIN
            }
        },
        {
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: SITE_NAME,
            applicationCategory: 'DeveloperApplication',
            operatingSystem: 'Cross-platform',
            description,
            url: SITE_ORIGIN,
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' }
        }
    ];
}

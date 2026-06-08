import type { Router } from '@esmx/router';
import type { UseHeadInput } from 'unhead/types';

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
        return path === '/' ? `${SITE_ORIGIN}/zh` : `${SITE_ORIGIN}/zh${path}`;
    }
    return path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`;
}

export function buildSeoHead(
    router: Router,
    options: SeoOptions
): UseHeadInput {
    const { path, title, description, ogType = 'website', jsonLd } = options;
    const lang = getLocale(router);
    const altLang = lang === 'zh' ? 'en' : 'zh';

    const canonical = localizedUrl(lang, path);
    const enUrl = localizedUrl('en', path);
    const zhUrl = localizedUrl('zh', path);

    return {
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
        script: (jsonLd ?? []).map((entry) => ({
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

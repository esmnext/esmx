import type { Router } from '@esmx/router';

export type Locale = 'en' | 'zh';

const LOCALE = 'esmx:locale';
const LISTENERS = 'esmx:locale:listeners';

const messages = {
    en: {
        statsTotal: 'Total visits',
        statsTop: 'Top 3',
        statsCurrent: 'Current',
        switchLang: '中文'
    },
    zh: {
        statsTotal: '总访问量',
        statsTop: '前 3 名',
        statsCurrent: '当前',
        switchLang: 'English'
    }
} as const;
type MessageKey = keyof (typeof messages)['en'];

/**
 * Shared, router-scoped locale — stored on `router.context` exactly like
 * app-state, so it is shared across every micro-app and travels from SSR/SSG to
 * the client via the serialized `__ESMX_CONTEXT__`. The value is validated and
 * narrowed at this boundary (no `as`, robust against stale/garbage input).
 */
export function getLocale(router: Router): Locale {
    const value = router.context[LOCALE];
    return value === 'zh' || value === 'en' ? value : 'en';
}

export function setLocale(router: Router, locale: Locale): void {
    router.context[LOCALE] = locale;
    const listeners = router.context[LISTENERS];
    if (listeners instanceof Set) {
        (listeners as Set<() => void>).forEach((fn) => fn());
    }
}

/** Translate a key in the router's current locale. */
export function t(router: Router, key: MessageKey): string {
    return messages[getLocale(router)][key];
}

export function subscribeLocale(router: Router, fn: () => void): () => void {
    if (!(router.context[LISTENERS] instanceof Set)) {
        router.context[LISTENERS] = new Set<() => void>();
    }
    const listeners = router.context[LISTENERS] as Set<() => void>;
    listeners.add(fn);
    return () => listeners.delete(fn);
}

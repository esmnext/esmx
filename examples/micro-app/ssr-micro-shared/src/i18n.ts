import type { Router } from '@esmx/router';

export type Locale = 'en' | 'zh';

const LOCALE = 'esmx:locale';
const LISTENERS = 'esmx:locale:listeners';
const LOCALE_SYNC = 'esmx:locale:sync';

const messages = {
    en: {
        // Sidebar (Layout)
        statsTotal: 'Total visits',
        statsTop: 'Top 3',
        statsCurrent: 'Current',
        switchLang: '中文',

        // Dashboard (HomeApp)
        homeMetaTitle: 'Esmx Micro-App Hub',
        homeMetaDesc: 'Explore micro-frontend architecture with Esmx Router',
        homeHeroTitle: 'Micro-Frontend Architecture',
        homeHeroSubtitle:
            'Explore how different frontend frameworks coexist in a single application powered by <strong style="color: var(--esmx-link);">Esmx Router</strong>',

        // Landing page (LandingApp)
        landingMetaTitle:
            'Esmx - Universal Rendering Framework Built on Native ESM',
        landingMetaDesc:
            'A universal rendering framework based on native ESM + Import Maps, supporting CSR/SSR and module linking with zero extra runtime overhead',
        navFeatures: 'Features',
        navQuickstart: 'Quick Start',
        navEcosystem: 'Ecosystem',
        navDocs: 'Docs',
        heroBadge: 'v3.0.0-rc.117 Preview',
        heroTitleLead: 'A Universal Rendering Framework',
        heroTitleGradient: 'Built on Native ESM',
        heroSubtitle:
            "Based on native ESM + Import Maps, with CSR/SSR and module linking. Compose applications and share code through the browser's native module system — zero extra runtime overhead.",
        heroBtnQuickstart: 'Quick Start',
        heroBtnDemo: 'Explore Live Demo',
        whyTitle: 'Why Esmx?',
        whyDesc:
            'Traditional approaches lean on simulation and wrapper layers that add runtime overhead — Esmx solves it at the root with native mechanisms',
        painLabelBad: 'Traditional',
        painBad1: 'Runtime sandbox simulation with heavy performance cost',
        painBad2: 'Custom module loaders, incompatible with the standard',
        painBad3: 'Proxy-hijacked globals make debugging hard',
        painSolution1:
            'Browser-native ESM loading, zero extra runtime overhead, natural isolation via module scope',
        painSolution2:
            'Standard ESM import/export syntax, zero learning curve, mix any frameworks',
        painSolution3:
            'Flexible SSR strategy, high-performance Rspack builds, cross-app sharing via Module Linking',
        featuresTitle: 'Core Features',
        featuresDesc:
            'Six core capabilities that redefine the micro-frontend experience',
        feat1Title: 'Zero Runtime Overhead',
        feat1Desc:
            'Browser-native ESM loading — no sandbox, proxy, or wrapper layers. Modules load and run directly, cutting runtime overhead dramatically versus traditional approaches.',
        feat2Title: 'Standard ESM Syntax',
        feat2Desc:
            'Use the familiar import/export — zero learning curve. No proprietary APIs to master; it feels just like writing a normal app.',
        feat3Title: 'SSR Support',
        feat3Desc:
            'Flexible server-side rendering, SEO-friendly with a fast first paint. Every app can be server-rendered independently.',
        feat4Title: 'Mix Any Framework',
        feat4Desc:
            'Vue, React, Preact and native HTML work out of the box; Solid, Svelte and more via simple config. Never locked into a single framework.',
        feat5Title: 'Module Linking',
        feat5Desc:
            'Cross-app module sharing via ESM Import Maps — dependencies resolved at build time, loaded directly at runtime. No redundant bundling, real module reuse.',
        feat6Title: 'High-Performance Builds',
        feat6Desc:
            'Powered by Rspack (Rust-driven): fast builds, Webpack ecosystem compatibility, with HMR, code splitting and content-hash caching.',
        quickstartTitle: 'Start in 3 Minutes',
        quickstartDesc:
            'One command to scaffold a project and start developing right away',
        ecoTitle: 'Works with Any Frontend Framework',
        ecoDesc:
            'Not bound to any framework — pick the stack that fits your use case best',
        liveTitle: 'Nine Frameworks, One App',
        liveDesc:
            'Switch frameworks with one click and no page reload — feel native ESM at its best',
        liveBtn: 'Try It Now',
        footerDocs: 'Docs'
    },
    zh: {
        // Sidebar (Layout)
        statsTotal: '总访问量',
        statsTop: '前 3 名',
        statsCurrent: '当前',
        switchLang: 'English',

        // Dashboard (HomeApp)
        homeMetaTitle: 'Esmx 微应用中心',
        homeMetaDesc: '使用 Esmx Router 探索微前端架构',
        homeHeroTitle: '微前端架构',
        homeHeroSubtitle:
            '探索不同前端框架如何在由 <strong style="color: var(--esmx-link);">Esmx Router</strong> 驱动的单个应用中共存',

        // Landing page (LandingApp)
        landingMetaTitle: 'Esmx - 基于原生 ESM 的通用渲染框架',
        landingMetaDesc:
            '基于原生 ESM + Import Maps 的通用渲染框架，支持 CSR/SSR 与模块链接，零额外运行时开销',
        navFeatures: '特性',
        navQuickstart: '快速开始',
        navEcosystem: '生态',
        navDocs: '文档',
        heroBadge: 'v3.0.0-rc.117 预览版',
        heroTitleLead: '基于原生 ESM 的',
        heroTitleGradient: '通用渲染框架',
        heroSubtitle:
            '基于原生 ESM + Import Maps，支持 CSR/SSR 与模块链接。用浏览器原生模块机制实现应用组合与代码共享，零额外运行时开销。',
        heroBtnQuickstart: '快速开始',
        heroBtnDemo: '探索在线 Demo',
        whyTitle: '为什么需要 Esmx？',
        whyDesc:
            '传统方案依赖模拟和包装层带来运行时负担，Esmx 用原生机制从根本上解决问题',
        painLabelBad: '传统方案',
        painBad1: '运行时沙箱模拟，性能损耗大',
        painBad2: '自定义模块加载器，与标准不兼容',
        painBad3: 'Proxy 劫持全局对象，调试困难',
        painSolution1:
            '浏览器原生 ESM 加载，零额外运行时开销，基于模块作用域天然隔离',
        painSolution2: '标准 ESM import/export 语法，零学习成本，任意框架混用',
        painSolution3:
            '灵活的 SSR 策略，基于 Rspack 的高性能构建，Module Linking 跨应用共享',
        featuresTitle: '核心特性',
        featuresDesc: '六大核心能力，重新定义微前端开发体验',
        feat1Title: '零运行时开销',
        feat1Desc:
            '浏览器原生 ESM 加载，无需沙箱、代理或包装层。模块即加载，加载即执行，相比传统方案显著降低运行时开销。',
        feat2Title: '标准 ESM 语法',
        feat2Desc:
            '使用熟悉的 import/export，零学习成本。不需要掌握任何专有 API，就像编写普通应用一样自然。',
        feat3Title: 'SSR 支持',
        feat3Desc:
            '灵活的服务端渲染策略，SEO 友好，首屏极速。每个应用都可以独立进行服务端渲染。',
        feat4Title: '多框架自由组合',
        feat4Desc:
            'Vue、React、Preact、原生 HTML 开箱即用，Solid、Svelte 等框架通过扩展配置即可支持。不再被单一框架束缚。',
        feat5Title: 'Module Linking',
        feat5Desc:
            '基于 ESM Import Maps 的跨应用模块共享方案，编译时解析依赖关系，运行时直接加载。告别冗余打包，实现真正的模块复用。',
        feat6Title: '高性能构建',
        feat6Desc:
            '基于 Rspack（Rust 驱动），构建速度快，与 Webpack 生态兼容。支持 HMR、代码分割与内容哈希缓存。',
        quickstartTitle: '3 分钟开始',
        quickstartDesc: '一条命令创建项目，即刻开始开发',
        ecoTitle: '支持任意前端框架',
        ecoDesc: '不受框架限制，自由选择最适合业务场景的技术栈',
        liveTitle: '9 种框架，一个应用',
        liveDesc: '无需刷新页面，一键切换前端框架，感受原生 ESM 的极致体验',
        liveBtn: '立即体验',
        footerDocs: '文档'
    }
} as const;
type MessageKey = keyof (typeof messages)['en'];

export interface CardText {
    subtitle: string;
    description: string;
    tag: string;
}

/**
 * Per-framework dashboard card copy, keyed by a stable framework id (see
 * HomeApp). Kept separate from the flat message catalog because each card is a
 * small structured record rather than a single label.
 */
const cardText: Record<Locale, Record<string, CardText>> = {
    en: {
        html: {
            subtitle: 'Pure HTML + TypeScript',
            description: 'A native HTML micro-app.',
            tag: 'Vanilla'
        },
        vue2: {
            subtitle: 'Vue 2.7 + Composition API',
            description: 'Classic Vue 2 with the modern Composition API.',
            tag: 'Legacy'
        },
        vue3: {
            subtitle: 'Vue 3.5 + SSR',
            description: 'Modern Vue 3 with full SSR support.',
            tag: 'Modern'
        },
        react: {
            subtitle: 'React 19 + Hooks',
            description: 'React 19 with concurrent features.',
            tag: 'Popular'
        },
        preact: {
            subtitle: 'Preact 10 + Hooks',
            description: 'A fast 3kB alternative to React.',
            tag: 'Lightweight'
        },
        preactHtm: {
            subtitle: 'Preact 10 + HTM',
            description: 'Preact with Hyperscript Tagged Markup.',
            tag: 'No JSX'
        },
        lit: {
            subtitle: 'Web Components + SSR',
            description: 'Standards-based Web Components with Lit SSR.',
            tag: 'W3C'
        },
        solid: {
            subtitle: 'Fine-grained Reactivity',
            description: 'No VDOM — a signals-based reactive UI.',
            tag: 'Signals'
        },
        svelte: {
            subtitle: 'Compiler-driven Runes',
            description: 'Reactive components with $state and $derived.',
            tag: 'Runes'
        }
    },
    zh: {
        html: {
            subtitle: '纯 HTML + TypeScript',
            description: '原生 HTML 微应用。',
            tag: '原生'
        },
        vue2: {
            subtitle: 'Vue 2.7 + 组合式 API',
            description: '经典 Vue 2，搭配现代组合式 API。',
            tag: '经典'
        },
        vue3: {
            subtitle: 'Vue 3.5 + SSR',
            description: '现代 Vue 3，完整 SSR 支持。',
            tag: '现代'
        },
        react: {
            subtitle: 'React 19 + Hooks',
            description: 'React 19，支持并发特性。',
            tag: '流行'
        },
        preact: {
            subtitle: 'Preact 10 + Hooks',
            description: '仅 3kB 的高速 React 替代方案。',
            tag: '轻量'
        },
        preactHtm: {
            subtitle: 'Preact 10 + HTM',
            description: '搭配 HTM 标签模板的 Preact。',
            tag: '无 JSX'
        },
        lit: {
            subtitle: 'Web Components + SSR',
            description: '基于标准的 Web Components，支持 Lit SSR。',
            tag: 'W3C'
        },
        solid: {
            subtitle: '细粒度响应式',
            description: '无虚拟 DOM，基于信号的响应式 UI。',
            tag: '信号'
        },
        svelte: {
            subtitle: '编译驱动的 Runes',
            description: '使用 $state 与 $derived 的响应式组件。',
            tag: 'Runes'
        }
    }
};

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

/** Dashboard card copy for a framework id in the router's current locale. */
export function getCardText(router: Router, key: string): CardText {
    return cardText[getLocale(router)][key];
}

/**
 * Prefix an app route with the active locale: unchanged in English, `/zh`-
 * prefixed in Chinese. Keeps in-app links (cards, CTAs, ecosystem) inside the
 * current locale so navigation never silently switches language.
 */
export function localePath(router: Router, path: string): string {
    return getLocale(router) === 'zh' ? `/zh${path}` : path;
}

export function subscribeLocale(router: Router, fn: () => void): () => void {
    if (!(router.context[LISTENERS] instanceof Set)) {
        router.context[LISTENERS] = new Set<() => void>();
    }
    const listeners = router.context[LISTENERS] as Set<() => void>;
    listeners.add(fn);
    return () => listeners.delete(fn);
}

/**
 * The URL is the source of truth for locale: `/zh/...` is Chinese, everything
 * else is the default English. The route path is already base-relative, so the
 * shared `/ssr-micro-hub/` mount point never appears here.
 */
export function localeFromPath(path: string): Locale {
    return /^\/zh(\/|$)/.test(path) ? 'zh' : 'en';
}

/**
 * Keep the shared locale aligned with the active route — installed once per
 * router. Every successful navigation (toggle, nav link, browser back/forward)
 * re-derives the locale from the path and republishes it, so `t()` and the
 * Layout always match the URL without a full page reload.
 */
export function installLocaleSync(router: Router): void {
    if (router.context[LOCALE_SYNC]) {
        return;
    }
    router.context[LOCALE_SYNC] = true;
    router.afterEach((to) => {
        const locale = localeFromPath(to.path);
        // Keep <html lang> in sync on the client for every app (the landing page
        // has no Layout to do it). Safe to run each navigation; SSR sets it via
        // the document template instead.
        if (typeof document !== 'undefined') {
            document.documentElement.lang = locale;
        }
        if (getLocale(router) !== locale) {
            setLocale(router, locale);
        }
    });
}

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
        menuLabel: 'Open menu',
        closeLabel: 'Close menu',

        // Dashboard (HomeApp)
        homeMetaTitle: 'Esmx Micro-App Hub',
        homeMetaDesc: 'Explore micro-frontend architecture with Esmx Router',
        homeHeroTitle: 'Micro-Frontend Architecture',
        homeHeroSubtitle:
            'Explore how different frontend frameworks coexist in a single application powered by <strong style="color: var(--esmx-brand);">Esmx Router</strong>',

        // Landing page (LandingApp)
        landingMetaTitle:
            'Esmx - Universal Rendering Framework Built on Native ESM',
        landingMetaDesc:
            'Esmx is an SEO-friendly SSR micro-frontend framework built on native ESM + Import Maps — CSR/SSR, framework-agnostic module linking, zero runtime overhead, no Module Federation.',
        navFeatures: 'Features',
        navQuickstart: 'Quick Start',
        navEcosystem: 'Ecosystem',
        navDocs: 'Docs',
        heroBadge: 'Preview',
        heroTitleLead: 'A Universal Rendering Framework',
        heroTitleGradient: 'Built on Native ESM',
        heroSubtitle:
            "Based on native ESM + Import Maps, with CSR/SSR and module linking. Compose applications and share code through the browser's native module system — zero extra runtime overhead.",
        heroBtnQuickstart: 'Quick Start',
        heroBtnDemo: 'Explore Live Demo',
        whyTitle: 'Built for the agent era',
        whyDesc:
            'Other micro-frontend frameworks invented their own lifecycle hooks, loader DSLs, and globals. Esmx is plain ESM + import maps — the same surface LLMs were trained on. Less to learn, less to hallucinate.',
        painLabelBad: 'Traditional',
        painBad1:
            'Custom lifecycle hooks (bootstrap, mount, unmount, runtime sandbox)',
        painBad2:
            'Proprietary loader DSL (expose/share, registerApplication, qiankun.start)',
        painBad3:
            'Proxy-hijacked globals make stack traces opaque and tooling fragile',
        painSolution1:
            'No lifecycle to learn — your remote is a standard ESM module the host imports.',
        painSolution2:
            "Federation is `import './x'` resolved by a standard import map. Your AI assistant already knows the API.",
        painSolution3:
            'Stack traces, devtools, and source maps point at the real module — no proxy in between.',
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
        footerDocs: 'Docs',

        // Framework demo pages
        fwReactTitle: 'React 19 Micro-App',
        fwReactDesc: 'This page is rendered by a React 19 micro-app.',
        fwVue3Title: 'Vue 3 Micro-App',
        fwVue3Desc:
            'This page is rendered by a Vue 3.5 micro-app with full SSR support.',
        fwVue2Title: 'Vue 2 Micro-App',
        fwVue2Desc: 'This page is rendered by a Vue 2.7 micro-app.',
        fwSolidTitle: 'SolidJS Micro-App',
        fwSolidDesc: 'This page is rendered by a SolidJS micro-app.',
        fwPreactTitle: 'Preact Micro-App',
        fwPreactDesc: 'This page is rendered by a Preact 10 micro-app.',
        fwPreactHtmTitle: 'Preact + HTM Micro-App',
        fwPreactHtmDesc:
            'This page is rendered by a Preact 10 micro-app using HTM.',
        fwSvelteTitle: 'Svelte 5 Micro-App',
        fwSvelteDesc:
            'This page is rendered by a Svelte 5 micro-app using runes.',
        fwLitTitle: 'Lit Micro-App',
        fwLitDesc:
            'This page is rendered by a Lit micro-app using Web Components.',
        fwHtmlTitle: 'HTML Micro-App',
        fwHtmlDesc: 'Pure HTML + TypeScript micro-app.'
    },
    zh: {
        // Sidebar (Layout)
        statsTotal: '总访问量',
        statsTop: '前 3 名',
        statsCurrent: '当前',
        switchLang: 'English',
        menuLabel: '打开菜单',
        closeLabel: '关闭菜单',

        // Dashboard (HomeApp)
        homeMetaTitle: 'Esmx 微应用中心',
        homeMetaDesc: '使用 Esmx Router 探索微前端架构',
        homeHeroTitle: '微前端架构',
        homeHeroSubtitle:
            '探索不同前端框架如何在由 <strong style="color: var(--esmx-brand);">Esmx Router</strong> 驱动的单个应用中共存',

        // Landing page (LandingApp)
        landingMetaTitle: 'Esmx - 基于原生 ESM 的通用渲染框架',
        landingMetaDesc:
            'Esmx 是基于原生 ESM + Import Maps 的 SSR 微前端框架——SEO 友好，支持 CSR/SSR 与跨框架模块链接，零运行时开销，无需 Module Federation。',
        navFeatures: '特性',
        navQuickstart: '快速开始',
        navEcosystem: '生态',
        navDocs: '文档',
        heroBadge: '预览版',
        heroTitleLead: '基于原生 ESM 的',
        heroTitleGradient: '通用渲染框架',
        heroSubtitle:
            '基于原生 ESM + Import Maps，支持 CSR/SSR 与模块链接。用浏览器原生模块机制实现应用组合与代码共享，零额外运行时开销。',
        heroBtnQuickstart: '快速开始',
        heroBtnDemo: '探索在线 Demo',
        whyTitle: '为 agent 时代而生',
        whyDesc:
            '其他微前端框架发明了自己的生命周期钩子、loader DSL 和全局对象。Esmx 只是原生 ESM + import map —— 跟 LLM 训练数据同一表面。学得少,幻觉少。',
        painLabelBad: '传统方案',
        painBad1: '自定义生命周期钩子(bootstrap、mount、unmount、运行时沙箱)',
        painBad2:
            '专有 loader DSL(expose/share、registerApplication、qiankun.start)',
        painBad3: 'Proxy 劫持全局,栈追踪难读懂,工具链脆弱',
        painSolution1:
            '没有需要学的生命周期 —— 远程就是一个标准 ESM 模块,host import 即可',
        painSolution2:
            "联邦 = `import './x'` + 标准 import map 解析。你的 AI 助手已经会这套 API",
        painSolution3:
            '栈追踪、devtools、source map 都指向真实模块,中间没有 proxy',
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
        footerDocs: '文档',

        // Framework demo pages
        fwReactTitle: 'React 19 微应用',
        fwReactDesc: '本页由 React 19 微应用渲染。',
        fwVue3Title: 'Vue 3 微应用',
        fwVue3Desc: '本页由支持完整 SSR 的 Vue 3.5 微应用渲染。',
        fwVue2Title: 'Vue 2 微应用',
        fwVue2Desc: '本页由 Vue 2.7 微应用渲染。',
        fwSolidTitle: 'SolidJS 微应用',
        fwSolidDesc: '本页由 SolidJS 微应用渲染。',
        fwPreactTitle: 'Preact 微应用',
        fwPreactDesc: '本页由 Preact 10 微应用渲染。',
        fwPreactHtmTitle: 'Preact + HTM 微应用',
        fwPreactHtmDesc: '本页由使用 HTM 的 Preact 10 微应用渲染。',
        fwSvelteTitle: 'Svelte 5 微应用',
        fwSvelteDesc: '本页由使用 runes 的 Svelte 5 微应用渲染。',
        fwLitTitle: 'Lit 微应用',
        fwLitDesc: '本页由使用 Web Components 的 Lit 微应用渲染。',
        fwHtmlTitle: 'HTML 微应用',
        fwHtmlDesc: '纯 HTML + TypeScript 微应用。'
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

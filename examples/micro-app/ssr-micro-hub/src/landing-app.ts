import {
    BaseApp,
    buildSeoHead,
    landingLd,
    localeFromPath,
    localePath,
    subscribeLocale,
    t
} from 'ssr-micro-shared/src/index';
import './landing-page.css';

const ESMX_LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40" shape-rendering="geometricPrecision"><g transform="translate(20,20)"><circle r="12" fill="none" stroke="#12B2EF" stroke-width="2.8"/><circle r="6.2" fill="#FFA000"/></g></svg>`;

const GITHUB_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>`;

const ARROW_RIGHT_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;

const STAR_ICON = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#12B2EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`;

const X_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;

const CHECK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`;

const BOOK_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;

/**
 * The docs (a separate Rspress build) are served on the same single domain as
 * this hub: English at the site root, Chinese under `/zh`. Since the landing
 * page owns `/` and `/zh`, the docs home is shadowed — the entry link must
 * point at a real content page, not `/`. `localePath` adds the `/zh` prefix in
 * Chinese, matching Rspress's default-locale-at-root URL scheme. These stay
 * plain `<a href>` (not `data-to`) so the click is a full-page navigation the
 * gateway routes to Rspress, not an in-app SPA push.
 */
const DOCS_ENTRY_PATH = '/guide/start/introduction';

export class LandingApp extends BaseApp {
    private unsubLocale: (() => void) | null = null;

    protected getHead() {
        const description = t(this.router, 'landingMetaDesc');
        return buildSeoHead(this.router, {
            path: '/',
            title: t(this.router, 'landingMetaTitle'),
            description,
            jsonLd: landingLd(description)
        });
    }

    private getNavHtml(): string {
        return (
            `<nav class="nav">` +
            `<div class="container nav-inner">` +
            `<a href="#" class="nav-logo">` +
            ESMX_LOGO_SVG +
            `Esmx` +
            `</a>` +
            `<div class="nav-links">` +
            `<a href="#features">${t(this.router, 'navFeatures')}</a>` +
            `<a href="#quickstart">${t(this.router, 'navQuickstart')}</a>` +
            `<a href="#ecosystem">${t(this.router, 'navEcosystem')}</a>` +
            `<a href="${localePath(this.router, DOCS_ENTRY_PATH)}">${t(this.router, 'navDocs')}</a>` +
            `</div>` +
            `<div class="nav-cta">` +
            `<button type="button" id="landingLangToggle" class="btn btn-outline btn-sm">${t(this.router, 'switchLang')}</button>` +
            `<a href="https://github.com/esmnext/esmx" target="_blank" class="btn btn-outline btn-sm">` +
            GITHUB_ICON +
            `GitHub` +
            `</a>` +
            `</div>` +
            `<button class="nav-mobile-toggle" id="landingMobileToggle" aria-label="Toggle menu">` +
            `<span></span><span></span><span></span>` +
            `</button>` +
            `</div>` +
            `<div class="nav-mobile-menu" id="landingMobileMenu">` +
            `<a href="#features">${t(this.router, 'navFeatures')}</a>` +
            `<a href="#quickstart">${t(this.router, 'navQuickstart')}</a>` +
            `<a href="#ecosystem">${t(this.router, 'navEcosystem')}</a>` +
            `<a href="${localePath(this.router, DOCS_ENTRY_PATH)}">${t(this.router, 'navDocs')}</a>` +
            `<a href="https://github.com/esmnext/esmx" target="_blank">GitHub</a>` +
            `<button type="button" id="landingLangToggleMobile" class="btn btn-outline btn-sm">${t(this.router, 'switchLang')}</button>` +
            `</div>` +
            `</nav>`
        );
    }

    private getHeroHtml(): string {
        return (
            `<section class="hero">` +
            `<div class="hero-bg"></div>` +
            `<div class="hero-grid"></div>` +
            `<div class="hero-glow"></div>` +
            `<div class="container hero-inner">` +
            `<div class="hero-content">` +
            `<div class="hero-badge reveal">` +
            `<span class="hero-badge-dot"></span>` +
            t(this.router, 'heroBadge') +
            `</div>` +
            `<h1 class="hero-title reveal reveal-delay-1">${t(this.router, 'heroTitleLead')}<span class="hero-title-gradient">${t(this.router, 'heroTitleGradient')}</span></h1>` +
            `<p class="hero-subtitle reveal reveal-delay-2">${t(this.router, 'heroSubtitle')}</p>` +
            `<div class="hero-actions reveal reveal-delay-3">` +
            `<a href="#quickstart" class="btn btn-primary">${t(this.router, 'heroBtnQuickstart')}${ARROW_RIGHT_ICON}</a>` +
            `<a href="#" class="btn btn-primary" data-to="${localePath(this.router, '/demo/')}">${t(this.router, 'heroBtnDemo')}${ARROW_RIGHT_ICON}</a>` +
            `<a href="https://github.com/esmnext/esmx" target="_blank" class="btn btn-outline">${GITHUB_ICON}GitHub</a>` +
            `</div>` +
            `<div class="hero-trust reveal reveal-delay-4">` +
            `<span class="hero-trust-item">${STAR_ICON}GitHub</span>` +
            `<span class="hero-trust-item">@esmx/core v3.0.0-rc.117</span>` +
            `<span class="hero-trust-item">MIT License</span>` +
            `</div>` +
            `</div>` +
            `<div class="hero-visual reveal reveal-delay-3">` +
            `<div class="esm-flow">` +
            `<div class="esm-node">vue</div>` +
            `<div class="esm-node">react</div>` +
            `<div class="esm-node">preact</div>` +
            `<div class="esm-node esm-node-main">Esmx</div>` +
            `<div class="esm-node">html</div>` +
            `<div class="esm-node">solid</div>` +
            `<div class="esm-node">shared</div>` +
            `<div class="esm-node">utils</div>` +
            `<div class="esm-connection esm-connection-1"></div>` +
            `<div class="esm-connection esm-connection-2"></div>` +
            `<div class="esm-connection esm-connection-3"></div>` +
            `<div class="esm-connection esm-connection-4"></div>` +
            `<div class="esm-connection esm-connection-5"></div>` +
            `<div class="esm-connection esm-connection-6"></div>` +
            `</div>` +
            `</div>` +
            `</div>` +
            `</section>`
        );
    }

    private getPainPointCard(delay: string, solution: string): string {
        return (
            `<div class="painpoint-card reveal reveal-delay-${delay}">` +
            `<div class="painpoint-header">` +
            `<span class="painpoint-icon bad">${X_ICON}</span>` +
            `<span class="painpoint-label-bad">${t(this.router, 'painLabelBad')}</span>` +
            `</div>` +
            `<div class="painpoint-list">` +
            `<div class="painpoint-item"><span class="mark bad">${X_ICON}</span><span>${t(this.router, 'painBad1')}</span></div>` +
            `<div class="painpoint-item"><span class="mark bad">${X_ICON}</span><span>${t(this.router, 'painBad2')}</span></div>` +
            `<div class="painpoint-item"><span class="mark bad">${X_ICON}</span><span>${t(this.router, 'painBad3')}</span></div>` +
            `</div>` +
            `<div class="painpoint-divider"></div>` +
            `<div class="painpoint-header">` +
            `<span class="painpoint-icon good">${CHECK_ICON}</span>` +
            `<span class="painpoint-label-good">Esmx</span>` +
            `</div>` +
            `<div class="painpoint-solution">${solution}</div>` +
            `</div>`
        );
    }

    private getPainPointsHtml(): string {
        return (
            `<section class="section painpoints" id="features">` +
            `<div class="container">` +
            `<div class="section-header reveal">` +
            `<span class="section-label">WHY ESMX</span>` +
            `<h2 class="section-title">${t(this.router, 'whyTitle')}</h2>` +
            `<p class="section-desc">${t(this.router, 'whyDesc')}</p>` +
            `</div>` +
            `<div class="painpoints-grid">` +
            this.getPainPointCard('1', t(this.router, 'painSolution1')) +
            this.getPainPointCard('2', t(this.router, 'painSolution2')) +
            this.getPainPointCard('3', t(this.router, 'painSolution3')) +
            `</div>` +
            `</div>` +
            `</section>`
        );
    }

    private getFeatureCard(
        delay: string,
        iconSvg: string,
        title: string,
        desc: string
    ): string {
        return (
            `<div class="feature-card reveal reveal-delay-${delay}">` +
            `<div class="feature-icon">${iconSvg}</div>` +
            `<h3 class="feature-title">${title}</h3>` +
            `<p class="feature-desc">${desc}</p>` +
            `</div>`
        );
    }

    private getFeaturesHtml(): string {
        const icons = {
            zero: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12B2EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
            esm: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12B2EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
            ssr: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12B2EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
            multi: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12B2EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>`,
            link: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12B2EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
            build: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#12B2EF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/></svg>`
        };

        return (
            `<section class="section">` +
            `<div class="container">` +
            `<div class="section-header reveal">` +
            `<span class="section-label">FEATURES</span>` +
            `<h2 class="section-title">${t(this.router, 'featuresTitle')}</h2>` +
            `<p class="section-desc">${t(this.router, 'featuresDesc')}</p>` +
            `</div>` +
            `<div class="features-grid">` +
            this.getFeatureCard(
                '1',
                icons.zero,
                t(this.router, 'feat1Title'),
                t(this.router, 'feat1Desc')
            ) +
            this.getFeatureCard(
                '2',
                icons.esm,
                t(this.router, 'feat2Title'),
                t(this.router, 'feat2Desc')
            ) +
            this.getFeatureCard(
                '3',
                icons.ssr,
                t(this.router, 'feat3Title'),
                t(this.router, 'feat3Desc')
            ) +
            this.getFeatureCard(
                '4',
                icons.multi,
                t(this.router, 'feat4Title'),
                t(this.router, 'feat4Desc')
            ) +
            this.getFeatureCard(
                '5',
                icons.link,
                t(this.router, 'feat5Title'),
                t(this.router, 'feat5Desc')
            ) +
            this.getFeatureCard(
                '6',
                icons.build,
                t(this.router, 'feat6Title'),
                t(this.router, 'feat6Desc')
            ) +
            `</div>` +
            `</div>` +
            `</section>`
        );
    }

    private getCodeDemoHtml(): string {
        return (
            `<section class="section code-demo" id="quickstart">` +
            `<div class="container">` +
            `<div class="section-header reveal">` +
            `<span class="section-label">QUICK START</span>` +
            `<h2 class="section-title">${t(this.router, 'quickstartTitle')}</h2>` +
            `<p class="section-desc">${t(this.router, 'quickstartDesc')}</p>` +
            `</div>` +
            `<div class="code-demo-grid">` +
            `<div class="terminal reveal reveal-delay-1">` +
            `<div class="terminal-header">` +
            `<span class="terminal-dot red"></span>` +
            `<span class="terminal-dot yellow"></span>` +
            `<span class="terminal-dot green"></span>` +
            `<span class="terminal-title">Terminal</span>` +
            `</div>` +
            `<div class="terminal-body">` +
            `<div class="terminal-line"><span class="terminal-prompt">$</span><span>npm create esmx@latest my-app</span></div>` +
            `<div class="terminal-line"><span class="terminal-status">${CHECK_ICON} Project created successfully</span></div>` +
            `<div class="terminal-line terminal-line-gap"><span class="terminal-prompt">$</span><span>cd my-app && npm install</span></div>` +
            `<div class="terminal-line terminal-line-gap"><span class="terminal-prompt">$</span><span>npm run dev</span></div>` +
            `<div class="terminal-line"><span class="terminal-status">${CHECK_ICON} Ready on http://localhost:3000</span></div>` +
            `<div class="terminal-line terminal-line-gap"><span class="terminal-prompt">$</span><span class="terminal-cursor"></span></div>` +
            `</div>` +
            `</div>` +
            `<div class="terminal reveal reveal-delay-2">` +
            `<div class="terminal-header">` +
            `<span class="terminal-dot red"></span>` +
            `<span class="terminal-dot yellow"></span>` +
            `<span class="terminal-dot green"></span>` +
            `<span class="terminal-title">src/entry.node.ts</span>` +
            `</div>` +
            `<div class="terminal-body">` +
            `<div><span class="sh-keyword">import type</span> { <span class="sh-function">EsmxOptions</span> } <span class="sh-keyword">from</span> <span class="sh-string">'@esmx/core'</span>;</div>` +
            `<div class="terminal-spacer">&nbsp;</div>` +
            `<div><span class="sh-keyword">export default</span> {</div>` +
            `<div>&nbsp;&nbsp;<span class="sh-property">modules</span>: {</div>` +
            `<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="sh-property">links</span>: {</div>` +
            `<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="sh-property">shared</span>: <span class="sh-string">'../shared-modules/dist'</span></div>` +
            `<div>&nbsp;&nbsp;&nbsp;&nbsp;},</div>` +
            `<div>&nbsp;&nbsp;&nbsp;&nbsp;<span class="sh-property">imports</span>: {</div>` +
            `<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="sh-property">vue</span>: <span class="sh-string">'shared-modules/vue'</span>,</div>` +
            `<div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="sh-property">utils</span>: <span class="sh-string">'shared-modules/utils'</span></div>` +
            `<div>&nbsp;&nbsp;&nbsp;&nbsp;}</div>` +
            `<div>&nbsp;&nbsp;}</div>` +
            `<div>} <span class="sh-keyword">satisfies</span> <span class="sh-function">EsmxOptions</span>;</div>` +
            `</div>` +
            `</div>` +
            `</div>` +
            `</div>` +
            `</section>`
        );
    }

    private getEcosystemHtml(): string {
        const logos = {
            vue: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" fill="none"><path fill="#41B883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z"/><path fill="#34495E" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z"/></svg>`,
            react: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><g fill="#61DAFB"><circle cx="64" cy="64" r="11.4"/><path d="M107.3 45.2c-2.2-.8-4.5-1.6-6.9-2.3.6-2.4 1.1-4.8 1.5-7.1 2.1-13.2-.2-22.5-6.6-26.1-1.9-1.1-4-1.6-6.4-1.6-7 0-15.9 5.2-24.9 13.9-9-8.7-17.9-13.9-24.9-13.9-2.4 0-4.5.5-6.4 1.6-6.4 3.7-8.7 13-6.6 26.1.4 2.3.9 4.7 1.5 7.1-2.4.7-4.7 1.4-6.9 2.3C8.2 50 1.4 56.6 1.4 64s6.9 14 19.3 18.8c2.2.8 4.5 1.6 6.9 2.3-.6 2.4-1.1 4.8-1.5 7.1-2.1 13.2.2 22.5 6.6 26.1 1.9 1.1 4 1.6 6.4 1.6 7.1 0 16-5.2 24.9-13.9 9 8.7 17.9 13.9 24.9 13.9 2.4 0 4.5-.5 6.4-1.6 6.4-3.7 8.7-13 6.6-26.1-.4-2.3-.9-4.7-1.5-7.1 2.4-.7 4.7-1.4 6.9-2.3 12.5-4.8 19.3-11.4 19.3-18.8s-6.8-14-19.3-18.8zM92.5 14.7c4.1 2.4 5.5 9.8 3.8 20.3-.3 2.1-.8 4.3-1.4 6.6-5.2-1.2-10.7-2-16.5-2.5-3.4-4.8-6.9-9.1-10.4-13 7.4-7.3 14.9-12.3 21-12.3 1.3 0 2.5.3 3.5.9zM81.3 74c-1.8 3.2-3.9 6.4-6.1 9.6-3.7.3-7.4.4-11.2.4-3.9 0-7.6-.1-11.2-.4-2.2-3.2-4.2-6.4-6-9.6-1.9-3.3-3.7-6.7-5.3-10 1.6-3.3 3.4-6.7 5.3-10 1.8-3.2 3.9-6.4 6.1-9.6 3.7-.3 7.4-.4 11.2-.4 3.9 0 7.6.1 11.2.4 2.2 3.2 4.2 6.4 6 9.6 1.9 3.3 3.7 6.7 5.3 10-1.7 3.3-3.4 6.6-5.3 10zm8.3-3.3c1.5 3.5 2.7 6.9 3.8 10.3-3.4.8-7 1.4-10.8 1.9 1.2-1.9 2.5-3.9 3.6-6 1.2-2.1 2.3-4.2 3.4-6.2zM64 97.8c-2.4-2.6-4.7-5.4-6.9-8.3 2.3.1 4.6.2 6.9.2 2.3 0 4.6-.1 6.9-.2-2.2 2.9-4.5 5.7-6.9 8.3zm-18.6-15c-3.8-.5-7.4-1.1-10.8-1.9 1.1-3.3 2.3-6.8 3.8-10.3 1.1 2 2.2 4.1 3.4 6.1 1.2 2.2 2.4 4.1 3.6 6.1zm-7-25.5c-1.5-3.5-2.7-6.9-3.8-10.3 3.4-.8 7-1.4 10.8-1.9-1.2 1.9-2.5 3.9-3.6 6-1.2 2.1-2.3 4.2-3.4 6.2zM64 30.2c2.4 2.6 4.7 5.4 6.9 8.3-2.3-.1-4.6-.2-6.9-.2-2.3 0-4.6.1-6.9.2 2.2-2.9 4.5-5.7 6.9-8.3zm22.2 21l-3.6-6c3.8.5 7.4 1.1 10.8 1.9-1.1 3.3-2.3 6.8-3.8 10.3-1.1-2.1-2.2-4.2-3.4-6.2zM31.7 35c-1.7-10.5-.3-17.9 3.8-20.3 1-.6 2.2-.9 3.5-.9 6 0 13.5 4.9 21 12.3-3.5 3.8-7 8.2-10.4 13-5.8.5-11.3 1.4-16.5 2.5-.6-2.3-1-4.5-1.4-6.6zM7 64c0-4.7 5.7-9.7 15.7-13.4 2-.8 4.2-1.5 6.4-2.1 1.6 5 3.6 10.3 6 15.6-2.4 5.3-4.5 10.5-6 15.5C15.3 75.6 7 69.6 7 64zm28.5 49.3c-4.1-2.4-5.5-9.8-3.8-20.3.3-2.1.8-4.3 1.4-6.6 5.2 1.2 10.7 2 16.5 2.5 3.4 4.8 6.9 9.1 10.4 13-7.4 7.3-14.9 12.3-21 12.3-1.3 0-2.5-.3-3.5-.9zM96.3 93c1.7 10.5.3 17.9-3.8 20.3-1 .6-2.2.9-3.5.9-6 0-13.5-4.9-21-12.3 3.5-3.8 7-8.2 10.4-13 5.8-.5 11.3-1.4 16.5-2.5.6 2.3 1 4.5 1.4 6.6zm9-15.6c-2 .8-4.2 1.5-6.4 2.1-1.6-5-3.6-10.3-6-15.6 2.4-5.3 4.5-10.5 6-15.5 13.8 4 22.1 10 22.1 15.6 0 4.7-5.8 9.7-15.7 13.4z"/></g></svg>`,
            preact: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#673AB8" d="M64 0L31.1 19v38L64 76l32.9-19V19L64 0z"/><path fill="#fff" d="M64 8L39.6 22v28L64 64l24.4-14V22L64 8z"/><path fill="#673AB8" d="M64 24l-12.2 7v14L64 52l12.2-7V31L64 24z"/><path fill="#FF73FA" d="M31.1 57L64 76l32.9-19v12L64 88 31.1 69V57z"/><path fill="#9D8DF1" d="M31.1 69L64 88l32.9-19v12L64 100 31.1 81V69z"/><path fill="#fff" d="M31.1 81L64 100l32.9-19v12L64 112 31.1 93V81z"/></svg>`,
            solid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#446b9e" d="M64 0L15.8 27.8v72.4L64 128l48.2-27.8V27.8L64 0z"/><path fill="#2c4f7c" d="M64 8L23.6 31.3v65.4L64 120l40.4-23.3V31.3L64 8z"/><path fill="#76b3e1" d="M64 16L31.4 34.8v57.4L64 112l32.6-19.8V34.8L64 16z"/><path fill="#fff" d="M64 24L39.2 38.3v51.4L64 104l24.8-14.3V38.3L64 24z"/></svg>`,
            html5: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#E44D26" d="M19.037 113.876L9.032 1.661h109.936l-10.016 112.198-45.019 12.48z"/><path fill="#F16529" d="M64 116.8l36.378-10.086 8.559-95.878H64z"/><path fill="#EBEBEB" d="M64 52.455H45.788L44.53 38.361H64V24.599H29.489l.33 3.692 3.382 37.927H64zm0 35.743l-.061.017-15.327-4.14-.979-10.975H33.816l1.928 21.609 28.193 7.826.063-.017z"/><path fill="#fff" d="M63.952 52.455v13.762h16.947l-1.597 17.849-15.35 4.143v14.319l28.215-7.82.207-2.325 3.234-36.233.335-3.696h-3.708zm0-27.856v13.762h33.244l.276-3.092.628-6.978.329-3.692z"/></svg>`,
            svelte: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><path fill="#FF3E00" d="M98.96 14.53a8.96 8.96 0 0 0-8.14 5.18l-9.68 20.1c-1.05 2.18-.9 4.76.4 6.8l12.28 18.9a8.96 8.96 0 0 1-7.55 13.78h-7.9a8.96 8.96 0 0 0-8.14 5.18l-9.68 20.1a8.96 8.96 0 0 1-16.14 0l-9.68-20.1a8.96 8.96 0 0 0-8.14-5.18h-7.9a8.96 8.96 0 0 1-7.55-13.78l12.28-18.9a8.96 8.96 0 0 0 .4-6.8l-9.68-20.1a8.96 8.96 0 0 1 16.14-7.96l9.68 20.1a8.96 8.96 0 0 0 8.14 5.18h15.8a8.96 8.96 0 0 0 8.14-5.18l9.68-20.1a8.96 8.96 0 0 1 16.14 7.96z"/><path fill="#fff" d="M64 40a24 24 0 1 0 0 48 24 24 0 0 0 0-48zm0 8a16 16 0 1 1 0 32 16 16 0 0 1 0-32z"/></svg>`
        };

        return (
            `<section class="section" id="ecosystem">` +
            `<div class="container">` +
            `<div class="section-header reveal">` +
            `<span class="section-label">ECOSYSTEM</span>` +
            `<h2 class="section-title">${t(this.router, 'ecoTitle')}</h2>` +
            `<p class="section-desc">${t(this.router, 'ecoDesc')}</p>` +
            `</div>` +
            '<div class="ecosystem-logos reveal reveal-delay-1">' +
            `<a href="#" class="ecosystem-item" data-to="${localePath(this.router, '/vue3/')}">` +
            logos.vue +
            '<span>Vue</span></a>' +
            `<a href="#" class="ecosystem-item" data-to="${localePath(this.router, '/react/')}">` +
            logos.react +
            '<span>React</span></a>' +
            `<a href="#" class="ecosystem-item" data-to="${localePath(this.router, '/preact/')}">` +
            logos.preact +
            '<span>Preact</span></a>' +
            `<a href="#" class="ecosystem-item" data-to="${localePath(this.router, '/solid/')}">` +
            logos.solid +
            '<span>Solid</span></a>' +
            `<a href="#" class="ecosystem-item" data-to="${localePath(this.router, '/html/')}">` +
            logos.html5 +
            '<span>HTML5</span></a>' +
            `<a href="#" class="ecosystem-item" data-to="${localePath(this.router, '/svelte/')}">` +
            logos.svelte +
            '<span>Svelte</span></a>' +
            '</div>' +
            `</div>` +
            `</section>`
        );
    }

    private getFooterHtml(): string {
        return (
            `<footer class="footer">` +
            `<div class="container footer-inner">` +
            `<div class="footer-brand">` +
            ESMX_LOGO_SVG +
            `Esmx` +
            `</div>` +
            `<p class="footer-copyright">MIT License &copy; 2025 Esmx Team</p>` +
            `<div class="footer-links">` +
            `<a href="https://github.com/esmnext/esmx" target="_blank">${GITHUB_ICON}GitHub</a>` +
            `<a href="${localePath(this.router, DOCS_ENTRY_PATH)}">${BOOK_ICON}${t(this.router, 'footerDocs')}</a>` +
            `</div>` +
            `</div>` +
            `</footer>`
        );
    }

    render(): string {
        return (
            `<div class="landing-page">` +
            this.getNavHtml() +
            this.getHeroHtml() +
            this.getPainPointsHtml() +
            this.getFeaturesHtml() +
            this.getCodeDemoHtml() +
            this.getEcosystemHtml() +
            `<section class="section" style="text-align: center;">
                <div class="container">
                    <div class="section-header reveal">
                        <span class="section-label">LIVE DEMO</span>
                        <h2 class="section-title">${t(this.router, 'liveTitle')}</h2>
                        <p class="section-desc">${t(this.router, 'liveDesc')}</p>
                    </div>
                    <a href="#" class="btn btn-primary" data-to="${localePath(this.router, '/demo/')}" style="font-size: 1.1rem; padding: 14px 32px;">
                        ${t(this.router, 'liveBtn')} ${ARROW_RIGHT_ICON}
                    </a>
                </div>
            </section>` +
            this.getFooterHtml() +
            `</div>`
        );
    }

    protected onMount(container: HTMLElement): void {
        container.innerHTML = this.render();
        this.initScripts(container);
        this.watchLocale(container);
    }

    protected onHydration(container: HTMLElement): void {
        this.initScripts(container);
        this.watchLocale(container);
    }

    /**
     * Re-render the whole landing page in place when the locale changes — the
     * app instance is reused across `/` <-> `/zh/`, so a full content swap (then
     * re-init of the scroll/nav scripts) is the simplest correct refresh. No
     * page reload: the language toggle drives an SPA `router.push`.
     */
    private watchLocale(container: HTMLElement): void {
        this.unsubLocale = subscribeLocale(this.router, () => {
            container.innerHTML = this.render();
            this.initScripts(container);
        });
    }

    protected onUnmount(): void {
        this.unsubLocale?.();
        this.unsubLocale = null;
    }

    renderToString(): Promise<string> {
        return Promise.resolve(this.render());
    }

    private initScripts(container: HTMLElement): void {
        document.documentElement.classList.add('js-enabled');

        // Language toggle (desktop + mobile): switch to the same page under the
        // other locale via SPA navigation (`/` <-> `/zh/`). No full page reload;
        // the locale-sync hook then re-renders this page in the new language.
        const switchLocale = () => {
            const path = this.router.route.path;
            const target =
                localeFromPath(path) === 'zh'
                    ? path.replace(/^\/zh/, '') || '/'
                    : `/zh${path}`;
            this.router.push(target);
        };
        for (const id of ['#landingLangToggle', '#landingLangToggleMobile']) {
            container
                .querySelector(id)
                ?.addEventListener('click', switchLocale);
        }

        const mobileToggle = container.querySelector(
            '#landingMobileToggle'
        ) as HTMLElement | null;
        const mobileMenu = container.querySelector(
            '#landingMobileMenu'
        ) as HTMLElement | null;

        if (mobileToggle && mobileMenu) {
            const toggleHandler = () => {
                mobileToggle.classList.toggle('active');
                mobileMenu.classList.toggle('active');
            };
            mobileToggle.addEventListener('click', toggleHandler);

            mobileMenu.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => {
                    mobileToggle.classList.remove('active');
                    mobileMenu.classList.remove('active');
                });
            });
        }

        const revealElements = container.querySelectorAll('.reveal');
        const revealObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        revealObserver.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1
            }
        );
        revealElements.forEach((el) => revealObserver.observe(el));

        // SPA navigation for data-to links (demo CTA, ecosystem items)
        container.querySelectorAll('[data-to]').forEach((el) => {
            el.addEventListener('click', (e) => {
                e.preventDefault();
                const to = (e.currentTarget as HTMLElement).getAttribute(
                    'data-to'
                );
                if (to) this.router.push(to);
            });
        });

        container.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                const el = e.currentTarget as HTMLAnchorElement;
                const href = el.getAttribute('href');
                if (!href || href === '#') return;
                e.preventDefault();
                const target = container.querySelector(href);
                if (target) {
                    const navHeight = 64;
                    const targetPosition =
                        target.getBoundingClientRect().top +
                        window.pageYOffset -
                        navHeight;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            });
        });
    }
}

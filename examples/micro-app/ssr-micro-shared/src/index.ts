// CSS side-effect imports — own them at the federation root so consumers
// don't need to import workspace-dep stylesheets (which rsbuild silently
// drops). Each consuming remote reaches ssr-micro-shared anyway, and the
// host's renderHost emits `<link>` for these chunks from this manifest.
// @ts-expect-error CSS handled by bundler loader, not tsc.
import './styles/tokens.css';
// @ts-expect-error CSS handled by bundler loader, not tsc.
import './styles/components.css';

export { renderSSRHead } from 'unhead/server';
export type { ActiveHeadEntry, Unhead, UseHeadInput } from 'unhead/types';
export type { AppState } from './app-state';
export {
    getAppState,
    setAppState,
    subscribeAppState
} from './app-state';
export { BaseApp } from './base-app';
export { getRouterHead } from './head-manager';
export type { HostOptions } from './host';
export { hydrateHost, renderHost } from './host';
export type { CardText, Locale } from './i18n';
export {
    getCardText,
    getLocale,
    installLocaleSync,
    localeFromPath,
    localePath,
    setLocale,
    subscribeLocale,
    t
} from './i18n';
export {
    installNavDelegate,
    Layout,
    SIDEBAR_WIDTH,
    STANDALONE_KEY
} from './layout';
export type { SeoOptions } from './seo';
export { buildSeoHead, landingLd, organizationLd } from './seo';
export { getSsrStyles, setSsrStyles } from './ssr-styles';

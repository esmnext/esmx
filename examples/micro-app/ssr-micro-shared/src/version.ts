import corePkg from '@esmx/core/package.json';

/**
 * The framework version, sourced from `@esmx/core`'s package.json so the site
 * always reflects the released version (lerna bumps it) — no hardcoded strings
 * to update by hand. Inlined at build time, so it is consistent across SSR and
 * client hydration.
 */
export const ESMX_VERSION: string = corePkg.version;

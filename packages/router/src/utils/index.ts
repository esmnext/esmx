export {
    regexDomain,
    normalizePath,
    parsePath,
    stringifyPath,
    normalizeLocation,
    isPathWithProtocolOrDomain
} from './path';
export { isESModule, inBrowser } from './utils';
export { warn } from './warn';
export { isSameRoute, isEqualRoute } from './guards';
export {
    computeScrollPosition,
    scrollToPosition,
    saveScrollPosition,
    getSavedScrollPosition,
    getKeepScrollPosition
} from './scroll';
export { openWindow } from './bom';
export {
    encodeHash,
    encodeParam,
    encodePath,
    encodeQueryKey,
    encodeQueryValue,
    decode
} from './encoding';

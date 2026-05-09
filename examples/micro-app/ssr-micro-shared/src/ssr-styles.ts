import type { Router } from '@esmx/router';

const stylesMap = new WeakMap<Router, string>();

export function setSsrStyles(router: Router, styles: string): void {
    stylesMap.set(router, styles);
}

export function getSsrStyles(router: Router): string {
    return stylesMap.get(router) ?? '';
}

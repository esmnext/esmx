import type { Router } from '@esmx/router';
import type { Unhead } from 'unhead/types';

const headMap = new WeakMap<Router, Unhead<any>>();

export function setRouterHead(router: Router, head: Unhead<any>): void {
    headMap.set(router, head);
}

export function getRouterHead(router: Router): Unhead<any> | undefined {
    return headMap.get(router);
}

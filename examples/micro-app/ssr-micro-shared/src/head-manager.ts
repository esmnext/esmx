import type { Router } from '@esmx/router';
import { createHead as createClientHead } from 'unhead/client';
import { createHead as createServerHead } from 'unhead/server';
import type { Unhead } from 'unhead/types';

const HEAD = 'esmx:head';

/**
 * Returns the single shared unhead instance for a router, creating it on first
 * access (same get-or-create + `router.context` convention as app-state).
 *
 * Why one shared head per router: every framework adapter (Vue `useHead`, React
 * `useHead`, …) is pointed at THIS instance, so they all contribute entries to
 * one head that owns `document.head`. That removes the multi-head race on the
 * client while letting each framework use its idiomatic head API.
 *
 * Why `router.context` and not a `WeakMap<Router, …>`: `@esmx/router-vue` hands
 * components a Proxy of the router; a Proxy is a distinct identity from its
 * target (a WeakMap keyed by the router would miss it), but `proxy.context`
 * forwards via `Reflect.get` to the same underlying object.
 *
 * Server vs client: on the server a server head is created so that adapters
 * which only register during render when `head.ssr` is true (notably
 * `@unhead/react`'s `useHead`) are collected by `renderSSRHead`; on the client
 * a client head drives the live DOM.
 */
export function getRouterHead(router: Router): Unhead<any> {
    const existing = router.context[HEAD];
    if (existing) {
        return existing as Unhead<any>;
    }
    const head =
        typeof document === 'undefined'
            ? createServerHead()
            : createClientHead();
    router.context[HEAD] = head;
    return head;
}

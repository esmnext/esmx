import type { Router } from '@esmx/router';
import type { ActiveHeadEntry, Unhead, UseHeadInput } from 'unhead/types';
import { getRouterHead } from './head-manager';

/**
 * Micro-app abstract base class
 *
 * Design rationale:
 * 1. Unified SSR/CSR container detection and management logic
 * 2. Lifecycle controlled by base class, subclasses implement rendering
 * 3. Separation of concerns: base manages DOM, subclasses manage framework mounting
 * 4. Consistent code structure across all sub-applications
 * 5. Shared <head>: all apps resolve one router-scoped head (`this.head`) that
 *    owns `document.head`, so there is never a multi-head race on the client.
 *    Frameworks with an idiomatic head composable (Vue/React `useHead`) wire
 *    that shared head into their adapter and manage entries in-component;
 *    frameworks without one declare a static `getHead()` and let the base class
 *    push it on construction and dispose it on unmount.
 */
export abstract class BaseApp {
    protected container: HTMLElement | null = null;
    protected readonly head: Unhead<any>;
    private headEntry: ActiveHeadEntry<UseHeadInput> | null = null;

    constructor(protected router: Router) {
        // One shared head per router (see head-manager).
        this.head = getRouterHead(router);
        // Static-head apps declare getHead(); composable apps (Vue/React) return
        // null here and drive the same shared head via their useHead adapter.
        const input = this.getHead();
        if (input) {
            this.headEntry = this.head.push(input);
        }
    }

    /**
     * Static <head> (title, meta, …) contributed on construction and disposed on
     * unmount by the base class. Return `null` when the app instead manages the
     * head in-component via its framework's `useHead` adapter (Vue/React).
     */
    protected getHead(): UseHeadInput | null {
        return null;
    }

    mount(el: HTMLElement): void {
        this.container = el;
        this.onMount(el);
    }

    hydration(el: HTMLElement): void {
        this.container = el;
        this.onHydration(el);
    }

    unmount(): void {
        this.onUnmount();
        // Idempotent: dispose this app's head entry so the next app's title wins.
        this.headEntry?.dispose();
        this.headEntry = null;
        this.container = null;
    }

    abstract renderToString(): Promise<string>;

    protected abstract onMount(container: HTMLElement): void;

    protected abstract onHydration(container: HTMLElement): void;

    protected abstract onUnmount(): void;
}

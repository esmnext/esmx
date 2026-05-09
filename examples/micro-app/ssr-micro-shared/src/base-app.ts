import type { Router } from '@esmx/router';

/**
 * Micro-app abstract base class
 *
 * Design rationale:
 * 1. Unified SSR/CSR container detection and management logic
 * 2. Lifecycle controlled by base class, subclasses implement rendering
 * 3. Separation of concerns: base manages DOM, subclasses manage framework mounting
 * 4. Consistent code structure across all sub-applications
 */
export abstract class BaseApp {
    protected container: HTMLElement | null = null;

    constructor(protected router: Router) {}

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
        this.container = null;
    }

    abstract renderToString(): Promise<string>;

    protected abstract onMount(container: HTMLElement): void;

    protected abstract onHydration(container: HTMLElement): void;

    protected abstract onUnmount(): void;
}

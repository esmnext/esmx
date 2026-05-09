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

    mount(root: HTMLElement): void {
        const ssrEl = root.querySelector('[data-ssr]');
        if (ssrEl) {
            this.container = ssrEl as HTMLElement;
        } else {
            this.container = document.createElement('div');
            root.appendChild(this.container);
        }
        this.onMount(this.container);
    }

    unmount(): void {
        this.onUnmount();
        this.container = null;
    }

    abstract renderToString(): Promise<string>;

    protected abstract onMount(container: HTMLElement): void;

    protected abstract onUnmount(): void;
}

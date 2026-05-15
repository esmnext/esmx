import type { Router } from '@esmx/router';

const STATE = 'esmx:appState';
const LISTENERS = 'esmx:appState:listeners';

export interface AppState {
    visitCount: number;
    lastVisited: string | null;
    frameworkVisits: Record<string, number>;
}

function freeze(state: AppState): AppState {
    return Object.freeze(state);
}

export function getAppState(router: Router): AppState {
    const state = router.context[STATE];
    if (state && typeof state === 'object') {
        return state as AppState;
    }
    const initial: AppState = freeze({
        visitCount: 0,
        lastVisited: null,
        frameworkVisits: {}
    });
    router.context[STATE] = initial;
    return initial;
}

export function setAppState(router: Router, patch: Partial<AppState>): void {
    const prev = getAppState(router);
    const next = freeze({
        ...prev,
        ...patch,
        frameworkVisits: patch.frameworkVisits
            ? { ...prev.frameworkVisits, ...patch.frameworkVisits }
            : prev.frameworkVisits
    });
    router.context[STATE] = next;
    const listeners = router.context[LISTENERS];
    if (listeners instanceof Set) {
        (listeners as Set<() => void>).forEach((fn) => fn());
    }
}

export function subscribeAppState(router: Router, fn: () => void): () => void {
    if (!(router.context[LISTENERS] instanceof Set)) {
        router.context[LISTENERS] = new Set<() => void>();
    }
    const listeners = router.context[LISTENERS] as Set<() => void>;
    listeners.add(fn);
    return () => listeners.delete(fn);
}

import { message } from './message';

// Track HMR state: __marker is reset by a full page reload but preserved by an
// in-place module replacement; __renderCount counts re-renders.
const w = window as unknown as { __marker?: number; __renderCount?: number };
if (w.__marker === undefined) {
    w.__marker = Date.now();
}

let current = message;

function render(): void {
    w.__renderCount = (w.__renderCount ?? 0) + 1;
    const el = document.getElementById('app');
    if (el) {
        el.textContent = current('client');
    }
}

render();

// HMR boundary: re-render in place using the updated module — no page reload.
if (import.meta.hot) {
    import.meta.hot.accept('./message', (mod) => {
        if (mod) {
            current = mod.message;
            render();
        }
    });
}

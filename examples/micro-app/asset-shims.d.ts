// Workspace infrastructure (NOT a per-provider declaration).
//
// Under source-resolution (RFC 0001 §8), a cross-framework consumer (plain
// tsc) may read a provider's SOURCE which imports framework assets (Vue SFCs,
// Svelte components). Those are opaque to a non-framework compiler, so they
// are typed `any`: the consumer treats the asset as an opaque value at the
// type-erased federation boundary, and never type-checks the asset itself.
// `any` (not `unknown`) so framework APIs that consume the import — e.g. Vue's
// `h(Component)` / `createSSRApp` — accept it. The provider still type-checks
// its own SFCs with its own toolchain (vue-tsc, etc.).
declare module '*.vue' {
    const component: any;
    export default component;
}
declare module '*.svelte' {
    const component: any;
    export default component;
}

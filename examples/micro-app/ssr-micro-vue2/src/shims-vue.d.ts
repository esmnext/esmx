// Vue 2.7 SFC shim. vue-tsc 3.x only type-checks Vue 3 SFCs natively, so for
// Vue 2 we fall back to the conventional ambient `*.vue` module declaration.
// This file must stay free of top-level imports/exports to remain a global
// (ambient) script — otherwise the wildcard declaration would not apply.
declare module '*.vue' {
    import type { Component } from 'vue';
    const component: Component;
    export default component;
}

// @ts-expect-error deep import of the bundler build: importing the bare
// specifier here would self-externalize onto this very export (cycle).
export * from '@vue/server-renderer/dist/server-renderer.esm-bundler.js';

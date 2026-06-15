// @ts-expect-error deep import of the production build: importing the bare
// specifier here would self-externalize onto this very export (cycle).
export * from 'vue-server-renderer/build.prod.js';

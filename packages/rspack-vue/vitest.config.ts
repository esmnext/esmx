import { defineConfig } from 'vitest/config';

// vue-app.ts and the loader entry modules call `import.meta.resolve(...)` —
// some at module top level. Vitest's Vite SSR transform rewrites `import.meta`
// to `__vite_ssr_import_meta__`, which lacks `resolve`, so those modules throw
// on import. Replace `import.meta.resolve` with a createRequire-based shim
// BEFORE Vite's transform runs (enforce: 'pre'), keeping the source untouched.
export default defineConfig({
    plugins: [
        {
            name: 'esmx-test-import-meta-resolve',
            enforce: 'pre',
            transform(code, id) {
                if (!id.includes('rspack-vue/src')) return;
                if (!code.includes('import.meta.resolve')) return;

                const banner = [
                    "import { createRequire as __esmxCreateRequire } from 'node:module';",
                    "import { pathToFileURL as __esmxPathToFileURL } from 'node:url';",
                    'const __esmxRequire = __esmxCreateRequire(import.meta.url);',
                    'const __esmxResolve = (spec) =>',
                    "    typeof spec === 'string' && spec.startsWith('file:')",
                    '        ? spec',
                    '        : __esmxPathToFileURL(__esmxRequire.resolve(spec)).href;',
                    ''
                ].join('\n');

                return {
                    code:
                        banner +
                        code.replace(/import\.meta\.resolve/g, '__esmxResolve'),
                    map: null
                };
            }
        }
    ]
});

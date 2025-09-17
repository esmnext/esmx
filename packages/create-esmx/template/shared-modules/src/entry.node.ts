import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: [
            // ========== Applicable to all shared modules ==========
            'pkg:@esmx/router',

            {
                // ========== Vue framework shared module configuration ==========
                // Business code: import Vue from 'vue' (defaults to Vue 3, shared from common modules)
                vue: {
                    client: 'pkg:vue/dist/vue.runtime.esm-browser.js', // Vue 3 production
                    server: 'pkg:vue/dist/vue.runtime.esm-browser.prod.js' // Vue 3 development
                },
                'vue/index': 'root:src/vue/index.ts',
                '@esmx/router-vue': 'pkg:@esmx/router-vue', // Vue 3 router

                // ========== Vue2 framework shared module configuration ==========
                // Exported to vue2/ directory, version isolation via scope mapping
                vue2: 'pkg:vue2/dist/vue.runtime.esm.js', // → vue2/vue.mjs
                'vue2/@esmx/router-vue': 'pkg:@esmx/router-vue', // → vue2/@esmx/router-vue.mjs,
                'vue2/index': 'root:src/vue2/index.ts'
            }
        ],

        scopes: {
            // ========== Vue2 shared module scope mapping ==========
            // Directory scope mapping: Only affects shared modules in vue2/ directory
            // Business code in vue2/ directory: import Vue from 'vue' → {{projectName}}/vue2 (version-isolated)
            // Business code in other directories: import Vue from 'vue' → Vue 3 (shared from common modules)
            'vue2/': {
                vue: '{{projectName}}/vue2'
            }

            // Package scope mapping: Affects dependencies within shared module packages
            // Example: When 'vue' package depends on 'AA', use replacement version
            // 'vue': {
            //     AA: 'some-other-AA'
            // }
        }
    },
    async devApp(esmx) {
        return import('@esmx/rspack').then((m) =>
            m.createRspackHtmlApp(esmx, {
                chain(context) {
                    // Custom Rspack configuration
                }
            })
        );
    },
    async server(esmx) {
        const server = http.createServer((req, res) => {
            esmx.middleware(req, res, async () => {
                const rc = await esmx.render({
                    params: { url: req.url }
                });
                res.end(rc.html);
            });
        });

        server.listen(3000, () => {
            console.log('Server started: http://localhost:3000');
        });
    }
} satisfies EsmxOptions;

/**
 * @file Node.js server entry file
 * @description Responsible for development environment configuration and server startup, providing SSR runtime environment
 */

import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    /**
     * Configure development environment app creator
     * @description Create and configure Rspack app instance for development environment build and hot reload
     * @param esmx Esmx framework instance, providing core functionality and configuration interface
     * @returns Returns configured Rspack app instance with HMR and live preview support
     */
    async devApp(esmx) {
        return import('@esmx/rspack-react').then((m) =>
            m.createRspackReactApp(esmx, {
                config(context) {
                    // Custom Rspack configuration can be added here
                }
            })
        );
    },

    /**
     * Configure and start HTTP server
     * @description Create HTTP server instance, integrate Esmx middleware, handle SSR requests
     * @param esmx Esmx framework instance, providing middleware and rendering functionality
     */
    async server(esmx) {
        const server = http.createServer((req, res) => {
            // Use Esmx middleware to handle requests
            esmx.middleware(req, res, async () => {
                // Execute server-side rendering
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

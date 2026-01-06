import http from 'node:http';
import type { EsmxOptions } from '@esmx/core';

export default {
    modules: {
        exports: ['pkg:react']
    },
    async devApp(esmx) {
        return import('@esmx/rspack-react').then((m) =>
            m.createRspackReactApp(esmx, {
                config(context: any) {
                    // Custom Rspack configuration
                }
            })
        );
    },

    async postBuild(esmx) {
        // postBuild is intentionally empty for react-ssr
        // React SSR has issues with React internal state (ReactCurrentDispatcher) during postBuild
        // React internal state cannot be initialized from outside the module that uses React
        // This prevents build failures while maintaining the postBuild hook structure
        // Vue SSR can use render() in postBuild, but React SSR cannot due to internal state requirements
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

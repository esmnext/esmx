import { Router } from '@esmx/router';
import { setRouterHead } from 'ssr-micro-shared/src/index';
// @ts-expect-error Esmx module linking resolves to environment-specific chunk
import { createHead } from 'unhead';

import { routes } from './routes';

const basePath = window.__ESMX_BASE__ || '/';
const base = new URL(basePath, location.origin);

const router = new Router({
    routes,
    appId: 'app',
    base,
    resolveLink(link) {
        const { href, origin } = link.route.url;
        link.attributes.href = href.slice(origin.length) || '/';
        return link;
    }
});

setRouterHead(router, createHead({ disableDefaults: true }));

await router.replace(location.href);

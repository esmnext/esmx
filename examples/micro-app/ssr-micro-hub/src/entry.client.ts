import { Router } from '@esmx/router';
// @ts-expect-error Esmx module linking resolves to environment-specific chunk
import { createHead } from 'unhead';

import { routes } from './routes';

const basePath = window.__ESMX_BASE__ || '/';
const base = new URL(basePath, location.origin);

const router = new Router({
    routes,
    appId: 'app',
    base,
    context: {
        head: createHead({ disableDefaults: true })
    },
    resolveLink(link) {
        const { href, origin } = link.route.url;
        link.attributes.href = href.slice(origin.length) || '/';
        return link;
    }
});

await router.replace(location.href);

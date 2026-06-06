import { Router } from '@esmx/router';
import { installNavDelegate } from 'ssr-micro-shared/src/index';

import { routes } from './routes';

const basePath = window.__ESMX_BASE__ || '/';
const base = new URL(basePath, location.origin);
const context = window.__ESMX_CONTEXT__ || {};

const router = new Router({
    routes,
    appId: 'app',
    base,
    context,
    resolveLink(link) {
        const { href, origin } = link.route.url;
        link.attributes.href = href.slice(origin.length) || '/';
        return link;
    }
});

// Install the nav-click delegate before the first app mounts, so sidebar links
// are intercepted from the very first interaction (no per-app binding gap).
installNavDelegate(router);

await router.replace(location.href);

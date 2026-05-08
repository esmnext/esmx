import { Router } from '@esmx/router';
import { routes } from './routes';

const pathname = location.pathname;
const basePath = pathname.replace(/\/[^/]+\/?$/, '/');
const base = new URL(basePath || '/', location.origin);

const router = new Router({
    routes,
    root: '#app',
    base,
    resolveLink(link) {
        const { href, origin } = link.route.url;
        link.attributes.href = href.slice(origin.length) || '/';
        return link;
    }
});

router.replace(location.href);

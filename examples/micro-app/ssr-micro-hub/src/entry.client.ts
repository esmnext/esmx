import { Router } from '@esmx/router';
import { routes } from './routes';

const router = new Router({
    routes,
    root: '#app',
    base: new URL(location.href),
    resolveLink(link) {
        const { href, origin } = link.route.url;
        link.attributes.href = href.slice(origin.length) || '/';
        return link;
    }
});

router.replace(location.href);

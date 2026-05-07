import { Router } from '@esmx/router';
import { routes } from './routes';

const router = new Router({
    routes,
    root: '#app',
    base: new URL(location.href)
});

router.replace(location.href);

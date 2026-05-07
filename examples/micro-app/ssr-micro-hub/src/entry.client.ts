import { Router } from '@esmx/router';
import { routes } from './routes';

const router = new Router({
    routes,
    root: '#app'
});

router.replace(location.pathname);

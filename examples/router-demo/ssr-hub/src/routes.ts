import type { RouteConfig } from '@esmx/router';
import { routes as vue2routes } from 'ssr-vue2/src/routes';
import { routes as vue3routes } from 'ssr-vue3/src/routes';

export const routes: RouteConfig[] = [...vue3routes, ...vue2routes];

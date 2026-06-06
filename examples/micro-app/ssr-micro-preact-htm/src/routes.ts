import type { RouteConfig } from '@esmx/router';
import { createPreactHtmApp } from './create-app';

export const routes: RouteConfig[] = [
    {
        path: '/preact-htm/',
        app: createPreactHtmApp
    }
];

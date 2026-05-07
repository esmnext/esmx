import type { RouteConfig } from '@esmx/router';
import { createHtmlApp } from './app';

export const routes: RouteConfig[] = [
    {
        path: '/html',
        app: createHtmlApp
    }
];

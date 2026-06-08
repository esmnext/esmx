import type { RouteConfig } from '@esmx/router';
import { createSolidApp } from './create-app';

export const routes: RouteConfig[] = [
    {
        path: '/solid/',
        app: createSolidApp
    }
];

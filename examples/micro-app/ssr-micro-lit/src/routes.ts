import type { RouteConfig } from '@esmx/router';
import { createLitApp } from './create-app';

export const routes: RouteConfig[] = [
    {
        path: '/lit/',
        app: createLitApp
    }
];

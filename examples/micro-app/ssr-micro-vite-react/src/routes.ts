import type { RouteConfig } from '@esmx/router';
import { createReactApp } from './create-app';

export const routes: RouteConfig[] = [
    {
        path: '/vite-react/',
        app: createReactApp
    }
];

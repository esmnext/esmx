import type { RouteConfig } from '@esmx/router';
import { createReactApp } from './app';

export const routes: RouteConfig[] = [
    {
        path: '/react',
        app: createReactApp
    }
];

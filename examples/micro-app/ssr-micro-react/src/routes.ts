import type { RouteConfig } from '@esmx/router';
import { App, createReactApp } from './app';

export const routes: RouteConfig[] = [
    {
        path: '/react',
        app: createReactApp,
        component: App
    }
];

import type { RouteConfig } from '@esmx/router';
import { createReactApp } from './create-app.tsx';

export const routes: RouteConfig[] = [
    {
        path: '/react',
        app: createReactApp
    }
];

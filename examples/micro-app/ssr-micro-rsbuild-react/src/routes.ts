import type { RouteConfig } from '@esmx/router';
import { createReactApp } from './create-app';

export const routes: RouteConfig[] = [
    {
        path: '/rsbuild-react/',
        app: createReactApp
    }
];

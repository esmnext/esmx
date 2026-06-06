import type { RouteConfig } from '@esmx/router';
import { createPreactApp } from './create-app';

export const routes: RouteConfig[] = [
    {
        path: '/preact/',
        app: createPreactApp
    }
];

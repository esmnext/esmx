import type { RouteConfig } from '@esmx/router';
import { createSvelteApp } from './create-app';

export const routes: RouteConfig[] = [
    {
        path: '/svelte/',
        app: createSvelteApp
    }
];

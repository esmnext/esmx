import { describe, expect, it } from 'vitest';
import {
    RouteTransition as IndexRouteTransition,
    Router as IndexRouter
} from './index';
import { RouteTransition } from './route-transition';
import { Router } from './router';

describe('index exports', () => {
    it('should export Router correctly', () => {
        expect(IndexRouter).toBe(Router);
    });

    it('should export RouteTransition correctly', () => {
        expect(IndexRouteTransition).toBe(RouteTransition);
    });
});

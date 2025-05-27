import { compile, match, pathToRegexp } from 'path-to-regexp';
import type { RouteConfig, RouterRawLocation } from './types';

export class RouteMatcher {
    private routes: RouteConfig[];
    public constructor(routes: RouteConfig[]) {
        this.routes = routes;
    }
    public match(rawLocation: RouterRawLocation) {}
}

import { rawLocationToURL } from './location';
import { Route, type RouterRawLocation } from './types';

export function parseRoute(location: RouterRawLocation) {
    const url = rawLocationToURL(location);
}

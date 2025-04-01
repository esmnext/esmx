import { describe, it } from 'vitest';

import {
    isPathWithProtocolOrDomain,
    normalizeLocation,
    normalizePath
} from './path';

// console.log(normalizeLocation({ path: '/' }));

// console.log(isPathWithProtocolOrDomain('/'));
// console.log(isPathWithProtocolOrDomain('www.a.b'));
// console.log(isPathWithProtocolOrDomain('a.b.cm'));
// console.log(isPathWithProtocolOrDomain('http://a.cn'));
// console.log(isPathWithProtocolOrDomain('a.b/path'));

describe('testing normalizeLocation', () => {
    it('testing normal domain', ({ expect }) => {
        expect(
            normalizeLocation(
                'http://localhost:5173/en/en/en/en/en',
                'http://localhost:5173/en/'
            ).path
        ).toBe('/en/en/en/en');
    });
    it('testing path', ({ expect }) => {
        expect(
            normalizeLocation('/test1/test2?t=https://www-six.betafollowme.com')
                .path
        ).toBe('/test1/test2');
    });
});

describe('testing normalizePath', () => {
    it('testing normal domain', ({ expect }) => {
        expect(normalizePath('test2', 'test1')).toBe('/test1/test2');
    });
    it('testing path', ({ expect }) => {
        expect(
            normalizeLocation('/test1/test2?t=https://www-six.betafollowme.com')
                .path
        ).toBe('/test1/test2');
    });
});

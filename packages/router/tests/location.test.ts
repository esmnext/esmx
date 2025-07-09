import { describe, expect, test } from 'vitest';
import { normalizeURL, parseLocation } from '../src/location';
import type { RouteLocationInput } from '../src/types';

declare module 'vitest' {
    interface ToEqURLMatchers {
        toEqURL(expected: URL | string): void;
    }
    interface Assertion extends ToEqURLMatchers {}
}

expect.extend({
    toEqURL: (received: URL, expected: URL | string) => {
        if (!(received instanceof URL)) {
            return {
                message: () => `expected ${received} to be an instance of URL`,
                pass: false
            };
        }
        (received = new URL(received)).searchParams.sort();
        (expected = new URL(expected)).searchParams.sort();
        // biome-ignore lint/correctness/noSelfAssign:
        received.hash = received.hash;
        // biome-ignore lint/correctness/noSelfAssign:
        expected.hash = expected.hash;
        return {
            message: () => `expected ${received.href} to be ${expected.href}`,
            pass: received.href === expected.href
        };
    }
});

describe('normalizeURL', () => {
    const testCases: Array<{
        input: string | URL;
        base: string;
        expected: string;
        description: string;
    }> = [
        {
            input: '//example.com/path',
            base: 'https://github.com',
            expected: 'http://example.com/path',
            description:
                'should handle protocol-relative URLs (starting with //)'
        },
        {
            input: 'http://github.com/path?a#h',
            base: 'http://example.com',
            expected: 'http://github.com/path?a#h',
            description: 'should handle absolute URLs'
        },
        {
            input: '/path',
            base: 'http://example.com/en/',
            expected: 'http://example.com/en/path',
            description: 'should handle relative paths with a base URL'
        },
        {
            input: 'github.com',
            base: 'http://example.com',
            expected: 'http://example.com/github.com',
            description: 'should treat bare domains as relative paths'
        },
        {
            input: new URL('http://example.com/path'),
            base: 'http://example.com',
            expected: 'http://example.com/path',
            description: 'should handle URL objects'
        },
        {
            input: '-a://example.com',
            base: 'http://example.com',
            expected: 'http://example.com/-a://example.com',
            description:
                'should treat strings that fail to parse as a protocol as relative paths'
        }
    ];

    testCases.forEach(({ input, base, expected, description }) => {
        test(description, () => {
            const result = normalizeURL(input, new URL(base));
            expect(result).toEqURL(expected);
        });
    });
});

describe('parseLocation', () => {
    const testCases: Array<{
        input: RouteLocationInput;
        base: string;
        expected: string;
        description: string;
    }> = [
        {
            input: '/products',
            base: 'http://example.com',
            expected: 'http://example.com/products',
            description: 'should handle string paths'
        },
        {
            input: { path: '/products' },
            base: 'http://example.com',
            expected: 'http://example.com/products',
            description: 'should handle objects with a path property'
        },
        {
            input: { url: '/products' },
            base: 'http://example.com',
            expected: 'http://example.com/products',
            description: 'should handle objects with a url property'
        },
        {
            input: {
                path: '/products',
                query: { id: '123', category: 'electronics' }
            },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=123&category=electronics',
            description: 'should handle objects with query parameters'
        },
        {
            input: { path: '/products', query: { id: '123' }, hash: 'details' },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=123#details',
            description: 'should handle objects with a hash'
        },
        {
            input: { path: '/products', queryArray: { tag: ['new', 'sale'] } },
            base: 'http://example.com',
            expected: 'http://example.com/products?tag=new&tag=sale',
            description: 'should handle objects with queryArray'
        },
        {
            input: {
                path: '/products',
                query: { id: '123', category: 'electronics' },
                queryArray: { tag: ['new', 'sale'] },
                hash: 'details'
            },
            base: 'http://example.com',
            expected:
                'http://example.com/products?id=123&category=electronics&tag=new&tag=sale#details',
            description: 'should handle complex objects with all properties'
        },
        {
            input: {
                path: '/products',
                hash: '#a?a'
            },
            base: 'http://example.com',
            expected: 'http://example.com/products#a?a',
            description: 'should handle special hash characters correctly'
        },
        {
            input: {
                path: '/products',
                hash: '#a?a#b'
            },
            base: 'http://example.com',
            expected: 'http://example.com/products#a?a#b',
            description: 'should handle special hash characters correctly'
        },
        {
            input: {
                path: '/products',
                query: {
                    id: null,
                    category: void 0,
                    symbol: Symbol(),
                    fn: async () => '',
                    obj: { a: 10 },
                    big: 12345678901234567891234567890123456789n,
                    a: Number.NaN,
                    b: '',
                    c: '0',
                    d: 0,
                    e: 1
                } as any as Record<string, string>
            },
            base: 'http://example.com',
            expected: `http://example.com/products?symbol=Symbol()&fn=${String(
                async () => ''
            )}&obj=${String({})}&big=12345678901234567891234567890123456789&b&c=0&d=0&e=1`,
            description:
                'should ignore null, undefined, and NaN query parameters'
        },
        {
            input: { path: '/products', queryArray: { tag: [] } },
            base: 'http://example.com',
            expected: 'http://example.com/products',
            description: 'should handle empty queryArray'
        },
        {
            input: {
                path: '/products?id=path&a',
                query: { id: 'query' }
            },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=query&a',
            description: 'query value should override query parameter in path'
        },
        {
            input: {
                path: '/products?id=path&a',
                query: { id: 'query' },
                queryArray: { id: ['queryArray'] }
            },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=queryArray&a',
            description:
                'queryArray value should override query and path parameters'
        },
        {
            input: {
                path: '/products?id=path&a',
                queryArray: { id: ['queryArray'] }
            },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=queryArray&a',
            description:
                'queryArray value should override query parameter in path'
        },
        {
            input: {
                path: '?a&a=&a&a',
                query: { a: '' },
                queryArray: { a: ['', ''] }
            },
            base: 'http://example.com',
            expected: 'http://example.com?a&a',
            description:
                'should handle empty strings and duplicate query parameters correctly'
        },
        {
            input: { path: '/products?id=123', url: '/products?id=456' },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=123',
            description:
                'path should take priority over url when both are present'
        },
        {
            input: { url: '/products?id=456' },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=456',
            description: 'url should be used when path is not present'
        },
        {
            input: {},
            base: 'http://example.com',
            expected: 'http://example.com/',
            description: 'empty input object should default to base URL'
        }
    ];

    testCases.forEach(({ input, base, expected, description }) => {
        test(description, () => {
            const result = parseLocation(input, new URL(base));
            expect(result).toEqURL(expected);
        });
    });
});

describe('normalizeURL more', () => {
    describe.for(
        // biome-ignore format:
        Object.entries({
            'https://www.esmx.dev': {
                '/': 'https://www.esmx.dev/',
                '/new': 'https://www.esmx.dev/new',
                '/new/': 'https://www.esmx.dev/new/',
                '/new/100': 'https://www.esmx.dev/new/100',
                '/new/100/': 'https://www.esmx.dev/new/100/',
                '..': 'https://www.esmx.dev/',
                '../': 'https://www.esmx.dev/',
                '../new': 'https://www.esmx.dev/new',
                '../new/': 'https://www.esmx.dev/new/',
                '../new/100': 'https://www.esmx.dev/new/100',
                '../new/100/': 'https://www.esmx.dev/new/100/',
                '': 'https://www.esmx.dev/',
                'new': 'https://www.esmx.dev/new',
                'new/': 'https://www.esmx.dev/new/',
                'new/100': 'https://www.esmx.dev/new/100',
                'new/100/': 'https://www.esmx.dev/new/100/',
                '.': 'https://www.esmx.dev/',
                './': 'https://www.esmx.dev/',
                './new': 'https://www.esmx.dev/new',
                './new/': 'https://www.esmx.dev/new/',
                './new/100': 'https://www.esmx.dev/new/100',
                './new/100/': 'https://www.esmx.dev/new/100/',
                '.a': 'https://www.esmx.dev/.a',
                '..a': 'https://www.esmx.dev/..a',
                '.a/': 'https://www.esmx.dev/.a/',
                '..a/': 'https://www.esmx.dev/..a/',
                'new/../.': 'https://www.esmx.dev/',
            },
            'https://www.esmx.dev/': {
                '/': 'https://www.esmx.dev/',
                '/new': 'https://www.esmx.dev/new',
                '/new/': 'https://www.esmx.dev/new/',
                '/new/100': 'https://www.esmx.dev/new/100',
                '/new/100/': 'https://www.esmx.dev/new/100/',
                '..': 'https://www.esmx.dev/',
                '../': 'https://www.esmx.dev/',
                '../new': 'https://www.esmx.dev/new',
                '../new/': 'https://www.esmx.dev/new/',
                '../new/100': 'https://www.esmx.dev/new/100',
                '../new/100/': 'https://www.esmx.dev/new/100/',
                '': 'https://www.esmx.dev/',
                'new': 'https://www.esmx.dev/new',
                'new/': 'https://www.esmx.dev/new/',
                'new/100': 'https://www.esmx.dev/new/100',
                'new/100/': 'https://www.esmx.dev/new/100/',
                '.': 'https://www.esmx.dev/',
                './': 'https://www.esmx.dev/',
                './new': 'https://www.esmx.dev/new',
                './new/': 'https://www.esmx.dev/new/',
                './new/100': 'https://www.esmx.dev/new/100',
                './new/100/': 'https://www.esmx.dev/new/100/',
                '.a': 'https://www.esmx.dev/.a',
                '..a': 'https://www.esmx.dev/..a',
                '.a/': 'https://www.esmx.dev/.a/',
                '..a/': 'https://www.esmx.dev/..a/',
                'new/../.': 'https://www.esmx.dev/',
            },
            'https://www.esmx.dev/a/b/c': {
                '/': 'https://www.esmx.dev/a/b/',
                '/new': 'https://www.esmx.dev/a/b/new',
                '/new/': 'https://www.esmx.dev/a/b/new/',
                '/new/100': 'https://www.esmx.dev/a/b/new/100',
                '/new/100/': 'https://www.esmx.dev/a/b/new/100/',
                '..': 'https://www.esmx.dev/a/',
                '../': 'https://www.esmx.dev/a/',
                '../new': 'https://www.esmx.dev/a/new',
                '../new/': 'https://www.esmx.dev/a/new/',
                '../new/100': 'https://www.esmx.dev/a/new/100',
                '../new/100/': 'https://www.esmx.dev/a/new/100/',
                '': 'https://www.esmx.dev/a/b/c',
                'new': 'https://www.esmx.dev/a/b/new',
                'new/': 'https://www.esmx.dev/a/b/new/',
                'new/100': 'https://www.esmx.dev/a/b/new/100',
                'new/100/': 'https://www.esmx.dev/a/b/new/100/',
                '.': 'https://www.esmx.dev/a/b/',
                './': 'https://www.esmx.dev/a/b/',
                './new': 'https://www.esmx.dev/a/b/new',
                './new/': 'https://www.esmx.dev/a/b/new/',
                './new/100': 'https://www.esmx.dev/a/b/new/100',
                './new/100/': 'https://www.esmx.dev/a/b/new/100/',
                '.a': 'https://www.esmx.dev/a/b/.a',
                '..a': 'https://www.esmx.dev/a/b/..a',
                '.a/': 'https://www.esmx.dev/a/b/.a/',
                '..a/': 'https://www.esmx.dev/a/b/..a/',
                'new/../.': 'https://www.esmx.dev/a/b/',
                'new/.././a/../../x/': 'https://www.esmx.dev/a/x/',
            },
            'https://www.esmx.dev/a/b/c/': {
                '/': 'https://www.esmx.dev/a/b/c/',
                '/new': 'https://www.esmx.dev/a/b/c/new',
                '/new/': 'https://www.esmx.dev/a/b/c/new/',
                '/new/100': 'https://www.esmx.dev/a/b/c/new/100',
                '/new/100/': 'https://www.esmx.dev/a/b/c/new/100/',
                '..': 'https://www.esmx.dev/a/b/',
                '../': 'https://www.esmx.dev/a/b/',
                '../new': 'https://www.esmx.dev/a/b/new',
                '../new/': 'https://www.esmx.dev/a/b/new/',
                '../new/100': 'https://www.esmx.dev/a/b/new/100',
                '../new/100/': 'https://www.esmx.dev/a/b/new/100/',
                '': 'https://www.esmx.dev/a/b/c/',
                'new': 'https://www.esmx.dev/a/b/c/new',
                'new/': 'https://www.esmx.dev/a/b/c/new/',
                'new/100': 'https://www.esmx.dev/a/b/c/new/100',
                'new/100/': 'https://www.esmx.dev/a/b/c/new/100/',
                '.': 'https://www.esmx.dev/a/b/c/',
                './': 'https://www.esmx.dev/a/b/c/',
                './new': 'https://www.esmx.dev/a/b/c/new',
                './new/': 'https://www.esmx.dev/a/b/c/new/',
                './new/100': 'https://www.esmx.dev/a/b/c/new/100',
                './new/100/': 'https://www.esmx.dev/a/b/c/new/100/',
                '.a': 'https://www.esmx.dev/a/b/c/.a',
                '..a': 'https://www.esmx.dev/a/b/c/..a',
                '.a/': 'https://www.esmx.dev/a/b/c/.a/',
                '..a/': 'https://www.esmx.dev/a/b/c/..a/',
                'new/.././': 'https://www.esmx.dev/a/b/c/',
                'new/.././a/../../x/': 'https://www.esmx.dev/a/b/x/',
            }
        })
    )(`base: $0`, ([base, cases]) => {
        test.each(Object.entries(cases))(`input: $0`, (input, expected) => {
            const url = normalizeURL(input, new URL(base));
            expect(url).toEqURL(expected);

            const pathSuffix = '?a&b=1&c=2&a=&a=4&base=10#hash';
            const urlWithSuffix = normalizeURL(
                input + pathSuffix,
                new URL(base)
            );
            expect(urlWithSuffix).toEqURL(expected + pathSuffix);

            const urlWithBaseSuffix = normalizeURL(
                input + pathSuffix,
                new URL(base + '?base=base#base')
            );
            expect(urlWithBaseSuffix).toEqURL(expected + pathSuffix);
        });
    });
});

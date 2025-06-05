import { describe, expect, test } from 'vitest';
import { normalizeURL, parseLocation } from './location';
import type { RouteLocationRaw } from './types';

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
        return {
            message: () => `输出 ${received.href} 应该为 ${expected.href}`,
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
            description: '应该处理协议相对路径(以//开头)'
        },
        {
            input: 'http://github.com/path?a#h',
            base: 'http://example.com',
            expected: 'http://github.com/path?a#h',
            description: '应该处理绝对URL'
        },
        {
            input: '/path',
            base: 'http://example.com/en/',
            expected: 'http://example.com/en/path',
            description: '应该处理带基URL的相对路径'
        },
        {
            input: 'github.com',
            base: 'http://example.com',
            expected: 'http://example.com/github.com',
            description: '裸域名应该当做相对路径处理'
        },
        {
            input: new URL('http://example.com/path'),
            base: 'http://example.com',
            expected: 'http://example.com/path',
            description: '应该处理URL对象'
        },
        {
            input: '-a://example.com',
            base: 'http://example.com',
            expected: 'http://example.com/-a://example.com',
            description: '协议开头但解析失败后应该当做相对路径'
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
        input: RouteLocationRaw;
        base: string;
        expected: string;
        description: string;
    }> = [
        {
            input: '/products',
            base: 'http://example.com',
            expected: 'http://example.com/products',
            description: '应该处理字符串路径'
        },
        {
            input: { path: '/products' },
            base: 'http://example.com',
            expected: 'http://example.com/products',
            description: '应该处理带path属性的对象'
        },
        {
            input: { url: '/products' },
            base: 'http://example.com',
            expected: 'http://example.com/products',
            description: '应该处理带url属性的对象'
        },
        {
            input: {
                path: '/products',
                query: { id: '123', category: 'electronics' }
            },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=123&category=electronics',
            description: '应该处理带query参数的对象'
        },
        {
            input: { path: '/products', query: { id: '123' }, hash: 'details' },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=123#details',
            description: '应该处理带hash的对象'
        },
        {
            input: { path: '/products', queryArray: { tag: ['new', 'sale'] } },
            base: 'http://example.com',
            expected: 'http://example.com/products?tag=new&tag=sale',
            description: '应该处理带queryArray的对象'
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
            description: '应该处理带所有属性的复杂对象'
        },
        {
            input: {
                path: '/products',
                hash: '#a?a'
            },
            base: 'http://example.com',
            expected: 'http://example.com/products#a?a',
            description: '特殊 hash 字符应该被正确处理'
        },
        {
            input: {
                path: '/products',
                hash: '#a?a#b'
            },
            base: 'http://example.com',
            expected: 'http://example.com/products#a?a#b',
            description: '特殊 hash 字符应该被正确处理'
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
            expected: `http://example.com/products?symbol=Symbol()&fn=${String(async () => '')}&obj=${String({})}&big=12345678901234567891234567890123456789&b&c=0&d=0&e=1`,
            description: '应该忽略null、undefined和NaN的query参数'
        },
        {
            input: { path: '/products', queryArray: { tag: [] } },
            base: 'http://example.com',
            expected: 'http://example.com/products',
            description: '应该处理空queryArray'
        },
        {
            input: {
                path: '/products?id=path',
                query: { id: 'query' }
            },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=query',
            description: 'query的值应覆盖path中的query参数'
        },
        {
            input: {
                path: '/products?id=path',
                query: { id: 'query' },
                queryArray: { id: ['queryArray'] }
            },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=queryArray',
            description: 'queryArray的值应覆盖query和path中的query参数'
        },
        {
            input: {
                path: '/products?id=path',
                queryArray: { id: ['queryArray'] }
            },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=queryArray',
            description: 'queryArray的值应覆盖path中的query参数'
        },
        {
            input: {
                path: '?a&a=&a&a',
                query: { a: '' },
                queryArray: { a: ['', ''] }
            },
            base: 'http://example.com',
            expected: 'http://example.com?a&a',
            description: '应正确处理空字符串和重复的query参数'
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
            new: 'https://www.esmx.dev/new',
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
            'new/../.': 'https://www.esmx.dev/'
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
            new: 'https://www.esmx.dev/new',
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
            'new/../.': 'https://www.esmx.dev/'
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
            new: 'https://www.esmx.dev/a/b/new',
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
            'new/.././a/../../x/': 'https://www.esmx.dev/a/x/'
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
            new: 'https://www.esmx.dev/a/b/c/new',
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
            'new/.././a/../../x/': 'https://www.esmx.dev/a/b/x/'
        }
    }).map(([base, cases]) => {
        test.each(Object.entries(cases))(
            `base: ${base}, input: $0`,
            (input, expected) => {
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
            }
        );
    });
});

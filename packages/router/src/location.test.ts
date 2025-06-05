import { describe, expect, test } from 'vitest';
import { normalizeURL, parseLocation } from './location';
import type { RouteLocationRaw } from './types';

describe('normalizeURL', () => {
    const testCases: Array<{
        input: string;
        base: string;
        expected: string;
        description: string;
    }> = [
        {
            input: '//example.com/path',
            base: 'http://example.com',
            expected: 'http://example.com/path',
            description: '应该处理协议相对路径(以//开头)'
        },
        {
            input: 'http://example.com/path',
            base: 'http://example.com',
            expected: 'http://example.com/path',
            description: '应该处理绝对URL'
        },
        {
            input: '/path',
            base: 'http://example.com',
            expected: 'http://example.com/path',
            description: '应该处理带基URL的相对路径'
        },
        {
            input: 'http://example.com/path',
            base: 'http://example.com',
            expected: 'http://example.com/path',
            description: '应该处理URL对象'
        }
    ];

    testCases.forEach(({ input, base, expected, description }) => {
        test(description, () => {
            const result = normalizeURL(input, new URL(base));
            expect(result.href).toBe(expected);
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
                query: { id: null, category: undefined } as any as Record<
                    string,
                    string
                >
            },
            base: 'http://example.com',
            expected: 'http://example.com/products',
            description: '应该忽略null和undefined的query参数'
        },
        {
            input: { path: '/products', queryArray: { tag: [] } },
            base: 'http://example.com',
            expected: 'http://example.com/products',
            description: '应该处理空queryArray'
        },
        {
            input: {
                path: '/products',
                query: { id: '123' },
                queryArray: { id: ['123'] }
            },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=123',
            description: 'query和queryArray值相同时应合并'
        },
        {
            input: {
                path: '/products',
                query: { id: '123' },
                queryArray: { id: ['456'] }
            },
            base: 'http://example.com',
            expected: 'http://example.com/products?id=123&id=456',
            description: 'query和queryArray值不同时应保留两者'
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
            expect(result.href).toBe(expected);
        });
    });
});

import { describe, expect, test } from 'vitest';
import { normalizeURL, parseLocation } from './location';

describe('normalizeURL', () => {
    const list: Array<{
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

    list.forEach(({ input, base, expected, description }) => {
        test(description, () => {
            const result = normalizeURL(input, new URL(base));
            expect(result.href).toBe(expected);
        });
    });
});

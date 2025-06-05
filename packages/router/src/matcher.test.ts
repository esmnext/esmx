import { assert, describe, test } from 'vitest';
import { createMatcher, joinPathname } from './matcher';

const BASE_URL = new URL('https://www.esmx.dev');

describe('joinPathname', () => {
    const testCases: Array<{
        description: string;
        cases: Array<{
            path: string;
            base?: string;
            expected: string;
        }>;
    }> = [
        {
            description: '基本路径拼接',
            cases: [
                { path: 'test', expected: '/test' },
                { path: '/test', expected: '/test' },
                { path: 'test/', expected: '/test' },
                { path: '/test/', expected: '/test' }
            ]
        },
        {
            description: '带base的路径拼接',
            cases: [
                { path: 'test', base: '/api', expected: '/api/test' },
                { path: '/test', base: '/api', expected: '/api/test' },
                { path: 'test', base: 'api', expected: '/api/test' },
                { path: '/test', base: 'api', expected: '/api/test' }
            ]
        },
        {
            description: '多层级路径拼接',
            cases: [
                { path: 'test/path', expected: '/test/path' },
                { path: '/test/path', expected: '/test/path' },
                { path: 'test/path/', expected: '/test/path' },
                { path: '/test/path/', expected: '/test/path' }
            ]
        },
        {
            description: '带base的多层级路径拼接',
            cases: [
                { path: 'test/path', base: '/api', expected: '/api/test/path' },
                {
                    path: '/test/path',
                    base: '/api',
                    expected: '/api/test/path'
                },
                { path: 'test/path', base: 'api', expected: '/api/test/path' },
                { path: '/test/path', base: 'api', expected: '/api/test/path' }
            ]
        },
        {
            description: '处理重复斜杠',
            cases: [
                { path: '//test', expected: '/test' },
                { path: 'test//path', expected: '/test/path' },
                { path: '//test//path//', expected: '/test/path' },
                {
                    path: 'test//path',
                    base: '/api//',
                    expected: '/api/test/path'
                }
            ]
        },
        {
            description: '处理空值',
            cases: [
                { path: '', expected: '/' },
                { path: '', base: '', expected: '/' },
                { path: 'test', base: '', expected: '/test' },
                { path: '', base: 'api', expected: '/api' }
            ]
        }
    ];

    testCases.forEach(({ description, cases }) => {
        test(description, () => {
            cases.forEach(({ path, base, expected }) => {
                assert.equal(joinPathname(path, base), expected);
            });
        });
    });
});

describe('createMatcher', () => {
    test('基本路由匹配', () => {
        const matcher = createMatcher([
            {
                path: '/news'
            },
            {
                path: '/news/:id'
            }
        ]);
        const result = matcher(new URL('/news/123', BASE_URL), BASE_URL);
        assert.deepEqual(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/news/:id');
    });

    test('嵌套路由匹配', () => {
        const matcher = createMatcher([
            {
                path: '/news',
                children: [
                    {
                        path: ':id'
                    }
                ]
            }
        ]);
        const result = matcher(new URL('/news/123', BASE_URL), BASE_URL);
        assert.deepEqual(result.matches.length, 2);
        assert.equal(result.matches[0].path, '/news');
        assert.equal(result.matches[1].path, ':id');
    });
});

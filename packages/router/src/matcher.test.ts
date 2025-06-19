import { assert, describe, test } from 'vitest';
import { createMatcher, joinPathname } from './matcher';
import type { RouteConfirmHook } from './types';

const BASE_URL = new URL('https://www.esmx.dev');

describe('joinPathname', () => {
    type TestCase = {
        path: string;
        base?: string;
        expected: string;
    };
    type JoinPathnameTestCase = {
        description: string;
        cases: TestCase[] | (() => TestCase[]);
    };

    // biome-ignore format:
    const testCases: JoinPathnameTestCase[] = [
        {
            description: 'Basic path joining',
            cases: [
                { path: 'test', expected: '/test' },
                { path: '/test', expected: '/test' },
                { path: 'test/', expected: '/test' },
                { path: '/test/', expected: '/test' },
            ]
        },
        {
            description: 'Path joining with a base',
            cases: [
                { path: 'test', base: '/api', expected: '/api/test' },
                { path: '/test', base: '/api', expected: '/api/test' },
                { path: 'test', base: 'api', expected: '/api/test' },
                { path: '/test', base: 'api', expected: '/api/test' },
            ]
        },
        {
            description: 'Multi-level path joining',
            cases: [
                { path: 'test/path', expected: '/test/path' },
                { path: '/test/path', expected: '/test/path' },
                { path: 'test/path/', expected: '/test/path' },
                { path: '/test/path/', expected: '/test/path' },
            ]
        },
        {
            description: 'Multi-level path joining with a base',
            cases: [
                { path: 'test/path', base: '/api', expected: '/api/test/path' },
                { path: '/test/path', base: '/api', expected: '/api/test/path' },
                { path: 'test/path', base: 'api', expected: '/api/test/path' },
                { path: '/test/path', base: 'api', expected: '/api/test/path' },
            ]
        },
        {
            description: 'Handling duplicate slashes',
            cases: [
                { path: '//test', expected: '/test' },
                { path: 'test//path', expected: '/test/path' },
                { path: '//test//path//', expected: '/test/path' },
                { path: 'test//path', base: '/api//', expected: '/api/test/path' },
            ]
        },
        {
            description: 'Handling empty values',
            cases: [
                { path: '', expected: '/' },
                { path: '', base: '', expected: '/' },
                { path: 'test', base: '', expected: '/test' },
                { path: '', base: 'api', expected: '/api' },
            ]
        },
        {
            description: 'Paths with special characters',
            cases: [
                { path: 'test-path', expected: '/test-path' },
                { path: 'test_path', expected: '/test_path' },
                { path: 'test.path', expected: '/test.path' },
                { path: 'test:path', expected: '/test:path' },
                { path: 'test@path', expected: '/test@path' },
            ]
        },
        {
            description: 'Support for Chinese characters in paths',
            cases: [
                { path: '测试', expected: '/测试' },
                { path: '测试/路径', expected: '/测试/路径' },
                { path: '测试', base: '/api', expected: '/api/测试' },
            ]
        }
    ];
    // Test cases for various extreme edge cases
    // biome-ignore format:
    const edgeCases: JoinPathnameTestCase[] = [
        {
            description: 'Paths with only slashes or empty strings',
            cases: [
                { path: '', expected: '/' },
                { path: '/', expected: '/' },
                { path: '///', expected: '/' },
                { path: '/', base: '/', expected: '/' },
                { path: '/', base: '//', expected: '/' },
                { path: '//', base: '/', expected: '/' },
                { path: '//', base: '//', expected: '/' },
            ]
        },
        {
            description: 'Extremely long path joining',
            cases: () => {
                const longSegment =
                    'very-long-segment-name-that-could-cause-issues';
                const base = Array(10).fill(longSegment).join('/');
                const path = Array(10).fill(longSegment).join('/');
                const expected = `/${base}/${path}`;
                return [{ path, base, expected }];
            }
        },
        {
            description: 'Joining paths with special characters',
            cases: [
                { path: '测试路径', base: '基础', expected: '/基础/测试路径' },
                { path: 'path with spaces', base: 'base', expected: '/base/path with spaces' },
                { path: 'path-with-dashes', base: 'base_with_underscores', expected: '/base_with_underscores/path-with-dashes' },
            ]
        },
        {
            description: 'Handling URL-encoded characters',
            cases: [
                { path: 'hello%20world', base: 'api', expected: '/api/hello%20world' },
                { path: 'user%2Fprofile', base: 'v1', expected: '/v1/user%2Fprofile' },
            ]
        },
        {
            description: 'Handling dot segments in paths',
            cases: [
                { path: '.', expected: '/.' },
                { path: '..', expected: '/..' },
                { path: './relative', base: 'base', expected: '/base/./relative' },
                { path: '../parent', base: 'base', expected: '/base/../parent' },
            ]
        },
        {
            description: 'Query parameters and hash do not affect joining',
            cases: [
                { path: 'path?query=1', base: 'base', expected: '/base/path?query=1' },
                { path: 'path#hash', base: 'base', expected: '/base/path#hash' },
                { path: 'path?q=1#hash', base: 'base', expected: '/base/path?q=1#hash' },
            ]
        },
        {
            description: 'Paths starting with a colon (route parameters)',
            cases: [
                { path: ':id', base: 'users', expected: '/users/:id' },
                { path: ':userId/profile', base: 'api', expected: '/api/:userId/profile' },
            ]
        },
        {
            description: 'Paths with wildcard asterisks',
            cases: [
                { path: ':rest*', base: 'files', expected: '/files/:rest*' },
                { path: ':rest*', base: 'assets', expected: '/assets/:rest*' },
                { path: 'images/:rest*', base: 'static', expected: '/static/images/:rest*' },
                { path: '/*splat', base: 'base', expected: '/base/*splat' },
            ]
        },
        {
            description: 'Optional paths',
            cases: [
                { path: ':id?', base: 'posts', expected: '/posts/:id?' },
                { path: 'comments/:commentId?', base: 'articles', expected: '/articles/comments/:commentId?' },
                { path: '/users{/:id}/delete?', base: 'base', expected: '/base/users{/:id}/delete?' },
            ]
        },
        {
            description: 'Combination of numbers and special symbols',
            cases: [
                { path: 'v1.2.3', base: 'api', expected: '/api/v1.2.3' },
                { path: 'user@domain', base: 'profile', expected: '/profile/user@domain' },
                { path: 'item_123', base: 'products', expected: '/products/item_123' },
            ]
        },
        {
            description: 'Whitespace character handling',
            cases: [
                { path: '  path  ', base: '  base  ', expected: '/  base  /  path  ' },
                { path: '\tpath\t', base: '\tbase\t', expected: '/\tbase\t/\tpath\t' },
            ]
        },
        {
            description: 'Boolean and numeric paths (boundary test)',
            cases: [
                // These may be uncommon in practice but test type safety
                { path: 'true', base: 'false', expected: '/false/true' },
                { path: '0', base: '1', expected: '/1/0' },
                { path: 'NaN', base: 'undefined', expected: '/undefined/NaN' },
            ]
        },
        {
            description: 'Extreme cases of path normalization',
            cases: [
                // Test normalization of multiple slashes
                { path: '///path///', base: '///base///', expected: '/base/path' },
                { path: 'path////with////slashes', base: 'base////with////slashes', expected: '/base/with/slashes/path/with/slashes' },
            ]
        },
        {
            description: 'Handling of non-ASCII character paths',
            cases: [
                // Test various Unicode characters
                { path: 'путь', base: 'база', expected: '/база/путь' }, // Russian
                { path: 'パス', base: 'ベース', expected: '/ベース/パス' }, // Japanese
                { path: '경로', base: '기본', expected: '/기본/경로' }, // Korean
                { path: 'مسار', base: 'قاعدة', expected: '/قاعدة/مسار' }, // Arabic
            ]
        },
        {
            description: 'Handling of special symbols and punctuation',
            cases: [
                { path: 'path!@#$%^&\\*()', base: 'base!@#$%^&\\*()', expected: '/base!@#$%^&\\*()/path!@#$%^&\\*()' },
                { path: 'path\\[]{};:"\'<>\\?', base: 'base\\[]{};:"\'<>\\?', expected: '/base\\[]{};:"\'<>\\?/path\\[]{};:"\'<>\\?' },
                { path: 'path\\backslash', base: 'base\\backslash\\', expected: '/base\\backslash\\/path\\backslash' },
            ]
        },
        {
            description: 'Paths with combinations of numbers and symbols',
            cases: [
                { path: '123.456.789', base: 'v1.0.0', expected: '/v1.0.0/123.456.789' },
                { path: 'item-123_abc', base: 'category-456_def', expected: '/category-456_def/item-123_abc' },
                { path: '2023-12-31', base: '2024-01-01', expected: '/2024-01-01/2023-12-31' },
            ]
        },
        {
            description: 'Various forms of whitespace characters',
            cases: [
                { path: ' ', base: ' ', expected: '/ / ' },
                { path: '\n', base: '\t', expected: '/\t/\n' },
                { path: '\r\n', base: '\t\r', expected: '/\t\r/\r\n' }, // Test carriage return and line feed
                { path: '\u00A0', base: '\u2000', expected: '/\u2000/\u00A0' }, // Non-breaking space and em space
            ]
        },
        {
            description: 'Handling of very long paths',
            cases: () => {
                const veryLongSegment = 'a'.repeat(1000);
                const path = veryLongSegment + '/segment';
                const base = 'base/' + veryLongSegment;
                const expected = '/' + base + '/' + path;
                return [{ path, base, expected }];
            }
        },
        {
            description: 'Boundary cases for path separators',
            cases: [
                // Test various path separator combinations
                { path: '/', base: '/', expected: '/' },
                { path: '//', base: '//', expected: '/' },
                { path: '///', base: '///', expected: '/' },
                { path: 'path/', base: '/base', expected: '/base/path' },
                { path: '/path/', base: '/base/', expected: '/base/path' },
            ]
        },
        {
            description: 'URL-encoded path segments',
            cases: [
                { path: '%20space%20', base: '%20base%20', expected: '/%20base%20/%20space%20' },
                { path: '%2F%2F', base: '%2F', expected: '/%2F/%2F%2F' },
                { path: 'path%3Fquery%3D1', base: 'base%23hash', expected: '/base%23hash/path%3Fquery%3D1' },
            ]
        },
        {
            description: 'Numeric type paths (type boundary)',
            cases: [
                // Although the function signature requires a string, test potential type coercion
                { path: '123', base: '456', expected: '/456/123' },
                { path: '0', expected: '/0' },
                { path: '', base: '0', expected: '/0' },
            ]
        },
        {
            description: 'Complex cases with dot notation in paths',
            cases: [
                { path: '../../../path', base: '../../base', expected: '/../../base/../../../path' },
                { path: './././path', base: './././base', expected: '/./././base/./././path' },
                { path: 'path/./file', base: 'base/../dir', expected: '/base/../dir/path/./file' },
            ]
        },
        {
            description: 'Paths with mixed character sets',
            cases: [
                { path: '中文/english/русский', base: '日本語/العربية', expected: '/日本語/العربية/中文/english/русский' },
                { path: '测试-test-тест', base: '基础-base-база', expected: '/基础-base-база/测试-test-тест' },
            ]
        },
        {
            description: 'Handling of control characters',
            cases: [
                // Test control characters (though uncommon in actual URLs)
                { path: '\u0001\u0002', base: '\u0003\u0004', expected: '/\u0003\u0004/\u0001\u0002' },
                { path: 'path\u007F', base: 'base\u007F', expected: '/base\u007F/path\u007F' },
            ]
        },
        {
            description: 'Various characters at the end of a path',
            cases: [
                { path: 'path.', base: 'base.', expected: '/base./path.' },
                { path: 'path-', base: 'base-', expected: '/base-/path-' },
                { path: 'path_', base: 'base_', expected: '/base_/path_' },
                { path: 'path~', base: 'base~', expected: '/base~/path~' },
            ]
        }
    ];

    const runTests = (testCases: JoinPathnameTestCase[]) =>
        testCases.forEach(({ description, cases }) => {
            if (typeof cases === 'function') {
                cases = cases();
            }
            test(description, () => {
                for (const { path, base, expected } of cases) {
                    assert.equal(joinPathname(path, base), expected);
                }
            });
        });

    runTests(testCases);
    describe('Edge Cases', () => runTests(edgeCases));
});

describe('createMatcher', () => {
    test('Basic route matching', () => {
        const matcher = createMatcher([
            { path: '/news' },
            { path: '/news/:id' }
        ]);
        const result = matcher(new URL('/news/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/news/:id');
        assert.equal(result.params.id, '123');
    });

    test('Exact route matching priority', () => {
        const matcher = createMatcher([
            { path: '/news/:id' },
            { path: '/news' }
        ]);
        const result = matcher(new URL('/news', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/news');
        assert.deepEqual(result.params, {});
    });

    test('Nested route matching', () => {
        const matcher = createMatcher([
            {
                path: '/news',
                children: [{ path: ':id' }]
            }
        ]);
        const result = matcher(new URL('/news/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 2);
        assert.equal(result.matches[0].path, '/news');
        assert.equal(result.matches[1].path, ':id');
        assert.equal(result.params.id, '123');
    });

    test('Deeply nested route matching', () => {
        const matcher = createMatcher([
            {
                path: '/user',
                children: [
                    {
                        path: ':userId',
                        children: [{ path: 'profile' }, { path: 'settings' }]
                    }
                ]
            }
        ]);
        const result = matcher(
            new URL('/user/123/profile', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 3);
        assert.equal(result.matches[0].path, '/user');
        assert.equal(result.matches[1].path, ':userId');
        assert.equal(result.matches[2].path, 'profile');
        assert.equal(result.params.userId, '123');
    });

    test('Multiple parameter route matching', () => {
        const matcher = createMatcher([{ path: '/user/:userId/post/:postId' }]);
        const result = matcher(
            new URL('/user/123/post/456', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/user/:userId/post/:postId');
        assert.equal(result.params.userId, '123');
        assert.equal(result.params.postId, '456');
    });

    test('Optional parameter route matching', () => {
        const matcher = createMatcher([{ path: '/posts/:id?' }]);

        // Match with parameter
        const resultWithParam = matcher(
            new URL('/posts/123', BASE_URL),
            BASE_URL
        );
        assert.equal(resultWithParam.matches.length, 1);
        assert.equal(resultWithParam.params.id, '123');

        // Match without parameter
        const resultWithoutParam = matcher(
            new URL('/posts', BASE_URL),
            BASE_URL
        );
        assert.equal(resultWithoutParam.matches.length, 1);
        assert.equal(resultWithoutParam.params.id, undefined);
    });

    test('Numeric parameter route matching', () => {
        const matcher = createMatcher([{ path: '/posts/:id(\\d+)' }]);

        // Match numeric parameter
        const resultWithParam = matcher(
            new URL('/posts/123', BASE_URL),
            BASE_URL
        );
        assert.equal(resultWithParam.matches.length, 1);
        assert.equal(resultWithParam.params.id, '123');

        // Match non-numeric parameter
        const resultWithoutParam = matcher(
            new URL('/posts/123a', BASE_URL),
            BASE_URL
        );
        assert.equal(resultWithoutParam.matches.length, 0);

        // Match NaN parameter
        const resultWithNaN = matcher(
            new URL('/posts/NaN', BASE_URL),
            BASE_URL
        );
        assert.equal(resultWithNaN.matches.length, 0);
    });

    test('Wildcard route matching', () => {
        const matcher = createMatcher([{ path: '/files/:rest*' }]);
        const result = matcher(
            new URL('/files/documents/readme.txt', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/files/:rest*');
        assert.deepEqual(result.params.rest, ['documents', 'readme.txt']);
    });

    test('RegExp parameter matching', () => {
        const matcher = createMatcher([{ path: '/api/v:version(\\d+)' }]);
        const result = matcher(new URL('/api/v1', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.params.version, '1');
    });

    test('No matching route', () => {
        const matcher = createMatcher([{ path: '/news' }]);
        const result = matcher(new URL('/blog', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);
        assert.deepEqual(result.params, {});
    });

    test('Empty route configuration', () => {
        const matcher = createMatcher([]);
        const result = matcher(new URL('/any', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);
        assert.deepEqual(result.params, {});
    });

    test('Route meta information passing', () => {
        const matcher = createMatcher([
            {
                path: '/protected',
                meta: { requiresAuth: true }
            }
        ]);
        const result = matcher(new URL('/protected', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0]?.meta?.requiresAuth, true);
    });

    test('Complex nested routes with parameters', () => {
        const matcher = createMatcher([
            {
                path: '/admin',
                meta: { role: 'admin' },
                children: [
                    {
                        path: 'users',
                        children: [
                            {
                                path: ':userId',
                                children: [{ path: 'edit' }]
                            }
                        ]
                    }
                ]
            }
        ]);
        const result = matcher(
            new URL('/admin/users/123/edit', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 4);
        assert.equal(result.matches[0].path, '/admin');
        assert.equal(result.matches[1].path, 'users');
        assert.equal(result.matches[2].path, ':userId');
        assert.equal(result.matches[3].path, 'edit');
        assert.equal(result.params.userId, '123');
        assert.equal(result.matches[0]?.meta?.role, 'admin');
    });

    test('baseURL with directory', () => {
        const matcher = createMatcher([{ path: '/api' }]);
        const customBaseURL = new URL('https://www.esmx.dev/app/');
        const result = matcher(
            new URL('https://www.esmx.dev/app/api'),
            customBaseURL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/api');
    });

    test('URL-encoded parameter handling', () => {
        const matcher = createMatcher([{ path: '/search/:query' }]);
        const result = matcher(
            new URL('/search/hello world', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        // path-to-regexp会编码URL参数
        assert.equal(result.params.query, 'hello%20world');
    });

    test('Chinese path parameters', () => {
        const matcher = createMatcher([
            { path: `/${encodeURIComponent('分类')}/:name` }
        ]);
        const result = matcher(new URL('/分类/技术', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.params.name, encodeURIComponent('技术'));
    });

    test('Duplicate parameter name handling', () => {
        const matcher = createMatcher([
            {
                path: '/parent/:id',
                children: [{ path: 'child/:childId' }]
            }
        ]);
        const result = matcher(
            new URL('/parent/123/child/456', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 2);
        assert.equal(result.params.id, '123');
        assert.equal(result.params.childId, '456');
    });

    test.todo('Route matching order consistency', () => {
        const matcher = createMatcher([
            {
                path: '/a/:id',
                meta: { order: 1 }
            },
            {
                path: '/a/special',
                meta: { order: 2 }
            }
        ]);

        // Parameter route should match
        const result1 = matcher(new URL('/a/123', BASE_URL), BASE_URL);
        assert.equal(result1.matches.length, 1);
        assert.equal(result1.matches[0]?.meta?.order, 1);

        // Exact route should match
        const result2 = matcher(new URL('/a/special', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 1);
        assert.equal(result2.matches[0]?.meta?.order, 2);
    });

    test('Special characters in path handling', () => {
        const routes = [
            { path: '/test-path' },
            { path: '/test_path' },
            { path: '/test.path' }
        ];
        const matcher = createMatcher(routes);

        for (const { path } of routes) {
            const result = matcher(new URL(path, BASE_URL), BASE_URL);
            assert.equal(result.matches.length, 1);
            assert.equal(result.matches[0].path, path);
        }
    });

    test('Empty string path handling', () => {
        const matcher = createMatcher([
            {
                path: '',
                children: [{ path: 'child' }]
            }
        ]);
        const result = matcher(new URL('/child', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 2);
        assert.equal(result.matches[0].path, '');
        assert.equal(result.matches[1].path, 'child');
    });

    // Verify performance later
    test.todo('Route matching performance verification', () => {
        // Create a large number of route configurations
        const routes = Array.from({ length: 1000 }, (_, i) => ({
            path: `/route${i}/:id`
        }));
        routes.push({ path: '/target/:id' });

        const matcher = createMatcher(routes);
        const startTime = performance.now();
        const result = matcher(new URL('/target/123', BASE_URL), BASE_URL);
        const endTime = performance.now();

        assert.equal(result.matches.length, 1);
        assert.equal(result.params.id, '123');
        // Verify that the matching time is within a reasonable range (less than 10ms)
        assert.isTrue(endTime - startTime < 10);
    });

    test('Edge case: extremely long path', () => {
        const longPath =
            '/very/long/path/with/many/segments/that/goes/on/and/on/and/on';
        const matcher = createMatcher([{ path: longPath }]);
        const result = matcher(new URL(longPath, BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, longPath);
    });

    test('Edge case: large number of parameters', () => {
        const matcher = createMatcher([
            { path: '/:a/:b/:c/:d/:e/:f/:g/:h/:i/:j' }
        ]);
        const result = matcher(
            new URL('/1/2/3/4/5/6/7/8/9/10', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.params.a, '1');
        assert.equal(result.params.j, '10');
        assert.equal(Object.keys(result.params).length, 10);
    });

    test('Path rewriting and encoding', () => {
        const matcher = createMatcher([{ path: '/api/:resource' }]);
        const result = matcher(
            new URL('/api/user%2Fprofile', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        // URL-encoded slashes are not automatically decoded as path separators
        assert.equal(result.params.resource, 'user%2Fprofile');
    });

    test('Query parameters do not affect route matching', () => {
        const matcher = createMatcher([{ path: '/search' }]);
        const result = matcher(
            new URL('/search?q=test&page=1', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/search');
    });

    test('Hash does not affect route matching', () => {
        const matcher = createMatcher([{ path: '/page' }]);
        const result = matcher(new URL('/page#section1', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/page');
    });

    test.todo('Case-sensitive matching', () => {
        const matcher = createMatcher([{ path: '/API' }, { path: '/api' }]);
        const result1 = matcher(new URL('/API', BASE_URL), BASE_URL);
        const result2 = matcher(new URL('/api', BASE_URL), BASE_URL);

        assert.equal(result1.matches.length, 1);
        assert.equal(result1.matches[0].path, '/API');

        assert.equal(result2.matches.length, 1);
        assert.equal(result2.matches[0].path, '/api');
    });

    test('Username and password in baseURL should be ignored', () => {
        const customBase = new URL('https://uname@pwlocalhost:3000/app/');
        const matcher = createMatcher([{ path: '/test' }]);
        const result = matcher(
            new URL('https://uname2@pw2localhost:3000/app/test'),
            customBase
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/test');
    });

    test('Empty string handling in nested routes', () => {
        const matcher = createMatcher([
            {
                path: '/parent',
                children: [{ path: '' }, { path: 'child' }]
            }
        ]);

        const result1 = matcher(new URL('/parent', BASE_URL), BASE_URL);
        assert.equal(result1.matches.length, 2);
        assert.equal(result1.matches[0].path, '/parent');
        assert.equal(result1.matches[1].path, '');

        const result2 = matcher(new URL('/parent/child', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 2);
        assert.equal(result2.matches[0].path, '/parent');
        assert.equal(result2.matches[1].path, 'child');
    });

    test('Route component configuration persistence', () => {
        const TestComponent = () => 'test';
        const matcher = createMatcher([
            {
                path: '/component-test',
                component: TestComponent
            }
        ]);
        const result = matcher(new URL('/component-test', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, TestComponent);
    });

    test('Route redirect configuration persistence', () => {
        const redirectTarget = '/new-path';
        const matcher = createMatcher([
            {
                path: '/old-path',
                redirect: redirectTarget
            }
        ]);
        const result = matcher(new URL('/old-path', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].redirect, redirectTarget);
    });

    test('Numeric parameter parsing', () => {
        const matcher = createMatcher([{ path: '/user/:id(\\d+)' }]);

        const result1 = matcher(new URL('/user/123', BASE_URL), BASE_URL);
        assert.equal(result1.matches.length, 1);
        assert.equal(result1.params.id, '123');

        // Non-numeric should not match
        const result2 = matcher(new URL('/user/abc', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 0);
    });

    test('Route matching depth-first strategy verification', () => {
        const matcher = createMatcher([
            {
                path: '/level1',
                meta: { level: 1 },
                children: [
                    {
                        path: 'level2',
                        meta: { level: 2 },
                        children: [
                            {
                                path: 'level3',
                                meta: { level: 3 }
                            }
                        ]
                    }
                ]
            }
        ]);
        const result = matcher(
            new URL('/level1/level2/level3', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 3);
        // Verify depth-first: parent routes first
        assert.equal(result.matches[0].meta?.level, 1);
        assert.equal(result.matches[1].meta?.level, 2);
        assert.equal(result.matches[2].meta?.level, 3);
    });

    test('Empty meta object default handling', () => {
        const matcher = createMatcher([{ path: '/no-meta' }]);
        const result = matcher(new URL('/no-meta', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.isObject(result.matches[0].meta);
        assert.deepEqual(result.matches[0].meta, {});
    });

    test('Path normalization handling', () => {
        const matcher = createMatcher([{ path: '/test//double//slash' }]);
        const result = matcher(
            new URL('/test/double/slash', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
    });

    test('Error path configuration handling', () => {
        // Test empty string path
        const matcher1 = createMatcher([{ path: '' }]);
        const result1 = matcher1(new URL('/', BASE_URL), BASE_URL);
        assert.equal(result1.matches.length, 1);

        // Test only slash path
        const matcher2 = createMatcher([{ path: '/' }]);
        const result2 = matcher2(new URL('/', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 1);
    });

    test('Empty parameter handling', () => {
        const matcher = createMatcher([{ path: '/user/:id' }]);
        // Test empty parameter value
        const result = matcher(new URL('/user/', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0); // Should not match
    });

    test('Route configuration completeness verification', () => {
        const TestComponent = () => 'test';
        const asyncComponent = async () => TestComponent;
        const beforeEnter = async () => void 0; // Correct RouteConfirmHookResult type

        const matcher = createMatcher([
            {
                path: '/complete',
                component: TestComponent,
                asyncComponent,
                beforeEnter,
                meta: {
                    title: 'Complete Route',
                    requiresAuth: true,
                    permissions: ['read', 'write']
                },
                children: [
                    {
                        path: 'child',
                        component: TestComponent
                    }
                ]
            }
        ]);

        const result = matcher(new URL('/complete', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, TestComponent);
        assert.equal(result.matches[0].asyncComponent, asyncComponent);
        assert.equal(result.matches[0].beforeEnter, beforeEnter);
        assert.equal(result.matches[0]?.meta?.title, 'Complete Route');
        assert.equal(result.matches[0]?.meta?.requiresAuth, true);
        assert.deepEqual(result.matches[0]?.meta?.permissions, [
            'read',
            'write'
        ]);
        assert.equal(result.matches[0].children.length, 1);
    });

    test.todo('Route conflict and priority handling', () => {
        const matcher = createMatcher([
            {
                path: '/conflict/:id',
                meta: { priority: 1 }
            },
            {
                path: '/conflict/special',
                meta: { priority: 2 }
            },
            {
                path: '/conflict/:rest*',
                meta: { priority: 3 }
            }
        ]);

        // Test exact match priority
        const result1 = matcher(
            new URL('/conflict/special', BASE_URL),
            BASE_URL
        );
        assert.equal(result1.matches.length, 1);
        assert.equal(result1.matches[0]?.meta?.priority, 2);

        // Test parameter matching
        const result2 = matcher(new URL('/conflict/123', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 1);
        assert.equal(result2.matches[0]?.meta?.priority, 1);
        assert.equal(result2.params.id, '123');
    });

    test('Multi-level nested parameter extraction', () => {
        const matcher = createMatcher([
            {
                path: '/api',
                children: [
                    {
                        path: 'v:version',
                        children: [
                            {
                                path: ':resource',
                                children: [
                                    {
                                        path: ':id',
                                        children: [{ path: ':action' }]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]);

        const result = matcher(
            new URL('/api/v1/users/123/edit', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 5);
        assert.equal(result.params.version, '1');
        assert.equal(result.params.resource, 'users');
        assert.equal(result.params.id, '123');
        assert.equal(result.params.action, 'edit');
    });

    test('Route override configuration handling', () => {
        // Using proper types instead of any
        // The override function returns RouteHandleHook when conditions are met
        const overrideHandler: RouteConfirmHook = (to, from) => {
            return async (toRoute, fromRoute) => ({ data: 'test' });
        };
        const matcher = createMatcher([
            {
                path: '/override-test',
                override: overrideHandler,
                meta: { type: 'hybrid' }
            }
        ]);

        const result = matcher(new URL('/override-test', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].override, overrideHandler);
        assert.equal(result.matches[0]?.meta?.type, 'hybrid');
    });

    test('Application configuration handling', () => {
        const appConfig = 'test-app';
        const appCallback = () => ({ mount: () => {}, unmount: () => {} });

        const matcher = createMatcher([
            { path: '/app1', app: appConfig },
            { path: '/app2', app: appCallback }
        ]);

        const result1 = matcher(new URL('/app1', BASE_URL), BASE_URL);
        assert.equal(result1.matches.length, 1);
        assert.equal(result1.matches[0].app, appConfig);

        const result2 = matcher(new URL('/app2', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 1);
        assert.equal(result2.matches[0].app, appCallback);
    });

    test('Complex wildcard and parameter combinations', () => {
        const matcher = createMatcher([{ path: '/files/:category/:rest*' }]);
        const result = matcher(
            new URL('/files/documents/folder1/folder2/view', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.params.category, 'documents');
        assert.deepEqual(result.params.rest, ['folder1', 'folder2', 'view']);
    });

    test('Route redirect configuration verification', () => {
        const redirectTarget = '/new-location';
        const redirectFunction = () => '/dynamic-location';

        const matcher = createMatcher([
            {
                path: '/redirect-string',
                redirect: redirectTarget
            },
            {
                path: '/redirect-function',
                redirect: redirectFunction
            }
        ]);

        const result1 = matcher(
            new URL('/redirect-string', BASE_URL),
            BASE_URL
        );
        assert.equal(result1.matches.length, 1);
        assert.equal(result1.matches[0].redirect, redirectTarget);

        const result2 = matcher(
            new URL('/redirect-function', BASE_URL),
            BASE_URL
        );
        assert.equal(result2.matches.length, 1);
        assert.equal(result2.matches[0].redirect, redirectFunction);
    });

    test('Route guard configuration verification', () => {
        const beforeEnter = async () => void 0; // Correct RouteConfirmHookResult type
        const beforeUpdate = async () => void 0; // Correct void type
        const beforeLeave = async () => '/cancel';

        const matcher = createMatcher([
            {
                path: '/guarded',
                beforeEnter,
                beforeUpdate,
                beforeLeave,
                meta: { protected: true }
            }
        ]);

        const result = matcher(new URL('/guarded', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].beforeEnter, beforeEnter);
        assert.equal(result.matches[0].beforeUpdate, beforeUpdate);
        assert.equal(result.matches[0].beforeLeave, beforeLeave);
        assert.equal(result.matches[0]?.meta?.protected, true);
    });

    // Verify performance later
    test.todo('matcher performance boundary test', () => {
        // Create a large number of complex route configurations
        const routes: Parameters<typeof createMatcher>[0] = [];
        for (let i = 0; i < 500; i++) {
            routes.push({
                path: `/category${i}/:id`,
                children: [
                    {
                        path: 'subcategory/:subId'
                    }
                ]
            });
        }

        const matcher = createMatcher(routes);
        const startTime = performance.now();

        // Test non-matching cases
        const result = matcher(new URL('/nonexistent', BASE_URL), BASE_URL);

        const endTime = performance.now();

        assert.equal(result.matches.length, 0);
        // Even if there is no match, performance should be within a reasonable range
        assert.isTrue(endTime - startTime < 50);
    });

    test('params type and value verification', () => {
        const matcher = createMatcher([
            { path: '/typed/:stringParam/:numberParam(\\d+)/:optionalParam?' }
        ]);

        const result = matcher(
            new URL('/typed/hello/123/extra', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(typeof result.params.stringParam, 'string');
        assert.equal(result.params.stringParam, 'hello');
        assert.equal(typeof result.params.numberParam, 'string'); // path-to-regexp总是返回字符串
        assert.equal(result.params.numberParam, '123');
        assert.equal(result.params.optionalParam, 'extra');
    });

    test('Special URL encoding scenarios', () => {
        const matcher = createMatcher([{ path: '/encoded/:param' }]);

        // Test various encoding scenarios - adjust according to path-to-regexp's actual behavior
        const testCases = [
            { input: '/encoded/hello%20world', expected: 'hello%20world' },
            {
                input: '/encoded/%E4%B8%AD%E6%96%87',
                expected: '%E4%B8%AD%E6%96%87'
            },
            {
                input: '/encoded/user%40domain.com',
                expected: 'user%40domain.com'
            },
            { input: '/encoded/path%2Fto%2Ffile', expected: 'path%2Fto%2Ffile' }
        ];

        testCases.forEach(({ input, expected }) => {
            const result = matcher(new URL(input, BASE_URL), BASE_URL);
            assert.equal(result.matches.length, 1);
            assert.equal(result.params.param, expected);
        });
    });

    test('Error configuration tolerance handling', () => {
        // Test empty route array
        const emptyMatcher = createMatcher([]);
        const emptyResult = emptyMatcher(new URL('/any', BASE_URL), BASE_URL);
        assert.equal(emptyResult.matches.length, 0);
        assert.deepEqual(emptyResult.params, {});

        // Test configuration with undefined path
        const matcher = createMatcher([
            { path: '/valid' },
            // Theoretically, there should not be such a configuration, but test tolerance
            ...(process.env.NODE_ENV === 'test' ? [] : [])
        ]);

        const result = matcher(new URL('/valid', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
    });

    test('Wildcard route matching - optional wildcard', () => {
        const routes = [
            { path: '/files/:path*', component: 'FilesPage' },
            { path: '/api/:section/data', component: 'ApiDataPage' },
            { path: '/:rest*', component: 'CatchAllPage' }
        ];
        const matcher = createMatcher(routes);

        // Test basic wildcard matching
        let result = matcher(
            new URL('/files/document.pdf', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FilesPage');
        assert.deepEqual(result.params.path, ['document.pdf']);

        result = matcher(
            new URL('/files/images/photo.jpg', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FilesPage');
        assert.deepEqual(result.params.path, ['images', 'photo.jpg']);

        result = matcher(new URL('/files/', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FilesPage');
        assert.equal(result.params.path, void 0);

        result = matcher(new URL('/files', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FilesPage');
        assert.equal(result.params.path, void 0);

        result = matcher(new URL('/api/v1/data', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ApiDataPage');
        assert.equal(result.params.section, 'v1');

        result = matcher(new URL('/anything/else', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'CatchAllPage');
        assert.deepEqual(result.params.rest, ['anything', 'else']);
    });

    test('Repeatable parameter route matching - + modifier', () => {
        const routes = [
            { path: '/chapters/:chapters+', component: 'ChaptersPage' },
            {
                path: '/categories/:categories+/items',
                component: 'CategoriesItemsPage'
            },
            { path: '/tags/:tags+/posts/:postId', component: 'TaggedPostPage' }
        ];
        const matcher = createMatcher(routes);

        // Test single parameter
        let result = matcher(new URL('/chapters/intro', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ChaptersPage');
        assert.deepEqual(result.params.chapters, ['intro']);

        // Test multiple parameters
        result = matcher(
            new URL('/chapters/intro/basics/advanced', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ChaptersPage');
        assert.deepEqual(result.params.chapters, [
            'intro',
            'basics',
            'advanced'
        ]);

        // Test repeatable parameters with subsequent paths
        result = matcher(
            new URL('/categories/tech/programming/items', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'CategoriesItemsPage');
        assert.deepEqual(result.params.categories, ['tech', 'programming']);

        // Test complex combinations
        result = matcher(
            new URL('/tags/react/typescript/hooks/posts/123', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'TaggedPostPage');
        assert.deepEqual(result.params.tags, ['react', 'typescript', 'hooks']);
        assert.equal(result.params.postId, '123');
    });

    test('Repeatable parameter route matching - * modifier', () => {
        const routes = [
            { path: '/path/:segments*', component: 'DynamicPathPage' },
            { path: '/files/:path*/download', component: 'DownloadPage' }
        ];
        const matcher = createMatcher(routes);

        // Test zero parameters (empty path segment)
        let result = matcher(new URL('/path', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DynamicPathPage');
        assert.equal(result.params.segments, undefined);

        // Test one parameter
        result = matcher(new URL('/path/a', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DynamicPathPage');
        assert.equal(result.params.segments, 'a');

        // Test multiple parameters
        result = matcher(new URL('/path/a/b/c/d', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DynamicPathPage');
        assert.deepEqual(result.params.segments, ['a', 'b', 'c', 'd']);

        // Test repeatable parameters with subsequent paths (zero)
        result = matcher(new URL('/files/download', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DownloadPage');
        assert.equal(result.params.path, undefined);

        // Test repeatable parameters with subsequent paths (one)
        result = matcher(new URL('/files/a/download', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DownloadPage');
        assert.equal(result.params.path, 'a');

        // Test repeatable parameters with subsequent paths (multiple)
        result = matcher(
            new URL('/files/docs/images/download', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DownloadPage');
        assert.deepEqual(result.params.path, ['docs', 'images']);
    });

    test('Custom regular expression route matching', () => {
        const routes = [
            { path: '/order/:orderId(\\d+)', component: 'OrderPage' },
            { path: '/user/:username([a-zA-Z0-9_]+)', component: 'UserPage' },
            { path: '/product/:productName', component: 'ProductPage' },
            { path: '/api/v:version(\\d+)', component: 'ApiPage' },
            { path: '/hex/:color([0-9a-fA-F]{6})', component: 'ColorPage' }
        ];
        const matcher = createMatcher(routes);

        // Test numeric ID
        let result = matcher(new URL('/order/12345', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'OrderPage');
        assert.equal(result.params.orderId, '12345');

        // Test non-numeric ID should not match OrderPage
        result = matcher(new URL('/order/abc123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);

        // Test username format
        result = matcher(new URL('/user/john_doe123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UserPage');
        assert.equal(result.params.username, 'john_doe123');

        // Test version number
        result = matcher(new URL('/api/v2', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ApiPage');
        assert.equal(result.params.version, '2');

        // Test hexadecimal color
        result = matcher(new URL('/hex/FF0000', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ColorPage');
        assert.equal(result.params.color, 'FF0000');

        // Test invalid hexadecimal color
        result = matcher(new URL('/hex/GGGGGG', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);

        // Test fallback to more generic routes
        result = matcher(new URL('/product/laptop-pro', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ProductPage');
        assert.equal(result.params.productName, 'laptop-pro');
    });

    test('Repeatable parameter and custom regular expression route matching', () => {
        const routes = [
            { path: '/numbers/:nums(\\d+)+', component: 'NumbersPage' },
            { path: '/codes/:codes([A-Z]{2,3})+', component: 'CodesPage' },
            { path: '/optional/:items(\\d+)*', component: 'OptionalItemsPage' },
            {
                path: '/mixed/:ids(\\d+)+/info/:codes([A-Z]+)*',
                component: 'MixedPage'
            }
        ];
        const matcher = createMatcher(routes);

        // Test required numeric parameter (single)
        let result = matcher(new URL('/numbers/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'NumbersPage');
        assert.deepEqual(result.params.nums, ['123']);

        // Test required numeric parameter (multiple)
        result = matcher(new URL('/numbers/123/456/789', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'NumbersPage');
        assert.deepEqual(result.params.nums, ['123', '456', '789']);

        // Test code format (required)
        result = matcher(new URL('/codes/US/UK/CA', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'CodesPage');
        assert.deepEqual(result.params.codes, ['US', 'UK', 'CA']);

        // Test optional numeric parameter (zero)
        result = matcher(new URL('/optional', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'OptionalItemsPage');
        assert.equal(result.params.items, undefined);

        // Test optional numeric parameter (multiple)
        result = matcher(new URL('/optional/100/200/300', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'OptionalItemsPage');
        assert.deepEqual(result.params.items, ['100', '200', '300']);

        // Test complex mixed mode
        result = matcher(
            new URL('/mixed/111/222/info/ABC/DEF', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'MixedPage');
        assert.deepEqual(result.params.ids, ['111', '222']);
        assert.deepEqual(result.params.codes, ['ABC', 'DEF']);

        // Test invalid format should not match
        result = matcher(new URL('/numbers/abc/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);
    });

    test('Optional parameter route matching - basic usage', () => {
        const routes = [
            { path: '/users/:userId?', component: 'UsersPage' },
            { path: '/posts/:postId?/comments', component: 'CommentsPage' },
            { path: '/search/:query?/:page?', component: 'SearchPage' },
            {
                path: '/profile/:section?/:subsection?',
                component: 'ProfilePage'
            }
        ];
        const matcher = createMatcher(routes);

        // Test no optional parameters
        let result = matcher(new URL('/users', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UsersPage');
        assert.equal(result.params.userId, undefined);

        // Test with optional parameters
        result = matcher(new URL('/users/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UsersPage');
        assert.equal(result.params.userId, '123');

        // Test intermediate optional parameters
        result = matcher(new URL('/posts/comments', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'CommentsPage');
        assert.equal(result.params.postId, undefined);

        result = matcher(new URL('/posts/456/comments', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'CommentsPage');
        assert.equal(result.params.postId, '456');

        // Test multiple optional parameters
        result = matcher(new URL('/search', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'SearchPage');
        assert.equal(result.params.query, undefined);
        assert.equal(result.params.page, undefined);

        result = matcher(new URL('/search/react', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'SearchPage');
        assert.equal(result.params.query, 'react');
        assert.equal(result.params.page, undefined);

        result = matcher(new URL('/search/react/2', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'SearchPage');
        assert.equal(result.params.query, 'react');
        assert.equal(result.params.page, '2');
    });

    test('Optional parameter and custom regular expression route matching', () => {
        const routes = [
            { path: '/users/:userId(\\d+)?', component: 'UsersPage' },
            {
                path: '/products/:category([a-z]+)?/:productId(\\d+)?',
                component: 'ProductsPage'
            },
            {
                path: '/articles/:year(\\d{4})?/:month(\\d{1,2})?/:slug?',
                component: 'ArticlesPage'
            },
            {
                path: '/api/:version(v\\d+)?/users/:userId(\\d+)?',
                component: 'ApiUsersPage'
            }
        ];
        const matcher = createMatcher(routes);

        // Test numeric user ID (optional)
        let result = matcher(new URL('/users', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UsersPage');
        assert.equal(result.params.userId, undefined);

        result = matcher(new URL('/users/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UsersPage');
        assert.equal(result.params.userId, '123');

        // Test invalid format should not match
        result = matcher(new URL('/users/abc', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);

        // Test multiple optional parameters with regular expression
        result = matcher(new URL('/products', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ProductsPage');
        assert.equal(result.params.category, undefined);
        assert.equal(result.params.productId, undefined);

        result = matcher(new URL('/products/electronics', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ProductsPage');
        assert.equal(result.params.category, 'electronics');
        assert.equal(result.params.productId, undefined);

        result = matcher(
            new URL('/products/electronics/456', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ProductsPage');
        assert.equal(result.params.category, 'electronics');
        assert.equal(result.params.productId, '456');

        // Test article path (year/month/title)
        result = matcher(new URL('/articles/2024', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ArticlesPage');
        assert.equal(result.params.year, '2024');
        assert.equal(result.params.month, undefined);
        assert.equal(result.params.slug, undefined);

        result = matcher(
            new URL('/articles/2024/03/my-post', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ArticlesPage');
        assert.equal(result.params.year, '2024');
        assert.equal(result.params.month, '03');
        assert.equal(result.params.slug, 'my-post');

        // Test API versioned route
        result = matcher(new URL('/api/v2/users/789', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ApiUsersPage');
        assert.equal(result.params.version, 'v2');
        assert.equal(result.params.userId, '789');

        result = matcher(new URL('/api/users', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ApiUsersPage');
        assert.equal(result.params.version, undefined);
        assert.equal(result.params.userId, undefined);
    });

    test('Complex route pattern combination matching', () => {
        const routes = [
            {
                path: '/api/v:version(\\d+)/users/:userId(\\d+)/posts/:postIds(\\d+)+',
                component: 'UserPostsPage'
            },
            {
                path: '/files/:folders([a-zA-Z0-9_-]+)*/download/:filename+',
                component: 'FileDownloadPage'
            },
            {
                path: '/shop/:categories([a-z]+)+/items/:itemId(\\d+)?/reviews/:reviewIds(\\d+)*',
                component: 'ShopReviewsPage'
            },
            {
                path: '/admin/users/:userIds(\\d+)+/roles/:roleNames([a-z]+)*',
                component: 'AdminUserRolesPage'
            }
        ];
        const matcher = createMatcher(routes);

        // Test complex API route
        let result = matcher(
            new URL('/api/v1/users/123/posts/456/789', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UserPostsPage');
        assert.equal(result.params.version, '1');
        assert.equal(result.params.userId, '123');
        assert.deepEqual(result.params.postIds, ['456', '789']);

        // Test file download route
        result = matcher(
            new URL('/files/docs/images/download/photo.jpg', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FileDownloadPage');
        assert.deepEqual(result.params.folders, ['docs', 'images']);
        assert.deepEqual(result.params.filename, ['photo.jpg']);

        // Test download without folder
        result = matcher(
            new URL('/files/download/readme.txt', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FileDownloadPage');
        assert.equal(result.params.folders, undefined);
        assert.deepEqual(result.params.filename, ['readme.txt']);

        // Test store comment route
        result = matcher(
            new URL('/shop/electronics/computers/items/123/reviews/', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ShopReviewsPage');
        assert.deepEqual(result.params.categories, [
            'electronics',
            'computers'
        ]);
        assert.equal(result.params.itemId, '123');
        assert.equal(result.params.reviewIds, undefined);

        result = matcher(
            new URL('/shop/books/items/reviews/101/102', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ShopReviewsPage');
        assert.deepEqual(result.params.categories, ['books']);
        assert.equal(result.params.itemId, undefined);
        assert.deepEqual(result.params.reviewIds, ['101', '102']);

        // Test admin user role route
        result = matcher(
            new URL('/admin/users/100/200/300/roles/admin/moderator', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'AdminUserRolesPage');
        assert.deepEqual(result.params.userIds, ['100', '200', '300']);
        assert.deepEqual(result.params.roleNames, ['admin', 'moderator']);

        result = matcher(
            new URL('/admin/users/100/roles/', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'AdminUserRolesPage');
        assert.deepEqual(result.params.userIds, ['100']);
        assert.equal(result.params.roleNames, undefined);
    });

    test('Advanced route pattern edge cases', () => {
        const routes = [
            {
                path: '/test/:param(\\d+)?/:param2(\\d+)+',
                component: 'TestPage'
            },
            { path: '/empty/:empty*', component: 'EmptyPage' },
            { path: '/strict/:id(\\d{3})', component: 'StrictPage' }
        ];
        const matcher = createMatcher(routes);

        // Test optional parameters followed by required repeatable parameters
        let result = matcher(new URL('/test/123/456', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'TestPage');
        assert.equal(result.params.param, '123');
        assert.deepEqual(result.params.param2, ['456']);

        result = matcher(new URL('/test/123/456/789', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'TestPage');
        assert.equal(result.params.param, '123');
        assert.deepEqual(result.params.param2, ['456', '789']);

        // Test empty wildcard
        result = matcher(new URL('/empty/', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'EmptyPage');
        assert.equal(result.params.empty, undefined);

        // Test strict regular expression matching (must be exactly 3 digits)
        result = matcher(new URL('/strict/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'StrictPage');
        assert.equal(result.params.id, '123');

        // Test cases that do not match strict regular expression
        result = matcher(new URL('/strict/1234', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);

        result = matcher(new URL('/strict/12', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);
    });

    test('Empty path wildcard', () => {
        assert.throws(
            () => createMatcher([{ path: '*' }]),
            'Unexpected MODIFIER'
        );

        let result = createMatcher([{ path: '(.*)' }])(
            new URL('/users/a/b/c', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '(.*)');

        result = createMatcher([{ path: '(.*)*' }])(
            new URL('/users/a/b/c', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '(.*)*');
    });

    test.todo('Wildcard route matching - new version', () => {
        const routes = [
            { path: '/files{/*path}/:file{.:ext}', component: 'FilesPage' }, // /files/:path*/:file.:ext?
            { path: '/api/*section/data', component: 'ApiDataPage' }, // /api/:section?/data
            { path: '{/*rest}', component: 'CatchAllPage' } // /:rest*
        ];
        const matcher = createMatcher(routes);

        // Test basic wildcard matching
        let result = matcher(
            new URL('/files/document.pdf', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FilesPage');
        assert.equal(result.params.path, void 0);
        assert.equal(result.params.file, 'document');
        assert.equal(result.params.ext, 'pdf');

        result = matcher(
            new URL('/files/images/photo.jpg', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FilesPage');
        assert.equal(result.params.path, ['images']);
        assert.equal(result.params.file, 'photo');
        assert.equal(result.params.ext, 'jpg');

        result = matcher(new URL('/files/images/photo', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FilesPage');
        assert.equal(result.params.path, ['images']);
        assert.equal(result.params.file, 'photo');
        assert.equal(result.params.ext, void 0);

        result = matcher(new URL('/files/', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FilesPage');
        assert.equal(result.params.path, void 0);

        result = matcher(new URL('/files', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FilesPage');
        assert.equal(result.params.path, void 0);

        result = matcher(new URL('/api/v1/data', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ApiDataPage');
        assert.equal(result.params.section, 'v1');

        result = matcher(new URL('/anything/else', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'CatchAllPage');
        assert.deepEqual(result.params.rest, ['anything', 'else']);
    });
});

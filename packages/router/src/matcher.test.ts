import { assert, describe, expect, test } from 'vitest';
import { createMatcher, joinPathname } from './matcher';

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

    const testCases: JoinPathnameTestCase[] = [
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
        },
        {
            description: '特殊字符路径',
            cases: [
                { path: 'test-path', expected: '/test-path' },
                { path: 'test_path', expected: '/test_path' },
                { path: 'test.path', expected: '/test.path' },
                { path: 'test:path', expected: '/test:path' },
                { path: 'test@path', expected: '/test@path' }
            ]
        },
        {
            description: '中文路径支持',
            cases: [
                { path: '测试', expected: '/测试' },
                { path: '测试/路径', expected: '/测试/路径' },
                { path: '测试', base: '/api', expected: '/api/测试' }
            ]
        }
    ];
    // 各种极端边界情况的测试用例
    const edgeCases: JoinPathnameTestCase[] = [
        {
            description: '仅斜杠或空的路径',
            cases: [
                { path: '', expected: '/' },
                { path: '/', expected: '/' },
                { path: '///', expected: '/' },
                { path: '/', base: '/', expected: '/' },
                { path: '/', base: '//', expected: '/' },
                { path: '//', base: '/', expected: '/' },
                { path: '//', base: '//', expected: '/' }
            ]
        },
        {
            description: '极长路径拼接',
            cases: () => {
                const longSegment =
                    'very-long-segment-name-that-could-cause-issues';
                const base = Array(10).fill(longSegment).join('/');
                const path = Array(10).fill(longSegment).join('/');
                const expected = '/' + base + '/' + path;
                return [{ path, base, expected }];
            }
        },
        {
            description: '特殊字符路径拼接',
            cases: [
                { path: '测试路径', base: '基础', expected: '/基础/测试路径' },
                {
                    path: 'path with spaces',
                    base: 'base',
                    expected: '/base/path with spaces'
                },
                {
                    path: 'path-with-dashes',
                    base: 'base_with_underscores',
                    expected: '/base_with_underscores/path-with-dashes'
                }
            ]
        },
        {
            description: 'URL编码字符处理',
            cases: [
                {
                    path: 'hello%20world',
                    base: 'api',
                    expected: '/api/hello%20world'
                },
                {
                    path: 'user%2Fprofile',
                    base: 'v1',
                    expected: '/v1/user%2Fprofile'
                }
            ]
        },
        {
            description: '点号路径处理',
            cases: [
                { path: '.', expected: '/.' },
                { path: '..', expected: '/..' },
                {
                    path: './relative',
                    base: 'base',
                    expected: '/base/./relative'
                },
                { path: '../parent', base: 'base', expected: '/base/../parent' }
            ]
        },
        {
            description: '查询参数和hash不影响拼接',
            cases: [
                {
                    path: 'path?query=1',
                    base: 'base',
                    expected: '/base/path?query=1'
                },
                {
                    path: 'path#hash',
                    base: 'base',
                    expected: '/base/path#hash'
                },
                {
                    path: 'path?q=1#hash',
                    base: 'base',
                    expected: '/base/path?q=1#hash'
                }
            ]
        },
        {
            description: '冒号开头的路径（路由参数）',
            cases: [
                { path: ':id', base: 'users', expected: '/users/:id' },
                {
                    path: ':userId/profile',
                    base: 'api',
                    expected: '/api/:userId/profile'
                }
            ]
        },
        {
            description: '星号通配符路径',
            cases: [
                { path: ':rest*', base: 'files', expected: '/files/:rest*' },
                { path: ':rest*', base: 'assets', expected: '/assets/:rest*' },
                {
                    path: 'images/:rest*',
                    base: 'static',
                    expected: '/static/images/:rest*'
                },
                { path: '/*splat', base: 'base', expected: '/base/*splat' }
            ]
        },
        {
            description: '可选路径',
            cases: [
                { path: ':id?', base: 'posts', expected: '/posts/:id?' },
                {
                    path: 'comments/:commentId?',
                    base: 'articles',
                    expected: '/articles/comments/:commentId?'
                },
                {
                    path: '/users{/:id}/delete?',
                    base: 'base',
                    expected: '/base/users{/:id}/delete?'
                }
            ]
        },
        {
            description: '数字和特殊符号组合',
            cases: [
                { path: 'v1.2.3', base: 'api', expected: '/api/v1.2.3' },
                {
                    path: 'user@domain',
                    base: 'profile',
                    expected: '/profile/user@domain'
                },
                {
                    path: 'item_123',
                    base: 'products',
                    expected: '/products/item_123'
                }
            ]
        },
        {
            description: '空白字符处理',
            cases: [
                {
                    path: '  path  ',
                    base: '  base  ',
                    expected: '/  base  /  path  '
                },
                {
                    path: '\tpath\t',
                    base: '\tbase\t',
                    expected: '/\tbase\t/\tpath\t'
                }
            ]
        },
        {
            description: '布尔值和数字路径（边界测试）',
            cases: [
                // 这些在实际使用中可能不常见，但测试类型安全
                { path: 'true', base: 'false', expected: '/false/true' },
                { path: '0', base: '1', expected: '/1/0' },
                { path: 'NaN', base: 'undefined', expected: '/undefined/NaN' }
            ]
        },
        {
            description: '路径标准化极端情况',
            cases: [
                // 测试多重斜杠标准化
                {
                    path: '///path///',
                    base: '///base///',
                    expected: '/base/path'
                },
                {
                    path: 'path////with////slashes',
                    base: 'base////with////slashes',
                    expected: '/base/with/slashes/path/with/slashes'
                }
            ]
        },
        {
            description: '非ASCII字符路径处理',
            cases: [
                // 测试各种Unicode字符
                { path: 'путь', base: 'база', expected: '/база/путь' }, // 俄文
                { path: 'パス', base: 'ベース', expected: '/ベース/パス' }, // 日文
                { path: '경로', base: '기본', expected: '/기본/경로' }, // 韩文
                { path: 'مسار', base: 'قاعدة', expected: '/قاعدة/مسار' } // 阿拉伯文
            ]
        },
        {
            description: '特殊符号和标点处理',
            cases: [
                {
                    path: 'path!@#$%^&\\*()',
                    base: 'base!@#$%^&\\*()',
                    expected: '/base!@#$%^&\\*()/path!@#$%^&\\*()'
                },
                {
                    path: 'path\\[]{};:"\'<>\\?',
                    base: 'base\\[]{};:"\'<>\\?',
                    expected: '/base\\[]{};:"\'<>\\?/path\\[]{};:"\'<>\\?'
                },
                {
                    path: 'path\\backslash',
                    base: 'base\\backslash\\',
                    expected: '/base\\backslash\\/path\\backslash'
                }
            ]
        },
        {
            description: '数字和符号组合路径',
            cases: [
                {
                    path: '123.456.789',
                    base: 'v1.0.0',
                    expected: '/v1.0.0/123.456.789'
                },
                {
                    path: 'item-123_abc',
                    base: 'category-456_def',
                    expected: '/category-456_def/item-123_abc'
                },
                {
                    path: '2023-12-31',
                    base: '2024-01-01',
                    expected: '/2024-01-01/2023-12-31'
                }
            ]
        },
        {
            description: '空白字符的各种形式',
            cases: [
                { path: ' ', base: ' ', expected: '/ / ' },
                { path: '\n', base: '\t', expected: '/\t/\n' },
                { path: '\r\n', base: '\t\r', expected: '/\t\r/\r\n' }, // 测试回车换行符
                { path: '\u00A0', base: '\u2000', expected: '/\u2000/\u00A0' } // 不间断空格和em空格
            ]
        },
        {
            description: '超长路径处理',
            cases: () => {
                const veryLongSegment = 'a'.repeat(1000);
                const path = veryLongSegment + '/segment';
                const base = 'base/' + veryLongSegment;
                const expected = '/' + base + '/' + path;
                return [{ path, base, expected }];
            }
        },
        {
            description: '路径分隔符边界情况',
            cases: [
                // 测试各种路径分隔符组合
                { path: '/', base: '/', expected: '/' },
                { path: '//', base: '//', expected: '/' },
                { path: '///', base: '///', expected: '/' },
                { path: 'path/', base: '/base', expected: '/base/path' },
                { path: '/path/', base: '/base/', expected: '/base/path' }
            ]
        },
        {
            description: 'URL编码路径片段',
            cases: [
                {
                    path: '%20space%20',
                    base: '%20base%20',
                    expected: '/%20base%20/%20space%20'
                },
                { path: '%2F%2F', base: '%2F', expected: '/%2F/%2F%2F' },
                {
                    path: 'path%3Fquery%3D1',
                    base: 'base%23hash',
                    expected: '/base%23hash/path%3Fquery%3D1'
                }
            ]
        },
        {
            description: '数值类型路径（类型边界）',
            cases: [
                // 虽然函数签名要求string，但测试潜在的类型强制转换
                { path: '123', base: '456', expected: '/456/123' },
                { path: '0', expected: '/0' },
                { path: '', base: '0', expected: '/0' }
            ]
        },
        {
            description: '路径包含点号的复杂情况',
            cases: [
                {
                    path: '../../../path',
                    base: '../../base',
                    expected: '/../../base/../../../path'
                },
                {
                    path: './././path',
                    base: './././base',
                    expected: '/./././base/./././path'
                },
                {
                    path: 'path/./file',
                    base: 'base/../dir',
                    expected: '/base/../dir/path/./file'
                }
            ]
        },
        {
            description: '混合字符集路径',
            cases: [
                {
                    path: '中文/english/русский',
                    base: '日本語/العربية',
                    expected: '/日本語/العربية/中文/english/русский'
                },
                {
                    path: '测试-test-тест',
                    base: '基础-base-база',
                    expected: '/基础-base-база/测试-test-тест'
                }
            ]
        },
        {
            description: '控制字符处理',
            cases: [
                // 测试控制字符（虽然在实际URL中不常见）
                {
                    path: '\u0001\u0002',
                    base: '\u0003\u0004',
                    expected: '/\u0003\u0004/\u0001\u0002'
                },
                {
                    path: 'path\u007F',
                    base: 'base\u007F',
                    expected: '/base\u007F/path\u007F'
                }
            ]
        },
        {
            description: '路径末尾的各种字符',
            cases: [
                { path: 'path.', base: 'base.', expected: '/base./path.' },
                { path: 'path-', base: 'base-', expected: '/base-/path-' },
                { path: 'path_', base: 'base_', expected: '/base_/path_' },
                { path: 'path~', base: 'base~', expected: '/base~/path~' }
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
    describe('边界情况', () => runTests(edgeCases));
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
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/news/:id');
        assert.equal(result.params.id, '123');
    });

    test('精确路由匹配优先级', () => {
        const matcher = createMatcher([
            {
                path: '/news/:id'
            },
            {
                path: '/news'
            }
        ]);
        const result = matcher(new URL('/news', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/news');
        assert.deepEqual(result.params, {});
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
        assert.equal(result.matches.length, 2);
        assert.equal(result.matches[0].path, '/news');
        assert.equal(result.matches[1].path, ':id');
        assert.equal(result.params.id, '123');
    });

    test('深层嵌套路由匹配', () => {
        const matcher = createMatcher([
            {
                path: '/user',
                children: [
                    {
                        path: ':userId',
                        children: [
                            {
                                path: 'profile'
                            },
                            {
                                path: 'settings'
                            }
                        ]
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

    test('多参数路由匹配', () => {
        const matcher = createMatcher([
            {
                path: '/user/:userId/post/:postId'
            }
        ]);
        const result = matcher(
            new URL('/user/123/post/456', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/user/:userId/post/:postId');
        assert.equal(result.params.userId, '123');
        assert.equal(result.params.postId, '456');
    });

    test('可选参数路由匹配', () => {
        const matcher = createMatcher([{ path: '/posts/:id?' }]);

        // 匹配有参数的情况
        const resultWithParam = matcher(
            new URL('/posts/123', BASE_URL),
            BASE_URL
        );
        assert.equal(resultWithParam.matches.length, 1);
        assert.equal(resultWithParam.params.id, '123');

        // 匹配无参数的情况
        const resultWithoutParam = matcher(
            new URL('/posts', BASE_URL),
            BASE_URL
        );
        assert.equal(resultWithoutParam.matches.length, 1);
        assert.equal(resultWithoutParam.params.id, undefined);
    });

    test('数字参数路由匹配', () => {
        const matcher = createMatcher([{ path: '/posts/:id(\\d+)' }]);

        // 匹配数字参数的情况
        const resultWithParam = matcher(
            new URL('/posts/123', BASE_URL),
            BASE_URL
        );
        assert.equal(resultWithParam.matches.length, 1);
        assert.equal(resultWithParam.params.id, '123');

        // 匹配参数不是数字的情况
        const resultWithoutParam = matcher(
            new URL('/posts/123a', BASE_URL),
            BASE_URL
        );
        assert.equal(resultWithoutParam.matches.length, 0);

        // 匹配参数为NaN的情况
        const resultWithNaN = matcher(
            new URL('/posts/NaN', BASE_URL),
            BASE_URL
        );
        assert.equal(resultWithNaN.matches.length, 0);
    });

    test('通配符路由匹配', () => {
        const matcher = createMatcher([{ path: '/files/:rest*' }]);
        const result = matcher(
            new URL('/files/documents/readme.txt', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/files/:rest*');
        assert.deepEqual(result.params.rest, ['documents', 'readme.txt']);
    });

    test('正则表达式参数匹配', () => {
        const matcher = createMatcher([{ path: '/api/v:version(\\d+)' }]);
        const result = matcher(new URL('/api/v1', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.params.version, '1');
    });

    test('无匹配路由情况', () => {
        const matcher = createMatcher([{ path: '/news' }]);
        const result = matcher(new URL('/blog', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);
        assert.deepEqual(result.params, {});
    });

    test('空路由配置', () => {
        const matcher = createMatcher([]);
        const result = matcher(new URL('/any', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);
        assert.deepEqual(result.params, {});
    });

    test('路由元信息传递', () => {
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

    test('复杂嵌套路由与参数组合', () => {
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
                                children: [
                                    {
                                        path: 'edit'
                                    }
                                ]
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

    test('baseURL带目录', () => {
        const matcher = createMatcher([{ path: '/api' }]);
        const customBaseURL = new URL('https://www.esmx.dev/app/');
        const result = matcher(
            new URL('https://www.esmx.dev/app/api'),
            customBaseURL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/api');
    });

    test('URL编码参数处理', () => {
        const matcher = createMatcher([{ path: '/search/:query' }]);
        const result = matcher(
            new URL('/search/hello world', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        // path-to-regexp会编码URL参数
        assert.equal(result.params.query, 'hello%20world');
    });

    test('中文路径参数', () => {
        const matcher = createMatcher([
            { path: `/${encodeURIComponent('分类')}/:name` }
        ]);
        const result = matcher(new URL('/分类/技术', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.params.name, encodeURIComponent('技术'));
    });

    test('重复参数名处理', () => {
        const matcher = createMatcher([
            {
                path: '/parent/:id',
                children: [
                    {
                        path: 'child/:childId'
                    }
                ]
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

    test.skip('路由匹配顺序一致性', () => {
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

        // 参数路由应该匹配
        const result1 = matcher(new URL('/a/123', BASE_URL), BASE_URL);
        assert.equal(result1.matches.length, 1);
        assert.equal(result1.matches[0]?.meta?.order, 1);

        // 精确路由应该匹配
        const result2 = matcher(new URL('/a/special', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 1);
        assert.equal(result2.matches[0]?.meta?.order, 2);
    });

    test('特殊字符在路径中的处理', () => {
        const matcher = createMatcher([
            { path: '/test-path' },
            { path: '/test_path' },
            { path: '/test.path' }
        ]);

        assert.equal(
            matcher(new URL('/test-path', BASE_URL), BASE_URL).matches.length,
            1
        );
        assert.equal(
            matcher(new URL('/test_path', BASE_URL), BASE_URL).matches.length,
            1
        );
        assert.equal(
            matcher(new URL('/test.path', BASE_URL), BASE_URL).matches.length,
            1
        );
    });

    test('空字符串路径处理', () => {
        const matcher = createMatcher([
            {
                path: '',
                children: [
                    {
                        path: 'child'
                    }
                ]
            }
        ]);
        const result = matcher(new URL('/child', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 2);
        assert.equal(result.matches[0].path, '');
        assert.equal(result.matches[1].path, 'child');
    });

    test('路由匹配性能验证', () => {
        // 创建大量路由配置
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
        // 验证匹配时间应该在合理范围内（小于10ms）
        assert.isTrue(endTime - startTime < 10);
    });

    test('边界情况：超长路径', () => {
        const longPath =
            '/very/long/path/with/many/segments/that/goes/on/and/on/and/on';
        const matcher = createMatcher([{ path: longPath }]);
        const result = matcher(new URL(longPath, BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, longPath);
    });

    test('边界情况：大量参数', () => {
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

    test('路径重写和编码', () => {
        const matcher = createMatcher([{ path: '/api/:resource' }]);
        const result = matcher(
            new URL('/api/user%2Fprofile', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        // URL编码的斜杠不会被自动解码为路径分隔符
        assert.equal(result.params.resource, 'user%2Fprofile');
    });

    test('查询参数不影响路由匹配', () => {
        const matcher = createMatcher([{ path: '/search' }]);
        const result = matcher(
            new URL('/search?q=test&page=1', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/search');
    });

    test('hash不影响路由匹配', () => {
        const matcher = createMatcher([{ path: '/page' }]);
        const result = matcher(new URL('/page#section1', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/page');
    });

    test.skip('大小写敏感匹配', () => {
        const matcher = createMatcher([{ path: '/API' }, { path: '/api' }]);
        const result1 = matcher(new URL('/API', BASE_URL), BASE_URL);
        const result2 = matcher(new URL('/api', BASE_URL), BASE_URL);

        assert.equal(result1.matches.length, 1);
        assert.equal(result1.matches[0].path, '/API');

        assert.equal(result2.matches.length, 1);
        assert.equal(result2.matches[0].path, '/api');
    });

    test('应忽略baseURL中的用户名和密码', () => {
        const customBase = new URL('https://uname@pwlocalhost:3000/app/');
        const matcher = createMatcher([{ path: '/test' }]);
        const result = matcher(
            new URL('https://uname2@pw2localhost:3000/app/test'),
            customBase
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].path, '/test');
    });

    test('嵌套路由中的空字符串处理', () => {
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

    test('路由组件配置保持', () => {
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

    test('路由重定向配置保持', () => {
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

    test('数字参数正确解析', () => {
        const matcher = createMatcher([{ path: '/user/:id(\\d+)' }]);

        const result1 = matcher(new URL('/user/123', BASE_URL), BASE_URL);
        assert.equal(result1.matches.length, 1);
        assert.equal(result1.params.id, '123');

        // 非数字应该不匹配
        const result2 = matcher(new URL('/user/abc', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 0);
    });

    test('路由匹配深度优先策略验证', () => {
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
        // 验证深度优先：父路由在前
        assert.equal(result.matches[0].meta?.level, 1);
        assert.equal(result.matches[1].meta?.level, 2);
        assert.equal(result.matches[2].meta?.level, 3);
    });

    test('空meta对象默认处理', () => {
        const matcher = createMatcher([{ path: '/no-meta' }]);
        const result = matcher(new URL('/no-meta', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.isObject(result.matches[0].meta);
        assert.deepEqual(result.matches[0].meta, {});
    });

    test('路径标准化处理', () => {
        const matcher = createMatcher([{ path: '/test//double//slash' }]);
        const result = matcher(
            new URL('/test/double/slash', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
    });

    test('错误路径配置处理', () => {
        // 测试空字符串路径
        const matcher1 = createMatcher([{ path: '' }]);
        const result1 = matcher1(new URL('/', BASE_URL), BASE_URL);
        assert.equal(result1.matches.length, 1);

        // 测试只有斜杠的路径
        const matcher2 = createMatcher([{ path: '/' }]);
        const result2 = matcher2(new URL('/', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 1);
    });

    test('空参数处理', () => {
        const matcher = createMatcher([{ path: '/user/:id' }]);
        // 测试空参数值
        const result = matcher(new URL('/user/', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0); // 应该不匹配
    });

    test('路由配置完整性验证', () => {
        const TestComponent = () => 'test';
        const asyncComponent = async () => TestComponent;
        const beforeEnter = async () => void 0; // 正确的RouteConfirmHookResult类型

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

    test.skip('路由冲突和优先级处理', () => {
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

        // 测试精确匹配优先
        const result1 = matcher(
            new URL('/conflict/special', BASE_URL),
            BASE_URL
        );
        assert.equal(result1.matches.length, 1);
        assert.equal(result1.matches[0]?.meta?.priority, 2);

        // 测试参数匹配
        const result2 = matcher(new URL('/conflict/123', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 1);
        assert.equal(result2.matches[0]?.meta?.priority, 1);
        assert.equal(result2.params.id, '123');
    });

    test('多级嵌套参数提取', () => {
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

    test('路由环境配置处理', () => {
        const envHandler = () => ({ data: 'test' });
        const matcher = createMatcher([
            {
                path: '/env-test',
                env: envHandler,
                meta: { env: 'production' }
            }
        ]);

        const result = matcher(new URL('/env-test', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].env, envHandler);
        assert.equal(result.matches[0]?.meta?.env, 'production');
    });

    test('应用配置处理', () => {
        const appConfig = 'test-app';
        const appCallback = () => ({ mount: () => {}, unmount: () => {} });

        const matcher = createMatcher([
            {
                path: '/app1',
                app: appConfig
            },
            {
                path: '/app2',
                app: appCallback
            }
        ]);

        const result1 = matcher(new URL('/app1', BASE_URL), BASE_URL);
        assert.equal(result1.matches.length, 1);
        assert.equal(result1.matches[0].app, appConfig);

        const result2 = matcher(new URL('/app2', BASE_URL), BASE_URL);
        assert.equal(result2.matches.length, 1);
        assert.equal(result2.matches[0].app, appCallback);
    });

    test('复杂通配符和参数组合', () => {
        const matcher = createMatcher([{ path: '/files/:category/:rest*' }]);
        const result = matcher(
            new URL('/files/documents/folder1/folder2/view', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.params.category, 'documents');
        assert.deepEqual(result.params.rest, ['folder1', 'folder2', 'view']);
    });

    test('路由重定向配置验证', () => {
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

    test('路由守卫配置验证', () => {
        const beforeEnter = async () => void 0; // 正确的RouteConfirmHookResult类型
        const beforeUpdate = async () => void 0; // 修正为void类型
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

    test('matcher性能边界测试', () => {
        // 创建大量复杂路由配置
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

        // 测试不匹配的情况
        const result = matcher(new URL('/nonexistent', BASE_URL), BASE_URL);

        const endTime = performance.now();

        assert.equal(result.matches.length, 0);
        // 即使是不匹配的情况，性能也应该在合理范围内
        assert.isTrue(endTime - startTime < 50);
    });

    test('params参数类型和值验证', () => {
        const matcher = createMatcher([
            {
                path: '/typed/:stringParam/:numberParam(\\d+)/:optionalParam?'
            }
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

    test('特殊URL编码场景', () => {
        const matcher = createMatcher([{ path: '/encoded/:param' }]);

        // 测试各种编码场景 - 根据path-to-regexp的实际行为调整
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

    test('错误配置容错处理', () => {
        // 测试空路由数组
        const emptyMatcher = createMatcher([]);
        const emptyResult = emptyMatcher(new URL('/any', BASE_URL), BASE_URL);
        assert.equal(emptyResult.matches.length, 0);
        assert.deepEqual(emptyResult.params, {});

        // 测试含有undefined路径的配置
        const matcher = createMatcher([
            { path: '/valid' },
            // 理论上不应该有这种配置，但测试容错性
            ...(process.env.NODE_ENV === 'test' ? [] : [])
        ]);

        const result = matcher(new URL('/valid', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
    });

    test('通配符路由匹配 - 可选通配符', () => {
        const routes = [
            { path: '/files/:path*', component: 'FilesPage' },
            { path: '/api/:section/data', component: 'ApiDataPage' },
            { path: '/:rest*', component: 'CatchAllPage' }
        ];
        const matcher = createMatcher(routes);

        // 测试基本通配符匹配
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

    test('可重复参数路由匹配 - + 修饰符', () => {
        const routes = [
            { path: '/chapters/:chapters+', component: 'ChaptersPage' },
            {
                path: '/categories/:categories+/items',
                component: 'CategoriesItemsPage'
            },
            { path: '/tags/:tags+/posts/:postId', component: 'TaggedPostPage' }
        ];
        const matcher = createMatcher(routes);

        // 测试单个参数
        let result = matcher(new URL('/chapters/intro', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ChaptersPage');
        assert.deepEqual(result.params.chapters, ['intro']);

        // 测试多个参数
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

        // 测试带后续路径的可重复参数
        result = matcher(
            new URL('/categories/tech/programming/items', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'CategoriesItemsPage');
        assert.deepEqual(result.params.categories, ['tech', 'programming']);

        // 测试复杂组合
        result = matcher(
            new URL('/tags/react/typescript/hooks/posts/123', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'TaggedPostPage');
        assert.deepEqual(result.params.tags, ['react', 'typescript', 'hooks']);
        assert.equal(result.params.postId, '123');
    });

    test('可重复参数路由匹配 - * 修饰符', () => {
        const routes = [
            { path: '/path/:segments*', component: 'DynamicPathPage' },
            { path: '/files/:path*/download', component: 'DownloadPage' }
        ];
        const matcher = createMatcher(routes);

        // 测试零个参数（空路径段）
        let result = matcher(new URL('/path', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DynamicPathPage');
        assert.equal(result.params.segments, undefined);

        // 测试一个参数
        result = matcher(new URL('/path/a', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DynamicPathPage');
        assert.equal(result.params.segments, 'a');

        // 测试多个参数
        result = matcher(new URL('/path/a/b/c/d', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DynamicPathPage');
        assert.deepEqual(result.params.segments, ['a', 'b', 'c', 'd']);

        // 测试带后续路径的可重复参数（零个）
        result = matcher(new URL('/files/download', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DownloadPage');
        assert.equal(result.params.path, undefined);

        // 测试带后续路径的可重复参数（一个）
        result = matcher(new URL('/files/a/download', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DownloadPage');
        assert.equal(result.params.path, 'a');

        // 测试带后续路径的可重复参数（多个）
        result = matcher(
            new URL('/files/docs/images/download', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'DownloadPage');
        assert.deepEqual(result.params.path, ['docs', 'images']);
    });

    test('自定义正则表达式路由匹配', () => {
        const routes = [
            { path: '/order/:orderId(\\d+)', component: 'OrderPage' },
            { path: '/user/:username([a-zA-Z0-9_]+)', component: 'UserPage' },
            { path: '/product/:productName', component: 'ProductPage' },
            { path: '/api/v:version(\\d+)', component: 'ApiPage' },
            { path: '/hex/:color([0-9a-fA-F]{6})', component: 'ColorPage' }
        ];
        const matcher = createMatcher(routes);

        // 测试数字 ID
        let result = matcher(new URL('/order/12345', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'OrderPage');
        assert.equal(result.params.orderId, '12345');

        // 测试非数字 ID 应该不匹配 OrderPage
        result = matcher(new URL('/order/abc123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);

        // 测试用户名格式
        result = matcher(new URL('/user/john_doe123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UserPage');
        assert.equal(result.params.username, 'john_doe123');

        // 测试版本号
        result = matcher(new URL('/api/v2', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ApiPage');
        assert.equal(result.params.version, '2');

        // 测试十六进制颜色
        result = matcher(new URL('/hex/FF0000', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ColorPage');
        assert.equal(result.params.color, 'FF0000');

        // 测试无效十六进制颜色
        result = matcher(new URL('/hex/GGGGGG', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);

        // 测试 fallback 到更通用的路由
        result = matcher(new URL('/product/laptop-pro', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'ProductPage');
        assert.equal(result.params.productName, 'laptop-pro');
    });

    test('可重复参数与自定义正则结合路由匹配', () => {
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

        // 测试必需的数字参数（单个）
        let result = matcher(new URL('/numbers/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'NumbersPage');
        assert.deepEqual(result.params.nums, ['123']);

        // 测试必需的数字参数（多个）
        result = matcher(new URL('/numbers/123/456/789', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'NumbersPage');
        assert.deepEqual(result.params.nums, ['123', '456', '789']);

        // 测试代码格式（必需）
        result = matcher(new URL('/codes/US/UK/CA', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'CodesPage');
        assert.deepEqual(result.params.codes, ['US', 'UK', 'CA']);

        // 测试可选数字参数（零个）
        result = matcher(new URL('/optional', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'OptionalItemsPage');
        assert.equal(result.params.items, undefined);

        // 测试可选数字参数（多个）
        result = matcher(new URL('/optional/100/200/300', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'OptionalItemsPage');
        assert.deepEqual(result.params.items, ['100', '200', '300']);

        // 测试复杂混合模式
        result = matcher(
            new URL('/mixed/111/222/info/ABC/DEF', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'MixedPage');
        assert.deepEqual(result.params.ids, ['111', '222']);
        assert.deepEqual(result.params.codes, ['ABC', 'DEF']);

        // 测试无效格式应该不匹配
        result = matcher(new URL('/numbers/abc/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);
    });

    test('可选参数路由匹配 - 基本用法', () => {
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

        // 测试无可选参数
        let result = matcher(new URL('/users', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UsersPage');
        assert.equal(result.params.userId, undefined);

        // 测试有可选参数
        result = matcher(new URL('/users/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UsersPage');
        assert.equal(result.params.userId, '123');

        // 测试中间可选参数
        result = matcher(new URL('/posts/comments', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'CommentsPage');
        assert.equal(result.params.postId, undefined);

        result = matcher(new URL('/posts/456/comments', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'CommentsPage');
        assert.equal(result.params.postId, '456');

        // 测试多个可选参数
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

    test('可选参数与自定义正则结合路由匹配', () => {
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

        // 测试数字用户 ID（可选）
        let result = matcher(new URL('/users', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UsersPage');
        assert.equal(result.params.userId, undefined);

        result = matcher(new URL('/users/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UsersPage');
        assert.equal(result.params.userId, '123');

        // 无效格式应该不匹配
        result = matcher(new URL('/users/abc', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);

        // 测试多个可选参数与正则
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

        // 测试文章路径（年/月/标题）
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

        // 测试 API 版本化路由
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

    test('复杂路由模式组合匹配', () => {
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

        // 测试复杂 API 路由
        let result = matcher(
            new URL('/api/v1/users/123/posts/456/789', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'UserPostsPage');
        assert.equal(result.params.version, '1');
        assert.equal(result.params.userId, '123');
        assert.deepEqual(result.params.postIds, ['456', '789']);

        // 测试文件下载路由
        result = matcher(
            new URL('/files/docs/images/download/photo.jpg', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FileDownloadPage');
        assert.deepEqual(result.params.folders, ['docs', 'images']);
        assert.deepEqual(result.params.filename, ['photo.jpg']);

        // 测试无文件夹的下载
        result = matcher(
            new URL('/files/download/readme.txt', BASE_URL),
            BASE_URL
        );
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'FileDownloadPage');
        assert.equal(result.params.folders, undefined);
        assert.deepEqual(result.params.filename, ['readme.txt']);

        // 测试商店评论路由
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

        // 测试管理员用户角色路由
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

    test('高级路由模式的边缘情况', () => {
        const routes = [
            {
                path: '/test/:param(\\d+)?/:param2(\\d+)+',
                component: 'TestPage'
            },
            { path: '/empty/:empty*', component: 'EmptyPage' },
            { path: '/strict/:id(\\d{3})', component: 'StrictPage' }
        ];
        const matcher = createMatcher(routes);

        // 测试可选参数后跟必需重复参数
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

        // 测试空通配符
        result = matcher(new URL('/empty/', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'EmptyPage');
        assert.equal(result.params.empty, undefined);

        // 测试严格正则匹配（必须恰好3位数字）
        result = matcher(new URL('/strict/123', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 1);
        assert.equal(result.matches[0].component, 'StrictPage');
        assert.equal(result.params.id, '123');

        // 测试不符合严格正则的情况
        result = matcher(new URL('/strict/1234', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);

        result = matcher(new URL('/strict/12', BASE_URL), BASE_URL);
        assert.equal(result.matches.length, 0);
    });

    test('空路径通配', () => {
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

    test.skip('通配符路由匹配 - 新版', () => {
        const routes = [
            { path: '/files{/*path}/:file{.:ext}', component: 'FilesPage' }, // /files/:path*/:file.:ext?
            { path: '/api/*section/data', component: 'ApiDataPage' }, // /api/:section?/data
            { path: '{/*rest}', component: 'CatchAllPage' } // /:rest*
        ];
        const matcher = createMatcher(routes);

        // 测试基本通配符匹配
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

import { assert, describe, expect, test } from 'vitest';
import { parseLocation } from './location';

const BASE_URL = 'https://www.esmx.dev';

/*
    URL 的 pathname 中有两个概念：目录和文件。

    * 目录 指的是到 URL 最后一个斜杠之前的部分。例如：
      * 对于路径 `/a/b/c` 来说，`/a/b/` 是其目录。
      * 对于路径 `/a/b/c/` 来说，`/a/b/c/` 是其目录。
    * 文件 指的是 URL 最后一个斜杠之后的部分。例如：
      * 对于路径 `/a/b/c` 来说，`c` 是其文件。

    相对路径是相对目录来说的。因此尾斜杠是具有意义的。
    具体的行为可以看 [解析 URL 的相对引用](https://developer.mozilla.org/en-US/docs/Web/API/URL_API/Resolving_relative_references)

    相对路径有三种类型：

    1. 相对于根的路径：带有 `/` 前缀的路径。
    2. 相对于父目录的路径：带有 `../` 前缀的路径，或者 `..`。
    3. 相对于当前目录的路径：带有或不带有 `./` 前缀的路径（例如 `./article`、`article` 或 `./article/`），或者 `.`。

    路由期望 router.option.base 不是作为相对父目录路径解析的根路径，意味着相对父目录路径是可以跳出应用的，这是基于相对父目录路径应该允许跳出应用的假设。
    例如：
        应用 A 的 base 为 `https://www.esmx.dev/`，应用 B 的 base 为 `https://www.esmx.dev/en/`。
        当前路径位于应用 B 中的根目录，即 `https://www.esmx.dev/en/`。现在在应用 B 中点击链接 `..`，期望是回到应用 A
        则 `..` 会被解析为 `https://www.esmx.dev/`，而不能是 `https://www.esmx.dev/en/`。

    那现在的解析，所有的路径都以 router.option.base 作为根路径进行解析。但允许 相对于父目录的路径 返回到 base 上级。

    对于 `//` 开头的路径，路由会拼接 `http:` 协议前缀。
    这是和浏览器的行为不一致的。浏览器会以当前文档的协议来解析 `//` 开头的路径。
    例如如果你在 `file:///test.html` 页面上点击 `//github.com` 链接，浏览器会将其解析为 `file://github.com/`。

    base 和 当前路径的 query 和 hash 都会被忽略。
*/

interface ToEqURLMatchers {
    toEqURL(expected: URL | string): void;
}

declare module 'vitest' {
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
            message: () =>
                `expected ${received.href} to equal ${expected.href}`,
            pass: received.href === expected.href
        };
    }
});

describe('parseLocation', () => {
    describe('字符串输入', () => {
        describe('绝对路径应该直接使用', () => {
            test.each([
                { input: 'http://github.com' },
                { input: 'https://github.com' },
                { input: 'https://github.com/' },
                { input: 'https://github.com/?a&b=1&c=2&a=&a=4#hash' },
                { input: 'file:///path/to/file.txt' },
                { input: 'ftp://example.com/resource' }
            ])('应该正确处理绝对路径: $input', ({ input }) => {
                expect(parseLocation(input, BASE_URL)).toEqURL(input);
            });
        });

        test('应该自动添加 http 协议', () => {
            expect(parseLocation('//github.com', BASE_URL)).toEqURL(
                'http://github.com/'
            );
        });

        test('裸域名应该当做相对路径处理', () => {
            expect(parseLocation('github.com', BASE_URL)).toEqURL(
                BASE_URL + '/github.com/'
            );
        });
    });

    describe('对象输入', () => {
        test('应该正确处理对象的默认值', () => {
            const t = new URL(BASE_URL);
            t.search = t.hash = '';
            expect(parseLocation({}, BASE_URL)).toEqURL(t);
        });

        test('应该正确处理 query 参数', () => {
            const url = parseLocation(
                {
                    path: '/api',
                    query: {
                        a: '1',
                        b: undefined, // 应该被忽略
                        c: '0' // 0 应该被保留
                    }
                },
                BASE_URL
            );
            expect(url).toEqURL(BASE_URL + '/api?a=1&c=0');
        });

        test('应该正确处理数组查询参数', () => {
            const url = parseLocation(
                {
                    path: '/api',
                    queryArray: {
                        ids: ['1', '2']
                    }
                },
                BASE_URL
            );
            expect(url).toEqURL(BASE_URL + '/api?ids=1&ids=2');
        });

        test('应该正确处理 hash', () => {
            // 不带 # 的 hash
            const url1 = parseLocation(
                {
                    path: '/page',
                    hash: 'section'
                },
                BASE_URL
            );
            expect(url1).toEqURL(BASE_URL + '/page#section');

            // 带 # 的 hash
            const url2 = parseLocation(
                {
                    path: '/page',
                    hash: '#section'
                },
                BASE_URL
            );
            expect(url2).toEqURL(BASE_URL + '/page#section');

            // 空 hash
            const url3 = parseLocation(
                {
                    path: '/page',
                    hash: ''
                },
                BASE_URL
            );
            expect(url3).toEqURL(BASE_URL + '/page');
        });
    });

    describe('相对路径解析', () => {
        Object.entries({
            'https://www.esmx.dev': [
                { input: '/', expected: 'https://www.esmx.dev/' },
                { input: '/new', expected: 'https://www.esmx.dev/new' },
                { input: '/new/', expected: 'https://www.esmx.dev/new/' },
                { input: '/new/100', expected: 'https://www.esmx.dev/new/100' },
                {
                    input: '/new/100/',
                    expected: 'https://www.esmx.dev/new/100/'
                },
                { input: '..', expected: 'https://www.esmx.dev/' },
                { input: '../', expected: 'https://www.esmx.dev/' },
                { input: '../new', expected: 'https://www.esmx.dev/new' },
                { input: '../new/', expected: 'https://www.esmx.dev/new/' },
                {
                    input: '../new/100',
                    expected: 'https://www.esmx.dev/new/100'
                },
                {
                    input: '../new/100/',
                    expected: 'https://www.esmx.dev/new/100/'
                },
                { input: '', expected: 'https://www.esmx.dev/' },
                { input: 'new', expected: 'https://www.esmx.dev/new' },
                { input: 'new/', expected: 'https://www.esmx.dev/new/' },
                { input: 'new/100', expected: 'https://www.esmx.dev/new/100' },
                {
                    input: 'new/100/',
                    expected: 'https://www.esmx.dev/new/100/'
                },
                { input: '.', expected: 'https://www.esmx.dev/' },
                { input: './', expected: 'https://www.esmx.dev/' },
                { input: './new', expected: 'https://www.esmx.dev/new' },
                { input: './new/', expected: 'https://www.esmx.dev/new/' },
                {
                    input: './new/100',
                    expected: 'https://www.esmx.dev/new/100'
                },
                {
                    input: './new/100/',
                    expected: 'https://www.esmx.dev/new/100/'
                }
            ],
            'https://www.esmx.dev/': [
                { input: '/', expected: 'https://www.esmx.dev/' },
                { input: '/new', expected: 'https://www.esmx.dev/new' },
                { input: '/new/', expected: 'https://www.esmx.dev/new/' },
                { input: '/new/100', expected: 'https://www.esmx.dev/new/100' },
                {
                    input: '/new/100/',
                    expected: 'https://www.esmx.dev/new/100/'
                },
                { input: '..', expected: 'https://www.esmx.dev/' },
                { input: '../', expected: 'https://www.esmx.dev/' },
                { input: '../new', expected: 'https://www.esmx.dev/new' },
                { input: '../new/', expected: 'https://www.esmx.dev/new/' },
                {
                    input: '../new/100',
                    expected: 'https://www.esmx.dev/new/100'
                },
                {
                    input: '../new/100/',
                    expected: 'https://www.esmx.dev/new/100/'
                },
                { input: '', expected: 'https://www.esmx.dev/' },
                { input: 'new', expected: 'https://www.esmx.dev/new' },
                { input: 'new/', expected: 'https://www.esmx.dev/new/' },
                { input: 'new/100', expected: 'https://www.esmx.dev/new/100' },
                {
                    input: 'new/100/',
                    expected: 'https://www.esmx.dev/new/100/'
                },
                { input: '.', expected: 'https://www.esmx.dev/' },
                { input: './', expected: 'https://www.esmx.dev/' },
                { input: './new', expected: 'https://www.esmx.dev/new' },
                { input: './new/', expected: 'https://www.esmx.dev/new/' },
                {
                    input: './new/100',
                    expected: 'https://www.esmx.dev/new/100'
                },
                {
                    input: './new/100/',
                    expected: 'https://www.esmx.dev/new/100/'
                }
            ],
            'https://www.esmx.dev/a/b/c': [
                { input: '/', expected: 'https://www.esmx.dev/a/b/' },
                { input: '/new', expected: 'https://www.esmx.dev/a/b/new' },
                { input: '/new/', expected: 'https://www.esmx.dev/a/b/new/' },
                {
                    input: '/new/100',
                    expected: 'https://www.esmx.dev/a/b/new/100'
                },
                {
                    input: '/new/100/',
                    expected: 'https://www.esmx.dev/a/b/new/100/'
                },
                { input: '..', expected: 'https://www.esmx.dev/a/' },
                { input: '../', expected: 'https://www.esmx.dev/a/' },
                { input: '../new', expected: 'https://www.esmx.dev/a/new' },
                { input: '../new/', expected: 'https://www.esmx.dev/a/new/' },
                {
                    input: '../new/100',
                    expected: 'https://www.esmx.dev/a/new/100'
                },
                {
                    input: '../new/100/',
                    expected: 'https://www.esmx.dev/a/new/100/'
                },
                { input: '', expected: 'https://www.esmx.dev/a/b/c' },
                { input: 'new', expected: 'https://www.esmx.dev/a/b/new' },
                { input: 'new/', expected: 'https://www.esmx.dev/a/b/new/' },
                {
                    input: 'new/100',
                    expected: 'https://www.esmx.dev/a/b/new/100'
                },
                {
                    input: 'new/100/',
                    expected: 'https://www.esmx.dev/a/b/new/100/'
                },
                { input: '.', expected: 'https://www.esmx.dev/a/b/' },
                { input: './', expected: 'https://www.esmx.dev/a/b/' },
                { input: './new', expected: 'https://www.esmx.dev/a/b/new' },
                { input: './new/', expected: 'https://www.esmx.dev/a/b/new/' },
                {
                    input: './new/100',
                    expected: 'https://www.esmx.dev/a/b/new/100'
                },
                {
                    input: './new/100/',
                    expected: 'https://www.esmx.dev/a/b/new/100/'
                }
            ],
            'https://www.esmx.dev/a/b/c/': [
                { input: '/', expected: 'https://www.esmx.dev/a/b/c/' },
                { input: '/new', expected: 'https://www.esmx.dev/a/b/c/new' },
                { input: '/new/', expected: 'https://www.esmx.dev/a/b/c/new/' },
                {
                    input: '/new/100',
                    expected: 'https://www.esmx.dev/a/b/c/new/100'
                },
                {
                    input: '/new/100/',
                    expected: 'https://www.esmx.dev/a/b/c/new/100/'
                },
                { input: '..', expected: 'https://www.esmx.dev/a/b/' },
                { input: '../', expected: 'https://www.esmx.dev/a/b/' },
                { input: '../new', expected: 'https://www.esmx.dev/a/b/new' },
                { input: '../new/', expected: 'https://www.esmx.dev/a/b/new/' },
                {
                    input: '../new/100',
                    expected: 'https://www.esmx.dev/a/b/new/100'
                },
                {
                    input: '../new/100/',
                    expected: 'https://www.esmx.dev/a/b/new/100/'
                },
                { input: '', expected: 'https://www.esmx.dev/a/b/c/' },
                { input: 'new', expected: 'https://www.esmx.dev/a/b/c/new' },
                { input: 'new/', expected: 'https://www.esmx.dev/a/b/c/new/' },
                {
                    input: 'new/100',
                    expected: 'https://www.esmx.dev/a/b/c/new/100'
                },
                {
                    input: 'new/100/',
                    expected: 'https://www.esmx.dev/a/b/c/new/100/'
                },
                { input: '.', expected: 'https://www.esmx.dev/a/b/c/' },
                { input: './', expected: 'https://www.esmx.dev/a/b/c/' },
                { input: './new', expected: 'https://www.esmx.dev/a/b/c/new' },
                {
                    input: './new/',
                    expected: 'https://www.esmx.dev/a/b/c/new/'
                },
                {
                    input: './new/100',
                    expected: 'https://www.esmx.dev/a/b/c/new/100'
                },
                {
                    input: './new/100/',
                    expected: 'https://www.esmx.dev/a/b/c/new/100/'
                }
            ]
        }).map(([base, cases]) => {
            test.each(cases)(
                `base: ${base}, input: $input`,
                ({ input, expected }) => {
                    const url = parseLocation(input, base);
                    expect(url).toEqURL(expected);

                    const pathSuffix = '?a&b=1&c=2&a=&a=4&base=10#hash';
                    const urlWithSuffix = parseLocation(
                        input + pathSuffix,
                        base
                    );
                    expect(urlWithSuffix).toEqURL(expected + pathSuffix);

                    const urlWithBaseSuffix = parseLocation(
                        input + pathSuffix,
                        base + '?base=base#base'
                    );
                    expect(urlWithBaseSuffix).toEqURL(expected + pathSuffix);
                }
            );
        });
    });
});

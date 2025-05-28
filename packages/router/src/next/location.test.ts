import { assert, describe, test } from 'vitest';
import { rawLocationToURL } from './location';

const BASE_URL = new URL('https://www.esmx.dev');
const BASE_EN_URL = new URL('https://www.esmx.dev/en/');

describe('rawLocationToURL', () => {
    describe('字符串输入', () => {
        test('应该根据输入类型决定是否使用 base', () => {
            // 1. 绝对路径 - 不使用 base
            assert.equal(
                rawLocationToURL('https://github.com', BASE_URL).href,
                'https://github.com/'
            );

            // 2. 相对路径 - 使用 base
            assert.equal(
                rawLocationToURL('/path', BASE_URL).href,
                'https://www.esmx.dev/path'
            );

            // 3. 空路径 - 使用 base
            assert.equal(
                rawLocationToURL('', BASE_URL).href,
                'https://www.esmx.dev/'
            );

            // 4. 裸域名 - 自动添加协议
            assert.equal(
                rawLocationToURL('github.com', BASE_URL).href,
                'http://github.com/'
            );
            assert.equal(
                rawLocationToURL('/', BASE_EN_URL).href,
                'https://www.esmx.dev/en/'
            );
            assert.equal(
                rawLocationToURL('./', BASE_EN_URL).href,
                'https://www.esmx.dev/en/'
            );
        });
    });

    describe('对象输入', () => {
        test('应该正确处理对象的默认值', () => {
            const url = rawLocationToURL({}, BASE_URL);
            assert.equal(url.pathname, '/');
            assert.equal(url.search, '');
            assert.equal(url.hash, '');
        });

        test('应该正确处理 query 参数', () => {
            const url = rawLocationToURL(
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

            assert.equal(url.searchParams.get('a'), '1');
            assert.equal(url.searchParams.has('b'), false);
            assert.equal(url.searchParams.get('c'), '0');
        });

        test('应该正确处理数组查询参数', () => {
            const url = rawLocationToURL(
                {
                    path: '/api',
                    queryArray: {
                        ids: ['1', '2']
                    }
                },
                BASE_URL
            );

            assert.deepEqual(url.searchParams.getAll('ids'), ['1', '2']);
        });

        test('应该正确处理 hash', () => {
            // 不带 # 的 hash
            const url1 = rawLocationToURL(
                {
                    path: '/page',
                    hash: 'section'
                },
                BASE_URL
            );
            assert.equal(url1.hash, '#section');

            // 带 # 的 hash
            const url2 = rawLocationToURL(
                {
                    path: '/page',
                    hash: '#section'
                },
                BASE_URL
            );
            assert.equal(url2.hash, '#section');

            // 空 hash
            const url3 = rawLocationToURL(
                {
                    path: '/page',
                    hash: ''
                },
                BASE_URL
            );
            assert.equal(url3.hash, '');
        });
    });
});

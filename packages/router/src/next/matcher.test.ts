import { assert, describe, test } from 'vitest';
import { Matcher, joinPathname } from './matcher';

const BASE_URL = new URL('https://www.esmx.dev');

describe('joinPathname', () => {
    test('基本路径拼接', () => {
        assert.equal(joinPathname('test'), 'test');
        assert.equal(joinPathname('/test'), 'test');
        assert.equal(joinPathname('test/'), 'test');
        assert.equal(joinPathname('/test/'), 'test');
    });

    test('带base的路径拼接', () => {
        assert.equal(joinPathname('test', '/api'), 'api/test');
        assert.equal(joinPathname('/test', '/api'), 'api/test');
        assert.equal(joinPathname('test', 'api'), 'api/test');
        assert.equal(joinPathname('/test', 'api'), 'api/test');
    });

    test('多层级路径拼接', () => {
        assert.equal(joinPathname('test/path'), 'test/path');
        assert.equal(joinPathname('/test/path'), 'test/path');
        assert.equal(joinPathname('test/path/'), 'test/path');
        assert.equal(joinPathname('/test/path/'), 'test/path');
    });

    test('带base的多层级路径拼接', () => {
        assert.equal(joinPathname('test/path', '/api'), 'api/test/path');
        assert.equal(joinPathname('/test/path', '/api'), 'api/test/path');
        assert.equal(joinPathname('test/path', 'api'), 'api/test/path');
        assert.equal(joinPathname('/test/path', 'api'), 'api/test/path');
    });

    test('处理重复斜杠', () => {
        assert.equal(joinPathname('//test'), 'test');
        assert.equal(joinPathname('test//path'), 'test/path');
        assert.equal(joinPathname('//test//path//'), 'test/path');
        assert.equal(joinPathname('test//path', '/api//'), 'api/test/path');
    });

    test('处理空值', () => {
        assert.equal(joinPathname(''), '');
        assert.equal(joinPathname('', ''), '');
        assert.equal(joinPathname('test', ''), 'test');
        assert.equal(joinPathname('', 'api'), 'api');
    });
});

describe('base', () => {
    test('基本路由匹配', () => {
        const matcher = new Matcher([
            {
                path: '/news'
            },
            {
                path: '/news/:id'
            }
        ]);
        const result = matcher.match(new URL('/news/123', BASE_URL), BASE_URL);
        assert.deepEqual(result.length, 1);
        assert.equal(result[0].path, '/news/:id');
    });

    test('嵌套路由匹配', () => {
        const matcher = new Matcher([
            {
                path: '/news',
                children: [
                    {
                        path: ':id'
                    }
                ]
            }
        ]);
        const result = matcher.match(new URL('/news/123', BASE_URL), BASE_URL);
        assert.deepEqual(result.length, 2);
        assert.equal(result[0].path, '/news');
        assert.equal(result[1].path, ':id');
    });
});

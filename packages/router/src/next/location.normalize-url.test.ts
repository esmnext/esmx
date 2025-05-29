import { assert, test } from 'vitest';
import { normalizeURL } from './location';

test('normalizeURL', () => {
    interface Item {
        name: string;
        input: {
            location: string;
            base: string;
        };
        expected: string;
    }
    const list: Item[] = [
        // 空输入测试 - 返回基础URL
        {
            name: '空输入 - 返回基础URL',
            input: {
                location: '',
                base: 'https://example.com/path'
            },
            expected: 'https://example.com/path'
        },
        {
            name: '空输入 - 返回带路径的基础URL',
            input: {
                location: '',
                base: 'https://example.com/path/to/resource'
            },
            expected: 'https://example.com/path/to/resource'
        },

        // 绝对路径测试 - 添加前缀到基础URL
        {
            name: '绝对路径 - 基本路径',
            input: {
                location: '/new-path',
                base: 'https://example.com/path'
            },
            expected: 'https://example.com/new-path'
        },
        {
            name: '绝对路径 - 多级路径',
            input: {
                location: '/new-path/sub/resource',
                base: 'https://example.com/path'
            },
            expected: 'https://example.com/new-path/sub/resource'
        },
        {
            name: '绝对路径 - 带查询参数',
            input: {
                location: '/new-path?query=value',
                base: 'https://example.com/path'
            },
            expected: 'https://example.com/new-path?query=value'
        },

        // 相对路径测试 - 直接与基础URL结合
        {
            name: '相对路径 - 当前目录',
            input: {
                location: './resource',
                base: 'https://example.com/path/'
            },
            expected: 'https://example.com/path/resource'
        },
        {
            name: '相对路径 - 上级目录',
            input: {
                location: '../resource',
                base: 'https://example.com/path/to/'
            },
            expected: 'https://example.com/path/resource'
        },
        {
            name: '相对路径 - 多级上级目录',
            input: {
                location: '../../resource',
                base: 'https://example.com/path/to/sub/'
            },
            expected: 'https://example.com/path/resource'
        },

        // 完整URL测试 - 直接构建
        {
            name: '完整URL - HTTP协议',
            input: {
                location: 'http://other-domain.com/path',
                base: 'https://example.com/path'
            },
            expected: 'http://other-domain.com/path'
        },
        {
            name: '完整URL - HTTPS协议',
            input: {
                location: 'https://other-domain.com/path',
                base: 'http://example.com/path'
            },
            expected: 'https://other-domain.com/path'
        },

        // 无效URL测试 - 使用协议回退
        {
            name: '无效URL - 协议回退',
            input: {
                location: 'other-domain.com/path',
                base: 'https://example.com/path'
            },
            expected: 'https://other-domain.com/path'
        },
        {
            name: '无效URL - 带查询参数的协议回退',
            input: {
                location: 'other-domain.com/path?query=value',
                base: 'https://example.com/path'
            },
            expected: 'https://other-domain.com/path?query=value'
        },

        // 边界情况测试
        {
            name: '边界情况 - 双斜杠开头（不被视为绝对路径）',
            input: {
                location: '//other-domain.com/path',
                base: 'https://example.com/path'
            },
            expected: 'https://other-domain.com/path'
        },
        {
            name: '边界情况 - 带端口号',
            input: {
                location: 'http://example.com:8080/path',
                base: 'https://example.com/path'
            },
            expected: 'http://example.com:8080/path'
        },
        {
            name: '边界情况 - 带认证信息',
            input: {
                location: 'http://user:pass@example.com/path',
                base: 'https://example.com/path'
            },
            expected: 'http://user:pass@example.com/path'
        },
        // Base URL尾斜杠测试 - 基于实际的normalizeURL逻辑
        {
            name: 'Base URL尾斜杠 - 绝对路径与带尾斜杠的base',
            input: {
                location: '/resource',
                base: 'https://example.com/path/'
            },
            expected: 'https://example.com/path/resource'
        },
        {
            name: 'Base URL尾斜杠 - 绝对路径与不带尾斜杠的base',
            input: {
                location: '/resource',
                base: 'https://example.com/path'
            },
            expected: 'https://example.com/resource'
        },
        {
            name: 'Base URL尾斜杠 - 协议回退与带尾斜杠的base',
            input: {
                location: 'resource',
                base: 'https://example.com/path/'
            },
            expected: 'https://resource/'
        },
        {
            name: 'Base URL尾斜杠 - 协议回退与不带尾斜杠的base',
            input: {
                location: 'resource',
                base: 'https://example.com/path'
            },
            expected: 'https://resource/'
        },
        {
            name: 'Base URL尾斜杠 - 当前目录与带尾斜杠的base',
            input: {
                location: './resource',
                base: 'https://example.com/path/'
            },
            expected: 'https://example.com/path/resource'
        },
        {
            name: 'Base URL尾斜杠 - 当前目录与不带尾斜杠的base',
            input: {
                location: './resource',
                base: 'https://example.com/path'
            },
            expected: 'https://example.com/resource'
        },
        {
            name: 'Base URL尾斜杠 - 上级目录与带尾斜杠的base',
            input: {
                location: '../resource',
                base: 'https://example.com/path/to/'
            },
            expected: 'https://example.com/path/resource'
        },
        {
            name: 'Base URL尾斜杠 - 上级目录与不带尾斜杠的base',
            input: {
                location: '../resource',
                base: 'https://example.com/path/to'
            },
            expected: 'https://example.com/resource'
        },
        {
            name: 'Base URL尾斜杠 - 多级绝对路径与带尾斜杠的base',
            input: {
                location: '/api/v1/users',
                base: 'https://example.com/app/'
            },
            expected: 'https://example.com/app/api/v1/users'
        },
        {
            name: 'Base URL尾斜杠 - 多级绝对路径与不带尾斜杠的base',
            input: {
                location: '/api/v1/users',
                base: 'https://example.com/app'
            },
            expected: 'https://example.com/api/v1/users'
        },
        {
            name: 'Base URL尾斜杠 - 根域名带尾斜杠',
            input: {
                location: '/api',
                base: 'https://example.com/'
            },
            expected: 'https://example.com/api'
        },
        {
            name: 'Base URL尾斜杠 - 根域名不带尾斜杠',
            input: {
                location: '/api',
                base: 'https://example.com'
            },
            expected: 'https://example.com/api'
        }
    ];
    list.forEach((item) => {
        const { name, input, expected } = item;
        const actual = normalizeURL(input.location, new URL(input.base)).href;
        assert.equal(actual, expected, name);
    });
});

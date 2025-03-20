import path from 'node:path';
import type { ParsedModuleConfig } from '@gez/core';
import type { Compiler } from '@rspack/core';

export function externalPlugin(
    moduleConfig: ParsedModuleConfig,
    compiler: Compiler
) {
    const externals = compiler.options.externals || [];
    if (!Array.isArray(externals)) {
        throw new TypeError(`'externals' configuration must be an array`);
    }
    Object.entries(moduleConfig.imports).forEach(([key, value]) => {
        externals.push(
            (
                { request, contextInfo }: any,
                callback: (...args: any[]) => any
            ) => {
                if (/\.worker\.(ts|mts|js|mjs)/.test(contextInfo.issuer)) {
                    return callback();
                }
                const getImport = getImportResult(moduleConfig, key, value);
                const result = getImport(contextInfo.issuer, request);
                if (result) {
                    return callback(null, `module-import ${result}`);
                }
                callback();
            }
        );
    });
    compiler.options.externalsType = 'module-import';
    compiler.options.externals = externals;
}

/**
 * 根据给定的选项和外部模块配置，返回一个函数，该函数用于处理模块的导入请求
 * @returns 一个函数，该函数接受两个参数：issuer 和 request，并返回一个字符串或 false
 */
function getImportResult(
    moduleConfig: ParsedModuleConfig,
    externalName: keyof ParsedModuleConfig['imports'],
    externalValue: ParsedModuleConfig['imports'][string]
): (issuer: string, request: string) => string | false {
    /**
     * 匹配的相对路径和别名
     * @example
     * ./serviceName/src/utils/index => ['./serviceName/src/utils/index', './serviceName/src/utils']
     * @lib/utils/index => ['@lib/utils/index', '@lib/utils']
     */
    const matches: string[] = [externalName];
    if (externalName.endsWith('/index')) {
        matches.push(externalName.replace(/\/index$/, ''));
    }

    /**
     * 匹配的文件路径
     * @example
     * ['./serviceName/src/utils/index', './serviceName/src/utils'] => ['/Users/xxx/serviceName/src/utils/index', '/Users/xxx/serviceName/src/utils']
     */
    const filePaths = matches.reduce<string[]>((acc, item) => {
        const target = path.resolve(
            moduleConfig.root,
            item.replace(new RegExp(`^${moduleConfig.name}\/`), '')
        );
        acc.push(target);
        return acc;
    }, []);

    /**
     * 可能出现的场景：
     * 例如：root:src/utils/index.ts
     * 入参：request 可能得值
     * 1. ssr-module-auth/src/utils
     * 2. ssr-module-auth/src/utils/index
     * 3. 在 test.ts 使用 ./utils
     * 4. 在 test.ts 使用 ./utils/index
     * issuer
     */
    return (issuer: string | undefined, request: string) => {
        const result = externalValue.import ?? request;
        if (!issuer) return false;
        if (issuer && externalValue.match.test(request)) {
            return result;
        }
        // 以 servername/ 开头的路径 直接进行匹配，命中时直接返回
        if (request.startsWith(`${moduleConfig.name}\/`)) {
            if (matches.includes(request)) {
                return result;
            }
        }

        if (request.startsWith(`.`)) {
            const index = request.indexOf('?');
            const requestFile =
                index > 0 ? request.substring(2, index) : request;
            const realPath = path.resolve(issuer, '../', request);
            if (requestFile === realPath) {
                return false;
            }
            if (filePaths.includes(realPath)) {
                return result;
            }
        }

        return false;
    };
}

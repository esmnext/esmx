import module from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { styleText } from 'node:util';
import pkg from '../../package.json' with { type: 'json' };

import { COMMAND, Esmx, type EsmxOptions } from '../core';

async function getSrcOptions(): Promise<EsmxOptions> {
    return import(path.resolve(process.cwd(), './src/entry.node.ts')).then(
        (m) => m.default
    );
}

export async function cli(command: string) {
    console.log(`🔥 ${styleText('yellow', 'Esmx')} v${pkg.version}
    `);
    if (command !== COMMAND.dev) {
        process.env.NODE_ENV = 'production';
    }
    let esmx: Esmx | null;
    let opts: EsmxOptions | null = null;
    switch (command) {
        case COMMAND.dev:
            opts = await getSrcOptions();
            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.dev));

            // 释放内存
            esmx = null;
            opts = null;
            break;
        case COMMAND.start:
            throw new Error(
                `Please use 'NODE_ENV=production node dist/index.mjs' to run the built program`
            );
        case COMMAND.build:
            // 编译代码。
            opts = await getSrcOptions();
            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.build));
            exit(await esmx.destroy());

            if (typeof opts.postBuild === 'function') {
                // 生产模式运行
                esmx = new Esmx({
                    ...opts,
                    server: undefined
                });
                exit(await esmx.init(COMMAND.start));
                exit(await esmx.postBuild());
            }

            // 释放内存
            esmx = null;
            opts = null;
            break;
        case COMMAND.preview:
            opts = await getSrcOptions();
            // 编译代码
            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.build));
            exit(await esmx.destroy());

            // 生产模式运行
            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.start));
            exit(await esmx.postBuild());

            // 释放内存
            esmx = null;
            opts = null;
            break;
        default:
            await import(path.resolve(process.cwd(), command));
            break;
    }
}

function exit(ok: boolean) {
    if (!ok) {
        process.exit(17);
    }
}

// 支持 TS 文件不需要编写 .ts 后缀。
module.register(fileURLToPath(import.meta.url), {
    parentURL: import.meta.url
});

export function resolve(
    specifier: string,
    context: Record<string, any>,
    nextResolve: Function
) {
    if (
        context?.parentURL.endsWith('.ts') &&
        specifier.startsWith('.') &&
        !specifier.endsWith('.ts')
    ) {
        return nextResolve(specifier + '.ts', context);
    }
    return nextResolve(specifier, context);
}

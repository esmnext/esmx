import module from 'node:module';
import { styleText } from 'node:util';
import pkg from '../../package.json' with { type: 'json' };

import { COMMAND, Esmx, type EsmxOptions } from '../core';
import { resolveImportPath } from '../utils/resolve-path';

async function getSrcOptions(): Promise<EsmxOptions> {
    return import(resolveImportPath(process.cwd(), './src/entry.node.ts')).then(
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

            esmx = null;
            opts = null;
            break;
        case COMMAND.start:
            throw new Error(
                `Please use 'NODE_ENV=production node dist/index.mjs' to run the built program`
            );
        case COMMAND.build:
            opts = await getSrcOptions();
            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.build));
            exit(await esmx.destroy());

            if (typeof opts.postBuild === 'function') {
                esmx = new Esmx({
                    ...opts,
                    server: undefined
                });
                exit(await esmx.init(COMMAND.start));
                exit(await esmx.postBuild());
            }

            esmx = null;
            opts = null;
            break;
        case COMMAND.preview:
            opts = await getSrcOptions();

            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.build));
            exit(await esmx.destroy());

            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.start));
            exit(await esmx.postBuild());

            esmx = null;
            opts = null;
            break;
        default:
            await import(resolveImportPath(process.cwd(), command));
            break;
    }
}

function exit(ok: boolean) {
    if (!ok) {
        process.exit(17);
    }
}

module.register(import.meta.url, {
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

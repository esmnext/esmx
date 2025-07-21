import module from 'node:module';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { styleText } from 'node:util';
import path from 'upath';
import pkg from '../../package.json' with { type: 'json' };

import { COMMAND, Esmx } from '../core';
import type { EsmxOptions } from '../core';

// Get Esmx options from the entry file
async function getSrcOptions(): Promise<EsmxOptions> {
    const entryPath = path.resolve(process.cwd(), './src/entry.node.ts');
    // Use pathToFileURL to ensure path is properly handled by import(), fixing Windows compatibility
    return import(pathToFileURL(entryPath).href).then((m) => m.default);
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

            // Free memory
            esmx = null;
            opts = null;
            break;
        case COMMAND.start:
            throw new Error(
                `Please use 'NODE_ENV=production node dist/index.mjs' to run the built program`
            );
        case COMMAND.build:
            // Compile code
            opts = await getSrcOptions();
            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.build));
            exit(await esmx.destroy());

            if (typeof opts.postBuild === 'function') {
                // Run in production mode
                esmx = new Esmx({
                    ...opts,
                    server: undefined
                });
                exit(await esmx.init(COMMAND.start));
                exit(await esmx.postBuild());
            }

            // Free memory
            esmx = null;
            opts = null;
            break;
        case COMMAND.preview:
            opts = await getSrcOptions();
            // Compile code
            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.build));
            exit(await esmx.destroy());

            // Run in production mode
            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.start));
            exit(await esmx.postBuild());

            // Free memory
            esmx = null;
            opts = null;
            break;
        default:
            {
                const cmdPath = path.resolve(process.cwd(), command);
                // Use pathToFileURL to ensure path is properly handled by import(), fixing Windows compatibility
                await import(pathToFileURL(cmdPath).href);
            }
            break;
    }
}

function exit(ok: boolean) {
    if (!ok) {
        process.exit(17);
    }
}

// Support TS files without .ts suffix.
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

import module from 'node:module';
import { styleText } from 'node:util';
import pkg from '../../package.json' with { type: 'json' };

import { COMMAND, Esmx, type EsmxOptions } from '../core';
import { resolveImportPath } from '../utils/resolve-path';
import { runValidate, VALIDATE_HELP } from './validate';

async function getSrcOptions(): Promise<EsmxOptions> {
    return import(resolveImportPath(process.cwd(), './src/entry.node.ts')).then(
        (m) => m.default
    );
}

async function getDistOptions(): Promise<EsmxOptions> {
    try {
        const m = await import(
            resolveImportPath(process.cwd(), './dist/node/src/entry.node.mjs')
        );
        return m.default;
    } catch (e) {
        console.error(
            styleText(
                'red',
                'Failed to load dist entry: dist/node/src/entry.node.mjs'
            )
        );
        console.error(styleText('yellow', 'Run `esmx build` and try again.'));
        process.exit(17);
    }
}

export async function cli(command: string) {
    if (command === 'validate') {
        // Handled before the banner: `--json` must keep stdout pure JSON.
        const flags = process.argv.slice(3);
        if (flags.includes('--help')) {
            console.log(VALIDATE_HELP);
            return;
        }
        const result = await runValidate(process.cwd(), {
            json: flags.includes('--json')
        });
        console.log(result.output);
        if (result.exitCode !== 0) {
            process.exit(result.exitCode);
        }
        return;
    }
    if (command === 'migrate') {
        // Handled before the banner: `--json` must keep stdout pure JSON.
        const opts = await getSrcOptions();
        const { runMigrate } = await import('../declaration/migrate');
        const ok = runMigrate(process.cwd(), opts.modules, {
            dryRun: process.argv.includes('--dry-run'),
            json: process.argv.includes('--json')
        });
        if (!ok) {
            process.exit(17);
        }
        return;
    }
    console.log(`🔥 ${styleText('yellow', 'Esmx')} v${pkg.version}
    `);
    if (
        command !== COMMAND.dev &&
        typeof process.env.NODE_ENV === 'undefined'
    ) {
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
            opts = await getDistOptions();
            esmx = new Esmx(opts);
            exit(await esmx.init(COMMAND.start));

            esmx = null;
            opts = null;
            break;
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
        context?.parentURL?.endsWith('.ts') &&
        specifier.startsWith('.') &&
        !specifier.endsWith('.ts')
    ) {
        return nextResolve(specifier + '.ts', context);
    }
    return nextResolve(specifier, context);
}

/**
 * Style assets imported via standard `import './x.css'` are part of esmx's
 * federation contract (manifest's `chunks[*].css[]` — see G section). On the
 * cli/build path Node's native loader hits these when reading the user's
 * `entry.node.ts` config (which transitively imports a remote's source). They
 * have no server-side behaviour — emit a no-op ESM module so the loader chain
 * continues cleanly. Mirrors `@esmx/import`'s VM-linker hook.
 */
const STYLE_ASSET_RE =
    /\.(?:css|scss|sass|less|stylus|styl|pcss|postcss)(?:\?.*)?$/i;

export async function load(
    url: string,
    context: Record<string, any>,
    nextLoad: Function
) {
    if (STYLE_ASSET_RE.test(url)) {
        return {
            format: 'module',
            shortCircuit: true,
            source: `export default ${JSON.stringify(url)}; export const href = ${JSON.stringify(url)};`
        };
    }
    return nextLoad(url, context);
}

import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { config } from '../config.mjs';
import {
    cleanDirectories,
    cleanNodeModules,
    execCommand,
    log,
    toDisplayPath
} from '../utils.mjs';

export async function initEnvironment() {
    log.info('Cleaning previous build artifacts...');

    if (existsSync(config.outDir)) {
        await rm(config.outDir, { recursive: true, force: true });
        log.info(`Removed ${toDisplayPath(config.outDir)}`);
    }

    log.info('Cleaning workspace node_modules and dist directories...');

    await cleanDirectories('all');

    log.info('Installing dependencies...');
    await execCommand('pnpm i');

    log.info('Building packages...');
    await execCommand('pnpm build:packages');

    log.info('Cleaning workspace node_modules and dist directories...');
    await cleanNodeModules('all');

    log.info('Rebuilding workspace links...');
    await execCommand('pnpm i');
}

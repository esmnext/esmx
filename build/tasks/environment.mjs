import { existsSync, rmSync } from 'node:fs';
import { config } from '../config.mjs';
import { execCommand, log, toDisplayPath } from '../utils.mjs';

export async function initEnvironment() {
    log.info('Cleaning previous build artifacts...');

    if (existsSync(config.outDir)) {
        rmSync(config.outDir, { recursive: true, force: true });
        log.info(`Removed ${toDisplayPath(config.outDir)}`);
    }

    log.info('Cleaning workspace node_modules and dist directories...');
    await execCommand('pnpm -r exec -- rm -rf dist node_modules');

    log.info('Installing dependencies...');
    await execCommand('pnpm i');

    log.info('Building packages...');
    await execCommand('pnpm build:packages');
}

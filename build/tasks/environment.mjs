import { existsSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { platform } from 'node:os';
import { config } from '../config.mjs';
import { execCommand, log, toDisplayPath } from '../utils.mjs';

export async function initEnvironment() {
    log.info('Cleaning previous build artifacts...');

    if (existsSync(config.outDir)) {
        await rm(config.outDir, { recursive: true, force: true });
        log.info(`Removed ${toDisplayPath(config.outDir)}`);
    }

    log.info('Cleaning workspace node_modules and dist directories...');

    // 使用跨平台命令
    const isWindows = platform() === 'win32';
    const cleanCommand = isWindows
        ? 'pnpm -r exec -- cmd /c rmdir /s /q dist node_modules 2>nul || exit 0'
        : 'pnpm -r exec -- rm -rf dist node_modules';

    await execCommand(cleanCommand);

    log.info('Installing dependencies...');
    await execCommand('pnpm i');

    log.info('Building packages...');
    await execCommand('pnpm build:packages');
}

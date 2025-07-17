import { existsSync, rmSync } from 'node:fs';
import { config } from '../config.mjs';
import { execCommand, log } from '../utils.mjs';

export async function buildExamples() {
    try {
        log.info('Refreshing dependencies to link latest package builds...');

        if (existsSync(config.nodeModulesDir)) {
            rmSync(config.nodeModulesDir, { recursive: true, force: true });
        }

        await execCommand('pnpm', ['i']);

        log.info('Building examples...');
        await execCommand('pnpm', ['build:examples']);
    } catch (error) {
        log.error(`Examples build failed: ${error.message}`);
        throw error; // Re-throw to ensure non-zero exit
    }
}

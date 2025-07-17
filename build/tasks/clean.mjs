import { existsSync, rmSync } from 'node:fs';
import { config } from '../config.mjs';
import { log, toDisplayPath } from '../utils.mjs';

export function cleanEnvironment() {
    try {
        log.info('Cleaning previous build artifacts...');

        const pathsToClean = [config.outDir, config.nodeModulesDir];

        pathsToClean.forEach((path) => {
            if (existsSync(path)) {
                rmSync(path, { recursive: true, force: true });
                log.info(`Removed ${toDisplayPath(path)}`);
            }
        });
    } catch (error) {
        log.error(`Environment cleanup failed: ${error.message}`);
        throw error; // Re-throw to ensure non-zero exit
    }
}

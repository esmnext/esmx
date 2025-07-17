import { execCommand, log } from '../utils.mjs';

export async function buildPackages() {
    try {
        log.info('Installing dependencies...');
        await execCommand('pnpm', ['i']);

        log.info('Building packages...');
        await execCommand('pnpm', ['build:packages']);
    } catch (error) {
        log.error(`Package build failed: ${error.message}`);
        throw error; // Re-throw to ensure non-zero exit
    }
}
